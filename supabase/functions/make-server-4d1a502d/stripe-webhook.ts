// MentalPath — Stripe Webhook Edge Function
// Handles: subscription created/updated/cancelled, invoice paid, payment failed
// Supabase Edge Function (Deno runtime)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Stripe event types we care about
const HANDLED_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "checkout.session.completed",
]);

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const rawBody = await req.text();

  if (!signature || !webhookSecret) {
    return new Response("Missing signature", { status: 400 });
  }

  // Verify Stripe signature
  let event: Record<string, unknown>;
  try {
    event = await verifyStripeSignature(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = event.type as string;
  if (!HANDLED_EVENTS.has(eventType)) {
    return new Response(JSON.stringify({ received: true, handled: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Init Supabase admin client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const obj = event.data?.object as Record<string, unknown>;

  try {
    switch (eventType) {

      // ── SUBSCRIPTION CREATED ──
      case "customer.subscription.created": {
        const customerId = obj.customer as string;
        const status = obj.status as string;
        const priceId = (obj.items as Record<string, unknown>)?.data?.[0]?.price?.id as string;
        const tier = getTierFromPrice(priceId);
        const trialEnd = obj.trial_end as number | null;

        await supabase
          .from("therapists")
          .update({
            stripe_subscription_id: obj.id,
            subscription_tier: tier,
            subscription_status: status,
            trial_ends_at: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription created: ${customerId} → ${tier} (${status})`);
        break;
      }

      // ── SUBSCRIPTION UPDATED ──
      case "customer.subscription.updated": {
        const customerId = obj.customer as string;
        const status = obj.status as string;
        const priceId = (obj.items as Record<string, unknown>)?.data?.[0]?.price?.id as string;
        const tier = getTierFromPrice(priceId);
        const cancelAt = obj.cancel_at as number | null;

        await supabase
          .from("therapists")
          .update({
            subscription_tier: tier,
            subscription_status: status,
            cancel_at: cancelAt ? new Date(cancelAt * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription updated: ${customerId} → ${tier} (${status})`);
        break;
      }

      // ── SUBSCRIPTION CANCELLED / DELETED ──
      case "customer.subscription.deleted": {
        const customerId = obj.customer as string;
        await supabase
          .from("therapists")
          .update({
            subscription_tier: "free",
            subscription_status: "cancelled",
            cancel_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription cancelled: ${customerId}`);
        break;
      }

      // ── INVOICE PAID (mark invoice as paid in our DB) ──
      case "invoice.payment_succeeded": {
        const stripeInvoiceId = obj.id as string;
        const amountPaid = (obj.amount_paid as number) / 100; // convert from cents
        const customerId = obj.customer as string;

        // Mark our invoice as paid if this was for a one-off invoice
        const { data: therapist } = await supabase
          .from("therapists")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (therapist) {
          // Find matching invoice by stripe payment intent
          const paymentIntentId = obj.payment_intent as string;
          if (paymentIntentId) {
            await supabase
              .from("invoices")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                stripe_payment_intent_id: paymentIntentId,
              })
              .eq("stripe_payment_intent_id", paymentIntentId)
              .eq("therapist_id", therapist.id);
          }
        }

        console.log(`Invoice paid: ${stripeInvoiceId} — $${amountPaid}`);
        break;
      }

      // ── INVOICE PAYMENT FAILED ──
      case "invoice.payment_failed": {
        const customerId = obj.customer as string;
        const attemptCount = obj.attempt_count as number;

        // Update subscription status to past_due after first failure
        if (attemptCount >= 1) {
          await supabase
            .from("therapists")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }

        console.log(`Payment failed for ${customerId} — attempt ${attemptCount}`);
        break;
      }

      // ── CHECKOUT SESSION COMPLETED (initial signup) ──
      case "checkout.session.completed": {
        const customerId = obj.customer as string;
        const subscriptionId = obj.subscription as string;
        const clientReferenceId = obj.client_reference_id as string; // therapist UUID

        if (clientReferenceId && customerId) {
          await supabase
            .from("therapists")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", clientReferenceId);
        }

        console.log(`Checkout completed: therapist ${clientReferenceId} → customer ${customerId}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true, handled: true, type: eventType }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(`Error handling ${eventType}:`, err);
    return new Response(JSON.stringify({ error: "Handler error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// Map Stripe price ID → subscription tier
function getTierFromPrice(priceId: string): string {
  const soloId = Deno.env.get("STRIPE_SOLO_PRICE_ID");
  const groupId = Deno.env.get("STRIPE_GROUP_PRICE_ID");
  if (priceId === soloId) return "solo";
  if (priceId === groupId) return "group";
  return "free";
}

// Stripe webhook signature verification (HMAC SHA-256)
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<Record<string, unknown>> {
  const parts = signature.split(",").reduce((acc: Record<string, string>, part: string) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const sig = parts["v1"];

  if (!timestamp || !sig) throw new Error("Invalid signature format");

  // Check timestamp (reject if > 5 minutes old)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error("Webhook timestamp too old");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(mac))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const expectedBytes = new TextEncoder().encode(expectedSig);
  const actualBytes = new TextEncoder().encode(sig);

  // Constant-time comparison — prevents timing-based signature leaks
  if (expectedBytes.length !== actualBytes.length) throw new Error("Signature mismatch");
  let diff = 0;
  for (let i = 0; i < expectedBytes.length; i++) {
    diff |= expectedBytes[i] ^ actualBytes[i];
  }
  if (diff !== 0) throw new Error("Signature mismatch");

  return JSON.parse(payload);
}
