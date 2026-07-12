// Verifies the TS port matches the Python reference behavior on the golden transcripts,
// using the deterministic sample backend (no API key needed).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ingest } from "../src/ingest.js";
import { analyzeSample } from "../src/analyze.js";
import { checkGrounding } from "../src/ground.js";
import { renderMarkdown } from "../src/report.js";

const here = dirname(fileURLToPath(import.meta.url));
const goldenDir = join(here, "..", "..", "golden");

interface Expected {
  company: string;
  quarter: string;
  expected_metrics: { metric: string; value_contains: string }[];
}

const CASES = ["northwind-q3-2025", "atlas-materials-q2-2025", "meridian-financial-q4-2025"];

for (const slug of CASES) {
  test(slug, () => {
    const raw = readFileSync(join(goldenDir, `${slug}.md`), "utf-8");
    const expected = JSON.parse(readFileSync(join(goldenDir, `${slug}.expected.json`), "utf-8")) as Expected;

    const t = ingest(raw);
    const analysis = analyzeSample(t, "", "");
    const g = checkGrounding(analysis, t);

    // Grounding must be perfect on the golden set (same bar as the Python eval).
    assert.equal(g.coverage, 1, `${slug}: grounding coverage`);
    assert.equal(g.numeric_accuracy, 1, `${slug}: numeric verification`);
    assert.equal(g.issues.length, 0, `${slug}: no grounding flags`);

    // Every expected metric must be surfaced (in produced metrics or on a cited line).
    const producedVals = analysis.key_metrics.map((m) => `${m.metric} ${m.value}`.toLowerCase().replace(/,/g, ""));
    const citedText = t.lines.join(" ").toLowerCase().replace(/,/g, "");
    for (const em of expected.expected_metrics) {
      const needle = em.value_contains.toLowerCase().replace(/,/g, "");
      const hit = producedVals.some((v) => v.includes(em.metric.toLowerCase()) && v.includes(needle)) || citedText.includes(needle);
      assert.ok(hit, `${slug}: expected metric ${em.metric} (${em.value_contains}) not found`);
    }

    // Report renders with the title and disclaimer.
    const md = renderMarkdown(analysis, g, { source: slug, model: "sample", generated: "2026-01-01 00:00" });
    assert.match(md, /Earnings Call Analysis/);
    assert.match(md, /demo-only/);
  });
}

test("company + quarter detection", () => {
  const raw = readFileSync(join(goldenDir, "northwind-q3-2025.md"), "utf-8");
  const analysis = analyzeSample(ingest(raw), "", "");
  assert.equal(analysis.company, "Northwind Technologies, Inc.");
  assert.equal(analysis.quarter, "Q3 2025");
});
