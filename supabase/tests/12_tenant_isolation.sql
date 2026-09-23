-- One clinician can never see or modify another clinician's clinical data.
BEGIN;
SELECT test_seed_users();
INSERT INTO clients (id, clinician_id, first_name, last_name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Client', 'OfAlice'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Client', 'OfBob');
INSERT INTO session_notes (id, clinician_id, client_id, session_date, note_format, section_1) VALUES
  ('aaaaaaaa-0000-0000-0000-0000000000a1', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', current_date, 'DAP', 'alice note'),
  ('bbbbbbbb-0000-0000-0000-0000000000b1', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', current_date, 'DAP', 'bob note');
INSERT INTO invoices (clinician_id, invoice_number, client_name, amount) VALUES
  ('11111111-1111-1111-1111-111111111111', 'INV-1', 'Client OfAlice', 100),
  ('22222222-2222-2222-2222-222222222222', 'INV-1', 'Client OfBob', 100);

SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT expect_count('SELECT 1 FROM clients', 1);
SELECT expect_count('SELECT 1 FROM session_notes', 1);
SELECT expect_count('SELECT 1 FROM invoices', 1);
SELECT expect_count('SELECT 1 FROM clinicians', 1);
SELECT expect_count($$SELECT 1 FROM clients WHERE last_name = 'OfBob'$$, 0);

-- Writes against Bob's rows silently match nothing
UPDATE clients SET first_name = 'hacked' WHERE id = 'bbbbbbbb-0000-0000-0000-000000000001';
DELETE FROM invoices WHERE client_name = 'Client OfBob';
-- Cannot create rows owned by Bob
SELECT expect_error($$INSERT INTO clients (clinician_id, first_name, last_name)
  VALUES ('22222222-2222-2222-2222-222222222222', 'x', 'y')$$, '%row-level security%');
SELECT expect_error($$INSERT INTO session_notes (clinician_id, session_date, note_format)
  VALUES ('22222222-2222-2222-2222-222222222222', current_date, 'DAP')$$, '%row-level security%');

-- Anonymous callers see nothing
RESET ROLE;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', false);
SET ROLE anon;
SELECT expect_count('SELECT 1 FROM clients', 0);
SELECT expect_error('SELECT 1 FROM session_notes', '%permission denied%');

RESET ROLE;
DO $$ BEGIN
  ASSERT (SELECT first_name FROM clients WHERE id = 'bbbbbbbb-0000-0000-0000-000000000001') = 'Client';
  ASSERT (SELECT count(*) FROM invoices WHERE client_name = 'Client OfBob') = 1;
END $$;
ROLLBACK;
