-- Records are destroyed once the College retention period ends (10 years after
-- last contact, or 10 years after the client turns 18, whichever is later).
BEGIN;
SELECT test_seed_users();
INSERT INTO clients (id, clinician_id, first_name, last_name, date_of_birth, created_at) VALUES
  -- adult, last seen 2014 → retain until 2024 → purge
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Old', 'Adult', '1980-01-01', '2010-01-01'),
  -- minor seen in 2012, born 2010 → retain until 2038 → keep
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Young', 'Minor', '2010-01-01', '2011-01-01'),
  -- seen in 2020 → retain until 2030 → keep
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Recent', 'Client', NULL, '2019-01-01'),
  -- Bob's only client, last seen 2013 → purge; Bob closed his account
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Bob', 'Client', NULL, '2012-01-01');
INSERT INTO session_notes (id, clinician_id, client_id, session_date, note_format, is_locked, enc_version) VALUES
  ('aaaaaaaa-0000-0000-0000-0000000000a1', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', '2014-05-01', 'dap', true, 2),
  ('aaaaaaaa-0000-0000-0000-0000000000a2', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000002', '2012-05-01', 'dap', true, 2),
  ('aaaaaaaa-0000-0000-0000-0000000000a3', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000003', '2020-05-01', 'dap', true, 2),
  ('bbbbbbbb-0000-0000-0000-0000000000b1', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', '2013-03-01', 'dap', true, 2);
INSERT INTO session_note_amendments (note_id, clinician_id, body)
  VALUES ('aaaaaaaa-0000-0000-0000-0000000000a1', '11111111-1111-1111-1111-111111111111', 'late correction');
INSERT INTO invoices (clinician_id, client_id, client_name, amount, created_at)
  VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'Old Adult', 120, '2014-05-01');
INSERT INTO appointments (clinician_id, client_id, scheduled_at)
  VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', '2014-05-01 10:00');
UPDATE clinicians SET deletion_requested_at = '2025-06-01' WHERE id = '22222222-2222-2222-2222-222222222222';
INSERT INTO contact_messages (name, email, message, created_at) VALUES
  ('Old', 'old@example.test', 'old message', now() - interval '3 years'),
  ('New', 'new@example.test', 'new message', now());

-- Clinicians can see a client's retention date, only for their own clients
SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT expect_count($$SELECT 1 WHERE client_retention_until('aaaaaaaa-0000-0000-0000-000000000001') = '2024-05-01'$$, 1);
SELECT expect_count($$SELECT 1 WHERE client_retention_until('aaaaaaaa-0000-0000-0000-000000000002') = '2038-01-01'$$, 1);
SELECT expect_count($$SELECT 1 WHERE client_retention_until('bbbbbbbb-0000-0000-0000-000000000001') IS NULL$$, 1);
-- ...and cannot run the purge
SELECT expect_error($$SELECT private.purge_expired_records()$$, '%permission denied%');

RESET ROLE;
SELECT set_config('request.jwt.claims', '', true);
DO $$
DECLARE res JSONB := private.purge_expired_records('2026-09-25');
BEGIN
  ASSERT (res->>'clients')::int = 2, format('clients purged: %s', res);
  ASSERT (res->>'session_notes')::int = 2, format('notes purged: %s', res);
  ASSERT (res->>'closed_accounts')::int = 1, format('accounts removed: %s', res);
  ASSERT (res->>'contact_messages')::int = 1, format('contact messages: %s', res);

  ASSERT NOT EXISTS (SELECT 1 FROM clients WHERE id IN ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001'));
  ASSERT (SELECT count(*) FROM clients) = 2, 'minor and recent client are retained';
  ASSERT (SELECT count(*) FROM session_notes) = 2;
  ASSERT NOT EXISTS (SELECT 1 FROM session_note_amendments);
  ASSERT NOT EXISTS (SELECT 1 FROM invoices WHERE client_name = 'Old Adult');
  ASSERT NOT EXISTS (SELECT 1 FROM appointments);
  ASSERT NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222'), 'closed account removed';
  ASSERT NOT EXISTS (SELECT 1 FROM clinicians WHERE id = '22222222-2222-2222-2222-222222222222');
  ASSERT EXISTS (SELECT 1 FROM clinicians WHERE id = '11111111-1111-1111-1111-111111111111'), 'open account kept';
  ASSERT (SELECT count(*) FROM contact_messages) = 1;
  ASSERT (SELECT counts FROM private.retention_runs ORDER BY id DESC LIMIT 1) = res, 'run recorded';
  ASSERT (SELECT counts::text FROM private.retention_runs ORDER BY id DESC LIMIT 1) NOT LIKE '%aaaaaaaa%', 'no identifiers in run log';
END $$;

-- The bypass is off again after the run: locked notes are still protected
SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT expect_error($$DELETE FROM session_notes WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a3'$$, '%cannot be deleted%');

-- A second run is a no-op
RESET ROLE;
DO $$
DECLARE res JSONB := private.purge_expired_records('2026-09-25');
BEGIN
  ASSERT (res->>'clients')::int = 0 AND (res->>'closed_accounts')::int = 0, format('second run: %s', res);
END $$;
ROLLBACK;
