"use strict";

const SECTION_ORDER = [
  ["executive_summary", "Executive Summary"],
  ["guidance", "Guidance & Outlook"],
  ["key_metrics", "Key Metrics"],
  ["management_tone", "Management Tone"],
  ["risks", "Risks & Headwinds"],
  ["qa_highlights", "Q&A Highlights"],
  ["notable_quotes", "Notable Quotes"],
];

const SAMPLE = `Operator: Good morning and welcome to the Northwind Technologies, Inc. Q3 2025 earnings conference call.
Dana Whitfield: Thank you, and good morning everyone. We delivered a strong third quarter with broad-based momentum across our platform.
Dana Whitfield: Revenue was $4.2 billion, up 14% year over year, driven by record demand in our cloud segment.
Dana Whitfield: Cloud revenue grew 28% and now represents just over half of total revenue.
Dana Whitfield: Diluted earnings per share were $1.20, an increase of 18% year over year.
Dana Whitfield: Operating margin expanded to 32%, reflecting improved efficiency and disciplined cost management.
Marcus Lindqvist: Net income for the quarter was $980 million, up from $850 million a year ago.
Marcus Lindqvist: Free cash flow was $1.1 billion, a healthy conversion of earnings to cash.
Marcus Lindqvist: We returned $600 million to shareholders through buybacks during the quarter.
Marcus Lindqvist: For the fourth quarter, we expect revenue of $4.4 to $4.6 billion.
Marcus Lindqvist: We remain mindful of foreign exchange pressure, which was a modest headwind this quarter.
Operator: We will now begin the question-and-answer session. Our first question comes from an analyst at a major bank.
Analyst: Congratulations on the quarter. Can you talk about the sustainability of the 28% cloud growth?
Dana Whitfield: Yes, we see a long runway. Adoption is still early and the pipeline is robust heading into next year.
Analyst: Any weakness or softness worth flagging in the macro environment?
Dana Whitfield: Some customers are scrutinizing budgets, but overall demand remains strong and we have not seen a slowdown.`;

const MAX_TRANSCRIPT_CHARS = 17000;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB upload cap; text is trimmed to 17k chars after extraction

const $ = (id) => document.getElementById(id);
const els = {
  company: $("company"), quarter: $("quarter"), transcript: $("transcript"),
  analyze: $("analyze"), loadSample: $("load-sample"), file: $("file"), clear: $("clear"),
  status: $("status"), report: $("report"), hint: $("input-hint"), charCount: $("char-count"),
  scorecard: $("scorecard"), sGround: $("s-grounding"), sNum: $("s-numeric"), sClaims: $("s-claims"),
  download: $("download"), badge: $("backend-badge"),
};

let lastMarkdown = "";
let lastName = "report";

function setStatus(text, kind) {
  els.status.textContent = text;
  els.status.className = "status" + (kind ? " " + kind : "");
  els.status.classList.remove("hidden");
  els.report.classList.add("hidden");
}

function pctClass(v) { return v >= 0.95 ? "good" : v >= 0.8 ? "warn" : "bad"; }
function pct(v) { return Math.round(v * 100) + "%"; }

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.title) node.title = opts.title;
  for (const c of children) node.appendChild(c);
  return node;
}

function citeChips(citations, lines) {
  const frag = document.createDocumentFragment();
  for (const c of citations || []) {
    if (!Number.isInteger(c)) continue;
    const src = lines[c - 1] || "(line unavailable)";
    frag.appendChild(el("span", { class: "cite", text: "L" + c, title: src }));
  }
  return frag;
}

function bulletList(items, lines) {
  const ul = el("ul");
  for (const it of items) {
    const li = el("li", { text: (it.text || "") + " " });
    li.appendChild(citeChips(it.citations, lines));
    ul.appendChild(li);
  }
  return ul;
}

