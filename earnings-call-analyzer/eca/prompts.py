"""Prompts and the analysis schema.

The prompt is grounded in the established sentiment/NLP-in-finance literature
(Loughran-McDonald, FinBERT — see docs/methodology.md) and treated as a baseline,
not a novel method. Its hard requirement: every figure and material claim must cite
the transcript line(s) it came from, so the grounding layer can verify it.
"""

from __future__ import annotations

# Ordered sections the model must return. Kept in sync with design-system.md `sections`.
SECTIONS = [
    "executive_summary",
    "guidance",
    "key_metrics",
    "management_tone",
    "risks",
    "qa_highlights",
    "notable_quotes",
]

# Each list item is a "cited claim": text plus the source line numbers.
# key_metrics items use {metric, value, citations}; notable_quotes add {speaker}.
SCHEMA_DESCRIPTION = """Return ONLY a JSON object with these keys:
{
  "company": string,
  "quarter": string,
  "executive_summary": [ {"text": string, "citations": [int, ...]} ],
  "guidance":          [ {"text": string, "citations": [int, ...]} ],
  "key_metrics":       [ {"metric": string, "value": string, "citations": [int, ...]} ],
  "management_tone":   [ {"text": string, "citations": [int, ...]} ],
  "risks":             [ {"text": string, "citations": [int, ...]} ],
  "qa_highlights":     [ {"text": string, "citations": [int, ...]} ],
  "notable_quotes":    [ {"text": string, "speaker": string, "citations": [int, ...]} ]
}
Rules:
- "citations" are the [Ln] line numbers (integers) the claim is drawn from. Every item
  MUST have at least one citation. If you cannot cite it, do not include it.
- Every figure (revenue, EPS, margins, guidance ranges, growth rates) MUST appear in
  key_metrics with its value copied verbatim from the cited line.
- Do not infer or round numbers that are not present on the cited line.
- management_tone: characterize sentiment/confidence using the transcript's own wording,
  reported as an established-baseline signal, not a novel discovery. No adjectives without
  a cited basis.
- Output valid JSON only. No markdown fences, no commentary.
"""

SYSTEM_PROMPT = (
    "You are a buy-side equity analyst producing an institutional-grade earnings-call "
    "read. You are precise, measured, and you never fabricate a number. You frame "
    "judgment as hypotheses for correction, not verdicts. You ground every claim in the "
    "transcript by line number."
)


def build_user_prompt(company_hint: str, quarter_hint: str, numbered_transcript: str) -> str:
    return (
        f"Company (hint, correct if wrong): {company_hint or 'unknown'}\n"
        f"Quarter (hint, correct if wrong): {quarter_hint or 'unknown'}\n\n"
        "Analyze the earnings-call transcript below. Each line is prefixed with its "
        "line number as [Ln]; use those exact numbers for citations.\n\n"
        f"{SCHEMA_DESCRIPTION}\n\n"
        "=== TRANSCRIPT START ===\n"
        f"{numbered_transcript}\n"
        "=== TRANSCRIPT END ==="
    )
