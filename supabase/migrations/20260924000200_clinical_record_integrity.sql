-- ============================================================
-- MentalPath — Clinical record integrity & server-side audit
-- ============================================================
-- Audit findings A01 (mutable locked notes, client-authored audit log),
-- A04 (reversible client-side "encryption") — see
-- docs/audits/2026-09-23-goal-audit.md and docs/adr/0001-session-note-storage.md.

-- ── 1. Storage format marker ─────────────────────────────────────────────────
-- enc_version 1 = legacy rows written by the retired browser-side AES scheme
-- (key derived from the user id). The app can still read them; new writes are
-- stored as plain text protected by RLS, MFA, column privileges and Supabase
-- encryption at rest (ADR 0001).
ALTER TABLE public.session_notes
  ADD COLUMN IF NOT EXISTS enc_version SMALLINT NOT NULL DEFAULT 0;

UPDATE public.session_notes
SET enc_version = 1
WHERE enc_version = 0
  AND (section_1 IS NOT NULL OR section_2 IS NOT NULL OR section_3 IS NOT NULL OR section_4 IS NOT NULL);

-- New notes must belong to a client (older orphaned drafts are grandfathered).
DO $$ BEGIN
  ALTER TABLE public.session_notes
    ADD CONSTRAINT session_notes_client_required CHECK (client_id IS NOT NULL) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_session_notes_clinician_client_date
  ON public.session_notes (clinician_id, client_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_clinician_time
  ON public.appointments (clinician_id, scheduled_at);

-- ── 2. Locked notes are immutable; lock metadata is server-set ──────────────
CREATE OR REPLACE FUNCTION public.session_notes_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_locked THEN
      RAISE EXCEPTION 'Locked session notes cannot be deleted'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_locked THEN
    RAISE EXCEPTION 'Locked session notes cannot be modified; add an amendment instead'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.session_number IS NULL AND NEW.client_id IS NOT NULL THEN
      SELECT count(*) + 1 INTO NEW.session_number
      FROM public.session_notes WHERE client_id = NEW.client_id;
    END IF;
    NEW.locked_at := NULL;
  END IF;

  IF NEW.is_locked THEN
    NEW.locked_at := NOW();
    NEW.is_draft := FALSE;
  ELSE
    NEW.locked_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS session_notes_before_write ON public.session_notes;
CREATE TRIGGER session_notes_before_write
  BEFORE INSERT OR UPDATE OR DELETE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.session_notes_before_write();

-- ── 3. Amendments (append-only) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_note_amendments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id      UUID NOT NULL REFERENCES public.session_notes(id) ON DELETE RESTRICT,
  clinician_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.clinicians(id) ON DELETE RESTRICT,
  body         TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 20000),
  reason       TEXT CHECK (char_length(reason) <= 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_amendments_note ON public.session_note_amendments (note_id, created_at);

ALTER TABLE public.session_note_amendments ENABLE ROW LEVEL SECURITY;
REVOKE UPDATE, DELETE, TRUNCATE ON public.session_note_amendments FROM anon, authenticated;
REVOKE ALL ON public.session_note_amendments FROM anon;

DROP POLICY IF EXISTS "amendments_select_own" ON public.session_note_amendments;
CREATE POLICY "amendments_select_own" ON public.session_note_amendments
  FOR SELECT TO authenticated USING (clinician_id = auth.uid());

DROP POLICY IF EXISTS "amendments_insert_own_locked" ON public.session_note_amendments;
CREATE POLICY "amendments_insert_own_locked" ON public.session_note_amendments
  FOR INSERT TO authenticated WITH CHECK (
    clinician_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.session_notes n
      WHERE n.id = note_id AND n.clinician_id = auth.uid() AND n.is_locked
    )
  );

DROP POLICY IF EXISTS "require_mfa" ON public.session_note_amendments;
CREATE POLICY "require_mfa" ON public.session_note_amendments AS RESTRICTIVE
  FOR ALL TO authenticated USING (public.mfa_satisfied()) WITH CHECK (public.mfa_satisfied());

