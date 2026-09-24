// MentalPath — Stripe webhook (deployed as its own function with verify_jwt = false;
// see supabase/config.toml). Stripe is the single source of truth for paid
// status: this function is the only writer of the clinicians billing columns.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { isStale, subscriptionToUpdate, verifyStripeSignature, type PriceMap } from "./logic.ts";

const SUBSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();
  // deno-lint-ignore no-explicit-any
  let event: any;
  try {
    event = await verifyStripeSignature(rawBody, signature, secret);
  } catch (err) {
    console.error("stripe-webhook: signature verification failed:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const prices: PriceMap = {
    solo: Deno.env.get("STRIPE_SOLO_PRICE_ID") ?? undefined,
    group: Deno.env.get("STRIPE_GROUP_PRICE_ID") ?? undefined,
  };

  try {
    const obj = event.data?.object ?? {};
    let clinicianId: string | null = null;
    // deno-lint-ignore no-explicit-any
    let update: Record<string, any> | null = null;

    if (event.type === "checkout.session.completed" && obj.mode === "subscription") {
      clinicianId = obj.client_reference_id ?? obj.metadata?.clinician_id ?? null;
      if (clinicianId && typeof obj.customer === "string") {
        update = { stripe_customer_id: obj.customer, stripe_subscription_id: obj.subscription ?? null };
      }
    } else if (SUBSCRIPTION_EVENTS.has(event.type)) {
      update = subscriptionToUpdate(obj, event.created, prices);
      clinicianId = obj.metadata?.clinician_id ?? null;
      if (!clinicianId && update?.stripe_customer_id) {
        const { data } = await supabase.from("clinicians").select("id")
          .eq("stripe_customer_id", update.stripe_customer_id).maybeSingle();
        clinicianId = data?.id ?? null;
      }
    } else if (event.type === "invoice.payment_failed" || event.type === "invoice.paid") {
      // Subscription status changes arrive via customer.subscription.updated;
      // these are recorded for the audit trail only.
      const { data } = await supabase.from("clinicians").select("id")
        .eq("stripe_customer_id", obj.customer).maybeSingle();
      if (data?.id) {
        await supabase.from("audit_log").insert({
          clinician_id: data.id,
          action: event.type === "invoice.paid" ? "BILLING_PAYMENT_SUCCEEDED" : "BILLING_PAYMENT_FAILED",
          table_name: "clinicians",
          record_id: data.id,
          details: { stripe_invoice: obj.id, attempt_count: obj.attempt_count ?? null },
        });
      }
      return json({ received: true, handled: "audit" });
    } else {
      return json({ received: true, handled: false });
    }

    if (!clinicianId || !update) {
      console.warn(`stripe-webhook: ${event.type} ${event.id} not matched to a clinician`);
      return json({ received: true, handled: false });
    }

    // Idempotency: Stripe retries deliveries; process each event once.
    const { data: firstTime, error: idemError } = await supabase.rpc("record_stripe_event", {
      p_id: event.id, p_type: event.type,
    });
    if (idemError) throw idemError;
    if (!firstTime) return json({ received: true, duplicate: true });

    // Ordering: ignore subscription snapshots older than the one already applied.
    if (update.billing_updated_at) {
      const { data: current } = await supabase.from("clinicians").select("billing_updated_at")
        .eq("id", clinicianId).maybeSingle();
      if (isStale(event.created, current?.billing_updated_at)) {
        return json({ received: true, stale: true });
      }
    }

    const { error } = await supabase.from("clinicians").update(update).eq("id", clinicianId);
    if (error) throw error;

    await supabase.from("audit_log").insert({
      clinician_id: clinicianId,
      action: "BILLING_UPDATED",
      table_name: "clinicians",
      record_id: clinicianId,
      details: { stripe_event: event.id, type: event.type, status: update.subscription_status ?? null },
    });

    return json({ received: true, handled: true });
  } catch (err) {
    console.error(`stripe-webhook: error handling ${event.type} ${event.id}:`, err);
    // 500 → Stripe retries with backoff. Forget the event so the retry is
    // processed instead of being treated as a duplicate.
    await supabase.rpc("forget_stripe_event", { p_id: event.id }).then(() => {}, () => {});
    return json({ error: "Handler error" }, 500);
  }
});
