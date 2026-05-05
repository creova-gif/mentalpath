-- ============================================================
-- MentalPath — Demo user re-seed (FIXED for GoTrue compatibility)
-- Run in: https://supabase.com/dashboard/project/hkhwgbkijepsxtixdmrs/sql
-- ============================================================
-- This script uses the correct auth.users field format that GoTrue
-- can validate passwords against (bcrypt via pgcrypto).
-- If users already exist, their passwords will be updated.

-- STEP 1: Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- STEP 2: Upsert all 4 demo users with correct GoTrue-compatible format
DO $$
DECLARE
  uid_osei     UUID;
  uid_chen     UUID;
  uid_patel    UUID;
  uid_williams UUID;
BEGIN

  -- ── dr.osei@mentalpath.ca ───────────────────────────────────────────────────
  SELECT id INTO uid_osei FROM auth.users WHERE email = 'dr.osei@mentalpath.ca';
  IF uid_osei IS NULL THEN
    uid_osei := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid_osei,
      'authenticated',
      'authenticated',
      'dr.osei@mentalpath.ca',
      crypt('demo1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Abena Osei-Mensah"}',
      NOW(), NOW(),
      '', '', '', ''
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('demo1234', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      aud = 'authenticated',
      role = 'authenticated',
      instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'),
      updated_at = NOW()
    WHERE id = uid_osei;
  END IF;

  -- ── dr.chen@spine360.ca ────────────────────────────────────────────────────
  SELECT id INTO uid_chen FROM auth.users WHERE email = 'dr.chen@spine360.ca';
  IF uid_chen IS NULL THEN
    uid_chen := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid_chen,
      'authenticated',
      'authenticated',
      'dr.chen@spine360.ca',
      crypt('demo1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Marcus Chen"}',
      NOW(), NOW(),
      '', '', '', ''
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('demo1234', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      aud = 'authenticated',
      role = 'authenticated',
      instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'),
      updated_at = NOW()
    WHERE id = uid_chen;
  END IF;

  -- ── sarah.patel@physiocare.ca ──────────────────────────────────────────────
  SELECT id INTO uid_patel FROM auth.users WHERE email = 'sarah.patel@physiocare.ca';
  IF uid_patel IS NULL THEN
    uid_patel := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid_patel,
      'authenticated',
      'authenticated',
      'sarah.patel@physiocare.ca',
      crypt('demo1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Sarah Patel"}',
      NOW(), NOW(),
      '', '', '', ''
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('demo1234', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      aud = 'authenticated',
      role = 'authenticated',
      instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'),
      updated_at = NOW()
    WHERE id = uid_patel;
  END IF;

  -- ── j.williams@rmtcare.ca ─────────────────────────────────────────────────
  SELECT id INTO uid_williams FROM auth.users WHERE email = 'j.williams@rmtcare.ca';
  IF uid_williams IS NULL THEN
    uid_williams := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid_williams,
      'authenticated',
      'authenticated',
      'j.williams@rmtcare.ca',
      crypt('demo1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Jordan Williams"}',
      NOW(), NOW(),
      '', '', '', ''
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('demo1234', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      aud = 'authenticated',
      role = 'authenticated',
      instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'),
      updated_at = NOW()
    WHERE id = uid_williams;
  END IF;

  -- ── STEP 3: Seed/update therapists rows ─────────────────────────────────────
  -- Re-fetch IDs in case they already existed
  SELECT id INTO uid_osei     FROM auth.users WHERE email = 'dr.osei@mentalpath.ca';
  SELECT id INTO uid_chen     FROM auth.users WHERE email = 'dr.chen@spine360.ca';
  SELECT id INTO uid_patel    FROM auth.users WHERE email = 'sarah.patel@physiocare.ca';
  SELECT id INTO uid_williams FROM auth.users WHERE email = 'j.williams@rmtcare.ca';

  -- therapists table has both profile fields AND subscription fields
  -- Include email (NOT NULL) + all known profile columns
  INSERT INTO therapists (
    id,
    email,
    subscription_tier,
    subscription_status,
    plan_type,
    province,
    session_rate,
    profession_type,
    created_at,
    updated_at
  )
  VALUES
    (uid_osei,     'dr.osei@mentalpath.ca',     'solo',  'active',   'solo',  'ON', 140.00, 'psychotherapist', NOW(), NOW()),
    (uid_chen,     'dr.chen@spine360.ca',        'solo',  'active',   'solo',  'BC',  85.00, 'chiropractor',    NOW(), NOW()),
    (uid_patel,    'sarah.patel@physiocare.ca',  'group', 'active',   'group', 'AB', 120.00, 'physiotherapist', NOW(), NOW()),
    (uid_williams, 'j.williams@rmtcare.ca',      'solo',  'trialing', 'solo',  'ON',  95.00, 'rmt',             NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email              = EXCLUDED.email,
    subscription_tier  = EXCLUDED.subscription_tier,
    subscription_status = EXCLUDED.subscription_status,
    plan_type          = EXCLUDED.plan_type,
    province           = EXCLUDED.province,
    session_rate       = EXCLUDED.session_rate,
    profession_type    = EXCLUDED.profession_type,
    updated_at         = NOW();

END $$;

-- ── Verify ─────────────────────────────────────────────────────────────────────
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  u.aud,
  u.role,
  t.subscription_tier,
  t.subscription_status
FROM auth.users u
LEFT JOIN therapists t ON t.id = u.id
WHERE u.email IN (
  'dr.osei@mentalpath.ca',
  'dr.chen@spine360.ca',
  'sarah.patel@physiocare.ca',
  'j.williams@rmtcare.ca'
)
ORDER BY u.email;
