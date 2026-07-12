"""Analysis engine: structured, cited extraction from a transcript.

Two backends behind one interface:
  - mock  : deterministic heuristic extractor (no API key, no network). Doubles as the
            baseline the eval harness scores real runs against.
  - claude: real analysis via the Anthropic API when ANTHROPIC_API_KEY is set.

Both return the same schema (see prompts.SECTIONS), with every item carrying real
line citations so the grounding layer can verify them.
"""

from __future__ import annotations

import json
import os
import re

from . import prompts
from .ingest import Transcript

# --- Small Loughran-McDonald-style sentiment lexicon (baseline, not novel) ----------
# A production build would load the full LM master dictionary; this compact subset keeps
# the mock deterministic and dependency-free while illustrating the method.
LM_POSITIVE = {
    "growth", "grew", "strong", "record", "improved", "improvement", "gain", "gains",
    "profit", "profitable", "outperform", "beat", "exceeded", "confident", "momentum",
    "accelerate", "expansion", "robust", "healthy", "opportunity", "progress",
}
LM_NEGATIVE = {
    "decline", "declined", "weak", "weakness", "loss", "losses", "headwind", "headwinds",
    "pressure", "uncertain", "uncertainty", "challenge", "challenging", "slowdown",
    "miss", "missed", "risk", "risks", "soft", "softness", "adverse", "litigation",
}

_MONEY = re.compile(r"\$\s?\d[\d,]*(?:\.\d+)?\s?(?:billion|million|trillion|bn|mn|b|m)?", re.I)
_PERCENT = re.compile(r"\d[\d,]*(?:\.\d+)?\s?%")
_NUMBER = re.compile(r"\d[\d,]*(?:\.\d+)?")
# A guided range like "$4.4 to $4.6 billion" or "31 to 32%".
_MONEY_RANGE = re.compile(
    r"\$\s?\d[\d,]*(?:\.\d+)?\s*(?:to|-|–|and)\s*\$?\s?\d[\d,]*(?:\.\d+)?\s?"
    r"(?:billion|million|trillion|bn|mn|b|m)?",
    re.I,
)
_PERCENT_RANGE = re.compile(r"\d[\d,]*(?:\.\d+)?\s*(?:to|-|–)\s*\d[\d,]*(?:\.\d+)?\s?%")

_METRIC_KEYWORDS = [
    ("EPS", re.compile(r"\b(eps|earnings per share|diluted (?:eps|earnings))\b", re.I)),
    ("Revenue", re.compile(r"\b(revenue|net sales|total sales|top line)\b", re.I)),
    ("Net income", re.compile(r"\b(net income|net earnings|net loss)\b", re.I)),
    ("Operating margin", re.compile(r"\b(operating margin|gross margin|operating income)\b", re.I)),
    ("Free cash flow", re.compile(r"\b(free cash flow|operating cash flow|cash flow)\b", re.I)),
    ("Guidance", re.compile(r"\b(guidance|outlook|expect|forecast|full[- ]year|fiscal)\b", re.I)),
    ("Buyback / dividend", re.compile(r"\b(buyback|repurchase|dividend|return of capital)\b", re.I)),
]

_GUIDANCE_RE = re.compile(r"\b(guidance|outlook|expect|anticipate|forecast|full[- ]year|next quarter|fiscal \d{4})\b", re.I)
_RISK_RE = re.compile(r"\b(risk|headwind|uncertain|challenge|pressure|macro|foreign exchange|fx|slowdown|softness)\b", re.I)
_QA_MARKER = re.compile(r"\b(q&a|question[- ]and[- ]answer|first question|analyst)\b", re.I)


def analyze(
    transcript: Transcript,
    company_hint: str = "",
    quarter_hint: str = "",
    backend: str = "mock",
    model: str | None = None,
) -> dict:
    if backend == "claude":
        return _analyze_claude(transcript, company_hint, quarter_hint, model)
    return _analyze_mock(transcript, company_hint, quarter_hint)


# --- Mock backend --------------------------------------------------------------------

def _analyze_mock(transcript: Transcript, company_hint: str, quarter_hint: str) -> dict:
    lines = transcript.lines
    company = company_hint or _guess_company(lines)
    quarter = quarter_hint or _guess_quarter(lines)

    key_metrics = _extract_metrics(lines)
    guidance = _extract_matches(lines, _GUIDANCE_RE, limit=4)
    risks = _extract_matches(lines, _RISK_RE, limit=4)
    qa = _extract_qa(lines)
    tone = _extract_tone(lines)
    quotes = _extract_quotes(lines)

    # Executive summary: top metric lines + the sharpest tone read.
    summary: list[dict] = []
    for m in key_metrics[:3]:
        summary.append({"text": f"{m['metric']} reported at {m['value']}.", "citations": m["citations"]})
    if tone:
        summary.append(tone[0])

    return {
        "company": company,
        "quarter": quarter,
        "executive_summary": summary,
        "guidance": guidance,
        "key_metrics": key_metrics,
        "management_tone": tone,
        "risks": risks,
        "qa_highlights": qa,
        "notable_quotes": quotes,
    }


_COMPANY_RE = re.compile(
    r"((?:[A-Z][A-Za-z0-9.&'’]+,?\s+){1,5}"
    r"(?:Corporation|Incorporated|Company|Holdings|Group|Corp|Inc|Ltd|PLC|Co|N\.V)\.?)"
)


def _guess_company(lines: list[str]) -> str:
    for text in lines[:12]:
        m = _COMPANY_RE.search(text)
        if m:
            return m.group(1).strip().rstrip(",")
    return "Unknown Company"


