-- ============================================================
-- MentalPath — Sign-in Sanity Check
-- Run each block separately in the Supabase SQL Editor
-- ============================================================

-- BLOCK 1: Confirm auth.users are ready for GoTrue login
-- All 4 should show: email_confirmed=true, aud=authenticated, has_password=true
SELECT
  email,
  email_confirmed_at IS NOT NULL                    AS email_confirmed,
  aud,
  role,
  encrypted_password IS NOT NULL                    AS has_password,
  last_sign_in_at,
  created_at
FROM auth.users
WHERE email IN (
  'dr.osei@mentalpath.ca',
  'dr.chen@spine360.ca',
  'sarah.patel@physiocare.ca',
  'j.williams@rmtcare.ca'
)
ORDER BY email;


-- BLOCK 2: Confirm therapists profile rows are linked to auth UUIDs
-- All 4 should show matching UUIDs, full_name, hourly_rate, subscription fields
SELECT
  t.id,
  u.email,
  t.full_name,
  t.province,
  t.hourly_rate,
  t.profession_code,
  t.subscription_tier,
  t.subscription_status
FROM therapists t
JOIN auth.users u ON u.id = t.id
WHERE u.email IN (
  'dr.osei@mentalpath.ca',
  'dr.chen@spine360.ca',
  'sarah.patel@physiocare.ca',
  'j.williams@rmtcare.ca'
)
ORDER BY u.email;


-- BLOCK 3: Simulate what loadProfile() fetches after login
-- This is the exact SELECT from UserContext.loadProfile()
-- Replace the UUID below with any real UUID from Block 1
SELECT
  id,
  email,
  full_name,
  profession_code,
  province,
  hourly_rate,
  subscription_tier,
  subscription_status,
  trial_ends_at,
  stripe_customer_id,
  cancel_at
FROM therapists
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'dr.osei@mentalpath.ca'
);


-- BLOCK 4: Confirm no orphan rows (therapists without auth user, or vice versa)
SELECT
  COALESCE(u.email, '[NO AUTH USER]') AS auth_email,
  COALESCE(t.email, '[NO THERAPIST ROW]') AS therapist_email,
  CASE
    WHEN u.id IS NULL THEN 'ORPHAN THERAPIST — no auth user'
    WHEN t.id IS NULL THEN 'ORPHAN AUTH USER — no therapist row'
    ELSE 'OK'
  END AS status
FROM auth.users u
FULL OUTER JOIN therapists t ON t.id = u.id
WHERE u.email IN (
  'dr.osei@mentalpath.ca',
  'dr.chen@spine360.ca',
  'sarah.patel@physiocare.ca',
  'j.williams@rmtcare.ca'
)
OR t.email IN (
  'dr.osei@mentalpath.ca',
  'dr.chen@spine360.ca',
  'sarah.patel@physiocare.ca',
  'j.williams@rmtcare.ca'
)
ORDER BY status;