-- ── 4. Server-side audit log ─────────────────────────────────────────────────
-- Browsers can no longer write the audit log: every change to clinical tables is
-- recorded by trigger, and note content reads go through get_session_note().
-- Only column NAMES are recorded, never values (the log must not become a
-- second copy of PHI).
DROP POLICY IF EXISTS "therapists_insert_audit_log" ON public.audit_log;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_log FROM anon, authenticated;
REVOKE ALL ON public.audit_log FROM anon;

CREATE OR REPLACE FUNCTION public.write_audit(
  p_action TEXT, p_table TEXT, p_record UUID, p_clinician UUID, p_details JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hdrs JSONB := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
BEGIN
  INSERT INTO public.audit_log (clinician_id, action, table_name, record_id, details, ip_address)
  VALUES (
    p_clinician,
    p_action,
    p_table,
    p_record,
    coalesce(p_details, '{}'::jsonb) || jsonb_build_object('actor', auth.uid()),
    left(split_part(coalesce(hdrs->>'x-forwarded-for', hdrs->>'x-real-ip', ''), ',', 1), 64)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.write_audit(TEXT, TEXT, UUID, UUID, JSONB) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_j JSONB := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END;
  new_j JSONB := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END;
  row_j JSONB := coalesce(new_j, old_j);
  owner UUID;
  changed TEXT[];
  action TEXT := TG_OP;
BEGIN
  owner := nullif(row_j->>'clinician_id', '')::uuid;
  IF owner IS NULL AND TG_TABLE_NAME = 'intake_forms' THEN
    SELECT clinician_id INTO owner FROM public.clients WHERE id = (row_j->>'client_id')::uuid;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(k ORDER BY k) INTO changed
    FROM jsonb_object_keys(new_j) AS k
    WHERE k NOT IN ('updated_at') AND new_j->k IS DISTINCT FROM old_j->k;
    IF changed IS NULL THEN RETURN NEW; END IF;
    IF TG_TABLE_NAME = 'session_notes' AND (new_j->>'is_locked')::boolean AND NOT (old_j->>'is_locked')::boolean THEN
      action := 'NOTE_LOCKED';
    END IF;
  END IF;

  PERFORM public.write_audit(
    action, TG_TABLE_NAME, nullif(row_j->>'id', '')::uuid, owner,
    CASE WHEN changed IS NOT NULL THEN jsonb_build_object('changed_columns', to_jsonb(changed)) END
  );
  RETURN coalesce(NEW, OLD);
END;
$$;
REVOKE ALL ON FUNCTION public.audit_row_change() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','invoices','session_notes','appointments','intake_forms','session_note_amendments']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_row_change ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER audit_row_change AFTER INSERT OR UPDATE OR DELETE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.audit_row_change()', t);
  END LOOP;
END $$;

-- ── 5. Note content is readable only through an audited function ────────────
-- Browser roles may list note metadata directly, but the clinical text columns
-- are only returned by get_session_note(), which records NOTE_ACCESSED.
REVOKE SELECT ON public.session_notes FROM anon, authenticated;
GRANT SELECT (
  id, clinician_id, client_id, session_date, session_type, duration_minutes,
  note_format, ai_used, is_draft, is_locked, locked_at, session_number,
  enc_version, created_at, updated_at
) ON public.session_notes TO authenticated;

CREATE OR REPLACE FUNCTION public.get_session_note(p_note_id UUID)
RETURNS TABLE (
  id UUID, client_id UUID, session_date DATE, session_type TEXT, duration_minutes INTEGER,
  note_format TEXT, section_1 TEXT, section_2 TEXT, section_3 TEXT, section_4 TEXT,
  ai_used BOOLEAN, is_draft BOOLEAN, is_locked BOOLEAN, locked_at TIMESTAMPTZ,
  session_number INTEGER, enc_version SMALLINT, updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN QUERY
    SELECT n.id, n.client_id, n.session_date, n.session_type, n.duration_minutes,
           n.note_format, n.section_1, n.section_2, n.section_3, n.section_4,
           n.ai_used, n.is_draft, n.is_locked, n.locked_at,
           n.session_number, n.enc_version, n.updated_at
    FROM public.session_notes n
    WHERE n.id = p_note_id AND n.clinician_id = auth.uid();

  IF FOUND THEN
    PERFORM public.write_audit('NOTE_ACCESSED', 'session_notes', p_note_id, auth.uid(), NULL);
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.get_session_note(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_session_note(UUID) TO authenticated;
