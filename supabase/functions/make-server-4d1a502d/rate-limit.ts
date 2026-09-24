import type { Context, Next } from "npm:hono";

// Fixed-window, per-IP limiter. State lives in the isolate's memory, so across
// several warm isolates the effective limit is a multiple of `limit` — this is
// abuse dampening, not a quota. Hard quotas (AI Assist) are enforced in Postgres.
export function rateLimit({ limit, windowSeconds }: { limit: number; windowSeconds: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return async (c: Context, next: Next) => {
    if (c.req.method === "OPTIONS") return next();
    const ip = (c.req.header("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      return next();
    }
    entry.count += 1;
    if (entry.count > limit) {
      c.header("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return c.json({ error: "Too many requests. Please wait and try again." }, 429);
    }
    return next();
  };
}
