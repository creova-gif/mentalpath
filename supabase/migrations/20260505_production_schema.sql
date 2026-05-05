-- ============================================================
-- MentalPath — Production Schema Migration
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Clinicians ─────────────────────────────────────────────
-- One row per authenticated user (auth.users). Stores all
-- profession-specific metadata so the app can reconstruct
-- UserProfile after a real Supabase Auth login.
CREATE TABLE IF NOT EXISTS clinicians (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  profession    TEXT NOT NULL,
  reg_number    TEXT,
  city          TEXT,
  session_rate  NUMERIC(10,2) DEFAULT 140,
  hst_exempt    BOOLEAN DEFAULT TRUE,
  plan_type     TEXT DEFAULT 'solo',    -- solo | group | enterprise
  plan_cycle    TEXT DEFAULT 'monthly', -- monthly | annual
  plan_seats    INTEGER DEFAULT 1,
  price_per_seat NUMERIC(10,2) DEFAULT 79,
  is_trial      BOOLEAN DEFAULT TRUE,
  trial_ends_at TIMESTAMPTZ,
  plan_starts_at TIMESTAMPTZ DEFAULT NOW(),
  plan_renews_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: clinicians can only read/update their own row
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinicians_select_own" ON clinicians
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "clinicians_update_own" ON clinicians
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "clinicians_insert_own" ON clinicians
  FOR INSERT WITH CHECK (id = auth.uid());

-- ── 2. Clients ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id  UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  date_of_birth DATE,
  pronouns      TEXT,
  status        TEXT DEFAULT 'active', -- active | inactive | waitlist
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_clinician_all" ON clients
  FOR ALL USING (clinician_id = auth.uid());

-- ── 3. Invoices ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id   UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  client_name    TEXT NOT NULL,  -- denormalised for fast display
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  sessions       INTEGER NOT NULL DEFAULT 1,
  amount         NUMERIC(10,2) NOT NULL,
  status         TEXT DEFAULT 'pending', -- paid | pending | overdue
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_clinician_all" ON invoices
  FOR ALL USING (clinician_id = auth.uid());

-- ── 4. Auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_clinicians_updated_at
  BEFORE UPDATE ON clinicians
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 5. Useful indexes ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clients_clinician_id ON clients(clinician_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinician_id ON invoices(clinician_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(clinician_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(clinician_id, date DESC);
