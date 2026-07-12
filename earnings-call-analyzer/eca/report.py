"""Render a structured analysis into a house-style markdown report.

Style is not hard-coded here: the section order, title format, disclaimer, and notes
are read from design-system.md's `config` block. Edit that file to change the house
style; this renderer obeys it.
"""

from __future__ import annotations

import datetime as _dt
import re
from pathlib import Path

from .ground import GroundingResult

_DESIGN_SYSTEM = Path(__file__).resolve().parent.parent / "design-system.md"

_SECTION_TITLES = {
    "executive_summary": "Executive Summary",
    "guidance": "Guidance & Outlook",
    "key_metrics": "Key Metrics",
    "management_tone": "Management Tone",
    "risks": "Risks & Headwinds",
    "qa_highlights": "Q&A Highlights",
    "notable_quotes": "Notable Quotes",
}


def load_design_config(path: Path | None = None) -> dict:
    """Parse the ```config``` block out of design-system.md."""
    path = path or _DESIGN_SYSTEM
    text = path.read_text(encoding="utf-8")
    m = re.search(r"```config\s*(.*?)```", text, re.S)
    cfg: dict = {}
    if not m:
        return cfg
    for line in m.group(1).splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()
        cfg[key] = [v.strip() for v in value.split(",")] if key == "sections" else value
    return cfg


def _cites(item: dict) -> str:
    cs = [c for c in item.get("citations", []) if isinstance(c, int)]
    return " ".join(f"[L{c}]" for c in cs)


def render(
    analysis: dict,
    grounding: GroundingResult,
    *,
    source: str,
    model: str,
    config: dict | None = None,
) -> str:
    cfg = config or load_design_config()
    sections = cfg.get("sections") or list(_SECTION_TITLES)
    title = cfg.get("title_format", "{company} {quarter} Earnings Call Analysis").format(
        company=analysis.get("company", "Unknown Company"),
        quarter=analysis.get("quarter", "Unknown Quarter"),
    )
    ts = _dt.datetime.now().strftime("%Y-%m-%d %H:%M")

    out: list[str] = [f"# {title}", ""]
    out.append(
        f"*Source: `{source}` · Model: `{model}` · Generated: {ts} · "
        f"Grounding coverage: {grounding.coverage:.0%} · "
        f"Numeric verification: {grounding.numeric_accuracy:.0%}*"
    )
    out.append("")
    if cfg.get("citation_note"):
        out.append(f"> {cfg['citation_note']}")
        out.append("")

    for section in sections:
        items = analysis.get(section, [])
        if not items:
            continue
        out.append(f"## {_SECTION_TITLES.get(section, section.replace('_', ' ').title())}")
        out.append("")
        if section == "key_metrics":
            out.append("| Metric | Value | Citation |")
            out.append("| --- | --- | --- |")
            for it in items:
                out.append(f"| {it.get('metric','')} | {it.get('value','')} | {_cites(it)} |")
        elif section == "notable_quotes":
            for it in items:
                who = it.get("speaker", "").strip()
                out.append(f"> \"{it.get('text','')}\" **{who}** {_cites(it)}".rstrip())
                out.append("")
        else:
            for it in items:
                out.append(f"- {it.get('text','')} {_cites(it)}".rstrip())
        out.append("")

    if grounding.issues:
        out.append("## Grounding Flags")
        out.append("")
        out.append("_Claims the grounding layer could not verify. Surfaced, not hidden._")
        out.append("")
        for issue in grounding.issues:
            out.append(f"- {issue}")
        out.append("")

    if cfg.get("disclaimer"):
        out.append("---")
        out.append("")
        out.append(f"*{cfg['disclaimer']}*")
        out.append("")

    return "\n".join(out).rstrip() + "\n"
