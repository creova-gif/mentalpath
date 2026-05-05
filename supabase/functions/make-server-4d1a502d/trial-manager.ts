import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.ts";

const app = new Hono();

const TRIAL_DURATION_DAYS = 7;

interface TrialData {
  userId: string;
  email: string;
  startDate: string;
  endDate: string;
  planType?: 'solo' | 'group';
  status: 'active' | 'expired' | 'upgraded';
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionData {
  userId: string;
  email: string;
  planType: 'solo' | 'group';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due';
  startDate: string;
  updatedAt: string;
}

// ─── Auth helper ────────────────────────────────────────────────────────────
// Returns the authenticated user or sends a 401 response.
// Callers MUST return immediately if this returns a Response.
async function requireAuth(c: any): Promise<{ user: any } | Response> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return { user };
}

// Start a new trial
app.post("/make-server-4d1a502d/trial/start", async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    // Use the authenticated user's id and email — never trust the request body for these
    const userId = user.id;
    const email = user.email ?? "";

    // Check if trial already exists
    const existingTrial = await kv.get<TrialData>(`trial:${userId}`);
    if (existingTrial) {
      return c.json({
        error: "Trial already exists for this user",
        trial: existingTrial
      }, 409);
    }

    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const trialData: TrialData = {
      userId,
      email,
      startDate,
      endDate,
      status: 'active',
      createdAt: startDate,
      updatedAt: startDate,
    };

    await kv.set(`trial:${userId}`, trialData);

    console.log(`Trial started for user ${userId}`);

    return c.json({
      success: true,
      trial: trialData,
      message: "7-day free trial started successfully"
    });
  } catch (error) {
    console.error("Error starting trial:", error);
    return c.json({ error: "Failed to start trial" }, 500);
  }
});

// Get trial status
app.get("/make-server-4d1a502d/trial/:userId", async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    // Enforce that a user can only read their own trial
    const requestedUserId = c.req.param("userId");
    if (requestedUserId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const userId = user.id;

    // Check for active subscription first
    const subscription = await kv.get<SubscriptionData>(`subscription:${userId}`);
    if (subscription && subscription.status === 'active') {
      return c.json({
        hasActivePlan: true,
        planType: subscription.planType,
        subscription,
        trial: null,
      });
    }

    // Get trial data
    const trial = await kv.get<TrialData>(`trial:${userId}`);

    if (!trial) {
      return c.json({
        hasActivePlan: false,
        trial: null,
        message: "No trial found for this user"
      });
    }

    // Calculate trial status
    const now = new Date();
    const endDate = new Date(trial.endDate);
    const timeRemaining = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
    const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));
    const isExpired = timeRemaining <= 0;

    // Update status if expired
    if (isExpired && trial.status === 'active') {
      trial.status = 'expired';
      trial.updatedAt = now.toISOString();
      await kv.set(`trial:${userId}`, trial);
    }

    return c.json({
      hasActivePlan: false,
      trial: {
        ...trial,
        daysRemaining,
        hoursRemaining,
        isExpired,
        isActive: !isExpired,
      },
    });
  } catch (error) {
    console.error("Error getting trial status:", error);
    return c.json({ error: "Failed to get trial status" }, 500);
  }
});

// Activate subscription (upgrade from trial)
app.post("/make-server-4d1a502d/trial/upgrade", async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const body = await c.req.json();
    const { planType, stripeCustomerId, stripeSubscriptionId } = body;

    if (!planType) {
      return c.json({ error: "planType is required" }, 400);
    }

    if (planType !== 'solo' && planType !== 'group') {
      return c.json({ error: "planType must be 'solo' or 'group'" }, 400);
    }

    const userId = user.id;
    const email = user.email ?? "";

    const now = new Date();
    const subscriptionData: SubscriptionData = {
      userId,
      email,
      planType,
      stripeCustomerId,
      stripeSubscriptionId,
      status: 'active',
      startDate: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await kv.set(`subscription:${userId}`, subscriptionData);

    // Update trial status to upgraded
    const trial = await kv.get<TrialData>(`trial:${userId}`);
    if (trial) {
      trial.status = 'upgraded';
      trial.planType = planType;
      trial.updatedAt = now.toISOString();
      await kv.set(`trial:${userId}`, trial);
    }

    console.log(`User ${userId} upgraded to ${planType} plan`);

    return c.json({
      success: true,
      subscription: subscriptionData,
      message: `Successfully upgraded to ${planType} plan`
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return c.json({ error: "Failed to upgrade subscription" }, 500);
  }
});

// Cancel subscription
app.post("/make-server-4d1a502d/subscription/cancel", async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const userId = user.id;

    const subscription = await kv.get<SubscriptionData>(`subscription:${userId}`);

    if (!subscription) {
      return c.json({ error: "No subscription found for this user" }, 404);
    }

    subscription.status = 'canceled';
    subscription.updatedAt = new Date().toISOString();
    await kv.set(`subscription:${userId}`, subscription);

    console.log(`Subscription canceled for user ${userId}`);

    return c.json({
      success: true,
      subscription,
      message: "Subscription canceled successfully"
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return c.json({ error: "Failed to cancel subscription" }, 500);
  }
});

// Get subscription status
app.get("/make-server-4d1a502d/subscription/:userId", async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    // Enforce that a user can only read their own subscription
    const requestedUserId = c.req.param("userId");
    if (requestedUserId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const userId = user.id;

    const subscription = await kv.get<SubscriptionData>(`subscription:${userId}`);

    if (!subscription) {
      return c.json({
        hasActiveSubscription: false,
        subscription: null,
        message: "No subscription found for this user"
      });
    }

    return c.json({
      hasActiveSubscription: subscription.status === 'active',
      subscription,
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return c.json({ error: "Failed to get subscription status" }, 500);
  }
});

export default app;
