// Shared-password gate for the whole site (UI + API). Runs on every request.
// Uses HTTP Basic Auth against the APP_PASSWORD secret. If APP_PASSWORD is unset the gate
// is disabled (local dev only) — ALWAYS set it in production via `wrangler pages secret put`.

interface Env {
  APP_PASSWORD?: string;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const expected = ctx.env.APP_PASSWORD;
  if (!expected) return ctx.next(); // gate disabled when no password configured (dev)

  const header = ctx.request.headers.get("Authorization") || "";
  if (header.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(header.slice(6));
    } catch {
      decoded = "";
    }
    const idx = decoded.indexOf(":");
    const pass = idx >= 0 ? decoded.slice(idx + 1) : decoded;
    if (safeEqual(pass, expected)) return ctx.next();
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Earnings-Call Analyzer (demo)"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
