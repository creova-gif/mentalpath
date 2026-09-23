-- ============================================================
-- MentalPath — Lock billing / entitlement columns on clinicians
-- ============================================================
-- Audit P0-1 (docs/audits/2026-09-23-goal-audit.md §9 A01):
-- The RLS policies "clinicians_update_own" / "clinicians_insert_own" allow a
-- signed-in user to write ANY column of their own row through PostgREST,
-- including plan_type, is_trial, trial_ends_at and price_per_seat — i.e. to
-- grant themselves a paid plan or an endless trial.
--
-- RLS decides WHICH ROWS a user may touch; column privileges decide WHICH
-- COLUMNS. We keep the row policies and narrow the column privileges so that
-- browser clients can only write profile fields. Billing fields remain
-- writable by service_role (edge functions / Stripe webhook) only.

-- Profile-only UPDATE for end users
REVOKE UPDATE ON public.clinicians FROM anon, authenticated;
GRANT UPDATE (
  first_name,
  last_name,
  profession,
  reg_number,
  city,
  session_rate,
  hst_exempt
) ON public.clinicians TO authenticated;

-- Profile-only INSERT for end users (billing columns fall back to defaults)
REVOKE INSERT ON public.clinicians FROM anon, authenticated;
GRANT INSERT (
  id,
  first_name,
  last_name,
  profession,
  reg_number,
  city,
  session_rate,
  hst_exempt
) ON public.clinicians TO authenticated;

-- Anonymous callers never need to read or delete clinician rows
REVOKE SELECT, DELETE ON public.clinicians FROM anon;

-- The KV store holds every user's trial, subscription, AI-usage and invoice
-- JSON and is only ever accessed with the service role from edge functions.
-- Make sure it is unreachable from browser keys regardless of prior setup.
DO $$
BEGIN
  IF to_regclass('public.kv_store_4d1a502d') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.kv_store_4d1a502d ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON public.kv_store_4d1a502d FROM anon, authenticated';
  END IF;
END $$;
