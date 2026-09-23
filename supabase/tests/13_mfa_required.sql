-- Clinical data requires an AAL2 (MFA-verified) session; the profile row does not.
BEGIN;
SELECT test_seed_users();
INSERT INTO clients (clinician_id, first_name, last_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Client', 'OfAlice');

SELECT test_login('11111111-1111-1111-1111-111111111111', 'aal1');
SELECT expect_count('SELECT 1 FROM clinicians', 1);
SELECT expect_count('SELECT 1 FROM clients', 0);
SELECT expect_error($$INSERT INTO clients (clinician_id, first_name, last_name)
  VALUES (auth.uid(), 'x', 'y')$$, '%row-level security%');

RESET ROLE;
SELECT test_login('11111111-1111-1111-1111-111111111111', 'aal2');
SELECT expect_count('SELECT 1 FROM clients', 1);

-- Local-dev escape hatch is controlled only from the private schema
RESET ROLE;
SELECT test_login('11111111-1111-1111-1111-111111111111', 'aal1');
SELECT expect_error($$SELECT * FROM private.app_settings$$, '%permission denied%');
SELECT expect_error($$INSERT INTO private.app_settings VALUES ('mfa_optional', 'true')$$, '%permission denied%');
ROLLBACK;
