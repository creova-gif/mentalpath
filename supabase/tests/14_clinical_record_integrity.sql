-- Locked notes are immutable, amendments are append-only, audit is server-side,
-- and note content is only readable through the audited function.
BEGIN;
SELECT test_seed_users();
INSERT INTO clients (id, clinician_id, first_name, last_name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Client', 'OfAlice'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Client', 'OfBob');

SELECT test_login('11111111-1111-1111-1111-111111111111');

-- Create drafts through the RPC; session number and lock metadata are server-set
-- Saving to an id that does not exist (or is not yours) is refused
SELECT expect_error($$SELECT save_session_note('aaaaaaaa-0000-0000-0000-0000000000ff'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001',
  current_date, 'video', 50, 'dap', false, 'x', NULL, NULL, NULL)$$, '%Note not found%');
CREATE TEMP TABLE t_ids (k TEXT, id UUID);
GRANT ALL ON t_ids TO authenticated;
INSERT INTO t_ids SELECT 'a1', save_session_note(NULL, 'aaaaaaaa-0000-0000-0000-000000000001', current_date,
  'video', 50, 'DAP', false, 'first draft', NULL, NULL, NULL);
INSERT INTO t_ids SELECT 'a2', save_session_note(NULL, 'aaaaaaaa-0000-0000-0000-000000000001', current_date,
  'video', 50, 'dap', false, 'second', NULL, NULL, NULL);
SELECT expect_count($$SELECT 1 FROM session_notes n JOIN t_ids t ON t.id = n.id AND t.k = 'a1'
  WHERE n.session_number = 1 AND n.locked_at IS NULL AND n.enc_version = 2 AND n.note_format = 'dap'$$, 1);
SELECT expect_count($$SELECT 1 FROM session_notes n JOIN t_ids t ON t.id = n.id AND t.k = 'a2' WHERE n.session_number = 2$$, 1);

-- Direct writes are refused; unknown formats and missing clients too
SELECT expect_error($$INSERT INTO session_notes (clinician_id, client_id, session_date, note_format)
  VALUES (auth.uid(), 'aaaaaaaa-0000-0000-0000-000000000001', current_date, 'DAP')$$, '%permission denied%');
SELECT expect_error($$UPDATE session_notes SET is_locked = true$$, '%permission denied%');
SELECT expect_error($$SELECT save_session_note(NULL, 'aaaaaaaa-0000-0000-0000-000000000001', current_date,
  'video', 50, 'freeform', false, 'x', NULL, NULL, NULL)$$, '%Unknown note format%');
SELECT expect_error($$SELECT save_session_note(NULL, NULL, current_date,
  'video', 50, 'dap', false, 'x', NULL, NULL, NULL)$$, '%session_notes_client_required%');
SELECT expect_error($$SELECT save_session_note(NULL, 'aaaaaaaa-0000-0000-0000-000000000001', current_date,
  'video', 50, 'dap', false, repeat('x', 100001), NULL, NULL, NULL)$$, '%too long%');

-- Drafts are editable, then lock
SELECT save_session_note((SELECT id FROM t_ids WHERE k = 'a1'), 'aaaaaaaa-0000-0000-0000-000000000001', current_date,
  'video', 50, 'dap', false, 'final text', NULL, NULL, NULL);
SELECT lock_session_note((SELECT id FROM t_ids WHERE k = 'a1'));
SELECT expect_count($$SELECT 1 FROM session_notes n JOIN t_ids t ON t.id = n.id AND t.k = 'a1'
  WHERE n.locked_at IS NOT NULL AND NOT n.is_draft$$, 1);
SELECT expect_error($$SELECT lock_session_note((SELECT id FROM t_ids WHERE k = 'a1'))$$, '%already locked%');

-- Locked: no edits, no delete
SELECT expect_error($$SELECT save_session_note((SELECT id FROM t_ids WHERE k = 'a1'), 'aaaaaaaa-0000-0000-0000-000000000001',
  current_date, 'video', 50, 'dap', false, 'rewritten', NULL, NULL, NULL)$$, '%cannot be modified%');
SELECT expect_error($$DELETE FROM session_notes WHERE id = (SELECT id FROM t_ids WHERE k = 'a1')$$, '%cannot be deleted%');
-- Drafts can still be deleted
DELETE FROM session_notes WHERE id = (SELECT id FROM t_ids WHERE k = 'a2');

-- Content columns are not directly selectable; metadata is
SELECT expect_error($$SELECT section_1 FROM session_notes$$, '%permission denied%');
SELECT expect_count($$SELECT id, is_locked, session_number FROM session_notes$$, 1);
-- ...but readable (and logged) through the audited function
SELECT expect_count($$SELECT * FROM get_session_note((SELECT id FROM t_ids WHERE k = 'a1')) WHERE section_1 = 'final text'$$, 1);

