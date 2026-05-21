-- ============================================================
-- MentalPath — Session Notes and Auditing Migration
-- ============================================================

DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['clients', 'invoices', 'session_notes', 'appointments', 'audit_log'])
  LOOP
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name=t AND column_name='therapist_id') THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN therapist_id TO clinician_id;', t);
    END IF;
  END LOOP;
END $$;

-- ── 1. Session Notes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id UUID REFERENCES clinicians(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
  session_date DATE NOT NULL,
  session_type TEXT DEFAULT 'individual',
  duration_minutes INTEGER DEFAULT 50,
  note_format TEXT NOT NULL, 
  section_1 TEXT, -- Encrypted Data
  section_2 TEXT, -- Encrypted Data
  section_3 TEXT, -- Encrypted Data
  section_4 TEXT, -- Encrypted Data
  ai_summary TEXT, 
  ai_used BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  session_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapists_own_notes" ON session_notes;
CREATE POLICY "therapists_own_notes" ON session_notes
  FOR ALL USING (clinician_id = auth.uid());

-- Trigger for auto-update updated_at
CREATE OR REPLACE TRIGGER set_session_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. Appointments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id UUID REFERENCES clinicians(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  session_type TEXT DEFAULT 'individual',
  status TEXT DEFAULT 'scheduled', 
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, 
  reminder_sent_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  note_id UUID REFERENCES session_notes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapists_own_appointments" ON appointments;
CREATE POLICY "therapists_own_appointments" ON appointments
  FOR ALL USING (clinician_id = auth.uid());

-- ── 3. Intake Forms ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  form_data JSONB NOT NULL,
  completed_at TIMESTAMPTZ,
  e_signature TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

-- Note: client portal may need insert access. For now, restrict to clinician via client relation.
-- A true portal access needs a different policy based on the portal token.
DROP POLICY IF EXISTS "therapists_own_intake_forms" ON intake_forms;
CREATE POLICY "therapists_own_intake_forms" ON intake_forms
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE clinician_id = auth.uid())
  );

-- ── 4. Audit Log (PHIPA requirement) ─────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
  action TEXT NOT NULL, 
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only therapists can see their own audit logs.
DROP POLICY IF EXISTS "therapists_view_audit_log" ON audit_log;
CREATE POLICY "therapists_view_audit_log" ON audit_log
  FOR SELECT USING (clinician_id = auth.uid());
-- Only inserts are allowed.
DROP POLICY IF EXISTS "therapists_insert_audit_log" ON audit_log;
CREATE POLICY "therapists_insert_audit_log" ON audit_log
  FOR INSERT WITH CHECK (clinician_id = auth.uid());
