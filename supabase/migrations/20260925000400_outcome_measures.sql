-- ============================================================
-- MentalPath — Standardised outcome measures (PHQ-9, GAD-7)
-- ============================================================
-- Item responses are entered by the clinician; totals, severity bands and the
-- PHQ-9 item-9 safety flag are computed by the database so every screen and
-- export agrees. Both instruments are free to use without permission
-- (Pfizer; Kroenke, Spitzer & Williams).

CREATE TABLE IF NOT EXISTS public.outcome_measures (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id   UUID NOT NULL DEFAULT auth.uid() REFERENCES public.clinicians(id) ON DELETE CASCADE,
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  instrument     TEXT NOT NULL CHECK (instrument IN ('PHQ-9', 'GAD-7')),
  administered_on DATE NOT NULL DEFAULT current_date,
  item_scores    SMALLINT[] NOT NULL,
  total_score    SMALLINT NOT NULL,
  severity       TEXT NOT NULL,
  risk_flag      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_measures_date_valid CHECK (administered_on BETWEEN DATE '2000-01-01' AND current_date + 1)
);
CREATE INDEX IF NOT EXISTS idx_outcome_measures_client
  ON public.outcome_measures (clinician_id, client_id, instrument, administered_on DESC);

CREATE OR REPLACE FUNCTION public.outcome_measures_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  expected INTEGER := CASE NEW.instrument WHEN 'PHQ-9' THEN 9 WHEN 'GAD-7' THEN 7 END;
  total INTEGER;
BEGIN
  IF coalesce(array_length(NEW.item_scores, 1), 0) <> expected
     OR EXISTS (SELECT 1 FROM unnest(NEW.item_scores) s WHERE s IS NULL OR s NOT BETWEEN 0 AND 3) THEN
    RAISE EXCEPTION '% needs % answers scored 0–3', NEW.instrument, expected USING ERRCODE = 'check_violation';
  END IF;
  SELECT sum(s) INTO total FROM unnest(NEW.item_scores) s;
  NEW.total_score := total;
  NEW.severity := CASE
    WHEN total <= 4 THEN 'minimal'
    WHEN total <= 9 THEN 'mild'
    WHEN total <= 14 THEN 'moderate'
    WHEN NEW.instrument = 'PHQ-9' AND total <= 19 THEN 'moderately severe'
    ELSE 'severe' END;
  NEW.risk_flag := NEW.instrument = 'PHQ-9' AND NEW.item_scores[9] > 0;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS outcome_measures_score ON public.outcome_measures;
CREATE TRIGGER outcome_measures_score BEFORE INSERT OR UPDATE ON public.outcome_measures
  FOR EACH ROW EXECUTE FUNCTION public.outcome_measures_score();

ALTER TABLE public.outcome_measures ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.outcome_measures FROM anon;
-- Scores are a clinical record: insert and delete only, no silent edits.
REVOKE UPDATE, TRUNCATE ON public.outcome_measures FROM authenticated;
DROP POLICY IF EXISTS outcome_measures_own ON public.outcome_measures;
CREATE POLICY outcome_measures_own ON public.outcome_measures FOR ALL TO authenticated
  USING (clinician_id = auth.uid()) WITH CHECK (clinician_id = auth.uid());
DROP POLICY IF EXISTS "require_mfa" ON public.outcome_measures;
CREATE POLICY "require_mfa" ON public.outcome_measures AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.mfa_satisfied()) WITH CHECK (public.mfa_satisfied());

DROP TRIGGER IF EXISTS enforce_same_owner_client ON public.outcome_measures;
CREATE TRIGGER enforce_same_owner_client BEFORE INSERT OR UPDATE OF client_id, clinician_id ON public.outcome_measures
  FOR EACH ROW EXECUTE FUNCTION public.enforce_same_owner_client();
DROP TRIGGER IF EXISTS audit_row_change ON public.outcome_measures;
CREATE TRIGGER audit_row_change AFTER INSERT OR UPDATE OR DELETE ON public.outcome_measures
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- A completed measure is client contact for retention purposes.
CREATE OR REPLACE FUNCTION public.client_retention_until(p_client UUID)
RETURNS DATE
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT greatest(
    (greatest(
        c.created_at::date,
        (SELECT max(n.session_date) FROM public.session_notes n WHERE n.client_id = c.id),
        (SELECT max(a.scheduled_at)::date FROM public.appointments a
          WHERE a.client_id = c.id AND a.scheduled_at <= now()),
        (SELECT max(i.created_at)::date FROM public.invoices i WHERE i.client_id = c.id),
        (SELECT max(m.administered_on) FROM public.outcome_measures m WHERE m.client_id = c.id)
     ) + interval '10 years')::date,
    (c.date_of_birth + interval '28 years')::date
  )
  FROM public.clients c
  WHERE c.id = p_client
$$;
