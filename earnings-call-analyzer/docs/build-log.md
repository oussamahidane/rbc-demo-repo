# Build Log — Earnings-Call Analyzer

> A running narrative of how the tool was built. This is itself a portfolio artifact: it
> shows the *how* — decisions, tradeoffs, verification — not just the finished code. The
> deck references this as evidence of documentation discipline.

## Session 1 — 2026-07-12

**Goal:** ship the lead proof asset (game plan §8) end-to-end: ingest → analysis →
grounding → report → eval harness → docs, verifiable offline.

**Key decisions**

1. **Mock-first architecture.** The whole pipeline runs deterministically with no API key
   (`--mock`). Rationale: (a) the eval harness must be reproducible and free to run; (b) the
   pipeline, grounding, and report rendering can be tested without spending tokens or
   depending on network; (c) a deterministic backend is a legitimate eval baseline. Real
   Claude analysis is the same interface behind `ANTHROPIC_API_KEY`.
2. **Grounding as a first-class output, not a feature.** Every claim cites `[Ln]`; a
   separate checker verifies citations resolve and financial figures appear on cited lines.
   Unverifiable claims are surfaced in a "Grounding Flags" section. Rationale: hallucinated
   figures are the adoption blocker on investment desks — kill the objection in the artifact.
3. **House style in one file.** `design-system.md` carries a machine-readable `config`
   block that the renderer parses (section order, title format, disclaimer, tone). The
   coupling is real, not cosmetic — editing the file changes every report. This is the
   md-as-context discipline made tangible.
4. **Synthetic golden set.** Eval needs known ground truth; real transcripts don't provide
   it cleanly and carry copyright risk. Three synthetic, clearly-labelled transcripts
   (a strong tech quarter, a soft industrials quarter, a bank quarter) with `expected.json`
   answer keys. Real transcripts are for the live demo only.
5. **Model default = claude-sonnet-5**, overridable. The choice is the cost/quality
   decision the whole campaign is about — documented in README, not buried.

**Verification (offline, mock)**

- `python -m eca --mock analyze golden/northwind-q3-2025.md` → report written; grounding
  coverage 100%, numeric verification 100%, 0 flags.
- `python -m eca --mock eval` → 3/3 golden cases PASS at 100% accuracy / 100% grounding /
  100% numeric / 100% consistency.

**Fixes made during the session**

- Company-name detection initially failed because the regex character class excluded the
  comma in "Northwind Technologies, Inc." — rewrote to match a run of Title-Case words
  ending in a legal suffix.
- Guidance value truncated a range ("$4.4" from "$4.4 to $4.6 billion") — added range regexes
  for money and percent so the full range is captured.
- Grounding numeric check false-flagged the tone diagnostic's lexicon counts ("9 vs 3") as
  unverified figures — narrowed numeric verification to *financial* figures (money/percent)
  only, so incidental integers and years aren't treated as claims.

**Known next steps (honest backlog)**

- Unit-consistency check in grounding (billion vs. million mismatch detection).
- Load the full Loughran-McDonald master dictionary for the tone stage.
- Prepared-remarks vs. Q&A tone divergence as an explicit signal (literature supports it).
- Optional: a one-page HTML render of the report for the live demo.
- Record the clean end-to-end demo video (fallback against live-demo failure).

**State at end of session:** tool complete and passing offline. Real-Claude path implemented
but unverified here (no API key in build environment) — verify with a key before the live
demo. Sample report committed at `reports/northwind-q3-2025.report.md`.

## Session 2 — 2026-07-12 — Web interface (Cloudflare Pages + Functions)

**Goal:** a password-gated web UI for the tool, deployable to Cloudflare (Pages + Workers)
for manager testing at rbc.oussamahidane.com.

**Decisions**

1. **Pages + Pages Functions**, not a separate Worker. Functions run on the Workers runtime,
   so it's genuinely "Workers + Pages," and keeping the API same-origin removes CORS as an
   entire risk class.
2. **TS port of the pipeline** (`web/src/`) mirroring the Python `eca` package — Cloudflare's
   runtime is JS/TS, and the port is faithful (verified below). Python stays the reference +
   eval harness. Shared house style via design-system.md (mirrored in `designSystem.ts`).
3. **Sample backend in the Worker too:** with no key, the API serves the deterministic
   heuristic — so the demo works offline and local dev costs nothing. Real Claude is behind
   the `ANTHROPIC_API_KEY` secret via a direct `fetch` to the Messages API (key never hits
   the client).
4. **Access:** shared-password HTTP Basic Auth in `_middleware.ts` against `APP_PASSWORD`;
   gates both UI and API. Grounding-figure tooltips: each `[Ln]` chip shows its source line
   on hover — the grounding story made visceral.
5. **Guardrails baked into the UI:** MNPI "do not paste confidential data" banner, no
   transcript logging, 200 KB body cap, CSP locked to `'self'`, footer "independent demo,
   not affiliated with RBC" + the demo-only maturity line.

**Verification (local `wrangler pages dev`)**

- `npm test` → 4/4 pass: TS port matches Python on all 3 golden transcripts (100% grounding,
  all expected metrics, correct company/quarter detection).
- `npm run typecheck` → clean on the deploy surface.
- API POST (Atlas transcript) → correct company/quarter, 100% grounding across 24 claims,
  all metrics, net-negative tone, source lines returned.
- Browser end-to-end: Load sample → Analyze → full report renders (scorecard, metrics table,
  quotes, citation hover-to-source). Guidance range renders in full ("$4.4 to $4.6 billion").
- Access gate: no auth → 401, wrong password → 401, correct → 200, API also 401 without auth.

**Fixes during session:** missing generic `.hidden` CSS rule left the "Analyzing…" status
lingering above the report — added `.hidden { display:none !important }`.

**Not done here (needs the user + a key):** real-Claude verification with a live key; the
actual `wrangler deploy`, secret-setting, and custom-domain wiring (runbook in
`web/README-web.md`); the demo transcript choice; the fallback video.
