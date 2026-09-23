-- ============================================================
-- MentalPath — Disable demo users in a production project
-- ============================================================
-- The demo accounts below were seeded with a publicly known password
-- (demo1234). This script locks them out WITHOUT deleting any rows, so
-- nothing cascades into clinicians/clients/session_notes:
--   • bans the account indefinitely (GoTrue rejects sign-in)
--   • replaces the password hash with an unguessable random one
--   • revokes all existing sessions / refresh tokens
-- Run once in the production project's SQL editor. Safe to re-run.

WITH demo AS (
  SELECT id FROM auth.users
  WHERE email IN (
    'dr.osei@mentalpath.ca',
    'dr.chen@spine360.ca',
    'sarah.patel@physiocare.ca',
    'j.williams@rmtcare.ca'
  )
)
UPDATE auth.users u
SET banned_until       = 'infinity',
    encrypted_password = crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')),
    updated_at         = NOW()
FROM demo
WHERE u.id = demo.id;

DELETE FROM auth.sessions
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN (
    'dr.osei@mentalpath.ca',
    'dr.chen@spine360.ca',
    'sarah.patel@physiocare.ca',
    'j.williams@rmtcare.ca'
  )
);

-- Verify: every row should show banned_until = infinity
SELECT email, banned_until FROM auth.users
WHERE email IN (
  'dr.osei@mentalpath.ca',
  'dr.chen@spine360.ca',
  'sarah.patel@physiocare.ca',
  'j.williams@rmtcare.ca'
);
