# What This Project Demonstrates

This repository is a job application. Not the PDF kind: a working demonstration of the exact competencies in RBC GAM's AI Analyst posting, built with AI at every step, documented so the process itself is inspectable.

The claim being tested: the fastest way to prove you can drive AI adoption, evaluate AI output for quality and reliability, and produce documentation others can reuse, is to do all three in public and hand over the artifact.

---

## 1. The brainstorm: strategy before code

Everything started in a single Claude chat session. No documents, no code. Just structured back-and-forth to answer:

- What is this role actually asking for underneath the title? (Reading the posting closely: the highest-frequency concepts are quality, reliability, evaluation, adoption, documentation, feedback. This is a QA-and-internal-consulting job wearing an AI title.)
- Where does a candidate like me win? (Evaluation methodology for LLMs is listed as a nice-to-have that almost no junior candidate will demonstrate. That became the entire angle.)
- What would a hiring process run like a sales process look like? (Discovery, proposal, proof-by-artifact. The meta-point: the role itself is internal sales and change management, so the approach demonstrates the job's core competency.)

The output of that chat was a complete campaign plan: three parallel workstreams (application, relationship, build), a locked narrative frame, objection prep, and a build spec for a demo tool. All of it before a single file existed.

**Why this matters for the role:** knowing what to build before building it is most of the job. The AI didn't decide the strategy; it pressure-tested it, surfaced the evaluation-methodology opening, and forced every claim to be either proof or cut.

## 2. From chat to workspace: context engineering in practice

The plan moved out of chat into a file-based workspace with a deliberate structure:

| File | Job |
|---|---|
| `CLAUDE.md` | Session rules. How any AI session must behave in this workspace. |
| `memory.md` | Current state. Locked decisions, workstream status, open items. |
| `progress.md` | Append-only session log. What shipped, what was decided, next action. |
| `rbc-gam-game-plan.md` | Full strategy. Loaded only section by section, as needed. |

The reason is a lesson learned the expensive way. Working over a pay-per-token API, one simple prompt inside an old chat session cost over $5, because months of accumulated history rode along silently as context. Bloated context does not just burn money; it degrades output quality. The fix became a discipline: **every session starts from zero chat history and loads only the markdown files it needs.** State lives in files, not in conversations.

This is what the posting calls context engineering, implemented as a working system rather than described as a skill. The same discipline shows up inside the demo tool itself: the report house style lives in one `design-system.md` file that the renderer parses, so changing the file changes every report.

## 3. Parallel sessions: AI as a coordinated team

With state in files instead of chat history, multiple AI sessions could run at once without stepping on each other:

- **Session A (Claude Cowork):** resume and cover letter tailored to the exact posting keywords, then the presentation deck content.
- **Session B (Claude Code):** the build workstream. This session read the workspace files, determined its own assignment from the workstream table, and wrote itself a standing brief (`workstream-c-build-brief.md`) with a definition of done, guardrails, and a build loop. Then it executed that loop to completion.
- **Coordination:** both sessions read and update `memory.md` and `progress.md`. When one session locked a decision (for example: no em dashes in any outward material, because it reads as machine-written), the other picked it up from the files and applied it retroactively to its own output.

No session ever needed another session's chat history. The files were the interface.

## 4. The build: a tool designed around evaluation, not output

The demo tool is an earnings-call analyzer: transcript in, institutional-grade report out. The design choices are the argument:

**Grounding first.** Every figure and material claim in a report cites the transcript line it came from as `[Ln]`, and a separate checker independently verifies that each cited line exists and that each financial figure actually appears on its cited line. Anything unverifiable is surfaced in a Grounding Flags section rather than hidden. Reasoning: hallucinated numbers are the single biggest adoption blocker on an investment desk, so the tool is built to kill that objection structurally rather than promise it away.

**Evals as a first-class deliverable.** A golden set of three synthetic transcripts with known ground truth (synthetic on purpose: an answer key requires knowing the right answers, and it avoids copyright). A harness scores extraction accuracy, grounding coverage, numeric verification, and cross-run consistency, and prints a pass/fail scorecard. The pipeline ships at 100 percent on all four.

**Offline-first.** The whole pipeline runs deterministically with no API key in mock mode. That makes the evals reproducible and free, and means the demo cannot be taken down by a network failure. Real analysis runs on Claude behind an API key, same schema, same grounding checks.

**Honest positioning.** The sentiment analysis is standard Loughran-McDonald / FinBERT-lineage work, cited in `docs/methodology.md` as the established baseline. Nothing here claims novelty. The edge is shipping, documenting, evaluating, and making it reproducible.

**Reproducibility as the leave-behind.** `MASTER-PROMPT.md` recreates the entire tool from one prompt in an empty directory. That file is the posting's "documentation, best practices and shared resources" bullet, delivered as an executable artifact before day one.

## 5. Verification at every step

Nothing in this repo was declared done without being exercised:

- The Python pipeline: `python -m eca --mock eval` passes 3/3 at 100 percent accuracy, grounding, numeric verification, and consistency.
- The TypeScript port for the web app: a test suite runs the same golden set through the ported pipeline and requires identical results, so the two implementations cannot silently drift.
- The web UI: driven end-to-end in a real browser (load sample, analyze, inspect the rendered report and citation tooltips) before deploy.
- The access gate: tested with no password, wrong password, and correct password (401 / 401 / 200), on both the UI and the API.

This is the evaluation habit the role asks for, applied to the application itself.

## 6. Deployment: shipping like it goes to production

The tool is not a local script. It is live:

- **Stack:** Cloudflare Pages for the UI, Pages Functions (Workers runtime) for the API. Same origin, so there is no CORS surface at all.
- **Pipeline ported to TypeScript** for the Workers runtime, with the Python version retained as the reference implementation and eval harness.
- **Secrets handled properly:** the Anthropic API key and the access password are encrypted Worker secrets, never in the client bundle, never in git.
- **Access control:** password gate on both UI and API.
- **Cost control:** per-IP weekly spend cap enforced through Cloudflare KV, with request size limits.
- **Deploy path:** git push to GitHub, auto-deploy to Cloudflare, custom domain.
- **Governance posture stated on the page itself:** in production this runs on approved infrastructure with data governance and model-risk review; the personal API key is demo-only. Plus a visible instruction not to paste confidential or material non-public information.

## 7. The mapping back to the posting

| Posting language | Where it is demonstrated |
|---|---|
| Evaluate AI use cases for output quality and reliability | Grounding layer + eval harness with pass/fail thresholds |
| Develop and refine evaluation frameworks | `eca/evaluate.py`, golden set, scorecard, consistency checks |
| Prompt engineering and context engineering | The md-file workspace system; `design-system.md`; the prompts that require line citations |
| Documentation, best practices, shared resources | README, methodology doc, build log, MASTER-PROMPT |
| Python proficiency | The entire reference pipeline |
| Translate technical concepts for non-technical audiences | This document, the report format, the deck |
| Drive adoption | The tool is designed backwards from the #1 adoption objection (hallucinated figures) |

## 8. What was human and what was AI

The strategy calls, the positioning, the decision to lead with evaluation methodology, the guardrails (no novelty claims, no RBC trademarks, synthetic golden set), and every accept/reject decision on AI output: human.

The drafting, the code, the porting, the test writing, the browser-driven verification, and the documentation: AI, working inside the file-based system above, session by session, with every session's work logged in `progress.md`.

That division of labor is the point. The role is not "person who uses AI." It is "person who can direct AI toward institutional-quality output and prove the output deserves trust." This repository is that proof, or at least the strongest version of it I could ship in the time available. Where it falls short, that is signal too, and I would rather be corrected on specifics than admired for claims.
