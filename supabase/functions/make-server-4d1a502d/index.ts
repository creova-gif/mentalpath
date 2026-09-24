import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import aiRoutes from "./ai-routes.ts";
import billingRoutes from "./billing-routes.ts";
import accountRoutes from "./account-routes.ts";
import { rateLimit } from "./rate-limit.ts";

const app = new Hono();

// Log method, path, status and timing only (hono/logger never logs bodies).
app.use("*", logger(console.log));

// ── CORS: explicit allowlist ─────────────────────────────────────────────────
// Set ALLOWED_ORIGINS (comma-separated) in production. Without it, only local
// development origins are accepted — never arbitrary origins.
const rawOrigins = Deno.env.get("ALLOWED_ORIGINS");
const allowedOrigins = rawOrigins ? rawOrigins.split(",").map((o) => o.trim()).filter(Boolean) : [];
const isDev = !rawOrigins;

app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!isDev) return allowedOrigins.includes(origin) ? origin : null;
      const devAllowed =
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/[\w-]+\.[\w-]+\.repl\.co$/.test(origin) ||
        /^https?:\/\/[\w-]+\.replit\.(app|dev)$/.test(origin);
      return devAllowed ? origin : null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Retry-After"],
    maxAge: 600,
  }),
);

// Security headers on every API response
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");
  c.header("Cache-Control", "no-store");
});

// Per-IP rate limiting on expensive / abusable endpoints
app.use("/make-server-4d1a502d/ai-note-assist", rateLimit({ limit: 20, windowSeconds: 60 }));
app.use("/make-server-4d1a502d/billing/*", rateLimit({ limit: 10, windowSeconds: 60 }));
app.use("/make-server-4d1a502d/account/*", rateLimit({ limit: 5, windowSeconds: 60 }));
app.use("/make-server-4d1a502d/contact", rateLimit({ limit: 3, windowSeconds: 300 }));

app.get("/make-server-4d1a502d/health", (c) => c.json({ status: "ok" }));

app.route("/", aiRoutes);
app.route("/", billingRoutes);
app.route("/", accountRoutes);

app.onError((err, c) => {
  console.error("Unhandled error:", err.message);
  return c.json({ error: "Internal error" }, 500);
});

Deno.serve(app.fetch);
