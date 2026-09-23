-- Locked notes are immutable, amendments are append-only, audit is server-side,
-- and note content is only readable through the audited function.
BEGIN;
SELECT test_seed_users();
INSERT INTO clients (id, clinician_id, first_name, last_name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Client', 'OfAlice'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Client', 'OfBob');

SELECT test_login('11111111-1111-1111-1111-111111111111');

-- Create a draft; session number and lock metadata are server-set
INSERT INTO session_notes (id, clinician_id, client_id, session_date, note_format, section_1, locked_at, session_number)
VALUES ('aaaaaaaa-0000-0000-0000-0000000000a1', auth.uid(), 'aaaaaaaa-0000-0000-0000-000000000001',
        current_date, 'DAP', 'first draft', '2000-01-01', NULL);
INSERT INTO session_notes (id, clinician_id, client_id, session_date, note_format, section_1)
VALUES ('aaaaaaaa-0000-0000-0000-0000000000a2', auth.uid(), 'aaaaaaaa-0000-0000-0000-000000000001',
        current_date, 'DAP', 'second');
SELECT expect_count($$SELECT 1 FROM session_notes WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a1' AND session_number = 1 AND locked_at IS NULL$$, 1);
SELECT expect_count($$SELECT 1 FROM session_notes WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a2' AND session_number = 2$$, 1);

-- Notes must have a client
SELECT expect_error($$INSERT INTO session_notes (clinician_id, session_date, note_format)
  VALUES (auth.uid(), current_date, 'DAP')$$, '%session_notes_client_required%');

-- Drafts are editable, then lock
UPDATE session_notes SET section_1 = 'final text' WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a1';
UPDATE session_notes SET is_locked = true WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a1';
SELECT expect_count($$SELECT 1 FROM session_notes WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a1'
  AND locked_at IS NOT NULL AND NOT is_draft$$, 1);

-- Locked: no edits, no unlock, no delete
SELECT expect_error($$UPDATE session_notes SET section_1 = 'rewritten' WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a1'$$, '%cannot be modified%');
SELECT expect_error($$UPDATE session_notes SET is_locked = false WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a1'$$, '%cannot be modified%');
SELECT expect_error($$DELETE FROM session_notes WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a1'$$, '%cannot be deleted%');
-- Drafts can still be deleted
DELETE FROM session_notes WHERE id = 'aaaaaaaa-0000-0000-0000-0000000000a2';

-- Content columns are not directly selectable; metadata is
SELECT expect_error($$SELECT section_1 FROM session_notes$$, '%permission denied%');
SELECT expect_count($$SELECT id, is_locked, session_number FROM session_notes$$, 1);
-- ...but readable (and logged) through the audited function
SELECT expect_count($$SELECT * FROM get_session_note('aaaaaaaa-0000-0000-0000-0000000000a1') WHERE section_1 = 'final text'$$, 1);

-- Amendments: only on own locked notes; append-only
INSERT INTO session_note_amendments (note_id, body, reason)
VALUES ('aaaaaaaa-0000-0000-0000-0000000000a1', 'Correction: client reported 3 nights of poor sleep, not 2.', 'Transcription error');
SELECT expect_error($$UPDATE session_note_amendments SET body = 'x'$$, '%permission denied%');
SELECT expect_error($$DELETE FROM session_note_amendments$$, '%permission denied%');

-- Audit log: browser cannot write it
SELECT expect_error($$INSERT INTO audit_log (clinician_id, action, table_name) VALUES (auth.uid(), 'FAKE', 'x')$$, '%permission denied%');
SELECT expect_error($$DELETE FROM audit_log$$, '%permission denied%');

-- Bob cannot read Alice's note via the function, amend it, or see her audit rows
RESET ROLE;
SELECT test_login('22222222-2222-2222-2222-222222222222');
SELECT expect_count($$SELECT * FROM get_session_note('aaaaaaaa-0000-0000-0000-0000000000a1')$$, 0);
SELECT expect_error($$INSERT INTO session_note_amendments (note_id, body)
  VALUES ('aaaaaaaa-0000-0000-0000-0000000000a1', 'x')$$, '%row-level security%');
SELECT expect_count($$SELECT 1 FROM audit_log WHERE clinician_id <> auth.uid()
  OR record_id = 'aaaaaaaa-0000-0000-0000-0000000000a1'$$, 0);

-- MFA is required for the function too
RESET ROLE;
SELECT test_login('11111111-1111-1111-1111-111111111111', 'aal1');
SELECT expect_error($$SELECT * FROM get_session_note('aaaaaaaa-0000-0000-0000-0000000000a1')$$, '%Not authorised%');

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
