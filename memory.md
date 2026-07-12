# Campaign Memory — Current State

Last updated: 2026-07-12

## Snapshot

- **Target:** AI Adoption Analyst, RBC Global Asset Management, 155 Wellington St W, Toronto. $55–90k + discretionary variable. Posted 2026-07-08.
- **Posting verified live 2026-07-12.** Official title "AI Analyst", Req R-0000179708, Wealth Management platform. Exact JD text in `jd-rbc-ai-analyst.md` — use its keyword bank, not the game-plan paraphrase. URL: https://jobs.rbc.com/ca/en/job/R-0000179708/AI-Analyst/
- **Cutoff:** 11:59 PM ET, July 22, 2026 (applications close the day *before* the listed Jul 23 deadline).
- **Status:** Planning complete → execution starting.
- **Mentee:** already knows Oussama's work intimately — Call 1 needs zero positioning. The risk is his *retelling*: seed the locked frame so the version reaching the boss is deliberate-transition, not winding-down.
- **Win angle:** LLM/agent evaluation methodology — the nice-to-have no junior candidate will demo. JD's highest-frequency concepts: quality, reliability, evaluation, adoption, documentation, feedback. Mirror them everywhere.

## Locked decisions — do not reopen

- **Narrative frame (verbatim, everywhere):** "I built a fintech until the capital ran out. Along the way I learned what it actually takes to ship AI products under real constraints — cost, quality, reliability. I'm now making a deliberate move into institutional asset management, and this role is the exact intersection of what I've built and where I'm going."
- Sequence: mentee Call 1 (intel + referral-logging question) → portal application → Call 2 (intro ask with forwardable blurb + resume).
- Meeting 1 = discovery only, no deck; close with the opt-in ask for a 20-minute walkthrough. Meeting 2 = deck + live demo, recorded fallback ready.
- Token story = cost AND quality lesson; tell it as production context engineering, not a hobbyist anecdote.
- Demo maturity line: "In production this runs on approved infrastructure with data governance and model-risk review — the personal API key is demo-only."
- Lead proof asset = earnings-call analyzer (speaks their language); underwriting pipeline = depth proof only.
- Submission backstop: Call 1 not booked by Jul 15 → text mentee the referral-order question alone. No answer by Jul 18 → submit anyway.
- Style rule (2026-07-12): no em dashes and no AI-telltale phrasing in ANY outward material (resume, letter, blurb, deck). Locked frame keeps its exact words with a colon replacing the dash.

## Workstream status

| Workstream | State | Next action |
|---|---|---|
| A — Application | Drafts shipped | Resume + cover letter v1 (docx) in workspace, built from oussamahidane.com + exact JD; awaiting Oussama's review. Submission waits only on referral-order answer (Call 1 Q5). |
| B — Relationship | In progress | Oussama texts mentee to book Call 1; script ready in `call-1-brief.md` |
| C — Build | Tool + web UI shipped; deck content drafted | Analyzer in `earnings-call-analyzer/`: `python -m eca --mock eval` PASSES 3/3 (100% acc/grounding/numeric/consistency); self-prompt in `workstream-c-build-brief.md`. **Web UI in `earnings-call-analyzer/web/`** (Cloudflare Pages+Functions, TS port, password-gated, for rbc.oussamahidane.com) verified locally — typecheck clean, tests 4/4, access gate + browser render confirmed; deploy runbook in `web/README-web.md`. Next: real-Claude verify w/ key, then Oussama runs `wrangler pages deploy` + sets `ANTHROPIC_API_KEY`/`APP_PASSWORD` secrets + wires custom domain; live-demo transcript; fallback video. **Upload upgrade (2026-07-12, local, unpushed):** web UI accepts .pdf/.docx/.pptx/.txt/.md, converted to text in the browser (pdf.js vendored in `public/vendor/`; docx/pptx parsed dependency-free); 10 MB file cap; server cap in `analyze.ts` lowered 200k→17k to enforce the box limit; Python side gained `eca/convert.py` + `python -m eca convert`, and `analyze` ingests .docx/.pptx directly. All verified locally (eval 3/3, tests 4/4, browser end-to-end); needs git push to deploy. Deck: v2 BUILT to `Deck - AI Adoption - Oussama Hidane.pptx` (10 slides, validated, all slides re-QA'd). v2 changes: slide 2 reframed as four objective-cards (headline = team objective, body = the daily job that serves it) + framing subtitle; the four objectives (adoption reach, trusted outputs, defensible quality bar, compounding wins) thread slides 4/5/6/8/9 via speaker notes; slide 1 subtitle dropped unverified "AI for Alpha" (softened, restore only if confirmed real); slide 7 dropped "audio" (ingests PDF/transcript only); slide 5 retitled "Your posting, matched". Source of truth is now `deck-content-v2.md` (full content, reviewed pre-build). `[INTEL]` reminders still in slides 2/6 notes. NOTE: bd.js rebuild script was lost to the scratchpad clear; deck is now edited in place via transient python-pptx scripts (inspect-then-patch). Video assets: `deck-video-script.md` (Google Vids voiceover, ~5.5 min, first person) + `Deck - AI Adoption - Oussama Hidane - VIDEO.pptx` (separate copy; notes = clean narration only so Vids reads exactly the script; main deck notes untouched). Scene 7 needs a demo screen recording from rbc.oussamahidane.com. Decks now 10 slides: added "How this was built" (now slide 8, after the demo slide) (two cards: **prompt engineering** = the Claude chat Oussama steered until it produced the game plan that seeded the workspace, NOT the tool's prompts; **context engineering** = the file workspace that plan became; a direct working-session ask bar spanning this build and his other projects; under-6-hours hook in the title). Leave-behind and ask are now 9 and 10. Standalone evals slide REMOVED 2026-07-12 per Oussama: its points (golden set, consistency, grounding, 3/3) live in the repo and the demo grounding line; flagged that a live viewer may not open the repo. Clean read-aloud voiceover also shipped at `Video Script - AI Adoption - Oussama Hidane.md` (10 scenes). BUILD LESSON: to change a slide, edit shapes in place or add-at-end-then-reorder; do NOT remove-then-add via python-pptx (orphaned slide parts collide on save and corrupt another slide). |

