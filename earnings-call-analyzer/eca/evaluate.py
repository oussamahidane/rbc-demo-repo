"""Evaluation harness (differentiator #2).

Runs a golden set of synthetic transcripts with known ground truth and scores three
things no candidate usually demos:
  - extraction accuracy : did we surface the expected metrics/facts?
  - grounding coverage  : is every claim cited and numerically verifiable?
  - consistency         : do repeated runs agree? (deterministic in mock; the real
                          signal is run-to-run stability of the Claude backend)
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from . import analyze as _analyze
from .ground import check_grounding
from .ingest import ingest


@dataclass
class CaseResult:
    slug: str
    accuracy: float
    grounding: float
    numeric: float
    consistency: float
    found: int
    expected: int
    missing: list[str] = field(default_factory=list)


@dataclass
class Scorecard:
    cases: list[CaseResult] = field(default_factory=list)
    accuracy_threshold: float = 0.8
    grounding_threshold: float = 0.95

    @property
    def mean_accuracy(self) -> float:
        return _mean(c.accuracy for c in self.cases)

    @property
    def mean_grounding(self) -> float:
        return _mean(c.grounding for c in self.cases)

    @property
    def mean_numeric(self) -> float:
        return _mean(c.numeric for c in self.cases)

    @property
    def mean_consistency(self) -> float:
        return _mean(c.consistency for c in self.cases)

    @property
    def passed(self) -> bool:
        return (
            bool(self.cases)
            and self.mean_accuracy >= self.accuracy_threshold
            and self.mean_grounding >= self.grounding_threshold
        )

    def render(self) -> str:
        lines = ["Earnings-Call Analyzer — Evaluation Scorecard", "=" * 46, ""]
        header = f"{'Transcript':<28}{'Accuracy':>10}{'Grounding':>11}{'Numeric':>9}{'Consist.':>10}"
        lines.append(header)
        lines.append("-" * len(header))
        for c in self.cases:
            lines.append(
                f"{c.slug:<28}{c.accuracy:>9.0%}{c.grounding:>11.0%}"
                f"{c.numeric:>9.0%}{c.consistency:>10.0%}"
            )
        lines.append("-" * len(header))
        lines.append(
            f"{'MEAN':<28}{self.mean_accuracy:>9.0%}{self.mean_grounding:>11.0%}"
            f"{self.mean_numeric:>9.0%}{self.mean_consistency:>10.0%}"
        )
        lines.append("")
        for c in self.cases:
            if c.missing:
                lines.append(f"  {c.slug}: missed {c.found}/{c.expected} — {', '.join(c.missing)}")
        lines.append("")
        verdict = "PASS" if self.passed else "FAIL"
        lines.append(
            f"Result: {verdict}  "
            f"(accuracy >= {self.accuracy_threshold:.0%}, grounding >= {self.grounding_threshold:.0%})"
        )
        return "\n".join(lines)


def _mean(values) -> float:
    values = list(values)
    return sum(values) / len(values) if values else 0.0


def _fingerprint(analysis: dict) -> str:
    metrics = sorted((m.get("metric", ""), m.get("value", "")) for m in analysis.get("key_metrics", []))
    return json.dumps(metrics, sort_keys=True)


def _score_case(slug: str, transcript_path: Path, expected: dict, backend: str, model, runs: int) -> CaseResult:
    transcript = ingest(transcript_path)
    fingerprints: set[str] = set()
    analysis = None
    for _ in range(max(1, runs)):
        analysis = _analyze.analyze(
            transcript,
            company_hint="",
            quarter_hint="",
            backend=backend,
            model=model,
        )
        fingerprints.add(_fingerprint(analysis))
    consistency = 1.0 if len(fingerprints) == 1 else 1.0 / len(fingerprints)

    exp_metrics = expected.get("expected_metrics", [])
    found = 0
    missing: list[str] = []
    produced = analysis.get("key_metrics", []) if analysis else []
    cited_lines_text = _cited_lines_text(analysis, transcript) if analysis else ""
    for em in exp_metrics:
        label = em.get("metric", "").lower()
        needle = str(em.get("value_contains", "")).lower().replace(",", "")
        hit = False
        for pm in produced:
            if label in pm.get("metric", "").lower():
                val = str(pm.get("value", "")).lower().replace(",", "")
                if needle in val:
                    hit = True
                    break
        # fall back to grounding evidence: the value is present on a cited line
        if not hit and needle and needle in cited_lines_text:
            hit = True
        if hit:
            found += 1
        else:
            missing.append(em.get("metric", "?"))
    accuracy = found / len(exp_metrics) if exp_metrics else 1.0

    g = check_grounding(analysis, transcript)
    return CaseResult(
        slug=slug,
        accuracy=accuracy,
        grounding=g.coverage,
        numeric=g.numeric_accuracy,
        consistency=consistency,
        found=found,
        expected=len(exp_metrics),
        missing=missing,
    )


def _cited_lines_text(analysis: dict, transcript) -> str:
    from . import prompts
    cites: set[int] = set()
    for section in prompts.SECTIONS:
        for item in analysis.get(section, []):
            for c in item.get("citations", []):
                if isinstance(c, int):
                    cites.add(c)
    return " ".join((transcript.line(c) or "") for c in sorted(cites)).lower().replace(",", "")


def run_eval(golden_dir: Path, backend: str = "mock", model=None, runs: int = 3) -> Scorecard:
    golden_dir = Path(golden_dir)
    scorecard = Scorecard()
    for expected_path in sorted(golden_dir.glob("*.expected.json")):
        slug = expected_path.name[: -len(".expected.json")]
        transcript_path = golden_dir / f"{slug}.md"
        if not transcript_path.exists():
            transcript_path = golden_dir / f"{slug}.txt"
        if not transcript_path.exists():
            continue
        expected = json.loads(expected_path.read_text(encoding="utf-8"))
        scorecard.cases.append(_score_case(slug, transcript_path, expected, backend, model, runs))
    return scorecard
