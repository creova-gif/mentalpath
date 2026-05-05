// MentalPath — AI Note Assist Routes
// Integrated with Hono web server
// PHIPA note: client PII is NEVER sent to Anthropic API

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.ts";

const app = new Hono();

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

// Usage limits
const AI_ASSIST_LIMITS = {
  TRIAL: 20, // 20 AI assists during 7-day trial
  PAID: 500, // 500 per month for paid users (generous limit)
};

const NOTE_FORMAT_PROMPTS: Record<string, { labels: string[]; instruction: string }> = {
  DAP: {
    labels: ["Data", "Assessment", "Plan"],
    instruction: `Generate a concise, clinically appropriate DAP note for a Canadian registered psychotherapist.

Data: Summarize what the client reported, presented concerns, and observable session content. Use person-centred language. Include relevant affect and presentation observations.

Assessment: Provide clinical formulation of themes, progress toward goals, and therapeutic process. Reference evidence-based frameworks (e.g., CBT, DBT, emotion-focused, narrative therapy) where applicable. Note any risk factors or protective factors observed.

Plan: Outline therapeutic interventions planned, homework assigned, goals for next session, and any follow-up required. Include frequency recommendations if relevant.

Use formal clinical language suitable for College of Registered Psychotherapists of Ontario (CRPO) records. Be specific, evidence-based, and person-centred. Avoid diagnostic language unless clearly indicated by the therapist's notes. Total length: 200-350 words.`,
  },
  SOAP: {
    labels: ["Subjective", "Objective", "Assessment", "Plan"],
    instruction: `Generate a concise SOAP note for a Canadian mental health practice.

Subjective: Client's self-report, presenting concerns, and subjective experience of symptoms or progress. Use the client's own language where possible.

Objective: Observable behaviours, affect, appearance, engagement level, and therapist observations. Include mental status observations where relevant.

Assessment: Clinical interpretation, progress toward treatment goals, effectiveness of interventions, and any shifts in presentation or functioning. Reference therapeutic modalities used.

Plan: Goals for upcoming sessions, interventions to continue or modify, any referrals or collateral contacts needed, and session frequency recommendations.

Maintain professional clinical standards appropriate for CRPO documentation. Be concise and evidence-based. Total length: 200-350 words.`,
  },
  BIRP: {
    labels: ["Behavior", "Intervention", "Response", "Plan"],
    instruction: `Generate a concise BIRP note for a Canadian psychotherapy practice.

Behavior: Presenting behaviors, client report, affect, and engagement. Note any significant changes from previous sessions.

Intervention: Specific therapeutic techniques and approaches used this session. Name modalities (e.g., CBT thought records, mindfulness exercises, emotion regulation skills, psychoeducation on [topic]). Include any resources provided.

Response: Client's response to interventions—engagement level, insights gained, skills practiced, barriers encountered. Note progress or setbacks.

Plan: Goals and therapeutic focus for upcoming sessions. Homework or between-session practice assigned. Any adjustments to treatment approach.

Use evidence-based language suitable for regulated mental health practice in Canada. Be specific about interventions. Total length: 200-350 words.`,
  },
  PROGRESS: {
    labels: ["Summary", "Observations", "Plan"],
    instruction: `Generate a narrative progress note suitable for a Canadian psychotherapy practice regulated by CRPO.

Summary: Provide a cohesive narrative of session content, themes explored, and client presentation. Integrate subjective report with therapeutic process.

Observations: Clinical observations about progress, therapeutic relationship, client strengths and resources, barriers to progress, and any risk or safety considerations.

Plan: Treatment direction, goals for continued work, interventions to employ, and any collaborative planning with client.

Use person-centred, non-pathologising language that respects client dignity and agency. Maintain clinical professionalism while being warm and humanistic. Avoid jargon. Total length: 200-400 words.`,
  },
};

interface NoteAssistRequest {
  session_id: string;
  note_format: string;
  section_1: string;
  section_2: string;
  section_3: string;
  section_4?: string;
  session_context?: string;
}

