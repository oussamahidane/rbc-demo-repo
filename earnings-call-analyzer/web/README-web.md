# Earnings-Call Analyzer — Web Interface (Cloudflare Pages + Functions)

A password-gated web UI for the [earnings-call analyzer](../README.md), for the manager
demo at **rbc.oussamahidane.com**. Static UI on Cloudflare **Pages**; the API and the
access gate run as Pages **Functions** on the Workers runtime (this is the "Workers +
Pages" pairing). Same origin throughout — no CORS surface.

```
public/            static UI (index.html, styles.css, app.js) — served by Pages
functions/
  _middleware.ts   shared-password gate (HTTP Basic Auth) on every request
  api/analyze.ts   POST endpoint: transcript -> grounded report JSON
src/               TS port of the pipeline (ingest, prompts, analyze, ground, report)
test/              node:test pipeline checks against the golden set
```

The `src/` logic mirrors the Python `eca` package; both read the same house style from
[`../design-system.md`](../design-system.md). The Python tool remains the reference
implementation + evaluation harness.

## Backends

- **No `ANTHROPIC_API_KEY` set** → deterministic **sample** backend (offline heuristic).
  Good for local dev and a zero-cost demo.
- **`ANTHROPIC_API_KEY` set** (Worker secret) → real **Claude** analysis. Key stays
  server-side; it never reaches the browser.

## Local development

```bash
cd earnings-call-analyzer/web
npm install
cp .dev.vars.example .dev.vars     # optional: add ANTHROPIC_API_KEY and/or APP_PASSWORD
npm run dev                        # wrangler pages dev  ->  http://127.0.0.1:8788
```

- Leave `.dev.vars` empty to exercise the offline sample backend with the gate disabled.
- `npm run typecheck` — type-checks the deploy surface (src + functions).
- `npm test` — runs the pipeline against the golden set (must pass, 100% grounding).

## Deploy (domain already on your Cloudflare account)

```bash
npx wrangler login                        # once, in an interactive terminal
npx wrangler pages project create eca-web # once; or create it in the dashboard
npm run deploy                            # wrangler pages deploy  -> *.pages.dev URL
```

### Set the secrets (do this yourself — I never handle the key)

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY   # paste your key when prompted
npx wrangler pages secret put APP_PASSWORD        # the shared demo password for managers
```

`ECA_MODEL` is a non-secret var (default `claude-sonnet-5`) set in `wrangler.jsonc`;
override there or in the dashboard. Redeploy after setting secrets if they were added
after the first deploy.

### Custom domain

Cloudflare dashboard → **Workers & Pages → eca-web → Custom domains → Set up a domain** →
enter `rbc.oussamahidane.com`. Since `oussamahidane.com` is already on your account, the
CNAME is added automatically and TLS is issued in a minute or two.

## Post-deploy verification checklist

1. Visit `https://rbc.oussamahidane.com` → browser prompts for the password (Basic Auth).
   Wrong password → 401. Correct → app loads.
2. Click **Load sample → Analyze**. Confirm the report renders with the scorecard and
   `[Ln]` citations (hover a citation → the source line appears).
3. Backend badge reads **"live: claude-sonnet-5"** (not "sample mode") once the key is set.
4. Paste a real transcript; spot-check that every figure's citation resolves to the right
   line, and that the Grounding Flags section catches anything unverifiable.
5. Confirm the key is not in the client bundle: `curl -s https://rbc.oussamahidane.com/app.js | grep -i anthropic` returns nothing.

## Security & governance notes

- **Access:** shared-password Basic Auth via `APP_PASSWORD`. If it's ever unset, the gate
  is disabled — always keep it set in production. (For a stronger posture, put Cloudflare
  Access / Zero Trust in front; the middleware can then be removed.)
- **Secrets:** `ANTHROPIC_API_KEY` and `APP_PASSWORD` are Worker secrets, never committed.
  `.dev.vars` is gitignored.
- **Data handling:** transcripts are analyzed in-request and **not stored or logged**. The
  UI carries a banner: do not paste confidential / client / material non-public info. This
  is demo infrastructure — the "personal API key is demo-only" line is shown in the footer.
- **Cost control:** the gate limits who can spend against your key; the API rejects bodies
  over 200 KB. Watch usage in the Anthropic console during the demo window.
- **Trademark:** no RBC logos/marks; footer states it is an independent demo, not
  affiliated with or endorsed by RBC.
