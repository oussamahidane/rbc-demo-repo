// Analysis engine. Two backends, one schema (mirrors eca/analyze.py):
//   sample : deterministic heuristic extractor (no key) — for offline demo + local dev.
//   claude : real analysis via the Anthropic Messages API when a key is provided.
// Every produced item carries real line citations so the grounding layer can verify it.

import type { Analysis, Metric, CitedClaim, Quote } from "./types.js";
import { numberedMarkdown, type Transcript } from "./ingest.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";

export const DEFAULT_MODEL = "claude-sonnet-5";

const LM_POSITIVE = new Set([
  "growth", "grew", "strong", "record", "improved", "improvement", "gain", "gains",
  "profit", "profitable", "outperform", "beat", "exceeded", "confident", "momentum",
  "accelerate", "expansion", "robust", "healthy", "opportunity", "progress",
]);
const LM_NEGATIVE = new Set([
  "decline", "declined", "weak", "weakness", "loss", "losses", "headwind", "headwinds",
  "pressure", "uncertain", "uncertainty", "challenge", "challenging", "slowdown",
  "miss", "missed", "risk", "risks", "soft", "softness", "adverse", "litigation",
]);

const MONEY = /\$\s?\d[\d,]*(?:\.\d+)?\s?(?:billion|million|trillion|bn|mn|b|m)?/i;
const PERCENT = /\d[\d,]*(?:\.\d+)?\s?%/;
const NUMBER = /\d[\d,]*(?:\.\d+)?/;
const MONEY_RANGE =
  /\$\s?\d[\d,]*(?:\.\d+)?\s*(?:to|-|–|and)\s*\$?\s?\d[\d,]*(?:\.\d+)?\s?(?:billion|million|trillion|bn|mn|b|m)?/i;
const PERCENT_RANGE = /\d[\d,]*(?:\.\d+)?\s*(?:to|-|–)\s*\d[\d,]*(?:\.\d+)?\s?%/;

const METRIC_KEYWORDS: [string, RegExp][] = [
  ["EPS", /\b(eps|earnings per share|diluted (?:eps|earnings))\b/i],
  ["Revenue", /\b(revenue|net sales|total sales|top line)\b/i],
  ["Net income", /\b(net income|net earnings|net loss)\b/i],
  ["Operating margin", /\b(operating margin|gross margin|operating income)\b/i],
  ["Free cash flow", /\b(free cash flow|operating cash flow|cash flow)\b/i],
  ["Guidance", /\b(guidance|outlook|expect|forecast|full[- ]year|fiscal)\b/i],
  ["Buyback / dividend", /\b(buyback|repurchase|dividend|return of capital)\b/i],
];
const GUIDANCE_RE = /\b(guidance|outlook|expect|anticipate|forecast|full[- ]year|next quarter|fiscal \d{4})\b/i;
const RISK_RE = /\b(risk|headwind|uncertain|challenge|pressure|macro|foreign exchange|fx|slowdown|softness)\b/i;
const QA_MARKER = /\b(q&a|question[- ]and[- ]answer|first question|analyst)\b/i;
const COMPANY_RE =
  /((?:[A-Z][A-Za-z0-9.&'’]+,?\s+){1,5}(?:Corporation|Incorporated|Company|Holdings|Group|Corp|Inc|Ltd|PLC|Co|N\.V)\.?)/;

export interface AnalyzeOptions {
  transcript: Transcript;
  companyHint?: string;
  quarterHint?: string;
  apiKey?: string;
  model?: string;
}

export async function analyze(
  opts: AnalyzeOptions,
): Promise<{ analysis: Analysis; backend: "claude" | "sample"; model: string }> {
  if (opts.apiKey) {
    const model = opts.model || DEFAULT_MODEL;
    const analysis = await analyzeClaude(opts.transcript, opts.companyHint ?? "", opts.quarterHint ?? "", opts.apiKey, model);
    return { analysis, backend: "claude", model };
  }
  return { analysis: analyzeSample(opts.transcript, opts.companyHint ?? "", opts.quarterHint ?? ""), backend: "sample", model: "sample" };
}

// --- Sample (deterministic) backend --------------------------------------------------

export function analyzeSample(t: Transcript, companyHint: string, quarterHint: string): Analysis {
  const lines = t.lines;
  const company = companyHint || guessCompany(lines);
  const quarter = quarterHint || guessQuarter(lines);
  const key_metrics = extractMetrics(lines);
  const guidance = extractMatches(lines, GUIDANCE_RE, 4);
  const risks = extractMatches(lines, RISK_RE, 4);
  const qa_highlights = extractQA(lines);
  const management_tone = extractTone(lines);
  const notable_quotes = extractQuotes(lines);

  const executive_summary: CitedClaim[] = [];
  for (const m of key_metrics.slice(0, 3)) {
    executive_summary.push({ text: `${m.metric} reported at ${m.value}.`, citations: m.citations });
  }
  if (management_tone.length) executive_summary.push(management_tone[0]);

  return { company, quarter, executive_summary, guidance, key_metrics, management_tone, risks, qa_highlights, notable_quotes };
}

function guessCompany(lines: string[]): string {
  for (const text of lines.slice(0, 12)) {
    const m = COMPANY_RE.exec(text);
    if (m) return m[1].trim().replace(/,$/, "");
  }
  return "Unknown Company";
}

function guessQuarter(lines: string[]): string {
  const re = /\b(Q[1-4]|first|second|third|fourth)[- ]?(?:quarter)?[, ]*(?:of\s*)?(?:fiscal\s*)?(20\d{2})\b/i;
  for (const text of lines.slice(0, 20)) {
    const m = re.exec(text);
    if (m) return `${m[1].toUpperCase()} ${m[2]}`;
  }
  return "Unknown Quarter";
}

function extractMetrics(lines: string[]): Metric[] {
  const metrics: Metric[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    if (!(MONEY.test(text) || PERCENT.test(text))) continue;
    for (const [label, kw] of METRIC_KEYWORDS) {
      if (seen.has(label)) continue;
      if (kw.test(text)) {
        const value = pickValue(text);
        if (value) {
          metrics.push({ metric: label, value, citations: [i + 1] });
          seen.add(label);
        }
        break;
      }
    }
  }
  return metrics;
}

function pickValue(text: string): string {
  const mr = MONEY_RANGE.exec(text);
  if (mr) return mr[0].trim().replace(/\s+/g, " ");
  const pr = PERCENT_RANGE.exec(text);
  if (pr) return pr[0].trim().replace(/\s+/g, " ");
  const money = MONEY.exec(text);
  const pct = PERCENT.exec(text);
  if (money && pct) return `${money[0].trim()} (${pct[0].trim()})`;
  if (money) return money[0].trim();
  if (pct) return pct[0].trim();
  const num = NUMBER.exec(text);
  return num ? num[0] : "";
}

function extractMatches(lines: string[], pattern: RegExp, limit: number): CitedClaim[] {
  const out: CitedClaim[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      out.push({ text: clip(lines[i]), citations: [i + 1] });
      if (out.length >= limit) break;
    }
  }
  return out;
}

function extractQA(lines: string[]): CitedClaim[] {
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (QA_MARKER.test(lines[i])) { start = i; break; }
  }
  if (start < 0) return [];
  const out: CitedClaim[] = [];
  for (let i = start; i < lines.length; i++) {
    const text = lines[i];
    if (/^(analyst|q:|question)/i.test(text) || PERCENT.test(text) || MONEY.test(text)) {
      out.push({ text: clip(text), citations: [i + 1] });
      if (out.length >= 4) break;
    }
  }
  return out;
}

function words(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z]+/g) ?? []));
}

