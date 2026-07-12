// Shared shapes for the analysis pipeline. Mirrors the Python `eca` package schema so
// the web tool and the CLI produce the same structured output.

export interface CitedClaim {
  text: string;
  citations: number[];
}

export interface Metric {
  metric: string;
  value: string;
  citations: number[];
}

export interface Quote {
  text: string;
  speaker: string;
  citations: number[];
}

export interface Analysis {
  company: string;
  quarter: string;
  executive_summary: CitedClaim[];
  guidance: CitedClaim[];
  key_metrics: Metric[];
  management_tone: CitedClaim[];
  risks: CitedClaim[];
  qa_highlights: CitedClaim[];
  notable_quotes: Quote[];
}

export interface GroundingResult {
  total_claims: number;
  cited_claims: number;
  numeric_claims: number;
  numerically_verified: number;
  coverage: number; // cited_claims / total_claims
  numeric_accuracy: number; // numerically_verified / numeric_claims
  issues: string[];
}

export interface AnalyzeResponse {
  backend: "claude" | "sample";
  model: string;
  analysis: Analysis;
  grounding: GroundingResult;
  reportMarkdown: string;
  lines: string[]; // ingested, line-numbered content so the UI can resolve [Ln] citations
}

// Ordered sections — kept in sync with design-system.md `sections` and eca/prompts.py.
export const SECTIONS = [
  "executive_summary",
  "guidance",
  "key_metrics",
  "management_tone",
  "risks",
  "qa_highlights",
  "notable_quotes",
] as const;
