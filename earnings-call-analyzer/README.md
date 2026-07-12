# Earnings-Call Analyzer (`eca`)

Turn an earnings-call transcript into an institutional-grade, **self-citing** markdown
report — with an **evaluation harness** that scores extraction accuracy, grounding
coverage, and run-to-run consistency.

Built to demonstrate the exact competencies in the RBC GAM *AI Adoption Analyst* role:
evaluating AI output for **quality and reliability**, building **evaluation frameworks**,
and producing **documentation and reproducible best practices**.

> The differentiator isn't the sentiment analysis — that's an established baseline (see
> [`docs/methodology.md`](docs/methodology.md)). The differentiator is that the tool
> **grounds every number to a source line** and **ships with evals**, because
> hallucinated figures are the #1 adoption blocker on an investment desk.

---

## What it does

```
transcript.(txt|md|pdf)
        │
        ▼
  ingest ──► line-numbered markdown   [L1] [L2] [L3] …   (stable citation anchors)
        │
        ▼
  analyze ─► structured, cited extraction   (mock heuristic  OR  Claude via API)
        │
        ▼
  ground ──► verify every citation resolves + every figure appears on its cited line
        │
        ▼
  report ──► house-style markdown, styled entirely by design-system.md
```

The **eval harness** runs the same pipeline over a golden set of synthetic transcripts
with known ground truth and prints a scorecard.

## Design principles

- **Reliability over flash.** Standard-library Python, one CLI, markdown output. No web
  framework, no database.
- **Runs offline.** `--mock` mode is fully deterministic and needs no API key — so the
  pipeline, grounding, and evals are testable and demoable without spending a token. This
  is also what makes the eval harness reproducible.
- **The house style lives in one file.** `design-system.md` controls report structure,
  tone, and disclaimers; the renderer reads it. (This is the `.md`-as-context discipline
  made tangible.)
- **Nothing uncited ships.** Uncited or unverifiable claims are flagged in the report,
  never silently included.

## Install

```bash
# Mock mode needs nothing beyond Python 3.10+.
python -m eca --mock eval

# For real Claude analysis and PDF ingest:
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...      # Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-..."
```

## Usage

```bash
# Analyze a transcript (offline, deterministic):
python -m eca --mock analyze golden/northwind-q3-2025.md

# Analyze with real Claude (uses ANTHROPIC_API_KEY; falls back to mock if unset):
python -m eca analyze path/to/transcript.pdf --company "Acme Corp" --quarter "Q3 2025"

# Choose a model / override output path:
python -m eca analyze transcript.txt --model claude-opus-4-8 --out reports/acme.md

# Run the evaluation harness (scorecard):
python -m eca --mock eval --runs 3
```

The report is written to `reports/<slug>.report.md`. A committed sample lives at
[`reports/northwind-q3-2025.report.md`](reports/northwind-q3-2025.report.md).

## Backends

| Backend | When | Needs |
| --- | --- | --- |
| `mock` | offline pipeline test, evals, demo without a key | nothing (stdlib) |
| `claude` | real analysis | `anthropic` SDK + `ANTHROPIC_API_KEY` |

The CLI picks `claude` automatically when `ANTHROPIC_API_KEY` is set, or `mock` otherwise.
`--mock` forces offline. Default model is `claude-sonnet-5` (quality/cost balance for
document analysis); override with `--model` or `ECA_MODEL`. Choosing the model *is* the
cost/quality decision — documented, not hidden.

## Evaluation

```
python -m eca --mock eval
```

Scores each golden transcript on:
- **Accuracy** — expected metrics surfaced (ground truth in `golden/*.expected.json`)
- **Grounding** — share of claims cited and figure-verified
- **Numeric** — share of financial figures found on their cited lines
- **Consistency** — agreement across repeated runs

See [`docs/methodology.md`](docs/methodology.md) for the literature grounding and why the
golden set is synthetic.

## Layout

```
eca/            pipeline: ingest · prompts · analyze · ground · report · evaluate · CLI
golden/         synthetic transcripts + expected-answer JSON (the eval set)
reports/        generated reports (one sample committed)
docs/           methodology.md (literature) · build-log.md (how it was built)
design-system.md   report house style — single source of truth
MASTER-PROMPT.md   recreate this tool from scratch in one prompt
```

## Production note

*In production this runs on approved infrastructure with data governance and model-risk
review — the personal API key is demo-only.* The grounding and eval layers are exactly
the controls that make an LLM tool defensible for investment-team use.

## Reproduce it

[`MASTER-PROMPT.md`](MASTER-PROMPT.md) recreates this entire tool from a single prompt —
the "documentation, best practices and shared resources" deliverable, delivered before
day one.
