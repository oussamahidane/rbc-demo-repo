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
| C — Build | Tool + web UI shipped; deck content drafted | Analyzer in `earnings-call-analyzer/`: `python -m eca --mock eval` PASSES 3/3 (100% acc/grounding/numeric/consistency); self-prompt in `workstream-c-build-brief.md`. **Web UI in `earnings-call-analyzer/web/`** (Cloudflare Pages+Functions, TS port, password-gated, for rbc.oussamahidane.com) verified locally — typecheck clean, tests 4/4, access gate + browser render confirmed; deploy runbook in `web/README-web.md`. Next: real-Claude verify w/ key, then Oussama runs `wrangler pages deploy` + sets `ANTHROPIC_API_KEY`/`APP_PASSWORD` secrets + wires custom domain; live-demo transcript; fallback video. Deck: content v1 in `deck-content.md`, md only until Oussama calls the pptx build; slides 2/6/8 carry `[INTEL]` slots waiting on Call 1. |

## Open items

- [ ] Montreal ↔ Toronto logistics answer (relocation? commute? timing?)
- [ ] MusliFin status statement — one OBA-ready paragraph
- [ ] MSc completion dates → bandwidth answer
- [ ] Sample earnings call selection (company + quarter) — for the LIVE DEMO only. Eval golden set is 3 synthetic transcripts (locked: known ground truth + no copyright). Still need one real mega-cap transcript for the demo.
- [ ] Referral logging order — confirm with mentee before submitting
- [x] Resume tailored to this JD's keywords — v1 docx shipped 2026-07-12, pending Oussama's review
- [ ] 3-line forwardable blurb drafted
- [ ] Decide live demo vs recorded-first for Meeting 2

## Resolved answers

- **Resume header location:** Toronto, ON (matches public site oussamahidane.com; Oussama must be ready to back it up in interviews). Decided 2026-07-12.
- **Cover letter greeting:** "Dear Hiring Team" for the portal version. Decided 2026-07-12.
- **MSc dates on resume:** show "in progress," no expected dates. NOTE: bandwidth objection answer (§9 game plan) still needs real completion dates — open item stays open.
- **Contact block (from site):** +1 (438) 220-5053 · mr.oussamahidane@gmail.com · linkedin.com/in/oussama-hidane · oussamahidane.com