-- Amendments: only on own locked notes; append-only
INSERT INTO session_note_amendments (note_id, body, reason)
VALUES ((SELECT id FROM t_ids WHERE k = 'a1'), 'Correction: client reported 3 nights of poor sleep, not 2.', 'Transcription error');
SELECT expect_error($$UPDATE session_note_amendments SET body = 'x'$$, '%permission denied%');
SELECT expect_error($$DELETE FROM session_note_amendments$$, '%permission denied%');

-- Audit log: browser cannot write it
SELECT expect_error($$INSERT INTO audit_log (clinician_id, action, table_name) VALUES (auth.uid(), 'FAKE', 'x')$$, '%permission denied%');
SELECT expect_error($$DELETE FROM audit_log$$, '%permission denied%');

-- Bob cannot read Alice's note via the function, amend it, or see her audit rows
RESET ROLE;
SELECT test_login('22222222-2222-2222-2222-222222222222');
SELECT expect_count($$SELECT * FROM get_session_note((SELECT id FROM t_ids WHERE k = 'a1'))$$, 0);
SELECT expect_error($$INSERT INTO session_note_amendments (note_id, body)
  VALUES ((SELECT id FROM t_ids WHERE k = 'a1'), 'x')$$, '%row-level security%');
SELECT expect_count($$SELECT 1 FROM audit_log WHERE clinician_id <> auth.uid()
  OR record_id = (SELECT id FROM t_ids WHERE k = 'a1')$$, 0);

-- MFA is required for the function too
RESET ROLE;
SELECT test_login('11111111-1111-1111-1111-111111111111', 'aal1');
SELECT expect_error($$SELECT * FROM get_session_note((SELECT id FROM t_ids WHERE k = 'a1'))$$, '%Not authorised%');

-- Content is ciphertext at rest; export is service_role only; maintenance bypass is not reachable
RESET ROLE;
DO $$
DECLARE raw TEXT;
BEGIN
  SELECT section_1 INTO raw FROM session_notes WHERE id = (SELECT id FROM t_ids WHERE k = 'a1');
  ASSERT raw LIKE '-----BEGIN PGP MESSAGE-----%', 'section_1 must be PGP ciphertext';
  ASSERT raw NOT LIKE '%final text%', 'plaintext must not be stored';
  ASSERT (SELECT count(*) FROM private.clinician_keys WHERE clinician_id = '11111111-1111-1111-1111-111111111111') = 1;
  ASSERT (SELECT wrapped_dek::text FROM private.clinician_keys LIMIT 1) NOT LIKE '%-%-%', 'DEK stored wrapped';
END $$;
-- Master-key rotation re-wraps DEKs without touching note ciphertext
DO $$
DECLARE k TEXT := private.master_key();
BEGIN
  ASSERT private.rewrap_all_deks(k, 'rotation-test-key') >= 1, 'rewrap count';
  ASSERT private.rewrap_all_deks('rotation-test-key', k) >= 1, 'rewrap back';
END $$;
SET ROLE service_role;
SELECT expect_count($$SELECT 1 FROM export_session_notes('11111111-1111-1111-1111-111111111111') WHERE section_1 = 'final text'$$, 1);
RESET ROLE;
SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT expect_error($$SELECT * FROM export_session_notes(auth.uid())$$, '%permission denied%');
SELECT expect_error($$SELECT * FROM private.clinician_keys$$, '%permission denied%');
SELECT expect_error($$SELECT private.set_maintenance(true)$$, '%permission denied%');
SELECT set_config('mentalpath.maintenance', 'on', true);
SELECT expect_error($$DELETE FROM session_notes WHERE id = (SELECT id FROM t_ids WHERE k = 'a1')$$, '%cannot be deleted%');
SELECT expect_error($$SELECT save_session_note((SELECT id FROM t_ids WHERE k = 'a1'), 'aaaaaaaa-0000-0000-0000-000000000001',
  current_date, 'video', 50, 'dap', false, 'rewritten', NULL, NULL, NULL)$$, '%cannot be modified%');
SELECT set_config('mentalpath.maintenance', '', true);

-- Server wrote the expected audit trail, attributed to Alice, with no PHI values
RESET ROLE;
DO $$
DECLARE
  actions TEXT[];
BEGIN
  SELECT array_agg(action ORDER BY id) INTO actions FROM audit_log
  WHERE clinician_id = '11111111-1111-1111-1111-111111111111' AND table_name IN ('session_notes','session_note_amendments');
  ASSERT actions = ARRAY['INSERT','INSERT','UPDATE','NOTE_LOCKED','DELETE','NOTE_ACCESSED','INSERT'],
    format('unexpected audit trail: %s', actions);
  ASSERT NOT EXISTS (SELECT 1 FROM audit_log WHERE details::text LIKE '%final text%'), 'audit must not contain note text';
  ASSERT (SELECT details->'changed_columns' FROM audit_log WHERE action = 'UPDATE' AND table_name = 'session_notes' LIMIT 1) = '["section_1"]'::jsonb;
END $$;
ROLLBACK;
