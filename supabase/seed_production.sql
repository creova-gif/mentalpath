-- ============================================================
-- MentalPath — Run this ONCE in Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/hkhwgbkijepsxtixdmrs/sql
-- ============================================================

-- ── STEP 1: Create tables (safe — uses IF NOT EXISTS) ──────────
CREATE TABLE IF NOT EXISTS clinicians (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  profession     TEXT NOT NULL,
  reg_number     TEXT,
  city           TEXT,
  session_rate   NUMERIC(10,2) DEFAULT 140,
  hst_exempt     BOOLEAN DEFAULT TRUE,
  plan_type      TEXT DEFAULT 'solo',
  plan_cycle     TEXT DEFAULT 'monthly',
  plan_seats     INTEGER DEFAULT 1,
  price_per_seat NUMERIC(10,2) DEFAULT 79,
  is_trial       BOOLEAN DEFAULT FALSE,
  trial_ends_at  TIMESTAMPTZ,
  plan_starts_at TIMESTAMPTZ DEFAULT NOW(),
  plan_renews_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id  UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  date_of_birth DATE,
  pronouns      TEXT,
  status        TEXT DEFAULT 'active',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id   UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  client_name    TEXT NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  sessions       INTEGER NOT NULL DEFAULT 1,
  amount         NUMERIC(10,2) NOT NULL,
  status         TEXT DEFAULT 'pending',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── STEP 2: Row-Level Security ─────────────────────────────────
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices   ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then recreate (idempotent)
DROP POLICY IF EXISTS "clinicians_select_own" ON clinicians;
DROP POLICY IF EXISTS "clinicians_update_own" ON clinicians;
DROP POLICY IF EXISTS "clinicians_insert_own" ON clinicians;
DROP POLICY IF EXISTS "clients_clinician_all"  ON clients;
DROP POLICY IF EXISTS "invoices_clinician_all" ON invoices;

CREATE POLICY "clinicians_select_own" ON clinicians FOR SELECT USING (id = auth.uid());
CREATE POLICY "clinicians_update_own" ON clinicians FOR UPDATE USING (id = auth.uid());
CREATE POLICY "clinicians_insert_own" ON clinicians FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "clients_clinician_all"  ON clients  FOR ALL   USING (clinician_id = auth.uid());
CREATE POLICY "invoices_clinician_all" ON invoices FOR ALL   USING (clinician_id = auth.uid());

-- ── STEP 3: updated_at trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clinicians_updated_at ON clinicians;
DROP TRIGGER IF EXISTS trg_clients_updated_at    ON clients;
DROP TRIGGER IF EXISTS trg_invoices_updated_at   ON invoices;

CREATE TRIGGER trg_clinicians_updated_at BEFORE UPDATE ON clinicians FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_clients_updated_at    BEFORE UPDATE ON clients    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_invoices_updated_at   BEFORE UPDATE ON invoices   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── STEP 4: Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clients_clinician  ON clients  (clinician_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinician ON invoices (clinician_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date      ON invoices (clinician_id, date DESC);

-- ── Demo accounts ──────────────────────────────────────────────
-- Intentionally NOT seeded here. Demo users share a publicly known password
-- and must never exist in a production project. For local/dev projects, use
-- supabase/seed_demo_users_fixed.sql. To disable demo users that were already
-- created in production, run supabase/scripts/disable_demo_users.sql.
