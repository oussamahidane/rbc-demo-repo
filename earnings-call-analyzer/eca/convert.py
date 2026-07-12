"""Convert transcript files (.pdf/.docx/.pptx/.txt/.md) to plain markdown text.

Runs before ingest so the engine and the AI model only ever see clean text.
.docx/.pptx are OOXML zip containers, so extraction is stdlib-only (zipfile +
ElementTree); PDF needs pypdf. The default character budget mirrors the web
UI's 17,000-character transcript limit; pass max_chars=0 to keep everything.
"""

from __future__ import annotations

import zipfile
from pathlib import Path
from xml.etree import ElementTree

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB cap on any converted file
MAX_CHARS = 17_000                 # mirrors the web UI transcript limit

SUPPORTED = {".txt", ".md", ".pdf", ".docx", ".pptx"}
_LEGACY = {".doc": ".docx", ".ppt": ".pptx"}

_WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
_DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"


def convert_to_markdown(path: str | Path) -> str:
    """Extract the text content of a supported file as markdown-ready text."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    suffix = path.suffix.lower()
    if suffix in _LEGACY:
        raise ValueError(
            f"Legacy {suffix} files are not supported; re-save as {_LEGACY[suffix]} and retry."
        )
    if suffix not in SUPPORTED:
        raise ValueError(
            f"Unsupported file type {suffix}; expected one of: {', '.join(sorted(SUPPORTED))}."
        )
    size = path.stat().st_size
    if size > MAX_FILE_BYTES:
        raise ValueError(
            f"File is {size / 1_048_576:.1f} MB; max is {MAX_FILE_BYTES // 1_048_576} MB."
        )
    if suffix == ".pdf":
        return _pdf_text(path)
    if suffix == ".docx":
        return _docx_text(path)
    if suffix == ".pptx":
        return _pptx_text(path)
    return path.read_text(encoding="utf-8", errors="replace")


def truncate(text: str, max_chars: int = MAX_CHARS) -> tuple[str, bool]:
    """Apply the character budget. Returns (text, was_truncated); 0 disables."""
    if max_chars and len(text) > max_chars:
        return text[:max_chars], True
    return text, False


def _pdf_text(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ModuleNotFoundError as exc:  # pragma: no cover - depends on optional dep
        raise RuntimeError(
            "PDF conversion needs pypdf. Install it (`pip install pypdf`) or convert "
            "the transcript to .txt/.md first."
        ) from exc
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _paragraphs(root: ElementTree.Element, ns: str) -> list[str]:
    """Collect visible text per paragraph (<w:p>/<a:p>), skipping empty ones."""
    out: list[str] = []
    for p in root.iter(f"{{{ns}}}p"):
        text = "".join(t.text or "" for t in p.iter(f"{{{ns}}}t")).strip()
        if text:
            out.append(text)
    return out


def _docx_text(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as zf:
            with zf.open("word/document.xml") as f:
                root = ElementTree.parse(f).getroot()
    except (zipfile.BadZipFile, KeyError, ElementTree.ParseError) as exc:
        raise ValueError(f"Could not read {path.name} as a .docx file: {exc}") from exc
    return "\n".join(_paragraphs(root, _WORD_NS))


def _pptx_text(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as zf:
            slide_names = sorted(
                (n for n in zf.namelist()
                 if n.startswith("ppt/slides/slide") and n.endswith(".xml")),
                key=lambda n: int("".join(c for c in n if c.isdigit()) or 0),
            )
            if not slide_names:
                raise ValueError(f"No slides found in {path.name}.")
            parts: list[str] = []
            for i, name in enumerate(slide_names, start=1):
                with zf.open(name) as f:
                    root = ElementTree.parse(f).getroot()
                paras = _paragraphs(root, _DRAWING_NS)
                if paras:
                    parts.append(f"## Slide {i}\n" + "\n".join(paras))
    except (zipfile.BadZipFile, ElementTree.ParseError) as exc:
        raise ValueError(f"Could not read {path.name} as a .pptx file: {exc}") from exc
    return "\n\n".join(parts)
