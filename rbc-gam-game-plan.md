# RBC GAM — AI Adoption Analyst: Campaign Brief

> **Purpose of this file.** Single source of truth for this campaign. Designed to bootstrap fresh Claude Code / Cowork sessions with zero prior chat history — read this file first, work the relevant workstream, and append to the Progress Log before ending the session. Keep this file lean; if it bloats past ~10 pages, archive completed detail elsewhere.

**Status:** Planning complete → execution starting
**Owner:** Founder/CEO, MusliFin Inc. (Sayaara)
**Created:** 2026-07-12
**Hard cutoff:** ⚠️ The posting states applications are accepted until 11:59 PM *the day prior* to the listed July 23 deadline — treat **11:59 PM ET, July 22, 2026** as the real submission cutoff.

---

## 1. Mission

Land the **AI Adoption Analyst** role at RBC Global Asset Management (Toronto) through three parallel workstreams:

- **Workstream A — Application:** tailored resume, portal submission early (don't let anything else block it).
- **Workstream B — Relationship:** warm path through the former mentee, who reports directly to the hiring manager. Intel first, intro second.
- **Workstream C — Build:** a consultant-style presentation plus a working demo tool (earnings-call analyzer) that proves the exact skills in the job description.

Core strategy: run the hiring process like a sales process. Discovery → proposal → proof-by-artifact. The meta-point that makes this work: **the role itself is internal sales and change management** (getting skeptical PMs to adopt AI), so a consultative approach isn't just a tactic — it's a live demonstration of the job's core competency.

---

## 2. Target Role — Condensed Intel

**Company:** RBC Global Asset Management — North American asset manager, ~C$800B AUM across mutual funds, pooled funds, hedge funds, segregated accounts, and specialty strategies.

**Initiative:** "AI for Alpha" — a firm-wide push to accelerate AI adoption across all investment teams, supported by internal technology and data functions.

**Role essence:** Sit between investment teams (PMs, analysts, traders) and AI tooling. Drive adoption and user experience, evaluate AI use cases and agents for output quality and reliability, help build evaluation frameworks and QA processes, monitor performance and usage, collect and analyze user feedback, maintain documentation and shared best-practice resources, and liaise with tech/data teams on issues and integrations.

**Must-haves (paraphrased):**
- Relevant undergraduate degree (CS, data science, engineering, business, finance, math)
- Demonstrated results using AI tools in academic or professional settings
- Understanding of prompt engineering and **context engineering**, plus current LLM developments
- Python proficiency
- Strong numerical/statistical skills
- Communication skills — translating technical concepts for non-technical audiences

**Nice-to-haves (paraphrased):**
- Investment management concepts (portfolio construction, risk management)
- AI/ML frameworks or APIs
- **Evaluation methodologies for LLMs and AI agents** ← the differentiation opening
- Data viz / BI tools
- Financial services exposure

**Logistics:** 155 Wellington St W, Toronto. Full-time, 37.5 h/wk. $55,000–90,000 + discretionary variable comp. Posted 2026-07-08.

**Read-through of the JD:** The highest-frequency concepts are *quality, reliability, evaluation, adoption, documentation, feedback*. This is a QA-and-internal-consulting job wearing an AI title. Almost no junior candidate will show up with actual eval methodology — that nice-to-have is where this campaign wins.

---

## 3. Candidate Positioning

**Identity stack:** Founder/CEO of MusliFin Inc. (consumer brand: Sayaara — Shariah-compliant auto-financing infrastructure, North America). Dual MSc in progress: Quantitative Finance (HEC Montréal) + Islamic Accounting and Finance (INCEIF). CFA candidate. Prior background in M&A research and capital markets.

**The narrative frame — LOCKED. Use this version everywhere:**

> "I built a fintech until the capital ran out. Along the way I learned what it actually takes to ship AI products under real constraints — cost, quality, reliability. I'm now making a deliberate move into institutional asset management, and this role is the exact intersection of what I've built and where I'm going."

**Never use the desperation frame.** No version of "I need a job." Same facts, different frame — the hiring manager will respect the first version and smell the second. Decide once, never deviate.

**Supporting notes:**
- A dormant / winding-down MusliFin simplifies RBC's **outside business activity (OBA) disclosure**. Prepare a clean one-paragraph status statement before Meeting 1. Banks require this disclosure — it cannot be soft-pedaled.
- Overqualification counter: comp expectations are aligned; the draw is institutional scale, mentorship, and the AI × investing intersection — which happens to be precisely the founder skillset (product thinking + evaluation discipline + stakeholder management).

---

## 4. Proof Assets — Evidence Inventory

Everything below is *proof, not claims*. The deck and meetings should lean on these.

**4.1 The $5 token story (canonical telling — rehearse it):**
Over the daily usage limit → switched to pay-per-token API → sent one *simple* prompt inside an old session → cost $5+ for a single message → root cause: months of accumulated chat history silently riding along as context. The fix became a discipline: **md progress files** that hold state and instructions, so every new session starts at zero token history and loads only what's needed.

Framing rules when telling it:
- It's a **cost lesson AND a quality lesson** — bloated context doesn't just burn tokens, it degrades output quality. This connects directly to the JD's "output quality and reliability" mandate.
- This is what "**context engineering**" (a JD must-have) means in production, learned the hard way — not from a blog post.
- At RBC GAM scale, context discipline is a material cost and reliability lever across every investment team. The person who instinctively thinks this way is exactly who should be evaluating AI use cases.
- Tell it as production discipline, not a hobbyist anecdote.

**4.2 Credit underwriting model (repo):** PD/LGD/EAD research grounded in IRB/OSFI frameworks, implemented via a six-agent Claude Code pipeline. Role in the pitch: **depth proof** — agent orchestration, domain rigor, real architecture. Caveat: it speaks *credit*, not asset management — reference it for depth, but lead with the earnings-call tool (§8), which speaks their language.

**4.3 Supporting builds (mention, don't demo):** Odoo 19 ↔ Claude Desktop MCP server; Gmail→Odoo accounting automation; live voice tool for sales-pitch assessment; CRM prospecting infrastructure. These establish breadth: this candidate ships.

**4.4 Academic artillery:** HEC derivatives (Itô's lemma, risk-neutral pricing, barrier options), econometrics (OLS, IV/2SLS, fixed effects), plus INCEIF structured-finance work. Use to clear the "strong numerical/statistical skills" bar and to speak PM language credibly.

---

## 5. Workstream B — Relationship Strategy (the warm path)

**The asset:** former mentee reports directly to the hiring manager. His credibility is collateral when he vouches — make it effortless and safe for him.

**Call 1 — Intel only. Do NOT ask for the intro yet.** Questions to get answered:
1. What pain actually triggered this posting? What broke or stalled?
2. Is the role already earmarked for an internal candidate?
3. What's the team's current AI maturity — which tools, what's adopted, what's stuck, who are the skeptical PMs?
4. What does the boss personally care about? How does he evaluate people and decide?
5. **How does RBC's employee referral system work — does the referral need to be logged *before* I submit the application?** (This ordering matters at most banks.)

**Call 2 — The intro ask.** Deliver a forwardable package: a 3-line blurb + tailored resume, so he can forward without composing anything. Give him ammunition: one proof point (the underwriting pipeline or the token story) + the locked narrative frame.

**Rules:**
- Apply through the portal early regardless — the warm path *supplements* the application, never replaces it.
- Sequence: confirm referral-logging order (Call 1) → submit application → intro ask.
- Even with a champion, expect the formal HR process and structured interviews. The deck wins the champion; the interviews still have to be won separately.

---

## 6. Meeting Strategy — Run It Like a Sales Process

**Meeting 1 = discovery + rapport.** Mostly questions; brief positioning; the token story if it fits naturally. Do NOT ambush a first coffee chat with a slide deck. Close with the opt-in:

> "I've actually built out how I'd approach this role — could I get twenty minutes to walk you through it?"

Opt-in beats ambush, and it earns a second, more formal meeting.

**Meeting 2 = the presentation + live demo** (§7, §8).

**Posture throughout: hypotheses, not verdicts.** "Here's what I believe you're solving for — correct me where I'm wrong." An outsider delivering confident diagnoses from a job posting reads as arrogant the moment one is wrong; the same content framed for correction reads as sharp. Mentee intel (§5) is what upgrades the hypotheses from guesses to informed reads.

---

## 7. Deliverable A — The Presentation (deck spec)

**Format:** 8–12 slides, 15–20 minutes. Deliberately mirror JD language throughout (*quality, reliability, evaluation, adoption, documentation, feedback*). Clean, RBC-adjacent styling — do not use RBC logos or trademarks.

**Skeleton:**
1. **What I think you need.** 3–4 hypotheses about the team's real problems (built from mentee intel + the posting), explicitly framed for correction.
2. **Why me — proof, not claims.** Founder-built AI systems; the token story; the underwriting pipeline; econometrics/derivatives foundation.
3. **My operating model — an enterprise inside the enterprise.** The AI team as an internal product organization serving investment teams as customers: continuously generating ideas for tools and services PMs would actually want, structurally evaluating them, then packaging each as a **formal proposal with decision factors so leadership can decide yes/no without added workload**. Show the JD lines side-by-side with this model — it maps nearly word-for-word to "developing and refining evaluation frameworks" and "create and maintain documentation, best practices and shared resources."
4. **First 90 days, as if already hired to implement.** Consultant-style execution plan: listen-and-inventory phase (use-case audit, tool audit, user interviews) → evaluation framework build → quick wins → documentation system → standing feedback-loop cadence. *(Flesh out during build phase with mentee intel.)*
5. **Demo.** The earnings-call analyzer, live (recorded fallback ready).
6. **The leave-behind.** Master prompt / clonable repo + build log: "this is exactly how I'd document every tool for your teams."
7. **The ask.** One clear next step.

---

## 8. Deliverable B — Earnings-Call Analyzer (build spec)

**Concept:** A Claude-cored wrapper with a chat-style UI. User uploads an earnings call (PDF / transcript / media) → pipeline produces an institutional-grade report in a consistent house style. Built and documented publicly along the way — the build log is itself a portfolio artifact and deck content.

**Pipeline:**
1. **Ingest.** Script converts the source file to clean markdown; flags any embedded images/exhibits for separate handling.
2. **Analysis.** Claude via API. Prompts grounded in the academic literature on sentiment analysis and NLP in asset management (Loughran–McDonald dictionaries, FinBERT, and related work) — researched with AI assistance and cited. Treat the literature as the established baseline, not a discovery.
3. **Report generation against a design-system md file.** Typography, structure, tone, and formatting rules live in one markdown file so every report renders identically. This file doubles as a live demonstration of the md-based context-management practice — the token story made tangible.
4. **Grounding layer — differentiator #1.** Every number and material claim in the report footnotes back to the source line in the transcript. Rationale: hallucinated figures are *the* adoption blocker on investment teams; a self-citing report kills the objection before anyone raises it.
5. **Eval harness — differentiator #2.** A golden set of 3–5 transcripts with expected extractions; consistency checks across repeated runs; grounding/hallucination checks; a simple scorecard. Rationale: the JD lists LLM/agent evaluation methodology as a nice-to-have that essentially no junior candidate will demo. Showing *evals*, not just outputs, is the single most differentiated move available.

**Reproducibility deliverable:** a master prompt the manager can run to recreate the tool himself; if it exceeds a context window, a clonable repo with a README. This artifact *is* the JD's "documentation, best practices and shared resources" bullet, delivered before day one.

**Positioning guardrails:**
- Do **not** pitch the sentiment analysis as novel — RBC GAM has quant teams for whom this literature is table stakes. The edge is the ability to **ship, document, evaluate, and make reproducible**.
- Include one enterprise-maturity line in the demo/deck: *"In production this runs on approved infrastructure with data governance and model-risk review — the personal API key is demo-only."* One sentence that signals thinking like someone who already works inside a bank.

**Practical notes:**
- Sample input: one widely covered mega-cap earnings call with a publicly available transcript. *(Open item — pick company/quarter.)*
- Keep the stack minimal: reliability beats flash. A simple single-page UI (or even CLI + rendered report) is fine.
- Record a clean end-to-end demo video as the fallback against live-demo failure.

---

## 9. Objection Prep — Answers Locked Before Meeting 1

| Objection | Answer |
|---|---|
| "Why does a founder/CEO want an analyst seat?" | The locked frame (§3): deliberate transition; the draw is institutional scale and the AI × investing intersection. |
| "Are you still running MusliFin? Will you stay?" | Prepared status statement + OBA disclosure readiness. Commitment is credible *because* the transition is deliberate. |
| "You're set up in Montreal; this is Toronto, full-time." | Concrete relocation/logistics plan. **(OPEN — decide the real answer.)** |
| "Two MScs in progress — do you have bandwidth?" | Completion timeline and study-schedule compatibility. **(OPEN — needs actual dates.)** |
| "Is $55–90k acceptable for a CEO?" | Yes, aligned — and say why without flinching. |

A fumbled answer on any of these undoes everything the repos and the token story build. Rehearse them.

---

## 10. Timeline — July 12 → 22

| Window | Actions |
|---|---|
| **Jul 12–13** | Mentee Call 1 (intel + referral-logging question). Tailor resume to JD keywords. Start tool skeleton (ingest + report pipeline). |
| **Jul 14–16** | Submit application (once referral order confirmed — don't let this slip past ~Jul 18 under any circumstances). Build design-system md + grounding layer. Send blurb package to mentee → intro ask. |
| **Jul 17–19** | Eval harness + golden set. Build deck using Call-1 intel. Clean up build log. Produce master prompt / repo. |
| **Jul 20–22** | Dry runs: demo end-to-end + 20-minute walkthrough out loud. Record fallback demo video. Buffer. **Submission cutoff: 11:59 PM ET Jul 22.** |

Meetings land whenever the manager offers — everything above is sequenced so the full package is ready by ~July 17.

---

## 11. Open Items

- [ ] Montreal ↔ Toronto logistics answer (relocation? commute? timing?)
- [ ] MusliFin status statement — one OBA-ready paragraph
- [ ] MSc completion dates → bandwidth answer
- [ ] Sample earnings call selection (company + quarter)
- [ ] Referral logging order — confirm with mentee before submitting
- [ ] Resume tailored to this JD's keywords
- [ ] 3-line forwardable blurb drafted
- [ ] Decide live demo vs recorded-first for Meeting 2

---

## 12. Session Protocol (Claude Code / Cowork)

1. **Start** every session by reading `CLAUDE.md` → `memory.md` → `progress.md`, then only the sections of this file the workstream needs. Do not carry prior chat history — zero-token-history starts, per the discipline this whole campaign is built on.
2. Work **one workstream per session** where possible (A: application, B: relationship, C: build).
3. **End** every session by appending to `progress.md`: date, what shipped, decisions made, next single action.
4. When an Open Item (§11) gets resolved, record the answer in `memory.md` and check it off.

---

## Progress Log

Moved to `progress.md` (2026-07-12). Append there, not here.
