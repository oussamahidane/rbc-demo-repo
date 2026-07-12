// Grounding layer (differentiator #1). Mirrors eca/ground.py.
// Verifies every claim cites a real line, and every FINANCIAL figure (money/percent)
// in a claim appears on one of its cited lines. Incidental integers (counts, years) are
// not treated as claims to verify.

import type { Analysis, GroundingResult } from "./types.js";
import { SECTIONS } from "./types.js";
import { line, type Transcript } from "./ingest.js";

const MONEY_NUM = /\$\s?(\d[\d,]*(?:\.\d+)?)/gi;
const PCT_NUM = /(\d[\d,]*(?:\.\d+)?)\s?%/g;

function figures(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(MONEY_NUM)) out.add(m[1].replace(/,/g, ""));
  for (const m of text.matchAll(PCT_NUM)) out.add(m[1].replace(/,/g, ""));
  return out;
}

function claimText(section: string, item: any): string {
  if (section === "key_metrics") return `${item.metric ?? ""} ${item.value ?? ""}`;
  return item.text ?? "";
}

export function checkGrounding(analysis: Analysis, t: Transcript): GroundingResult {
  const r: GroundingResult = {
    total_claims: 0, cited_claims: 0, numeric_claims: 0, numerically_verified: 0,
    coverage: 1, numeric_accuracy: 1, issues: [],
  };
  const nLines = t.lines.length;

  for (const section of SECTIONS) {
    const items = (analysis as any)[section] as any[];
    for (const item of items ?? []) {
      r.total_claims += 1;
      const text = claimText(section, item);
      const cites: number[] = Array.isArray(item.citations) ? item.citations.filter((c: unknown) => Number.isInteger(c)) : [];
      const valid = cites.filter((c) => c >= 1 && c <= nLines);
      if (valid.length === 0) {
        r.issues.push(`[${section}] uncited or out-of-range: ${JSON.stringify(text.slice(0, 80))}`);
        continue;
      }
      r.cited_claims += 1;
      const claimFigures = figures(text);
      if (claimFigures.size > 0) {
        r.numeric_claims += 1;
        const cited = valid.map((c) => line(t, c) ?? "").join(" ");
        const sourceFigures = figures(cited);
        const overlap = [...claimFigures].some((f) => sourceFigures.has(f));
        if (overlap) r.numerically_verified += 1;
        else r.issues.push(`[${section}] figure(s) ${[...claimFigures].sort().join(", ")} not on cited line(s) ${valid.join(", ")}: ${JSON.stringify(text.slice(0, 80))}`);
      }
    }
  }
  r.coverage = r.total_claims ? r.cited_claims / r.total_claims : 1;
  r.numeric_accuracy = r.numeric_claims ? r.numerically_verified / r.numeric_claims : 1;
  return r;
}
