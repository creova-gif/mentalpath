// MentalPath — AI Note Assist routes.
// Sends clinician-written note text (after identifier scrubbing) to Claude.
// Clinicians must opt in first (clinicians.ai_assist_enabled); every use is
// metered in Postgres and recorded in the audit log without note content.
import { Hono } from "npm:hono";
import Anthropic from "npm:@anthropic-ai/sdk";
import { requireUser, serviceClient } from "./auth.ts";
import { buildUserPrompt, SYSTEM_PROMPT, type NoteAssistInput } from "./ai-prompts.ts";

const app = new Hono();

// Monthly allowance by effective plan (see public.effective_plan()).
export const AI_ASSIST_LIMITS: Record<string, number> = {
  solo_trial: 20,
  solo: 500,
  group: 500,
};

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-5";

// deno-lint-ignore no-explicit-any
type Db = any;

async function planAndTrial(db: Db, userId: string): Promise<{ plan: string; trial: boolean; consent: boolean }> {
  const [{ data: plan }, { data: row }] = await Promise.all([
    db.rpc("plan_for", { p_clinician: userId }),
    db.from("clinicians").select("subscription_status, ai_assist_enabled").eq("id", userId).maybeSingle(),
  ]);
  const paid = ["active", "trialing", "past_due"].includes(row?.subscription_status);
  return { plan: plan ?? "none", trial: !paid, consent: row?.ai_assist_enabled === true };
}

function limitFor(plan: string, trial: boolean): number {
  if (plan === "starter" || plan === "none") return 0;
  return trial ? AI_ASSIST_LIMITS.solo_trial : (AI_ASSIST_LIMITS[plan] ?? 0);
}

// POST /make-server-4d1a502d/ai-note-assist
app.post("/make-server-4d1a502d/ai-note-assist", async (c) => {
  const auth = await requireUser(c);
  if (auth instanceof Response) return auth;
  const userId = auth.user.id;
  const db = serviceClient();

  const { plan, trial, consent } = await planAndTrial(db, userId);
  const limit = limitFor(plan, trial);
  if (limit === 0) {
    return c.json({ error: "AI Assist is included in the Solo plan.", code: "SUBSCRIPTION_REQUIRED" }, 403);
  }
  if (!consent) {
    return c.json({
      error: "Turn on AI Assist first. You'll be shown what is sent before it's enabled.",
      code: "AI_NOT_ENABLED",
    }, 403);
  }

  let body: NoteAssistInput & { session_id?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const requestId = typeof body.session_id === "string" && /^[0-9a-f-]{36}$/i.test(body.session_id)
    ? body.session_id : crypto.randomUUID();

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    return c.json({ error: "AI service configuration error" }, 500);
  }

  // Atomically reserve one assist; refunded below if the model call fails.
  const { data: remaining, error: meterError } = await db.rpc("consume_ai_assist", {
    p_clinician: userId, p_limit: limit,
  });
  if (meterError) {
    console.error("consume_ai_assist failed:", meterError.code);
    return c.json({ error: "AI Assist is temporarily unavailable." }, 503);
  }
  if (remaining < 0) {
    return c.json({
      error: trial ? "You've used all trial AI assists. Subscribe to Solo to continue." : "Monthly AI Assist limit reached.",
      code: "USAGE_LIMIT_REACHED", limit, remaining: 0,
    }, 429);
  }

  const { format, prompt } = buildUserPrompt(body);

  try {
    const client = new Anthropic({ apiKey });
    // Server-side fallbacks re-run a classifier-declined request on the model
    // Anthropic recommends for that refusal category, in the same call.
    // `fallbacks: "default"` is newer than the SDK's published types, hence the cast.
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    } as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming);

    if (response.stop_reason === "refusal") {
      await db.rpc("refund_ai_assist", { p_clinician: userId });
      return c.json({ error: "AI Assist couldn't draft this note. Please write it manually.", code: "REFUSED" }, 422);
    }

    const draft = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    if (!draft) {
      await db.rpc("refund_ai_assist", { p_clinician: userId });
      return c.json({ error: "AI Assist returned an empty draft. Please try again." }, 502);
    }

    await db.from("audit_log").insert({
      clinician_id: userId,
      action: "AI_ASSIST_USED",
      table_name: "session_notes",
      details: {
        note_format: format,
        model: response.model,
        input_tokens: response.usage?.input_tokens,
        output_tokens: response.usage?.output_tokens,
        stop_reason: response.stop_reason,
        request_id: requestId,
      },
    });

    return c.json({
      draft,
      format,
      model: response.model,
      disclaimer: "AI draft — review and edit before saving. Not a substitute for clinical judgment.",
      usage: { remaining, limit, used: limit - remaining },
    });
  } catch (error) {
    await db.rpc("refund_ai_assist", { p_clinician: userId });
    if (error instanceof Anthropic.RateLimitError) {
      return c.json({ error: "AI Assist is busy. Please try again in a minute." }, 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}`);
    } else {
      console.error("AI assist error:", (error as Error).message);
    }
    return c.json({ error: "AI Assist unavailable. Please write your note manually." }, 503);
  }
});

// GET /make-server-4d1a502d/ai-usage
app.get("/make-server-4d1a502d/ai-usage", async (c) => {
  const auth = await requireUser(c);
  if (auth instanceof Response) return auth;
  const db = serviceClient();
  const { plan, trial, consent } = await planAndTrial(db, auth.user.id);
  const limit = limitFor(plan, trial);
  const month = new Date().toISOString().slice(0, 7) + "-01";
  const { data } = await db.from("ai_usage").select("used").eq("clinician_id", auth.user.id).eq("month", month).maybeSingle();
  const used = data?.used ?? 0;
  return c.json({ limit, used, remaining: Math.max(0, limit - used), plan, enabled: consent });
});

export default app;
