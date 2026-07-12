"""CLI: `python -m eca analyze <transcript>`, `python -m eca convert <file>`, `python -m eca eval`."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from . import analyze as _analyze
from . import report as _report
from .ground import check_grounding
from .ingest import ingest


def _backend(args) -> str:
    if args.mock:
        return "mock"
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "claude"
    return "mock"


def cmd_analyze(args) -> int:
    transcript = ingest(args.transcript)
    backend = _backend(args)
    model = args.model or _analyze.DEFAULT_MODEL if backend == "claude" else "mock"

    analysis = _analyze.analyze(
        transcript,
        company_hint=args.company,
        quarter_hint=args.quarter,
        backend=backend,
        model=args.model,
    )
    grounding = check_grounding(analysis, transcript)
    md = _report.render(analysis, grounding, source=transcript.source, model=model)

    if args.out:
        out_path = Path(args.out)
    else:
        slug = Path(args.transcript).stem
        out_path = Path("reports") / f"{slug}.report.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(md, encoding="utf-8")

    print(f"Backend: {backend} · Model: {model}")
    print(f"Grounding coverage: {grounding.coverage:.0%} · "
          f"Numeric verification: {grounding.numeric_accuracy:.0%} · "
          f"Flags: {len(grounding.issues)}")
    print(f"Report written to {out_path}")
    return 0


def cmd_convert(args) -> int:
    from .convert import convert_to_markdown, truncate
    text, truncated = truncate(convert_to_markdown(args.file), args.max_chars)
    out_path = Path(args.out) if args.out else Path(args.file).with_suffix(".md")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text, encoding="utf-8")
    if truncated:
        print(f"warning: output truncated to {args.max_chars:,} characters "
              f"(the web UI transcript limit); pass --max-chars 0 to keep everything.",
              file=sys.stderr)
    print(f"Wrote {out_path} ({len(text):,} chars)")
    return 0


def cmd_eval(args) -> int:
    from .evaluate import run_eval
    backend = _backend(args)
    scorecard = run_eval(
        golden_dir=Path(args.golden),
        backend=backend,
        model=args.model,
        runs=args.runs,
    )
    print(scorecard.render())
    return 0 if scorecard.passed else 1


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="eca", description="Earnings-Call Analyzer")
    p.add_argument("--mock", action="store_true", help="Force offline deterministic mode.")
    p.add_argument("--model", default=None, help="Claude model id (real mode).")
    sub = p.add_subparsers(dest="command", required=True)

    a = sub.add_parser("analyze", help="Analyze one transcript into a report.")
    a.add_argument("transcript", help="Path to .txt/.md/.pdf/.docx/.pptx transcript.")
    a.add_argument("--company", default="", help="Company hint.")
    a.add_argument("--quarter", default="", help="Quarter hint (e.g. 'Q3 2025').")
    a.add_argument("--out", default=None, help="Output path (default reports/<slug>.report.md).")
    a.set_defaults(func=cmd_analyze)

    c = sub.add_parser("convert", help="Convert a .pdf/.docx/.pptx/.txt file to markdown.")
    c.add_argument("file", help="Path to the file to convert.")
    c.add_argument("--out", default=None, help="Output path (default: same name, .md).")
    c.add_argument("--max-chars", type=int, default=17_000,
                   help="Character budget matching the web UI limit (0 = unlimited).")
    c.set_defaults(func=cmd_convert)

    e = sub.add_parser("eval", help="Run the golden-set evaluation harness.")
    e.add_argument("--golden", default="golden", help="Golden set directory.")
    e.add_argument("--runs", type=int, default=3, help="Runs per transcript (consistency).")
    e.set_defaults(func=cmd_eval)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