function metricsTable(items, lines) {
  const table = el("table", { class: "metrics" });
  const thead = el("thead");
  const hr = el("tr");
  ["Metric", "Value", "Source"].forEach((h) => hr.appendChild(el("th", { text: h })));
  thead.appendChild(hr); table.appendChild(thead);
  const tb = el("tbody");
  for (const it of items) {
    const tr = el("tr");
    tr.appendChild(el("td", { text: it.metric || "" }));
    tr.appendChild(el("td", { class: "value", text: it.value || "" }));
    const td = el("td");
    td.appendChild(citeChips(it.citations, lines));
    tr.appendChild(td);
    tb.appendChild(tr);
  }
  table.appendChild(tb);
  return table;
}

function quotes(items, lines) {
  const frag = document.createDocumentFragment();
  for (const it of items) {
    const bq = el("blockquote", { text: "“" + (it.text || "") + "” " });
    bq.appendChild(citeChips(it.citations, lines));
    if (it.speaker) bq.appendChild(el("span", { class: "who", text: it.speaker }));
    frag.appendChild(bq);
  }
  return frag;
}

function renderReport(data) {
  const { analysis, grounding, lines } = data;
  const root = els.report;
  root.textContent = "";

  root.appendChild(el("h3", { class: "doc-title", text: `${analysis.company} ${analysis.quarter} Earnings Call Analysis` }));
  root.appendChild(el("p", {
    class: "doc-meta",
    text: `Backend: ${data.backend} · Model: ${data.model} · Grounding ${pct(grounding.coverage)} · Numeric ${pct(grounding.numeric_accuracy)}`,
  }));

  for (const [key, title] of SECTION_ORDER) {
    const items = analysis[key] || [];
    if (!items.length) continue;
    const sec = el("section");
    sec.appendChild(el("h4", { text: title }));
    if (key === "key_metrics") sec.appendChild(metricsTable(items, lines));
    else if (key === "notable_quotes") sec.appendChild(quotes(items, lines));
    else sec.appendChild(bulletList(items, lines));
    root.appendChild(sec);
  }

  if (grounding.issues && grounding.issues.length) {
    const box = el("section", { class: "flags" });
    box.appendChild(el("h4", { text: "Grounding Flags" }));
    box.appendChild(el("p", { class: "note", text: "Claims the grounding layer could not verify. Surfaced, not hidden." }));
    const ul = el("ul");
    for (const i of grounding.issues) ul.appendChild(el("li", { text: i }));
    box.appendChild(ul);
    root.appendChild(box);
  }

  root.appendChild(el("p", {
    class: "disclaimer",
    text: "Hypotheses offered for correction, not investment advice. In production this runs on approved infrastructure with data governance and model-risk review. The personal API key is demo-only.",
  }));

  els.status.classList.add("hidden");
  root.classList.remove("hidden");
}

function updateScorecard(data) {
  const g = data.grounding;
  els.scorecard.classList.remove("hidden");
  els.sGround.textContent = pct(g.coverage); els.sGround.className = "stat-value " + pctClass(g.coverage);
  els.sNum.textContent = pct(g.numeric_accuracy); els.sNum.className = "stat-value " + pctClass(g.numeric_accuracy);
  els.sClaims.textContent = String(g.total_claims); els.sClaims.className = "stat-value";
  els.badge.textContent = data.backend === "claude" ? "live: " + data.model : "sample mode";
  els.badge.className = "badge " + (data.backend === "claude" ? "badge-live" : "badge-sample");
  els.download.disabled = false;
}

async function runAnalyze() {
  const transcript = els.transcript.value.trim();
  if (!transcript) { els.hint.textContent = "Paste a transcript or load the sample first."; els.hint.className = "hint error"; return; }
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    els.hint.textContent = `Transcript is ${transcript.length.toLocaleString()} characters; max is ${MAX_TRANSCRIPT_CHARS.toLocaleString()}. Trim it and try again.`;
    els.hint.className = "hint error";
    return;
  }
  els.hint.textContent = ""; els.hint.className = "hint";
  els.analyze.disabled = true; els.analyze.textContent = "Analyzing…";
  setStatus("Analyzing transcript…", "loading");
  els.scorecard.classList.add("hidden");

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        company: els.company.value.trim(),
        quarter: els.quarter.value.trim(),
        source: lastName + " (pasted)",
      }),
    });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error || `Request failed (${res.status}).`, "error"); return; }
    lastMarkdown = data.reportMarkdown || "";
    lastName = `${(data.analysis.company || "report").replace(/[^a-z0-9]+/gi, "-")}-${(data.analysis.quarter || "").replace(/[^a-z0-9]+/gi, "-")}`.replace(/-+$/,"").toLowerCase() || "report";
    renderReport(data);
    updateScorecard(data);
  } catch (err) {
    setStatus("Network error: " + err.message, "error");
  } finally {
    els.analyze.disabled = false; els.analyze.textContent = "Analyze";
  }
}

