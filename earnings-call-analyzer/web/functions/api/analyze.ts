// POST /api/analyze — transcript in, grounded report out.
// Runs server-side so ANTHROPIC_API_KEY never reaches the browser. Falls back to the
// deterministic sample backend when no key is configured (offline demo / local dev).

import type { AnalyzeResponse } from "../../src/types.js";
import { ingest } from "../../src/ingest.js";
import { analyze } from "../../src/analyze.js";
import { checkGrounding } from "../../src/ground.js";
import { renderMarkdown } from "../../src/report.js";

interface Env {
  ANTHROPIC_API_KEY?: string;
  ECA_MODEL?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

const MAX_CHARS = 200_000; // ~40k tokens; protects cost and latency

// Opus pricing: $0.015/1K input tokens, $0.06/1K output tokens
const OPUS_INPUT_COST_PER_1K = 0.015;
const OPUS_OUTPUT_COST_PER_1K = 0.06;

interface Body {
  transcript?: string;
  company?: string;
  quarter?: string;
  source?: string;
}

function getWeekKey(): string {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  return weekStart.toISOString().split('T')[0];
}

async function trackCost(ip: string, kv: KVNamespace, costDollars: number): Promise<void> {
  const weekKey = getWeekKey();
  const kvKey = `ratelimit:${ip}:${weekKey}`;
  const currentStr = await kv.get(kvKey);
  const current = currentStr ? parseFloat(currentStr) : 0;
  const updated = current + costDollars;
  await kv.put(kvKey, updated.toFixed(4), { expirationTtl: 86400 * 7 }); // 7 days
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: Body;
  try {
    body = (await ctx.request.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const transcript = (body.transcript ?? "").toString();
  if (!transcript.trim()) return json({ error: "Transcript is empty." }, 400);
  if (transcript.length > MAX_CHARS) {
    return json({ error: `Transcript too large (${transcript.length} chars; max ${MAX_CHARS}).` }, 413);
  }

  const t = ingest(transcript);
  if (t.lines.length === 0) return json({ error: "No readable content in transcript." }, 400);

  let analysis, backend, model;
  try {
    ({ analysis, backend, model } = await analyze({
      transcript: t,
      companyHint: (body.company ?? "").toString(),
      quarterHint: (body.quarter ?? "").toString(),
      apiKey: ctx.env.ANTHROPIC_API_KEY,
      model: ctx.env.ECA_MODEL,
    }));
  } catch (err) {
    return json({ error: `Analysis failed: ${(err as Error).message}` }, 502);
  }

  const grounding = checkGrounding(analysis, t);
  const reportMarkdown = renderMarkdown(analysis, grounding, {
    source: (body.source ?? "pasted transcript").toString(),
    model,
    generated: new Date().toISOString().slice(0, 16).replace("T", " "),
  });

  // Track cost if using real Claude (estimate based on token usage)
  if (backend === "claude" && ctx.env.RATE_LIMIT_KV) {
    const ip = ctx.request.headers.get("CF-Connecting-IP") || "unknown";
    // Rough estimate: transcript chars / 4 ≈ tokens
    const inputTokens = Math.ceil(transcript.length / 4);
    const outputTokens = Math.ceil(reportMarkdown.length / 4);
    const costDollars = (inputTokens / 1000) * OPUS_INPUT_COST_PER_1K + (outputTokens / 1000) * OPUS_OUTPUT_COST_PER_1K;
    await trackCost(ip, ctx.env.RATE_LIMIT_KV, costDollars);
  }

  const payload: AnalyzeResponse = { backend, model, analysis, grounding, reportMarkdown, lines: t.lines };
  return json(payload);
};
