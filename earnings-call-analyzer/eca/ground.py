"""Grounding layer (differentiator #1).

Hallucinated figures are the adoption blocker on investment desks. So every claim in
the analysis must cite a real transcript line, and every number in a claim must actually
appear on one of its cited lines. This module verifies both and reports coverage.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from . import prompts
from .ingest import Transcript

# Verification targets FINANCIAL figures — money amounts and percentages — not every
# integer. Lexicon counts, years, and line references are not claims to verify.
_MONEY_NUM = re.compile(r"\$\s?(\d[\d,]*(?:\.\d+)?)", re.I)
_PCT_NUM = re.compile(r"(\d[\d,]*(?:\.\d+)?)\s?%")


@dataclass
class GroundingResult:
    total_claims: int = 0
    cited_claims: int = 0            # claims with >=1 resolvable citation
    numerically_verified: int = 0    # numeric claims whose number appears on a cited line
    numeric_claims: int = 0
    issues: list[str] = field(default_factory=list)

    @property
    def coverage(self) -> float:
        return (self.cited_claims / self.total_claims) if self.total_claims else 1.0

    @property
    def numeric_accuracy(self) -> float:
        return (self.numerically_verified / self.numeric_claims) if self.numeric_claims else 1.0


def _claim_text(section: str, item: dict) -> str:
    if section == "key_metrics":
        return f"{item.get('metric', '')} {item.get('value', '')}"
    return item.get("text", "")


def _nums(text: str) -> set[str]:
    """Financial figures in `text`, normalized (commas stripped)."""
    figures = _MONEY_NUM.findall(text) + _PCT_NUM.findall(text)
    return {f.replace(",", "") for f in figures}


def check_grounding(analysis: dict, transcript: Transcript) -> GroundingResult:
    result = GroundingResult()
    n_lines = len(transcript.lines)

    for section in prompts.SECTIONS:
        for item in analysis.get(section, []):
            result.total_claims += 1
            text = _claim_text(section, item)
            cites = [c for c in item.get("citations", []) if isinstance(c, int)]

            valid_cites = [c for c in cites if 1 <= c <= n_lines]
            if not valid_cites:
                result.issues.append(f"[{section}] uncited or out-of-range: {text[:80]!r}")
                continue
            result.cited_claims += 1

            claim_nums = _nums(text)
            if claim_nums:
                result.numeric_claims += 1
                cited_text = " ".join(transcript.line(c) or "" for c in valid_cites)
                source_nums = _nums(cited_text)
                if claim_nums & source_nums:
                    result.numerically_verified += 1
                else:
                    result.issues.append(
                        f"[{section}] number(s) {sorted(claim_nums)} not found on cited "
                        f"line(s) {valid_cites}: {text[:80]!r}"
                    )
    return result
