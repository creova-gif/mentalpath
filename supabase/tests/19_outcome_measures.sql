-- PHQ-9 / GAD-7: server-side scoring, safety flag, ownership, MFA, immutability.
BEGIN;
SELECT test_seed_users();
INSERT INTO clients (id, clinician_id, first_name, last_name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Client', 'OfAlice'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Client', 'OfBob');

SELECT test_login('11111111-1111-1111-1111-111111111111');
-- Browser-sent totals are ignored; the database scores
INSERT INTO outcome_measures (client_id, instrument, item_scores, total_score, severity, risk_flag)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'PHQ-9', '{2,2,2,2,2,1,1,1,1}', 0, 'minimal', false);
SELECT expect_count($$SELECT 1 FROM outcome_measures WHERE instrument = 'PHQ-9'
  AND total_score = 14 AND severity = 'moderate' AND risk_flag AND clinician_id = auth.uid()$$, 1);
INSERT INTO outcome_measures (client_id, instrument, item_scores, total_score, severity)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'GAD-7', '{3,3,3,3,3,3,3}', 0, '');
SELECT expect_count($$SELECT 1 FROM outcome_measures WHERE instrument = 'GAD-7' AND total_score = 21 AND severity = 'severe' AND NOT risk_flag$$, 1);
INSERT INTO outcome_measures (client_id, instrument, item_scores, total_score, severity)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'PHQ-9', '{3,3,3,3,3,3,0,0,0}', 0, '');
SELECT expect_count($$SELECT 1 FROM outcome_measures WHERE total_score = 18 AND severity = 'moderately severe' AND NOT risk_flag$$, 1);

-- Validation
SELECT expect_error($$INSERT INTO outcome_measures (client_id, instrument, item_scores, total_score, severity)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'PHQ-9', '{1,1,1}', 0, '')$$, '%needs 9 answers%');
SELECT expect_error($$INSERT INTO outcome_measures (client_id, instrument, item_scores, total_score, severity)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'GAD-7', '{0,0,0,0,0,0,4}', 0, '')$$, '%scored 0%');
SELECT expect_error($$INSERT INTO outcome_measures (client_id, instrument, item_scores, total_score, severity)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'BDI', '{0}', 0, '')$$, '%instrument%');
-- Cannot attach to another clinician's client, or write as them
SELECT expect_error($$INSERT INTO outcome_measures (client_id, instrument, item_scores, total_score, severity)
  VALUES ('bbbbbbbb-0000-0000-0000-000000000001', 'GAD-7', '{0,0,0,0,0,0,0}', 0, '')$$, '%Client not found%');
SELECT expect_error($$INSERT INTO outcome_measures (clinician_id, client_id, instrument, item_scores, total_score, severity)
  VALUES ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', 'GAD-7', '{0,0,0,0,0,0,0}', 0, '')$$, '%row-level security%');
-- No edits; deletion allowed (entered in error), and audited
SELECT expect_error($$UPDATE outcome_measures SET item_scores = '{0,0,0,0,0,0,0}'$$, '%permission denied%');
DELETE FROM outcome_measures WHERE total_score = 18;

-- Other clinicians and AAL1 sessions see nothing
SELECT test_login('22222222-2222-2222-2222-222222222222');
SELECT expect_count($$SELECT 1 FROM outcome_measures$$, 0);
SELECT test_login('11111111-1111-1111-1111-111111111111', 'aal1');
SELECT expect_count($$SELECT 1 FROM outcome_measures$$, 0);

RESET ROLE;
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM audit_log WHERE table_name = 'outcome_measures' AND action = 'INSERT') = 3;
  ASSERT (SELECT count(*) FROM audit_log WHERE table_name = 'outcome_measures' AND action = 'DELETE') = 1;
  ASSERT NOT EXISTS (SELECT 1 FROM audit_log WHERE table_name = 'outcome_measures' AND details::text LIKE '%{2,2%');
END $$;
ROLLBACK;
