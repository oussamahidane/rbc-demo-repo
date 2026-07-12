# Deck Content: Meeting 2 Presentation (Deliverable A)

Draft v1, 2026-07-12. Content only; build to pptx happens later on Oussama's go.
Spec (game plan §7): 8 to 12 slides, 15 to 20 minutes, JD language mirrored throughout, RBC-adjacent styling, no RBC logos.
Style rules apply: no em dashes, no AI-telltale phrasing, hypotheses offered for correction, never verdicts.
`[INTEL]` marks content that gets upgraded or replaced after mentee Call 1.

---

## Slide 1: Title

**On-slide:**
> How I'd drive AI adoption on investment teams
> A working proposal for the AI for Alpha initiative
> Oussama Hidane · July 2026

Subline, small: "Everything in here is a hypothesis. I'm here to be corrected."

**Speaker notes:** Thank him for the twenty minutes. One sentence of frame: this is how I think, shown rather than described. Invite interruption at any point; the corrections are the most valuable part of the meeting for me.

**Why this slide:** The posture line kills the arrogant-outsider risk in the first ten seconds and sets the discovery tone the whole deck depends on.

---

## Slide 2: What I think you're solving for

**On-slide (four hypotheses, each one line, framed as questions to correct):**

1. Adoption is uneven: a few power users, and a long tail of PMs who tried a tool once, hit a wrong number, and quietly stopped. `[INTEL: Q1/Q3 answers replace or sharpen this]`
2. Trust is the real blocker, not tooling. One hallucinated figure costs more adoption than ten good outputs earn back.
3. Wins aren't shared. Prompts and use cases live with individuals, so every team relearns the same lessons. `[INTEL: does a best-practice library exist?]`
4. Evaluation is ad hoc. Outputs get judged by eyeballing, which leaves no defensible QA story for leadership or model risk. `[INTEL: Q4, what the boss cares about]`

Footer line: "Where am I wrong? That's the most useful thing you can tell me today."

**Speaker notes:** Walk each hypothesis in one breath, then stop and ask him to react before moving on. If Call 1 intel confirmed a specific pain, lead with it and name it plainly. Do not defend a hypothesis he corrects; write down the correction visibly.

**Why this slide:** The JD's highest-frequency words are quality, reliability, evaluation, adoption, documentation, feedback. These four hypotheses are those words turned into problems. Mentee intel upgrades this slide from informed guess to inside read, which is why it cannot be finalized before Call 1.

---

## Slide 3: Why me: proof, not claims

**On-slide:**

- Founder & CEO, MusliFin: shipped Shariah-compliant auto-finance infrastructure and convinced skeptical, non-technical dealers to adopt a new workflow. Adoption is the job I just did.
- Six-agent Claude pipeline for credit-risk research (PD/LGD/EAD, IRB/OSFI-grounded). Depth proof: agent orchestration with domain rigor.
- The $5 prompt: one message, five dollars, because months of chat history rode along silently. Context engineering learned in production, as a cost lever and a quality lever.
- Foundation: CFA Level II candidate, MSc Quantitative Finance (HEC Montréal) + MSc Islamic Accounting & Finance (INCEIF), M&A research behind a C$400M+ acquisition program.

**Speaker notes:** Tell the $5 story properly here if it did not come up in Meeting 1: production discipline, not hobbyist anecdote. The lesson was that bloated context degrades output quality as much as it burns budget, which is exactly the "output quality and reliability" mandate in this role. Keep the underwriting pipeline to one sentence; it speaks credit, not asset management.

**Why this slide:** Claims are what every candidate brings. Artifacts are the differentiator, and each bullet is an artifact he can inspect.

---

## Slide 4: The operating model: what founding taught me, applied to your team

**On-slide:**

Running MusliFin meant asking every single day: what should we build next for the people we serve, and is it worth our scarce capital?

The loop I lived:

1. **Brainstorm daily**: ideas for better products, tools and services for the teams we serve, sourced from their feedback and my own use.
2. **Evaluate first**: I test each idea myself for quality, feasibility and impact. Raw ideas never reach a decision maker.
3. **Propose decision-ready**: what survives becomes a short proposal: the opportunity or problem targeted, how I propose to do it, what it takes in people and capital, and the key factors that should drive the commit or don't commit call.
4. **Build and document**: whatever gets a yes ships with documentation, best practices and shared resources from day one.

Large, bottom: **"I won't put more work on my manager's plate. I'll take work off it."**

**Speaker notes:** This is autobiographical, not built for this meeting. With no spare capital, evaluating before committing was survival; every bad build was money we did not have. Inside your team, the same loop means you receive options you can decide in ten minutes, with the decision factors already laid out, instead of receiving homework. Investment teams are the customers; adoption is a product problem.

**Why this slide:** The JD asks for someone who evaluates use cases, refines frameworks and maintains shared resources. This slide shows that loop already running for a year and a half under real capital constraints, and it pre-answers "why does a founder want an analyst seat": the daily motion of this seat is the daily motion of the startup. The workload line matters because a junior hire who creates management overhead is a net negative; this one runs the loop himself and hands up decisions, not tasks.

---

## Slide 5: Your posting, this model, side by side

**On-slide (two-column table):**

| The posting says | The model delivers |
|---|---|
| "ensure output quality, reliability and alignment with investment workflows" | Structured evaluation before anything ships |
| "developing and refining evaluation frameworks and quality assurance processes" | Golden sets, consistency checks, grounding audits, scorecards |
| "collect and analyze user feedback to drive continuous improvement" | Standing feedback cadence with PMs, analysts and traders |
| "create and maintain documentation, best practices and shared resources" | Documentation-first builds; every tool reproducible from its docs |
| "monitor AI system performance and usage" | Usage and quality reporting on a fixed rhythm |

