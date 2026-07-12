// Render a structured analysis into the house-style markdown report. Mirrors eca/report.py
// and obeys the shared design config (designSystem.ts <- design-system.md).

import type { Analysis, GroundingResult } from "./types.js";
import { DESIGN, SECTION_TITLES } from "./designSystem.js";

function cites(item: { citations?: number[] }): string {
  return (item.citations ?? []).filter((c) => Number.isInteger(c)).map((c) => `[L${c}]`).join(" ");
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

export function renderMarkdown(
  analysis: Analysis,
  grounding: GroundingResult,
  meta: { source: string; model: string; generated: string },
): string {
  const title = DESIGN.title_format
    .replace("{company}", analysis.company || "Unknown Company")
    .replace("{quarter}", analysis.quarter || "Unknown Quarter");

  const out: string[] = [`# ${title}`, ""];
  out.push(
    `*Source: \`${meta.source}\` · Model: \`${meta.model}\` · Generated: ${meta.generated} · ` +
    `Grounding coverage: ${pct(grounding.coverage)} · Numeric verification: ${pct(grounding.numeric_accuracy)}*`,
  );
  out.push("");
  out.push(`> ${DESIGN.citation_note}`);
  out.push("");

  for (const section of DESIGN.sections) {
    const items = (analysis as any)[section] as any[];
    if (!items || items.length === 0) continue;
    out.push(`## ${SECTION_TITLES[section] ?? section}`);
    out.push("");
    if (section === "key_metrics") {
      out.push("| Metric | Value | Citation |");
      out.push("| --- | --- | --- |");
      for (const it of items) out.push(`| ${it.metric ?? ""} | ${it.value ?? ""} | ${cites(it)} |`);
    } else if (section === "notable_quotes") {
      for (const it of items) {
        out.push(`> "${it.text ?? ""}" **${(it.speaker ?? "").trim()}** ${cites(it)}`.trimEnd());
        out.push("");
      }
    } else {
      for (const it of items) out.push(`- ${it.text ?? ""} ${cites(it)}`.trimEnd());
    }
    out.push("");
  }

  if (grounding.issues.length) {
    out.push("## Grounding Flags", "");
    out.push("_Claims the grounding layer could not verify. Surfaced, not hidden._", "");
    for (const issue of grounding.issues) out.push(`- ${issue}`);
    out.push("");
  }

  out.push("---", "");
  out.push(`*${DESIGN.disclaimer}*`, "");
  return out.join("\n").replace(/\s+$/, "") + "\n";
}
