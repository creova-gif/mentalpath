-- ============================================================
-- MentalPath — Billing state, entitlements and AI usage
-- ============================================================
-- Audit P0-8 / §7: Stripe is the single source of truth for paid status. The
-- stripe-webhook Edge Function (service role) is the only writer of these
-- columns; browsers cannot write them (see 20260923_lock_clinician_billing_columns).
--
-- Plans (src/config/pricing.ts):
--   starter — free forever, 1 active client, no AI Assist
--   solo    — $49/mo CAD; new accounts get a 7-day no-card trial of Solo
--   group   — not yet sold (requires the practice/membership model)

ALTER TABLE public.clinicians
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT NOT NULL DEFAULT 'none'
    CHECK (subscription_status IN ('none','trialing','active','past_due','unpaid','canceled','incomplete','incomplete_expired','paused')),
  ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at              TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_updated_at     TIMESTAMPTZ;

-- Legacy rows used plan_type values solo/group/enterprise with no payment
-- record; keep the column but make its meaning "plan purchased".
ALTER TABLE public.clinicians ALTER COLUMN plan_type SET DEFAULT 'solo';
ALTER TABLE public.clinicians ALTER COLUMN price_per_seat SET DEFAULT 49;

-- ── Effective plan: what the clinician can use right now ────────────────────
CREATE OR REPLACE FUNCTION public.effective_plan(c public.clinicians)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN c.subscription_status IN ('active', 'trialing', 'past_due') THEN coalesce(c.plan_type, 'solo')
    WHEN c.is_trial AND c.trial_ends_at IS NOT NULL AND c.trial_ends_at > NOW() THEN 'solo'
    ELSE 'starter'
  END
$$;

CREATE OR REPLACE FUNCTION public.current_plan()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT public.effective_plan(c) FROM public.clinicians c WHERE c.id = auth.uid()), 'starter')
$$;
GRANT EXECUTE ON FUNCTION public.current_plan() TO authenticated;

-- ── Starter plan limit: one active client ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_client_plan_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan TEXT;
  active_count INTEGER;
BEGIN
  IF coalesce(NEW.status, 'active') <> 'active' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND coalesce(OLD.status, 'active') = 'active' THEN RETURN NEW; END IF;

  SELECT public.effective_plan(c) INTO plan FROM public.clinicians c WHERE c.id = NEW.clinician_id;
  IF coalesce(plan, 'starter') <> 'starter' THEN RETURN NEW; END IF;

  SELECT count(*) INTO active_count FROM public.clients
  WHERE clinician_id = NEW.clinician_id AND coalesce(status, 'active') = 'active' AND id <> NEW.id;
  IF active_count >= 1 THEN
    RAISE EXCEPTION 'The Starter plan includes 1 active client. Upgrade to Solo for unlimited clients.'
      USING ERRCODE = 'check_violation', HINT = 'PLAN_LIMIT';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_plan_limit ON public.clients;
CREATE TRIGGER enforce_client_plan_limit
  BEFORE INSERT OR UPDATE OF status ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.enforce_client_plan_limit();

-- ── Stripe webhook idempotency ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS private.stripe_events (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Called by the webhook with the service role. Returns FALSE if already seen.
CREATE OR REPLACE FUNCTION public.record_stripe_event(p_id TEXT, p_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO private.stripe_events (id, type) VALUES (p_id, p_type);
  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
  RETURN FALSE;
END;
$$;
REVOKE ALL ON FUNCTION public.record_stripe_event(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_stripe_event(TEXT, TEXT) TO service_role;

-- ── AI Assist usage (replaces the non-atomic KV counter) ─────────────────────
CREATE TABLE IF NOT EXISTS public.ai_usage (
  clinician_id UUID NOT NULL REFERENCES public.clinicians(id) ON DELETE CASCADE,
  month        DATE NOT NULL,
  used         INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0),
  PRIMARY KEY (clinician_id, month)
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_usage FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.ai_usage FROM authenticated;
DROP POLICY IF EXISTS "ai_usage_select_own" ON public.ai_usage;
CREATE POLICY "ai_usage_select_own" ON public.ai_usage FOR SELECT TO authenticated USING (clinician_id = auth.uid());

-- Atomically consume one AI assist if under the limit. Returns remaining after
-- consumption, or -1 if the limit was already reached. Service role only.
CREATE OR REPLACE FUNCTION public.consume_ai_assist(p_clinician UUID, p_limit INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m DATE := date_trunc('month', NOW())::date;
  new_used INTEGER;
BEGIN
  INSERT INTO public.ai_usage (clinician_id, month, used) VALUES (p_clinician, m, 0)
  ON CONFLICT DO NOTHING;
  UPDATE public.ai_usage SET used = used + 1
  WHERE clinician_id = p_clinician AND month = m AND used < p_limit
  RETURNING used INTO new_used;
  IF new_used IS NULL THEN RETURN -1; END IF;
  RETURN p_limit - new_used;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_assist(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_assist(UUID, INTEGER) TO service_role;

-- Give a refund if the model call fails after consumption.
CREATE OR REPLACE FUNCTION public.refund_ai_assist(p_clinician UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.ai_usage SET used = greatest(used - 1, 0)
  WHERE clinician_id = p_clinician AND month = date_trunc('month', NOW())::date;
$$;
REVOKE ALL ON FUNCTION public.refund_ai_assist(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_ai_assist(UUID) TO service_role;

-- Effective plan for a given clinician — for Edge Functions (service role).
CREATE OR REPLACE FUNCTION public.plan_for(p_clinician UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT public.effective_plan(c) FROM public.clinicians c WHERE c.id = p_clinician), 'none')
$$;
REVOKE ALL ON FUNCTION public.plan_for(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.plan_for(UUID) TO service_role;

-- Lets the webhook un-record an event whose processing failed, so Stripe's retry runs.
CREATE OR REPLACE FUNCTION public.forget_stripe_event(p_id TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM private.stripe_events WHERE id = p_id;
$$;
REVOKE ALL ON FUNCTION public.forget_stripe_event(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.forget_stripe_event(TEXT) TO service_role;
