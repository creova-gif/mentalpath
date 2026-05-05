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
// Falls back to localhost for local development.
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: (origin) => allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

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