## Open items

- [ ] Montreal ↔ Toronto logistics answer (relocation? commute? timing?)
- [ ] MusliFin status statement — one OBA-ready paragraph
- [ ] MSc completion dates → bandwidth answer
- [ ] Sample earnings call selection (company + quarter) — for the LIVE DEMO only. Eval golden set is 3 synthetic transcripts (locked: known ground truth + no copyright). Still need one real mega-cap transcript for the demo.
- [ ] Referral logging order — confirm with mentee before submitting
- [x] Resume tailored to this JD's keywords — v1 docx shipped 2026-07-12, pending Oussama's review
- [ ] 3-line forwardable blurb drafted
- [ ] Decide live demo vs recorded-first for Meeting 2
- [ ] Confirm whether "AI for Alpha" is a real RBC GAM initiative (if yes, restore on slide 1 subtitle)
- [ ] Confirm the four slide-2 objective headlines match Oussama's read of what the team wants
- [ ] Video: AI voice vs Oussama's own voice; first person (current) vs narrator; record the scene-7 demo clip
- [ ] SECURITY (flagged 2026-07-12): pushed `rbc-demo-repo` (origin/main) contains campaign-strategy files (rbc-gam-game-plan, memory, CLAUDE.md, call-1-brief) plus resume and cover letter. Oussama chose to leave the repo as-is for now. Revisit before pointing the hiring manager to the repo; reading call-1-brief/memory would expose the mentee warm-path strategy.

## Resolved answers

- **MusliFin dealer claim is NON-FACTUAL (2026-07-12):** never write "convinced skeptical dealers to adopt a workflow" or "adoption is the job I just did" (venture is pre-launch, no dealer has adopted). True framing: translated one complex system for very different audiences (dealership sales and GMs, OEM captive risk/compliance/legal, VC and angel investors), ran customer discovery (pitched the idea, assessed interest, adapted/pivoted), and taught himself AI proficiently the hard way in real time while building ("learning to fly while flying"). Deck slide 3 and video scene 3 fixed. RESUME + COVER LETTER still carry the claim plus numbers (7+ dealerships pitched, 15+ meetings, 4 converted to qualified partners); confirm those numbers with Oussama before editing them. Also re-verify the six-agent credit-risk pipeline / live-ERP lines.
- **Slide 4 = "The founder's state of mind" (rebuilt 2026-07-12):** the mindset a startup unlocks, framed as the asset for this open-ended seat. The analyst does not wait for tasks; as the AI expert he listens to the teams (his clients), spots the use case, scopes it (human + capital cost, benefit, how it ships), and hands the manager a yes/no decision, taking "what should the AI analyst do each day" off the manager's plate. Four steps: Listen to the teams / Spot the use case / Scope it fully / Hand up a decision; right box "Every proposal carries" (opportunity, human and capital cost, benefit, how it ships); punchline kept ("I won't put more work on my manager's plate. I'll take work off it."). Briefly references wanting the same ownership from his first hire (a VP of BD), positive framing only, never criticizing the colleague. Apollo backstory dropped from slide and script.
- **Slide 7 framing + slide 8 ask (2026-07-12):** slide 7 (demo) subtitle "1.5 years of AI experience, built to show how I'd ship a tool relevant to investment teams, documented at every step to show the behind-the-scenes skills this role wants" (positions the tool as a showcase of accumulated experience + the documented behind-the-scenes; behind-the-scenes/repo/live-meeting stays on slide 8, no duplication). Slide 8 ask bar broadened to "here and across my work and school projects" (mirrors JD "academic or professional settings").
- **Resume header location:** Toronto, ON (matches public site oussamahidane.com; Oussama must be ready to back it up in interviews). Decided 2026-07-12.
- **Cover letter greeting:** "Dear Hiring Team" for the portal version. Decided 2026-07-12.
- **MSc dates on resume:** show "in progress," no expected dates. NOTE: bandwidth objection answer (§9 game plan) still needs real completion dates — open item stays open.
- **Degree names (corrected 2026-07-12, verbatim in all material):** HEC Montréal = "MSc Finance" (NOT Quantitative Finance). INCEIF = "Master in Islamic Finance" (NOT Islamic Accounting & Finance). The game plan had both wrong; now fixed. Quant skills are claimed via coursework (derivatives, econometrics) and CFA, not the program name.
- **Contact block (from site):** +1 (438) 220-5053 · mr.oussamahidane@gmail.com · linkedin.com/in/oussama-hidane · oussamahidane.com
