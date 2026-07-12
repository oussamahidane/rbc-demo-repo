// Analysis prompt + schema description. Mirrors eca/prompts.py. Grounded in the
// established sentiment/NLP-in-finance literature (Loughran-McDonald, FinBERT) as a
// baseline, not a novel method. Hard requirement: every claim cites its source line.

export const SYSTEM_PROMPT =
  "You are a buy-side equity analyst producing an institutional-grade earnings-call read. " +
  "You are precise, measured, and you never fabricate a number. You frame judgment as " +
  "hypotheses for correction, not verdicts. You ground every claim in the transcript by line number.";

export const SCHEMA_DESCRIPTION = `Return ONLY a JSON object with these keys:
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
  reported as an established-baseline signal, not a novel discovery.
- Output valid JSON only. No markdown fences, no commentary.`;

export function buildUserPrompt(
  companyHint: string,
  quarterHint: string,
  numberedTranscript: string,
): string {
  return (
    `Company (hint, correct if wrong): ${companyHint || "unknown"}\n` +
    `Quarter (hint, correct if wrong): ${quarterHint || "unknown"}\n\n` +
    "Analyze the earnings-call transcript below. Each line is prefixed with its line " +
    "number as [Ln]; use those exact numbers for citations.\n\n" +
    `${SCHEMA_DESCRIPTION}\n\n` +
    "=== TRANSCRIPT START ===\n" +
    `${numberedTranscript}\n` +
    "=== TRANSCRIPT END ==="
  );
}
