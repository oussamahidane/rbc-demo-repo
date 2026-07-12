# Master Prompt — Recreate the Earnings-Call Analyzer

> **Purpose.** Paste the prompt below into Claude Code (or any capable coding agent) in an
> empty directory and it will rebuild this tool from scratch. This is the reproducibility
> deliverable: "documentation, best practices and shared resources" as an executable
> artifact. If a manager wants to own the tool, they run this — no dependency on me.

---

## The prompt

```
You are building a small, reliability-first Python CLI called "eca" — an Earnings-Call
Analyzer. Follow this spec exactly. Keep it minimal: standard library only for the core;
`anthropic` and `pypdf` are optional and used only for real analysis / PDF ingest.

GOAL
Turn an earnings-call transcript (.txt/.md/.pdf) into an institutional-grade markdown
report where EVERY figure and material claim cites the transcript line it came from, and
ship an evaluation harness that scores the pipeline against a golden set.

HARD REQUIREMENTS
1. Runs fully offline in a deterministic --mock mode with NO API key. Real analysis uses
   Claude via the anthropic SDK when ANTHROPIC_API_KEY is set. Same output schema for both.
2. Grounding is the point: hallucinated figures are the top adoption blocker. Every claim
   carries [Ln] citations; a grounding checker verifies each citation resolves and each
   FINANCIAL figure (money/percent) in a claim appears on a cited line. Unverifiable claims
   are surfaced in a "Grounding Flags" section, never hidden.
3. Report house style (section order, title format, disclaimer, citation note, tone) lives
   in a single design-system.md file that the renderer parses — not hard-coded.
4. An eval harness scores a golden set of SYNTHETIC transcripts (known ground truth) on:
   extraction accuracy, grounding coverage, numeric verification, and cross-run consistency,
   then prints a scorecard with a PASS/FAIL against thresholds.
5. Do NOT present sentiment analysis as novel. Ground it in Loughran-McDonald and FinBERT
   as the established baseline; cite them in docs/methodology.md.

STRUCTURE
  eca/__init__.py        version + module docstring
  eca/__main__.py        argparse CLI: `analyze <transcript>` and `eval`; picks claude
                         backend if ANTHROPIC_API_KEY set else mock; --mock forces offline
  eca/ingest.py          load .txt/.md/.pdf -> Transcript(lines[], exhibits[]); collapse
                         blank lines so line numbers track content; numbered_markdown()
                         renders "[Ln] text"; flag images/exhibits
  eca/prompts.py         SECTIONS list; a strict JSON schema description; SYSTEM_PROMPT
                         (buy-side analyst, never fabricates, hypotheses-not-verdicts,
                         cite every claim by line); build_user_prompt()
  eca/analyze.py         analyze(transcript, hints, backend, model). mock = deterministic
                         heuristic extractor (regex for $ / % / ranges; a compact
                         Loughran-McDonald-style pos/neg lexicon for tone; metric keyword
                         map). claude = anthropic messages.create, parse JSON defensively,
                         coerce to schema. Every produced item has real line citations.
                         Default model claude-sonnet-5, overridable via --model / ECA_MODEL.
  eca/ground.py          check_grounding(analysis, transcript) -> coverage, numeric
                         verification (money/percent only, not incidental integers), and a
                         list of issues.
  eca/report.py          load_design_config() parses design-system.md's ```config``` block;
                         render() emits H1 title, a metadata line (source/model/time/
                         grounding), a table for key_metrics, bullets with [Ln] for other
                         sections, blockquotes for notable_quotes, a Grounding Flags section,
                         and the disclaimer.
  eca/evaluate.py        run_eval(golden_dir, backend, model, runs) -> Scorecard. For each
                         golden/*.expected.json + matching transcript: run N times, compute
                         accuracy (expected metrics found in produced metrics or on cited
                         lines), grounding, numeric, consistency (fingerprint of extracted
                         metrics across runs). Scorecard.render() prints an aligned table +
                         PASS/FAIL (accuracy>=0.8, grounding>=0.95).
  design-system.md       prose + a ```config``` block: title_format, disclaimer,
                         citation_note, sections (ordered), tone. Include the enterprise
                         maturity line about approved infrastructure / demo-only key.
  golden/                3 synthetic transcripts (clearly labelled SYNTHETIC, fictional
                         companies) as .md with one metric per line so the heuristic can
                         extract cleanly, each with a <slug>.expected.json listing company,
                         quarter, tone_expectation, and expected_metrics [{metric,
                         value_contains}].
  docs/methodology.md    literature grounding (Loughran-McDonald 2011, FinBERT, call-tone
                         studies), why grounding + evals are the core design, honest limits.
  README.md              what/why/install/usage/backends/eval/layout/production note.

VERIFY before finishing:
  python -m eca --mock analyze golden/<slug>.md   # writes reports/<slug>.report.md
  python -m eca --mock eval                        # prints scorecard, must PASS
Confirm grounding coverage is 100% and numeric verification is 100% on the golden set.
```

---

## Notes for whoever runs this

- The output should match the committed tool closely; small stylistic differences are fine.
- Swap in the full Loughran-McDonald master dictionary and (optionally) a fine-tuned tone
  model for production. The architecture doesn't change — only the tone stage gets better.
- To point it at a real transcript, drop a `.txt`/`.md`/`.pdf` in and run
  `python -m eca analyze <file> --company "…" --quarter "…"` with `ANTHROPIC_API_KEY` set.
