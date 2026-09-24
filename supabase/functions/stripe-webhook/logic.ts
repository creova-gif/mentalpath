// Pure, dependency-free logic for the Stripe webhook so it can be unit-tested
// with `deno test` (see logic.test.ts).

export type Plan = "solo" | "group";

export interface PriceMap {
  solo?: string;
  group?: string;
}

/** Columns on public.clinicians that the webhook is allowed to write. */
export interface BillingUpdate {
  stripe_customer_id?: string;
  stripe_subscription_id?: string | null;
  subscription_status?: string;
  plan_type?: Plan;
  is_trial?: boolean;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  cancel_at?: string | null;
  plan_seats?: number;
  price_per_seat?: number;
  plan_cycle?: "monthly" | "annual";
  billing_updated_at: string;
}

const KNOWN_STATUSES = new Set([
  "trialing", "active", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused",
]);

const iso = (unixSeconds: unknown): string | null =>
  typeof unixSeconds === "number" && unixSeconds > 0 ? new Date(unixSeconds * 1000).toISOString() : null;

export function planForPrice(priceId: string | undefined, prices: PriceMap): Plan | null {
  if (!priceId) return null;
  if (priceId === prices.solo) return "solo";
  if (priceId === prices.group) return "group";
  return null;
}

// deno-lint-ignore no-explicit-any
type StripeObject = Record<string, any>;

/**
 * Maps a Stripe Subscription object to clinician billing columns.
 * Returns null for prices we don't sell (the event is acknowledged but ignored).
 */
export function subscriptionToUpdate(sub: StripeObject, eventCreated: number, prices: PriceMap): BillingUpdate | null {
  const item = sub?.items?.data?.[0];
  const plan = planForPrice(item?.price?.id, prices);
  if (!plan) return null;

  const status = KNOWN_STATUSES.has(sub.status) ? sub.status : "incomplete";
  const unitAmount = typeof item?.price?.unit_amount === "number" ? item.price.unit_amount / 100 : undefined;
  const interval = item?.price?.recurring?.interval;

  return {
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    stripe_subscription_id: status === "canceled" ? null : sub.id,
    subscription_status: status,
    plan_type: plan,
    is_trial: status === "trialing",
    trial_ends_at: iso(sub.trial_end),
    // Stripe moved current_period_end onto subscription items (2025 API versions)
    current_period_end: iso(item?.current_period_end ?? sub.current_period_end),
    cancel_at: iso(sub.cancel_at),
    plan_seats: typeof item?.quantity === "number" ? item.quantity : 1,
    ...(unitAmount !== undefined ? { price_per_seat: unitAmount } : {}),
    ...(interval ? { plan_cycle: interval === "year" ? "annual" : "monthly" } : {}),
    billing_updated_at: new Date(eventCreated * 1000).toISOString(),
  };
}

/** True if an event is older than the last one applied (Stripe does not guarantee order). */
export function isStale(eventCreated: number, lastAppliedIso: string | null | undefined): boolean {
  if (!lastAppliedIso) return false;
  return eventCreated * 1000 < new Date(lastAppliedIso).getTime();
}

// ── Signature verification (Stripe-Signature: t=...,v1=...[,v1=...]) ────────
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = 300,
): Promise<StripeObject> {
  let timestamp: string | undefined;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.split("=", 2).map((s) => s?.trim());
    if (k === "t") timestamp = v;
    if (k === "v1" && v) signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) throw new Error("Invalid signature header");
  if (Math.abs(nowSeconds - Number(timestamp)) > toleranceSeconds) throw new Error("Timestamp outside tolerance");

  const expected = await hmacHex(secret, `${timestamp}.${payload}`);
  // Stripe may send several v1 signatures during secret rotation.
  if (!signatures.some((sig) => timingSafeEqual(sig, expected))) throw new Error("Signature mismatch");
  return JSON.parse(payload);
}

export async function signForTest(payload: string, secret: string, timestamp: number): Promise<string> {
  return `t=${timestamp},v1=${await hmacHex(secret, `${timestamp}.${payload}`)}`;
}
