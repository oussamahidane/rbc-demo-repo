"""Ingest: normalize a transcript source into clean, line-numbered markdown.

Stable line numbers are the backbone of the grounding layer: every claim in the
report cites the line(s) it came from, so the numbering must be deterministic.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Transcript:
    """A normalized, line-numbered transcript."""

    source: str
    lines: list[str]                       # 1-indexed content: lines[0] is [L1]
    exhibits: list[str] = field(default_factory=list)  # flagged images/exhibits

    def numbered_markdown(self) -> str:
        """Render as `[Ln] text` — the exact form the model reads and cites."""
        return "\n".join(f"[L{i}] {t}" for i, t in enumerate(self.lines, start=1))

    def line(self, n: int) -> str | None:
        """Return the text of line n (1-indexed), or None if out of range."""
        if 1 <= n <= len(self.lines):
            return self.lines[n - 1]
        return None


_IMAGE_RE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
_EXHIBIT_RE = re.compile(r"\b(exhibit|figure|chart|table|appendix)\s+[A-Z0-9]", re.IGNORECASE)


def ingest(path: str | Path) -> Transcript:
    """Load a .txt/.md/.pdf/.docx/.pptx transcript and normalize it into a Transcript."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Transcript not found: {path}")

    from .convert import convert_to_markdown
    raw = convert_to_markdown(path)
    lines: list[str] = []
    exhibits: list[str] = []

    for raw_line in raw.splitlines():
        text = raw_line.strip()
        if not text:
            continue  # collapse blank lines so numbering tracks meaningful content
        if _IMAGE_RE.search(text) or _EXHIBIT_RE.search(text):
            exhibits.append(text)
        # keep the line in the body regardless; exhibits are flagged, not removed
        # normalize internal whitespace runs to single spaces for stable numbering
        text = re.sub(r"[ \t]+", " ", text)
        lines.append(text)

    return Transcript(source=str(path), lines=lines, exhibits=exhibits)
