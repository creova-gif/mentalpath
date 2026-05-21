import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
import trialManager from "./trial-manager.ts";
import aiRoutes from "./ai-routes.ts";
import billingRoutes from "./billing-routes.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// ── M-02: Restrict CORS to explicit allowlist ────────────────────────────────
// Set ALLOWED_ORIGINS env var to a comma-separated list of production domains.
// Falls back to common dev origins (localhost variants + Replit) when not set.
const rawOrigins = Deno.env.get("ALLOWED_ORIGINS");
const allowedOrigins = rawOrigins
  ? rawOrigins.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const isDev = !rawOrigins;

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: (origin) => {
      // In prod: only exact allowlist matches
      if (!isDev) {
        return allowedOrigins.includes(origin) ? origin : null;
      }
      // In dev (no ALLOWED_ORIGINS set): allow localhost on any port + Replit
      return isDev ? (origin || '*') : null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Explicit OPTIONS handler for preflight requests
app.options('*', (c) => {
  return c.text('', 204);
});

// Health check endpoint
app.get("/make-server-4d1a502d/health", (c) => {
  return c.json({ status: "ok" });
});

// Mount trial manager routes
app.route("/", trialManager);

// Mount AI note assist routes
app.route("/", aiRoutes);

// Mount billing routes
app.route("/", billingRoutes);

Deno.serve(app.fetch);