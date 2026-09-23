-- Browser roles can edit profile fields but never plan/trial/billing fields.
BEGIN;
SELECT test_seed_users();
SELECT test_login('11111111-1111-1111-1111-111111111111');

UPDATE clinicians SET city = 'Toronto' WHERE id = auth.uid();
SELECT expect_error($$UPDATE clinicians SET plan_type = 'group' WHERE id = auth.uid()$$, '%permission denied%');
SELECT expect_error($$UPDATE clinicians SET is_trial = false WHERE id = auth.uid()$$, '%permission denied%');
SELECT expect_error($$UPDATE clinicians SET trial_ends_at = '2999-01-01' WHERE id = auth.uid()$$, '%permission denied%');
SELECT expect_error($$SELECT * FROM kv_store_4d1a502d$$, '%permission denied%');

RESET ROLE;
DO $$ BEGIN
  ASSERT (SELECT city FROM clinicians WHERE id = '11111111-1111-1111-1111-111111111111') = 'Toronto';
  ASSERT (SELECT plan_type FROM clinicians WHERE id = '11111111-1111-1111-1111-111111111111') = 'solo';
END $$;
ROLLBACK;