function extractTone(lines: string[]): CitedClaim[] {
  const pos: number[] = [];
  const neg: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const w = words(lines[i]);
    if ([...w].some((x) => LM_POSITIVE.has(x))) pos.push(i + 1);
    if ([...w].some((x) => LM_NEGATIVE.has(x))) neg.push(i + 1);
  }
  const total = pos.length + neg.length;
  if (total === 0) return [];
  const net = (pos.length - neg.length) / total;
  const lean = net > 0.15 ? "net positive" : net < -0.15 ? "net negative" : "balanced";
  const cites = [...pos.slice(0, 2), ...neg.slice(0, 2)];
  const uniq = [...new Set(cites)].sort((a, b) => a - b);
  return [{
    text:
      `Management tone reads ${lean} on a Loughran-McDonald-style lexicon ` +
      `(${pos.length} positive vs ${neg.length} negative sentiment lines). Baseline signal, not a verdict.`,
    citations: uniq.length ? uniq : [1],
  }];
}

function extractQuotes(lines: string[]): Quote[] {
  const out: Quote[] = [];
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const speaker = /^([A-Z][a-zA-Z.\- ]{2,40}?)\s*[:\-]/.exec(text);
    const w = words(text);
    const strong = [...w].some((x) => LM_POSITIVE.has(x) || LM_NEGATIVE.has(x));
    if (speaker && strong && text.length < 240) {
      out.push({ text: clip(text.slice(speaker[0].length).trim()), speaker: speaker[1].trim(), citations: [i + 1] });
      if (out.length >= 2) break;
    }
  }
  return out;
}

function clip(text: string, limit = 220): string {
  text = text.trim();
  return text.length <= limit ? text : text.slice(0, limit - 1).trimEnd() + "…";
}

// --- Claude backend ------------------------------------------------------------------

async function analyzeClaude(t: Transcript, companyHint: string, quarterHint: string, apiKey: string, model: string): Promise<Analysis> {
  const user = buildUserPrompt(companyHint, quarterHint, numberedMarkdown(t));
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`Anthropic API error ${resp.status}: ${detail.slice(0, 300)}`);
  }
  const data = (await resp.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  return coerceSchema(parseJson(text));
}

function parseJson(text: string): Record<string, unknown> {
  let t = text.trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return a JSON object.");
  return JSON.parse(t.slice(start, end + 1));
}

function coerceSchema(data: Record<string, unknown>): Analysis {
  const arr = (k: string) => (Array.isArray(data[k]) ? (data[k] as any[]) : []);
  return {
    company: (data.company as string) || "Unknown Company",
    quarter: (data.quarter as string) || "Unknown Quarter",
    executive_summary: arr("executive_summary"),
    guidance: arr("guidance"),
    key_metrics: arr("key_metrics"),
    management_tone: arr("management_tone"),
    risks: arr("risks"),
    qa_highlights: arr("qa_highlights"),
    notable_quotes: arr("notable_quotes"),
  };
}
