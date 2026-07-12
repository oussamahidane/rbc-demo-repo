# Workstream C — Build Brief (self-prompt): Earnings-Call Analyzer

> **What this file is.** A standing, self-directed prompt for the build workstream. A fresh Claude session with zero chat history can load this file plus `memory.md` and execute the loop below until the tool is delivered. This mirrors the campaign's own md-context discipline — the tool and the way it's built are the same proof point.

## Role & boundary

You own **Deliverable B — the earnings-call analyzer** (game plan §8). Cowork owns the resume (Workstream A) and the deck (Deliverable A, §7). Do **not** touch resume or deck files. Build the tool, its evals, its docs, and one sample rendered report.

## Definition of done (the product ships when all are true)

1. `python -m eca analyze <transcript>` produces an institutional-grade markdown report in a consistent house style.
2. Every number and material claim in the report carries a `[L<n>]` citation back to a source line. A grounding check reports the % of claims that are cited and flags any that aren't.
3. `python -m eca eval` runs a golden set (3–5 synthetic transcripts with known ground truth) and prints a scorecard: extraction accuracy, grounding coverage, and cross-run consistency.
4. The whole pipeline runs **without an API key** in `--mock` mode (deterministic), and with real Claude when `ANTHROPIC_API_KEY` is set. Verified both ways where possible.
5. `design-system.md` fully controls report style (typography, structure, tone) — the token-story-made-tangible artifact.
6. `docs/methodology.md` grounds the analysis in the literature (Loughran–McDonald, FinBERT, etc.), cited, framed as established baseline — **not** as novel.
7. `README.md` + `MASTER-PROMPT.md` make the tool reproducible by the hiring manager from scratch.
8. `docs/build-log.md` captures the build as a portfolio narrative.
9. One sample report committed under `reports/` as proof it runs.

## Non-negotiable guardrails (from memory.md / §8)

- Do **not** pitch sentiment analysis as novel. Edge = ship + document + evaluate + reproduce.
- Grounding (self-citation) is differentiator #1 — hallucinated figures are THE adoption blocker on investment desks; kill the objection before it's raised.
- Eval harness is differentiator #2 — showing *evals*, not just outputs, is the most differentiated move. No junior candidate will demo this.
- Golden-set transcripts are **synthetic and clearly labelled** — a golden set needs known ground truth (which real transcripts can't give you cleanly) and it dodges copyright. Real, recognizable transcripts are for live demo only, supplied at run time.
- Keep the stack minimal. Reliability beats flash. CLI + rendered markdown report is sufficient; no framework sprawl.
- Bake in one enterprise-maturity line where the demo surfaces it: *"In production this runs on approved infrastructure with data governance and model-risk review — the personal API key is demo-only."*
- No RBC logos/trademarks; RBC-adjacent styling only.
- Python (JD must-have). Cost/quality tradeoffs made explicit (the token story) — model choice configurable, default documented.

## Architecture

```
earnings-call-analyzer/
  README.md                  # what it is, install, run, reproduce
  MASTER-PROMPT.md           # one-shot recreate-from-scratch prompt (reproducibility deliverable)
  requirements.txt
  design-system.md           # report house style — single source of truth for rendering
  pyproject / -m eca         # runnable as `python -m eca ...`
  eca/
    __init__.py
    __main__.py              # CLI: analyze | eval
    ingest.py                # source (.txt/.md/.pdf) -> clean, line-numbered markdown
    prompts.py               # analysis prompt, literature-grounded, demands line citations
    analyze.py               # Claude call (real) + deterministic mock; returns structured analysis
    ground.py                # verify each claim's [L<n>] cite resolves; grounding coverage %
    report.py                # render structured analysis -> report per design-system.md
    evaluate.py              # golden-set runner: accuracy + grounding + consistency -> scorecard
  golden/
    <slug>.md                # synthetic transcript (labelled SYNTHETIC)
    <slug>.expected.json     # ground-truth extractions for scoring
  reports/                   # generated reports (one committed sample)
  docs/
    methodology.md           # literature grounding + citations
    build-log.md             # portfolio narrative
```

## Build loop (repeat until Definition of Done)

1. Read `memory.md` + this file. Pick the first unchecked item in the Build Backlog below.
2. Implement the smallest slice that advances it.
3. Verify: run `python -m eca` for the relevant command in `--mock` mode; confirm output.
4. Check the item; append a one-line note to `docs/build-log.md`.
5. If all items checked → run the full end-to-end verification, generate the sample report, update `progress.md` + `memory.md`, stop.

## Build backlog (check off in order)

- [ ] Scaffold package + `requirements.txt` + runnable `python -m eca`
- [ ] `ingest.py` — normalize source to line-numbered markdown; unit-verify on a golden file
- [ ] `design-system.md` — house style spec
- [ ] `prompts.py` — literature-grounded analysis prompt demanding `[L<n>]` citations + strict JSON schema
- [ ] `analyze.py` — mock mode (deterministic, schema-valid) + real Claude mode behind `ANTHROPIC_API_KEY`
- [ ] `report.py` — render structured analysis to a report obeying `design-system.md`
- [ ] `ground.py` — resolve every citation; compute grounding coverage; flag uncited claims
- [ ] `golden/` — 3 synthetic transcripts + expected.json ground truth
- [ ] `evaluate.py` — scorecard: extraction accuracy, grounding coverage, cross-run consistency
- [ ] `docs/methodology.md` — literature grounding, cited
- [ ] `README.md` + `MASTER-PROMPT.md` — reproducibility
- [ ] `docs/build-log.md` — portfolio narrative (append as you go)
- [ ] Full E2E: `analyze` a golden transcript → sample report in `reports/`; `eval` prints scorecard
- [ ] Update `progress.md` + `memory.md`; mark Workstream C build state

## Decisions locked for this build

- **Language/stack:** Python 3, stdlib-first. Only third-party dep is `anthropic` (real mode) and optionally `pypdf` (PDF ingest). Mock mode needs neither.
- **Model default:** `claude-sonnet-5` (quality/cost balance for a document-analysis tool); overridable via `--model` / `ECA_MODEL`. Document the tradeoff — it *is* the cost/quality story.
- **Output:** markdown report (portable, diff-able, renders anywhere). No web framework.
- **Citations:** ingest prepends `[L1] [L2] …` line numbers; the model must tag every figure/claim with the line(s) it came from; `ground.py` validates them.
- **Golden set:** synthetic, labelled, ground-truth JSON authored alongside each transcript.
