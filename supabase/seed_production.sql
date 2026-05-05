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

-- ── STEP 5: Seed demo accounts into Supabase Auth ─────────────
-- Creates the 4 demo users (password = demo1234 for all)
-- This uses the admin API via SQL — safe to run in SQL Editor.

SELECT auth.uid(); -- just to confirm you're connected

-- Seed users via Supabase Admin (run each only once)
DO $$
DECLARE
  uid_osei    UUID;
  uid_chen    UUID;
  uid_patel   UUID;
  uid_williams UUID;
BEGIN
  -- dr.osei@mentalpath.ca
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    gen_random_uuid(),
    'dr.osei@mentalpath.ca',
    crypt('demo1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid_osei;

  -- dr.chen@spine360.ca
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    gen_random_uuid(),
    'dr.chen@spine360.ca',
    crypt('demo1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid_chen;

  -- sarah.patel@physiocare.ca
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    gen_random_uuid(),
    'sarah.patel@physiocare.ca',
    crypt('demo1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid_patel;

  -- j.williams@rmtcare.ca
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    gen_random_uuid(),
    'j.williams@rmtcare.ca',
    crypt('demo1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid_williams;

  -- Re-fetch IDs in case of conflict (ON CONFLICT doesn't return)
  SELECT id INTO uid_osei    FROM auth.users WHERE email = 'dr.osei@mentalpath.ca';
  SELECT id INTO uid_chen    FROM auth.users WHERE email = 'dr.chen@spine360.ca';
  SELECT id INTO uid_patel   FROM auth.users WHERE email = 'sarah.patel@physiocare.ca';
  SELECT id INTO uid_williams FROM auth.users WHERE email = 'j.williams@rmtcare.ca';

  -- ── STEP 6: Seed clinicians rows ───────────────────────────
  INSERT INTO clinicians (
    id, first_name, last_name, profession, reg_number, city,
    session_rate, hst_exempt, plan_type, plan_cycle, plan_seats,
    price_per_seat, is_trial, trial_ends_at, plan_starts_at, plan_renews_at
  ) VALUES
    (uid_osei,    'Abena',  'Osei-Mensah', 'Registered Psychotherapist', 'CRPO-004821', 'Toronto, ON',    140, TRUE,  'solo',  'monthly', 1, 79, FALSE, NULL, '2025-09-01', '2026-04-01'),
    (uid_chen,    'Marcus', 'Chen',         'Chiropractor',               'CCO-012047',  'Vancouver, BC',  85,  FALSE, 'solo',  'annual',  1, 69, FALSE, NULL, '2026-01-15', '2027-01-15'),
    (uid_patel,   'Sarah',  'Patel',        'Physiotherapist',            'CPT-008834',  'Calgary, AB',    120, FALSE, 'group', 'monthly', 4, 69, FALSE, NULL, '2025-11-01', '2026-04-01'),
    (uid_williams,'Jordan', 'Williams',     'Registered Massage Therapist','CMTO-019923','Ottawa, ON',      95,  FALSE, 'solo',  'monthly', 1, 79, TRUE,  NOW() + interval '4 days', '2026-03-16', '2026-03-23')
  ON CONFLICT (id) DO NOTHING;

END $$;

-- ── Verify ─────────────────────────────────────────────────────
SELECT u.email, c.first_name, c.last_name, c.profession, c.plan_type
FROM auth.users u
JOIN clinicians c ON c.id = u.id
WHERE u.email IN ('dr.osei@mentalpath.ca','dr.chen@spine360.ca','sarah.patel@physiocare.ca','j.williams@rmtcare.ca');
