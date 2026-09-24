// MentalPath — Subscription checkout, billing portal, and T2125 income export.
import { Hono } from "npm:hono";
import { requireUser, serviceClient, userClient } from "./auth.ts";
import { stripeRequest } from "./stripe.ts";

const app = new Hono();

function appUrl(): string {
  const url = Deno.env.get("APP_URL");
  if (!url) throw new Error("APP_URL is not configured");
  return url.replace(/\/$/, "");
}

export const MAX_GROUP_SEATS = 50;

/** Validates the checkout request body. Exported for unit tests. */
export function parseCheckoutRequest(body: unknown): { plan: "solo" | "group"; seats: number } | { error: string } {
  const b = (body ?? {}) as { plan?: unknown; seats?: unknown };
  const plan = b.plan === undefined ? "solo" : b.plan;
  if (plan !== "solo" && plan !== "group") return { error: "Unknown plan" };
  if (plan === "solo") return { plan, seats: 1 };
  const seats = Number(b.seats);
  if (!Number.isInteger(seats) || seats < 2 || seats > MAX_GROUP_SEATS) {
    return { error: `Group practices need between 2 and ${MAX_GROUP_SEATS} seats` };
  }
  return { plan, seats };
}

// POST /make-server-4d1a502d/billing/checkout-session  { plan?: "solo" | "group", seats?: number }
// Starts Stripe Checkout. Group requires the caller to own a practice; seats =
// subscription quantity. Paid status is granted only by the stripe-webhook
// function once Stripe confirms the subscription.
app.post("/make-server-4d1a502d/billing/checkout-session", async (c) => {
  const auth = await requireUser(c);
  if (auth instanceof Response) return auth;
  const { user } = auth;

  const req = parseCheckoutRequest(await c.req.json().catch(() => ({})));
  if ("error" in req) return c.json({ error: req.error }, 400);

  const priceId = Deno.env.get(req.plan === "group" ? "STRIPE_GROUP_PRICE_ID" : "STRIPE_SOLO_PRICE_ID");
  if (!priceId) return c.json({ error: "Billing is not configured" }, 503);

  const db = serviceClient();
  if (req.plan === "group") {
    const { data: practice } = await db.from("practices").select("id").eq("owner_id", user.id).maybeSingle();
    if (!practice) return c.json({ error: "Create your practice first.", code: "NO_PRACTICE" }, 409);
  }
  const { data: clinician } = await db.from("clinicians")
    .select("stripe_customer_id, subscription_status, is_trial, trial_ends_at")
    .eq("id", user.id).maybeSingle();
  if (!clinician) return c.json({ error: "Profile not found" }, 404);

  if (["active", "trialing", "past_due"].includes(clinician.subscription_status)) {
    return c.json({ error: "You already have a subscription. Manage it from the billing portal.", code: "ALREADY_SUBSCRIBED" }, 409);
  }

  // Keep the remaining no-card trial: Stripe starts billing when it ends
  // (Stripe requires trial_end to be at least 48h away).
  const trialEnd = clinician.is_trial && clinician.trial_ends_at
    ? Math.floor(new Date(clinician.trial_ends_at).getTime() / 1000) : 0;
  const keepTrial = trialEnd > Math.floor(Date.now() / 1000) + 48 * 3600;

  try {
    const session = await stripeRequest<{ url: string }>("checkout/sessions", {
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": req.seats,
      client_reference_id: user.id,
      "metadata[clinician_id]": user.id,
      "subscription_data[metadata][clinician_id]": user.id,
      ...(keepTrial ? { "subscription_data[trial_end]": trialEnd } : {}),
      ...(clinician.stripe_customer_id
        ? { customer: clinician.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      allow_promotion_codes: true,
      billing_address_collection: "required",
      ...(Deno.env.get("STRIPE_AUTOMATIC_TAX") === "true" ? { "automatic_tax[enabled]": true } : {}),
      success_url: `${appUrl()}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/dashboard/settings?tab=subscription`,
      locale: "auto",
    });
    return c.json({ url: session.url });
  } catch (err) {
    console.error("checkout-session error:", (err as Error).message);
    return c.json({ error: "Could not start checkout. Please try again." }, 502);
  }
});

// POST /make-server-4d1a502d/billing/portal-session
// Stripe Customer Portal: update card, view invoices, cancel (cancellation is
// never obstructed — SaaS framework §7).
app.post("/make-server-4d1a502d/billing/portal-session", async (c) => {
  const auth = await requireUser(c);
  if (auth instanceof Response) return auth;

  const { data: clinician } = await serviceClient().from("clinicians")
    .select("stripe_customer_id").eq("id", auth.user.id).maybeSingle();
  if (!clinician?.stripe_customer_id) {
    return c.json({ error: "No billing account yet.", code: "NO_CUSTOMER" }, 404);
  }
  try {
    const session = await stripeRequest<{ url: string }>("billing_portal/sessions", {
      customer: clinician.stripe_customer_id,
      return_url: `${appUrl()}/dashboard/settings?tab=subscription`,
    });
    return c.json({ url: session.url });
  } catch (err) {
    console.error("portal-session error:", (err as Error).message);
    return c.json({ error: "Could not open the billing portal." }, 502);
  }
});

// GET /make-server-4d1a502d/tax-export/t2125/:year
// Reads the same Postgres invoices the Billing page shows, as the caller (RLS +
// MFA apply), so the export can never include another clinician's data.
app.get("/make-server-4d1a502d/tax-export/t2125/:year", async (c) => {
  const auth = await requireUser(c);
  if (auth instanceof Response) return auth;

  const year = c.req.param("year");
  if (!/^\d{4}$/.test(year)) return c.json({ error: "Invalid year — must be a 4-digit year" }, 400);

  const { data: invoices, error } = await userClient(auth.token)
    .from("invoices")
    .select("invoice_number, date, client_name, amount, sessions, status")
    .eq("status", "paid")
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`)
    .order("date");
  if (error) {
    console.error("t2125 query error:", error.code);
    return c.json({ error: "Failed to generate T2125 summary" }, 500);
  }

  const rows = (invoices ?? []).map((inv) => ({
    invoiceNumber: inv.invoice_number,
    date: inv.date,
    client: inv.client_name,
    amount: Number(inv.amount),
    sessions: inv.sessions ?? 0,
  }));
  const summary = buildT2125Summary(year, rows);
  return c.json({ summary, csv: generateT2125CSV(summary), fileName: `MentalPath_T2125_${year}.csv` });
});

export interface T2125Row { invoiceNumber: string; date: string; client: string; amount: number; sessions: number }

export function buildT2125Summary(year: string, rows: T2125Row[]) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(Date.UTC(2000, i, 1)).toLocaleString("en-CA", { month: "long", timeZone: "UTC" }),
    revenue: 0, sessions: 0, invoices: 0,
  }));
  for (const r of rows) {
    const m = months[Number(r.date.slice(5, 7)) - 1];
    m.revenue += r.amount;
    m.sessions += r.sessions;
    m.invoices += 1;
  }
  return {
    year,
    grossRevenue: rows.reduce((s, r) => s + r.amount, 0),
    totalInvoices: rows.length,
    totalSessions: rows.reduce((s, r) => s + r.sessions, 0),
    monthlyBreakdown: months,
    invoiceDetails: rows,
    notes: [
      "This is a summary of gross professional income only.",
      "Business expenses should be tracked separately for T2125 Part 2.",
      "Consult a tax professional for complete T2125 preparation.",
    ],
  };
}

// CSV injection protection: neutralise formula triggers, quote special characters.
export function csvSafe(value: unknown): string {
  let str = String(value ?? "");
  if (/^[=+\-@\t\r|%]/.test(str)) str = `'${str}`;
  if (/[",\n\r]/.test(str)) str = `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function generateT2125CSV(summary: ReturnType<typeof buildT2125Summary>): string {
  const lines = [
    "MentalPath T2125 Income Summary",
    `Tax Year,${csvSafe(summary.year)}`,
    "",
    "GROSS REVENUE SUMMARY",
    `Total Gross Revenue,${summary.grossRevenue.toFixed(2)}`,
    `Total Invoices,${summary.totalInvoices}`,
    `Total Sessions,${summary.totalSessions}`,
    "",
    "MONTHLY BREAKDOWN",
    "Month,Revenue,Sessions,Invoices",
    ...summary.monthlyBreakdown.map((m) => `${m.month},${m.revenue.toFixed(2)},${m.sessions},${m.invoices}`),
    "",
    "DETAILED INVOICE LIST",
    "Invoice Number,Date,Client,Amount,Sessions",
    ...summary.invoiceDetails.map((inv) =>
      [csvSafe(inv.invoiceNumber), csvSafe(inv.date), csvSafe(inv.client), inv.amount.toFixed(2), inv.sessions].join(",")
    ),
    "",
    "NOTES FOR T2125 PREPARATION",
    ...summary.notes.map((n) => csvSafe(n)),
  ];
  return lines.join("\n");
}

export default app;