function download() {
  if (!lastMarkdown) return;
  const blob = new Blob([lastMarkdown], { type: "text/markdown;charset=utf-8" });
  const a = el("a");
  a.href = URL.createObjectURL(blob);
  a.download = lastName + ".report.md";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
}

els.analyze.addEventListener("click", runAnalyze);
els.loadSample.addEventListener("click", () => {
  els.transcript.value = SAMPLE; els.company.value = "Northwind Technologies"; els.quarter.value = "Q3 2025";
  els.hint.textContent = "Sample loaded. Click Analyze."; els.hint.className = "hint";
  updateCharCount();
});
els.clear.addEventListener("click", () => {
  els.transcript.value = ""; els.company.value = ""; els.quarter.value = "";
  updateCharCount();
  els.scorecard.classList.add("hidden"); setStatus("Awaiting a transcript.");
  els.badge.textContent = "backend: ready"; els.badge.className = "badge badge-muted";
});
// --- File extraction: .pdf via vendored pdf.js; .docx/.pptx are OOXML zips parsed
// with DecompressionStream + DOMParser (no dependencies). All parsing happens in the
// browser; only the extracted text is ever sent to the API.

let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("/vendor/pdf.min.mjs").then((m) => {
      m.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
      return m;
    });
  }
  return pdfjsPromise;
}

async function pdfToText(f) {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: await f.arrayBuffer() });
  const doc = await task.promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    const lines = [];
    let line = "", lastY = null;
    for (const item of content.items) {
      if (item.str == null) continue;
      const y = item.transform ? item.transform[5] : lastY;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2 && line) { lines.push(line); line = ""; }
      line += item.str;
      if (item.hasEOL && line) { lines.push(line); line = ""; }
      lastY = y;
    }
    if (line) lines.push(line);
    pages.push(lines.join("\n"));
  }
  task.destroy();
  return pages.join("\n\n");
}

function unzip(buf) {
  const view = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("not a valid Office file (zip directory missing)");
  const count = view.getUint16(eocd + 10, true);
  let off = view.getUint32(eocd + 16, true);
  const entries = new Map();
  const decoder = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (view.getUint32(off, true) !== 0x02014b50) break;
    const method = view.getUint16(off + 10, true);
    const compSize = view.getUint32(off + 20, true);
    const nameLen = view.getUint16(off + 28, true);
    const extraLen = view.getUint16(off + 30, true);
    const commentLen = view.getUint16(off + 32, true);
    const localOff = view.getUint32(off + 42, true);
    const name = decoder.decode(new Uint8Array(buf, off + 46, nameLen));
    entries.set(name, { method, compSize, localOff });
    off += 46 + nameLen + extraLen + commentLen;
  }
  return { buf, view, entries };
}

async function zipEntryText(zip, name) {
  const e = zip.entries.get(name);
  if (!e) return null;
  const nameLen = zip.view.getUint16(e.localOff + 26, true);
  const extraLen = zip.view.getUint16(e.localOff + 28, true);
  const data = new Uint8Array(zip.buf, e.localOff + 30 + nameLen + extraLen, e.compSize);
  let bytes = data;
  if (e.method === 8) {
    const ds = new DecompressionStream("deflate-raw");
    bytes = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer());
  } else if (e.method !== 0) {
    throw new Error("unsupported compression inside the file");
  }
  return new TextDecoder().decode(bytes);
}

