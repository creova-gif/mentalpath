-- ============================================================
-- MentalPath — Account creation trigger + MFA enforcement
-- ============================================================
-- Audit P0-7 / A07 (docs/audits/2026-09-23-goal-audit.md).

-- ── 1. Create the clinicians row server-side on signup ───────────────────────
-- The browser passes profile fields as user metadata to supabase.auth.signUp().
-- Metadata is user-controlled, so every field is validated and bounded here, and
-- billing fields are always set by the server: a new account starts a 7-day
-- trial on the solo plan.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  INSERT INTO public.clinicians (
    id, first_name, last_name, profession, reg_number, city,
    session_rate, hst_exempt,
    plan_type, is_trial, trial_ends_at, plan_starts_at
  ) VALUES (
    NEW.id,
    left(coalesce(nullif(btrim(m->>'first_name'), ''), split_part(NEW.email, '@', 1), 'Clinician'), 100),
    left(coalesce(btrim(m->>'last_name'), ''), 100),
    CASE WHEN m->>'profession' IN (
      'psychotherapist','psychologist','social_worker','chiropractor','physiotherapist',
      'rmt','occupational_therapist','naturopath','acupuncturist','dietitian','slp'
    ) THEN m->>'profession' ELSE 'psychotherapist' END,
    left(nullif(btrim(m->>'reg_number'), ''), 50),
    left(nullif(btrim(m->>'city'), ''), 100),
    CASE WHEN (m->>'session_rate') ~ '^\d{1,5}(\.\d{1,2})?$'
      THEN (m->>'session_rate')::numeric ELSE 140 END,
    CASE WHEN m->>'hst_exempt' IN ('true','false')
      THEN (m->>'hst_exempt')::boolean ELSE TRUE END,
    'solo', TRUE, NOW() + INTERVAL '7 days', NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. Require MFA (AAL2) for all clinical data ──────────────────────────────
-- RESTRICTIVE policies are AND-ed with the existing owner policies, so a
-- session that has not completed a TOTP challenge cannot read or write PHI even
-- if the browser gate is bypassed. The clinicians profile row stays readable at
-- AAL1 so the app can load and route the user to MFA enrolment.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- For local development projects only:
--   INSERT INTO private.app_settings VALUES ('mfa_optional', 'true')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
CREATE OR REPLACE FUNCTION public.mfa_satisfied()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(auth.jwt()->>'aal', '') = 'aal2'
      OR coalesce((SELECT value FROM private.app_settings WHERE key = 'mfa_optional'), 'false') = 'true';
$$;

GRANT EXECUTE ON FUNCTION public.mfa_satisfied() TO authenticated;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','invoices','session_notes','appointments','intake_forms','audit_log']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "require_mfa" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "require_mfa" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated '
      'USING (public.mfa_satisfied()) WITH CHECK (public.mfa_satisfied())', t);
  END LOOP;
END $$;
