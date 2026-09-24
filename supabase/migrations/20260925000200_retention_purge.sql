-- ============================================================
-- MentalPath — Record retention and purge
-- ============================================================
-- Ontario Colleges (CRPO, CPO, OCSWSSW) require clinical records to be kept
-- for 10 years after the last contact, or 10 years after the client's 18th
-- birthday, whichever is later. Invoices fall inside that window, which also
-- covers the CRA's 6-year rule. After that, records are destroyed.
--
-- private.purge_expired_records() runs nightly (pg_cron) and:
--   1. destroys every client whose retention date has passed, with all notes,
--      amendments, appointments, intake forms and invoices;
--   2. removes a closed account (deletion_requested_at set) once it holds no
--      client records, including its auth user and data key;
--   3. drops contact-form messages after 2 years, AI usage counters after
--      2 years, Stripe idempotency ids after 400 days and audit rows after
--      10 years.
-- Each run is recorded with counts only (no identifiers) in private.retention_runs.

-- Retention date for one client. SECURITY INVOKER: browser callers see only
-- their own clients through RLS; the purge job runs as the owner.
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
        (SELECT max(i.created_at)::date FROM public.invoices i WHERE i.client_id = c.id)
     ) + interval '10 years')::date,
    (c.date_of_birth + interval '28 years')::date
  )
  FROM public.clients c
  WHERE c.id = p_client
$$;
REVOKE ALL ON FUNCTION public.client_retention_until(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.client_retention_until(UUID) TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS private.retention_runs (
  id      BIGSERIAL PRIMARY KEY,
  ran_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  as_of   DATE NOT NULL,
  counts  JSONB NOT NULL
);

CREATE OR REPLACE FUNCTION private.purge_expired_records(p_as_of DATE DEFAULT current_date)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  n_clients INTEGER := 0;
  n_notes INTEGER := 0;
  n_accounts INTEGER := 0;
  n INTEGER;
  n_contact INTEGER;
  n_ai INTEGER;
  n_stripe INTEGER;
  n_audit INTEGER;
  result JSONB;
BEGIN
  PERFORM private.set_maintenance(true);

  -- 1. Clients past retention
  FOR r IN
    SELECT c.id FROM public.clients c
    WHERE public.client_retention_until(c.id) < p_as_of
    FOR UPDATE SKIP LOCKED
  LOOP
    DELETE FROM public.session_note_amendments
      WHERE note_id IN (SELECT id FROM public.session_notes WHERE client_id = r.id);
    DELETE FROM public.session_notes WHERE client_id = r.id;
    GET DIAGNOSTICS n = ROW_COUNT;
    n_notes := n_notes + n;
    DELETE FROM public.invoices WHERE client_id = r.id;
    DELETE FROM public.clients WHERE id = r.id;  -- cascades appointments, intake forms
    n_clients := n_clients + 1;
  END LOOP;

  -- 2. Closed accounts with nothing left to retain
  FOR r IN
    SELECT k.id FROM public.clinicians k
    WHERE k.deletion_requested_at IS NOT NULL
      AND k.deletion_requested_at < p_as_of - interval '30 days'
      AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.clinician_id = k.id)
  LOOP
    DELETE FROM public.session_note_amendments WHERE clinician_id = r.id;
    DELETE FROM public.session_notes WHERE clinician_id = r.id;
    DELETE FROM private.clinician_keys WHERE clinician_id = r.id;
    DELETE FROM auth.users WHERE id = r.id;  -- cascades clinicians → invoices, ai_usage, …
    n_accounts := n_accounts + 1;
  END LOOP;

  -- 3. Operational data
  DELETE FROM public.contact_messages WHERE created_at < p_as_of - interval '2 years';
  GET DIAGNOSTICS n_contact = ROW_COUNT;
  DELETE FROM public.ai_usage WHERE month < p_as_of - interval '2 years';
  GET DIAGNOSTICS n_ai = ROW_COUNT;
  DELETE FROM private.stripe_events WHERE received_at < p_as_of - interval '400 days';
  GET DIAGNOSTICS n_stripe = ROW_COUNT;
  DELETE FROM public.audit_log WHERE created_at < p_as_of - interval '10 years';
  GET DIAGNOSTICS n_audit = ROW_COUNT;

  PERFORM private.set_maintenance(false);

  result := jsonb_build_object(
    'clients', n_clients, 'session_notes', n_notes, 'closed_accounts', n_accounts,
    'contact_messages', n_contact, 'ai_usage', n_ai, 'stripe_events', n_stripe, 'audit_log', n_audit);
  INSERT INTO private.retention_runs (as_of, counts) VALUES (p_as_of, result);
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION private.purge_expired_records(DATE) FROM PUBLIC, anon, authenticated;

-- Nightly at 03:17 UTC where pg_cron is available (Supabase: enable it under
-- Database → Extensions). Elsewhere, schedule `SELECT private.purge_expired_records()`.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    PERFORM cron.schedule('mentalpath-retention-purge', '17 3 * * *',
                          'SELECT private.purge_expired_records()');
  ELSE
    RAISE NOTICE 'pg_cron not available; schedule private.purge_expired_records() externally';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not schedule retention purge: %', SQLERRM;
END $$;
