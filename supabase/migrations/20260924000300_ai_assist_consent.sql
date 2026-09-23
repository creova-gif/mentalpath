-- ============================================================
-- MentalPath — Explicit clinician opt-in for AI Note Assist
-- ============================================================
-- AI Note Assist sends clinician-written session text to a US-based model
-- provider. It is off by default and must be switched on by the clinician after
-- reading what is sent (audit P0-6). The edge function refuses requests from
-- clinicians who have not opted in.
ALTER TABLE public.clinicians
  ADD COLUMN IF NOT EXISTS ai_assist_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_assist_consented_at TIMESTAMPTZ;

GRANT UPDATE (ai_assist_enabled) ON public.clinicians TO authenticated;

CREATE OR REPLACE FUNCTION public.clinicians_ai_consent_stamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ai_assist_enabled AND NOT coalesce(OLD.ai_assist_enabled, FALSE) THEN
    NEW.ai_assist_consented_at := NOW();
  ELSIF NOT NEW.ai_assist_enabled THEN
    NEW.ai_assist_consented_at := NULL;
  ELSE
    NEW.ai_assist_consented_at := OLD.ai_assist_consented_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clinicians_ai_consent_stamp ON public.clinicians;
CREATE TRIGGER clinicians_ai_consent_stamp
  BEFORE UPDATE ON public.clinicians
  FOR EACH ROW EXECUTE FUNCTION public.clinicians_ai_consent_stamp();