**Speaker notes:** Do not read the table aloud. One line: "I didn't invent this model for the interview; it's how I already work, and your posting describes it." Then move.

**Why this slide:** Mirroring the JD verbatim proves the match without asserting it. The quotes are exact strings from the posting (`jd-rbc-ai-analyst.md`).

---

## Slide 6: First 90 days, as if already hired

**On-slide:**

- **Days 1 to 30, listen and inventory.** Use-case audit, tool audit, interviews across PMs, analysts and traders. Deliverable: adoption baseline and friction map. `[INTEL: name the teams or tools Call 1 surfaces]`
- **Days 31 to 60, evaluation framework plus quick wins.** Stand up the eval scorecard and QA process; ship two or three low-risk, high-visibility improvements to prove the loop works. Deliverable: evaluation framework v1, first wins shipped.
- **Days 61 to 90, make it compound.** Documentation system and shared best-practice library; standing feedback cadence; first monthly usage and quality report. Deliverable: the machine that keeps improving without heroics.

**Speaker notes:** Present as a consultant's execution plan, not a wish list. Each phase has a deliverable a manager can check. Say plainly: the sequence flexes to what I learn in the first two weeks, which is why phase one is listening, not shipping.

**Why this slide:** The role is change management wearing an AI title. A concrete 90-day plan demonstrates the exact competency the seat needs, and it gives the manager a mental movie of the candidate already working for him.

---

## Slide 7: Demo: the earnings-call analyzer

**On-slide:**

Upload an earnings call. Get an institutional-grade report in a consistent house style.

Pipeline: ingest to clean markdown → Claude analysis grounded in the established sentiment literature (Loughran-McDonald, FinBERT) → report rendered against a design-system file, so every report looks identical.

The differentiator on this slide: **every number and material claim footnotes back to its source line in the transcript.**

**Speaker notes:** Run the live demo here; recorded fallback ready. Say the guardrail sentence verbatim: "In production this runs on approved infrastructure with data governance and model-risk review. The personal API key is demo-only." Do not pitch the sentiment analysis as novel; your quant teams know this literature. What I'm demonstrating is shipping, documenting and evaluating it.

**Why this slide:** Hallucinated figures are the single biggest adoption blocker on investment teams. A self-citing report kills that objection before anyone raises it. The design-system file is the $5 token story made tangible.

---

## Slide 8: I don't ship without evals

**On-slide:**

The analyzer ships with its own evaluation harness:

- Golden set: transcripts with known ground truth, scored automatically
- Consistency: repeated runs must agree with each other
- Grounding: every generated figure verified against the source document
- Current scorecard: 3 of 3 golden transcripts passing, 100% on accuracy, grounding, numeric verification and run consistency

One line, large: "An AI tool without an eval is an opinion."

**Speaker notes:** This is the differentiation moment; slow down. Almost nobody at the junior level shows evals rather than outputs. Connect it to his mandate: this same harness pattern, golden sets plus consistency plus grounding, is what I would stand up for every tool your teams rely on. `[INTEL: if Q4 revealed what the boss personally measures, tie the scorecard to it]`

**Why this slide:** Evaluation methodology is the JD nice-to-have essentially no junior candidate will demo. This is the campaign's single most differentiated move, so it gets its own slide instead of hiding inside the demo.

---

## Slide 9: The leave-behind

**On-slide:**

Everything from today is yours to keep and reproduce:

- **MASTER-PROMPT.md**: recreate the entire tool yourself, from one file
- **Repo with README and build log**: how it was built, decision by decision
- **design-system.md**: the house-style file every report renders against
- **methodology.md**: the sentiment literature, cited, treated as baseline not discovery

"This is exactly how I'd document every tool for your teams."

**Speaker notes:** Physically hand over or send the package during the meeting, not after. The point: documentation, best practices and shared resources are not a promise, they are already in his inbox.

**Why this slide:** The JD's documentation bullet, delivered before day one. Reproducibility is the proof that the documentation is real.

---

## Slide 10: The ask

**On-slide:**

> Tell me where these hypotheses are wrong.
> If the approach holds, I'd like to go through your formal process for this seat.

**Speaker notes:** One ask, stated once, then silence. If the application is already submitted (it should be by Meeting 2), the ask adjusts to: "My application is in the system; I'd value your read on whether this approach fits what you're building." Do not stack secondary asks on top.

**Why this slide:** A sales process ends with a single clear next step. Two asks compete with each other; one ask gets answered.

---

## Build notes (for the pptx phase, later)

- 16:9, clean, RBC-adjacent: deep navy (#1A365D works, it is Oussama's own brand color), white space, no RBC logos or trademarks anywhere.
- Max ~30 words on-slide except the table (slide 5) and the ask (slide 10, nearly empty on purpose).
- Slide 7 needs a simple pipeline graphic; slide 5 is the only table; slide 8's scorecard could render as four check rows.
- Rehearsal target: 15 minutes talking, 5 for interruptions. Slides 2 and 8 carry the meeting.

## Open dependencies

- Call 1 intel feeds slides 2, 6, 8 (marked `[INTEL]`). Deck is presentable without it, but noticeably weaker.
- Live-demo transcript choice (open item) affects slide 7's screenshots if we bake any in.
- Application should be submitted before this deck is ever shown (sequence rule).