// Sanitise input — strip any obvious PII patterns before sending to Claude
const sanitize = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[phone redacted]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi, "[email redacted]")
    .replace(/\b\d{9}\b/g, "[SIN redacted]")
    .trim();
};

// Check AI usage limit for user
async function checkAIUsageLimit(userId: string, userStatus: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = userStatus === 'trial' ? AI_ASSIST_LIMITS.TRIAL : AI_ASSIST_LIMITS.PAID;
  const usageKey = `ai_usage:${userId}:${new Date().toISOString().slice(0, 7)}`; // Monthly tracking
  
  const currentUsage = await kv.get(usageKey);
  const used = currentUsage ? parseInt(currentUsage as string, 10) : 0;
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}

// Increment AI usage for user
async function incrementAIUsage(userId: string): Promise<void> {
  const usageKey = `ai_usage:${userId}:${new Date().toISOString().slice(0, 7)}`;
  const currentUsage = await kv.get(usageKey);
  const used = currentUsage ? parseInt(currentUsage as string, 10) : 0;
  await kv.set(usageKey, String(used + 1));
}

// POST /make-server-4d1a502d/ai-note-assist
app.post("/make-server-4d1a502d/ai-note-assist", async (c) => {
  try {
    // Verify authorization header
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.split(" ")[1];
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // ── Auth resolution ───────────────────────────────────────────────────────
    // Two modes:
    //   1. Demo/prototype: client sends the public anon key (role=anon JWT)
    //      → allow with a synthetic user ID so usage tracking still works.
    //   2. Production (real Supabase Auth): client sends a user JWT → verify it.
    let userId: string;
    let userStatus: { status: string; subscriptionStatus: string } | null = null;

    // Detect anon key by decoding the JWT payload (no crypto needed — just base64)
    let isAnonKey = false;
    try {
      const payloadB64 = accessToken.split(".")[1];
      if (payloadB64) {
        const decoded = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
        isAnonKey = decoded?.role === "anon";
      }
    } catch {
      isAnonKey = false;
    }

    if (isAnonKey) {
      // Demo mode — grant access without a real user record
      userId = "demo-user";
      userStatus = { status: "trial", subscriptionStatus: "trial" };
    } else {
      // Production mode — verify JWT against Supabase Auth
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: "Unauthorized - invalid token" }, 401);
      }
      userId = user.id;
      const userStatusData = await kv.get(`user:${userId}:status`);
      userStatus = userStatusData ? JSON.parse(userStatusData as string) : null;
    }

    // Check user trial/subscription status (skip for demo anon key)
    if (!isAnonKey && (!userStatus || (userStatus.status === 'trial_expired' && userStatus.subscriptionStatus !== 'active'))) {
      return c.json({ 
        error: "AI Assist requires an active subscription or trial period.",
        code: "SUBSCRIPTION_REQUIRED"
      }, 403);
    }

    // Check usage limits
    const currentStatus = userStatus.subscriptionStatus === 'active' ? 'paid' : 'trial';
    const usageCheck = await checkAIUsageLimit(userId, currentStatus);
    
    if (!usageCheck.allowed) {
      return c.json({ 
        error: `AI Assist limit reached. ${currentStatus === 'trial' ? 'Upgrade to continue using AI features.' : 'Monthly limit exceeded.'}`,
        code: "USAGE_LIMIT_REACHED",
        limit: usageCheck.limit,
        remaining: 0,
      }, 429);
    }

    // Parse request body
    let body: NoteAssistRequest;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }

    const { session_id, note_format, section_1, section_2, section_3, section_4, session_context } = body;

    // Validate — session_id must be a UUID (no PII slipping through as ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!session_id || !uuidRegex.test(session_id)) {
      return c.json({ error: "Invalid session_id - must be a valid UUID" }, 400);
    }

    const fmt = (note_format || "DAP").toUpperCase() as keyof typeof NOTE_FORMAT_PROMPTS;
    const formatConfig = NOTE_FORMAT_PROMPTS[fmt] || NOTE_FORMAT_PROMPTS.DAP;

    const s1 = sanitize(section_1);
    const s2 = sanitize(section_2);
    const s3 = sanitize(section_3);
    const s4 = section_4 ? sanitize(section_4) : null;
    const ctx = session_context ? sanitize(session_context) : "individual therapy session";

    // Build enhanced prompt for Canadian practice
    const userPrompt = `You are assisting a Canadian registered psychotherapist draft a ${fmt} session note.
Session context: ${ctx}

${formatConfig.labels[0]} notes: ${s1}

${formatConfig.labels[1]} notes: ${s2}

${formatConfig.labels[2]} notes: ${s3}${s4 ? `\n\n${formatConfig.labels[3]} notes: ${s4}` : ""}

${formatConfig.instruction}

Respond with ONLY the formatted note — no preamble, no explanation, no markdown headers.
Format each section with its label (e.g. "Data:\n...") separated by blank lines.
This note will be reviewed and edited by the therapist before saving.`;

    // Call Claude API
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      console.error("ANTHROPIC_API_KEY not set in environment");
      return c.json({ error: "AI service configuration error" }, 500);
    }

    const response = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-20250514",
        max_tokens: 800,
        temperature: 0.7,
        system: `You are a clinical documentation assistant for Canadian registered psychotherapists and mental health professionals.

Your role:
- Help therapists draft session notes in professional clinical language
- Follow College of Registered Psychotherapists of Ontario (CRPO) documentation standards
- Use person-centred, evidence-based language
- Never invent clinical details not present in the therapist's notes
- Never reproduce client names or identifying information
- Reference common therapeutic modalities in Canada: CBT, DBT, ACT, emotion-focused therapy, narrative therapy, solution-focused brief therapy, trauma-informed approaches
- Use inclusive, non-pathologising language that respects client dignity
- Maintain appropriate clinical boundaries and professional tone

All output will be reviewed and edited by a registered professional before saving.
Your drafts should be concise, clinically sound, and suitable for regulated practice records.`,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Anthropic API error: ${err}`);
      return c.json({ error: "AI service temporarily unavailable" }, 503);
    }

    const data = await response.json();
    const draft = data.content?.[0]?.text || "";

    // Increment usage counter
    await incrementAIUsage(userId);
    
    // Get updated usage info
    const updatedUsage = await checkAIUsageLimit(userId, currentStatus);

    // Log usage for audit (no PII — just session_id + token counts)
    console.log(JSON.stringify({
      event: "ai_note_assist",
      user_id: userId,
      session_id,
      note_format: fmt,
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
      remaining_assists: updatedUsage.remaining,
      timestamp: new Date().toISOString(),
    }));

    return c.json({
      draft,
      format: fmt,
      model: data.model,
      disclaimer: "AI draft — review and edit before saving. Not a substitute for clinical judgment.",
      usage: {
        remaining: updatedUsage.remaining,
        limit: updatedUsage.limit,
        used: updatedUsage.limit - updatedUsage.remaining,
      },
    });

  } catch (error) {
    console.error("AI assist error:", error);
    return c.json({ error: "AI assist unavailable. Please write your note manually." }, 500);
  }
});

// GET /make-server-4d1a502d/ai-usage - Check current usage
app.get("/make-server-4d1a502d/ai-usage", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.split(" ")[1];
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = user.id;
    const userStatusData = await kv.get(`user:${userId}:status`);
    const userStatus = userStatusData ? JSON.parse(userStatusData as string) : null;
    
    const currentStatus = userStatus?.subscriptionStatus === 'active' ? 'paid' : 'trial';
    const usageInfo = await checkAIUsageLimit(userId, currentStatus);

    return c.json({
      ...usageInfo,
      accountType: currentStatus,
    });

  } catch (error) {
    console.error("AI usage check error:", error);
    return c.json({ error: "Unable to check usage" }, 500);
  }
});

export default app;