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

const $ = (id) => document.getElementById(id);
const els = {
  company: $("company"), quarter: $("quarter"), transcript: $("transcript"),
  analyze: $("analyze"), loadSample: $("load-sample"), file: $("file"), clear: $("clear"),
  status: $("status"), report: $("report"), hint: $("input-hint"),
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
});
els.clear.addEventListener("click", () => {
  els.transcript.value = ""; els.company.value = ""; els.quarter.value = "";
  els.scorecard.classList.add("hidden"); setStatus("Awaiting a transcript.");
  els.badge.textContent = "backend: ready"; els.badge.className = "badge badge-muted";
});
els.file.addEventListener("change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  els.transcript.value = await f.text();
  lastName = f.name.replace(/\.[^.]+$/, "");
  els.hint.textContent = `Loaded ${f.name}. Click Analyze.`; els.hint.className = "hint";
});
els.download.addEventListener("click", download);