def _guess_quarter(lines: list[str]) -> str:
    for text in lines[:20]:
        m = re.search(r"\b(Q[1-4]|first|second|third|fourth)[- ]?(?:quarter)?[, ]*(?:of\s*)?(?:fiscal\s*)?(20\d{2})\b", text, re.I)
        if m:
            return f"{m.group(1).upper()} {m.group(2)}"
    return "Unknown Quarter"


def _extract_metrics(lines: list[str]) -> list[dict]:
    metrics: list[dict] = []
    seen: set[str] = set()
    for i, text in enumerate(lines, start=1):
        if not (_MONEY.search(text) or _PERCENT.search(text)):
            continue
        for label, kw in _METRIC_KEYWORDS:
            if label in seen:
                continue
            if kw.search(text):
                value = _pick_value(text)
                if value:
                    metrics.append({"metric": label, "value": value, "citations": [i]})
                    seen.add(label)
                break
    return metrics


def _pick_value(text: str) -> str:
    money_range = _MONEY_RANGE.search(text)
    if money_range:
        return re.sub(r"\s+", " ", money_range.group(0).strip())
    pct_range = _PERCENT_RANGE.search(text)
    if pct_range:
        return re.sub(r"\s+", " ", pct_range.group(0).strip())
    money = _MONEY.search(text)
    pct = _PERCENT.search(text)
    if money and pct:
        # Report both when a line pairs an absolute with a growth rate.
        return f"{money.group(0).strip()} ({pct.group(0).strip()})"
    if money:
        return money.group(0).strip()
    if pct:
        return pct.group(0).strip()
    num = _NUMBER.search(text)
    return num.group(0) if num else ""


def _extract_matches(lines: list[str], pattern: re.Pattern, limit: int) -> list[dict]:
    out: list[dict] = []
    for i, text in enumerate(lines, start=1):
        if pattern.search(text):
            out.append({"text": _clip(text), "citations": [i]})
            if len(out) >= limit:
                break
    return out


def _extract_qa(lines: list[str]) -> list[dict]:
    start = None
    for i, text in enumerate(lines, start=1):
        if _QA_MARKER.search(text):
            start = i
            break
    if start is None:
        return []
    out: list[dict] = []
    for i in range(start, len(lines) + 1):
        text = lines[i - 1]
        if re.match(r"^(analyst|q:|question)", text, re.I) or (_PERCENT.search(text) or _MONEY.search(text)):
            out.append({"text": _clip(text), "citations": [i]})
            if len(out) >= 4:
                break
    return out


def _extract_tone(lines: list[str]) -> list[dict]:
    pos_hits: list[int] = []
    neg_hits: list[int] = []
    for i, text in enumerate(lines, start=1):
        words = set(re.findall(r"[a-z]+", text.lower()))
        if words & LM_POSITIVE:
            pos_hits.append(i)
        if words & LM_NEGATIVE:
            neg_hits.append(i)
    total = len(pos_hits) + len(neg_hits)
    if total == 0:
        return []
    net = (len(pos_hits) - len(neg_hits)) / total
    lean = "net positive" if net > 0.15 else "net negative" if net < -0.15 else "balanced"
    cites = (pos_hits[:2] + neg_hits[:2]) or pos_hits[:2] or neg_hits[:2]
    return [{
        "text": (
            f"Management tone reads {lean} on a Loughran-McDonald-style lexicon "
            f"({len(pos_hits)} positive vs {len(neg_hits)} negative sentiment lines). "
            "Baseline signal, not a verdict."
        ),
        "citations": sorted(set(cites)) or [1],
    }]


def _extract_quotes(lines: list[str]) -> list[dict]:
    out: list[dict] = []
    for i, text in enumerate(lines, start=1):
        speaker = re.match(r"^([A-Z][a-zA-Z.\- ]{2,40}?)\s*[:\-]", text)
        words = set(re.findall(r"[a-z]+", text.lower()))
        strong = words & (LM_POSITIVE | LM_NEGATIVE)
        if speaker and strong and len(text) < 240:
            body = text[speaker.end():].strip()
            out.append({"text": _clip(body), "speaker": speaker.group(1).strip(), "citations": [i]})
            if len(out) >= 2:
                break
    return out


def _clip(text: str, limit: int = 220) -> str:
    text = text.strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


# --- Claude backend ------------------------------------------------------------------

DEFAULT_MODEL = os.environ.get("ECA_MODEL", "claude-sonnet-5")


def _analyze_claude(transcript: Transcript, company_hint: str, quarter_hint: str, model: str | None) -> dict:
    try:
        import anthropic
    except ModuleNotFoundError as exc:  # pragma: no cover - optional dep
        raise RuntimeError(
            "Real analysis needs the anthropic SDK (`pip install anthropic`). "
            "Or run with --mock for the offline pipeline."
        ) from exc
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise RuntimeError("ANTHROPIC_API_KEY is not set. Set it, or run with --mock.")

    client = anthropic.Anthropic()
    user = prompts.build_user_prompt(company_hint, quarter_hint, transcript.numbered_markdown())
    resp = client.messages.create(
        model=model or DEFAULT_MODEL,
        max_tokens=4000,
        system=prompts.SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user}],
    )
    text = "".join(block.text for block in resp.content if getattr(block, "type", "") == "text")
    return _coerce_schema(_parse_json(text))


def _parse_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.S)
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model did not return a JSON object.")
    return json.loads(text[start : end + 1])


def _coerce_schema(data: dict) -> dict:
    out = {"company": data.get("company", "Unknown Company"), "quarter": data.get("quarter", "Unknown Quarter")}
    for section in prompts.SECTIONS:
        items = data.get(section) or []
        out[section] = items if isinstance(items, list) else []
    return out
