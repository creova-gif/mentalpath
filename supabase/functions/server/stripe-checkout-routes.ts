// MentalPath — Stripe Checkout Session Routes
// For Canadian regulated mental health SaaS subscriptions

import { Hono } from "npm:hono";
import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_TEST_SECRET_KEY");
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" }) : null;

// Pricing IDs (Configured in Supabase Secrets / Environment)
const PRICE_MAP: Record<string, string> = {
  solo_monthly: Deno.env.get("STRIPE_PRICE_SOLO") || "price_solo_monthly",
  solo_annual: Deno.env.get("STRIPE_PRICE_SOLO_ANNUAL") || "price_solo_annual",
  group_monthly: Deno.env.get("STRIPE_PRICE_GROUP") || "price_group_monthly",
  group_annual: Deno.env.get("STRIPE_PRICE_GROUP_ANNUAL") || "price_group_annual",
};

app.post("/make-server-4d1a502d/stripe-checkout", async (c) => {
  return handleCheckout(c);
});

app.post("/stripe-checkout", async (c) => {
  return handleCheckout(c);
});

async function handleCheckout(c: any) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { plan = 'solo', cycle = 'monthly', email, user_id, origin = 'https://mentalpath.ca' } = body;

    if (!stripe) {
      return c.json({
        error: "Stripe is not yet configured on this backend. Set STRIPE_SECRET_KEY in environment.",
        mock_available: true,
      }, 503);
    }

    const priceKey = `${plan}_${cycle}`;
    const priceId = PRICE_MAP[priceKey] || PRICE_MAP.solo_monthly;

    // Optional customer lookup if email provided
    let customerId: string | undefined;
    if (email) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;

        // Check if customer already has an active subscription
        const activeSubs = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1,
        });

        if (activeSubs.data.length > 0) {
          // Customer is already paying — redirect to Billing Portal instead
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/dashboard/settings?tab=subscription`,
          });
          return c.json({ portal_url: portalSession.url });
        }
      } else {
        const newCustomer = await stripe.customers.create({
          email,
          metadata: {
            supabase_user_id: user_id || '',
          },
        });
        customerId = newCustomer.id;
      }
    }

    // Create Subscription Checkout Session with Canadian Tax automation
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7, // 7-day Canadian solo practice free trial
        metadata: {
          plan,
          cycle,
          supabase_user_id: user_id || '',
        },
      },
      // Canadian automated tax calculation (GST/HST/QST based on province)
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: "required",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${origin}/subscribe`,
      metadata: {
        supabase_user_id: user_id || '',
        plan,
      },
    });

    return c.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return c.json({ error: error.message || "Failed to create checkout session" }, 500);
  }
}

export default app;