function xmlParagraphs(xml, ns) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const out = [];
  for (const p of doc.getElementsByTagNameNS(ns, "p")) {
    let s = "";
    for (const t of p.getElementsByTagNameNS(ns, "t")) s += t.textContent;
    if (s.trim()) out.push(s.trim());
  }
  return out.join("\n");
}

async function docxToText(f) {
  const zip = unzip(await f.arrayBuffer());
  const xml = await zipEntryText(zip, "word/document.xml");
  if (!xml) throw new Error("no document body found in the .docx");
  return xmlParagraphs(xml, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
}

async function pptxToText(f) {
  const zip = unzip(await f.arrayBuffer());
  const slides = [...zip.entries.keys()]
    .map((n) => n.match(/^ppt\/slides\/slide(\d+)\.xml$/))
    .filter(Boolean)
    .sort((a, b) => Number(a[1]) - Number(b[1]));
  if (!slides.length) throw new Error("no slides found in the .pptx");
  const parts = [];
  for (const m of slides) {
    const xml = await zipEntryText(zip, m[0]);
    const text = xmlParagraphs(xml, "http://schemas.openxmlformats.org/drawingml/2006/main");
    if (text) parts.push(`## Slide ${m[1]}\n${text}`);
  }
  return parts.join("\n\n");
}

async function extractFileText(f) {
  const ext = (f.name.match(/\.([^.]+)$/) || [, ""])[1].toLowerCase();
  if (ext === "doc" || ext === "ppt") {
    throw new Error(`legacy .${ext} files aren't supported; re-save as .${ext}x and retry`);
  }
  if (ext === "pdf") return pdfToText(f);
  if (ext === "docx") return docxToText(f);
  if (ext === "pptx") return pptxToText(f);
  if (ext === "txt" || ext === "md" || f.type.startsWith("text/")) return f.text();
  throw new Error("unsupported file type; upload .txt, .md, .pdf, .docx, or .pptx");
}

els.file.addEventListener("change", async (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = ""; // allow picking the same file again
  if (!f) return;
  if (f.size > MAX_FILE_BYTES) {
    els.hint.textContent = `${f.name} is ${(f.size / 1048576).toFixed(1)} MB; the upload limit is ${MAX_FILE_BYTES / 1048576} MB.`;
    els.hint.className = "hint error";
    return;
  }
  els.hint.textContent = `Reading ${f.name}…`; els.hint.className = "hint";
  let text;
  try {
    text = (await extractFileText(f)).replace(/\r\n/g, "\n").trim();
  } catch (err) {
    els.hint.textContent = `Could not read ${f.name}: ${err.message}.`;
    els.hint.className = "hint error";
    return;
  }
  if (!text) {
    els.hint.textContent = `No text found in ${f.name}. Scanned or image-only files need OCR first.`;
    els.hint.className = "hint error";
    return;
  }
  els.transcript.value = text.slice(0, MAX_TRANSCRIPT_CHARS);
  updateCharCount();
  lastName = f.name.replace(/\.[^.]+$/, "");
  if (text.length > MAX_TRANSCRIPT_CHARS) {
    els.hint.textContent = `Loaded ${f.name}, trimmed to the first ${MAX_TRANSCRIPT_CHARS.toLocaleString()} characters (file had ${text.length.toLocaleString()}). Click Analyze.`;
    els.hint.className = "hint error";
  } else {
    els.hint.textContent = `Loaded ${f.name}. Click Analyze.`; els.hint.className = "hint";
  }
});
function updateCharCount() {
  const len = els.transcript.value.length;
  const atLimit = len >= MAX_TRANSCRIPT_CHARS;
  els.charCount.textContent =
    `${len.toLocaleString()} / ${MAX_TRANSCRIPT_CHARS.toLocaleString()} characters` +
    (atLimit ? " — limit reached, longer pastes are cut off" : "");
  els.charCount.className = "char-count" + (atLimit ? " error" : "");
}
els.transcript.addEventListener("input", updateCharCount);
updateCharCount();
els.download.addEventListener("click", download);
