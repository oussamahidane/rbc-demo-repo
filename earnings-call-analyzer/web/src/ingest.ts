// Ingest: normalize raw transcript text into stable, line-numbered content.
// Stable line numbers are the backbone of grounding: every claim cites its [Ln].
// (Text-only in the browser/Worker; PDF extraction stays in the Python reference tool.)

export interface Transcript {
  lines: string[]; // 1-indexed content: lines[0] is [L1]
  exhibits: string[];
}

const IMAGE_RE = /!\[[^\]]*\]\([^)]*\)/;
const EXHIBIT_RE = /\b(exhibit|figure|chart|table|appendix)\s+[A-Z0-9]/i;

export function ingest(raw: string): Transcript {
  const lines: string[] = [];
  const exhibits: string[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    let text = rawLine.trim();
    if (!text) continue; // collapse blanks so numbering tracks meaningful content
    if (IMAGE_RE.test(text) || EXHIBIT_RE.test(text)) exhibits.push(text);
    text = text.replace(/[ \t]+/g, " ");
    lines.push(text);
  }
  return { lines, exhibits };
}

export function numberedMarkdown(t: Transcript): string {
  return t.lines.map((text, i) => `[L${i + 1}] ${text}`).join("\n");
}

export function line(t: Transcript, n: number): string | null {
  return n >= 1 && n <= t.lines.length ? t.lines[n - 1] : null;
}
