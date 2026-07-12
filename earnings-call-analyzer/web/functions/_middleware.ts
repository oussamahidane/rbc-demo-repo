// Shared-password gate for the whole site (UI + API). Runs on every request.
// Uses HTTP Basic Auth against the APP_PASSWORD secret. If APP_PASSWORD is unset the gate
// is disabled (local dev only) — ALWAYS set it in production via `wrangler pages secret put`.

interface Env {
  APP_PASSWORD?: string;
  RATE_LIMIT_BUDGET?: string;
  RATE_LIMIT_WINDOW_DAYS?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function getWeekKey(): string {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  return weekStart.toISOString().split('T')[0]; // YYYY-MM-DD of week start
}

async function checkRateLimit(ip: string, kv: KVNamespace, budgetDollars: number): Promise<{ allowed: boolean; remaining: number }> {
  const weekKey = getWeekKey();
  const kvKey = `ratelimit:${ip}:${weekKey}`;

  const storedStr = await kv.get(kvKey);
  const currentSpend = storedStr ? parseFloat(storedStr) : 0;
  const remaining = Math.max(0, budgetDollars - currentSpend);

  return { allowed: remaining > 0, remaining };
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const ip = ctx.request.headers.get("CF-Connecting-IP") || "unknown";

  // Rate limit check (if KV is bound)
  if (ctx.env.RATE_LIMIT_KV) {
    const budget = parseFloat(ctx.env.RATE_LIMIT_BUDGET || "5.0");
    const { allowed } = await checkRateLimit(ip, ctx.env.RATE_LIMIT_KV, budget);
    if (!allowed) {
      return new Response("Rate limit exceeded ($5/week per IP). Try again next week.", {
        status: 429,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  // Password gate
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
