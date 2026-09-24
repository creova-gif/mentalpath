-- Group practices: shared billing by seats, no shared clinical data.
BEGIN;
SELECT test_seed_users();
INSERT INTO clients (id, clinician_id, first_name, last_name) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Client', 'OfBob');
INSERT INTO session_notes (clinician_id, client_id, session_date, note_format, enc_version)
  VALUES ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', current_date, 'dap', 2);
-- Trials over, so plans reflect billing alone
UPDATE clinicians SET is_trial = false, trial_ends_at = NULL;
CREATE TEMP TABLE t_tok (who TEXT, token TEXT);
GRANT ALL ON t_tok TO authenticated;

-- Alice founds a practice; browsers cannot write practice tables directly
SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT create_practice('Riverside Therapy');
SELECT expect_error($$SELECT create_practice('Second')$$, '%already belong%');
SELECT expect_error($$INSERT INTO practice_members (practice_id, clinician_id) VALUES (my_practice_id(), '33333333-3333-3333-3333-333333333333')$$, '%permission denied%');
SELECT expect_error($$UPDATE practices SET name = 'x'$$, '%permission denied%');
-- No paid seats yet → cannot invite
SELECT expect_error($$SELECT invite_practice_member('bob@test.local')$$, '%seats%');

-- Stripe webhook (service role) records a 2-seat Group subscription for Alice
RESET ROLE;
UPDATE clinicians SET subscription_status = 'active', plan_type = 'group', plan_seats = 2
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT test_login('11111111-1111-1111-1111-111111111111');
INSERT INTO t_tok SELECT 'bob', invite_practice_member(' Bob@Test.local ');
SELECT expect_error($$SELECT invite_practice_member('carol@test.local')$$, '%seats%');  -- owner + pending invite = 2
SELECT expect_error($$SELECT token_hash FROM practice_invites$$, '%permission denied%');
SELECT expect_count($$SELECT 1 FROM practice_invites WHERE email = 'bob@test.local'$$, 1);
DO $$ BEGIN ASSERT (SELECT paid FROM my_practice_seats()) = 2 AND (SELECT pending FROM my_practice_seats()) = 1; END $$;

-- Only the invited email can accept; tokens are single use
SELECT test_login('33333333-3333-3333-3333-333333333333');
SELECT expect_error($$SELECT accept_practice_invite((SELECT token FROM t_tok WHERE who = 'bob'))$$, '%different email%');
SELECT expect_error($$SELECT accept_practice_invite('not-a-token')$$, '%no longer valid%');
SELECT expect_count($$SELECT 1 FROM practices$$, 0);

SELECT test_login('22222222-2222-2222-2222-222222222222');
DO $$ BEGIN ASSERT current_plan() = 'starter', current_plan(); END $$;
SELECT accept_practice_invite((SELECT token FROM t_tok WHERE who = 'bob'));
DO $$ BEGIN ASSERT current_plan() = 'group', current_plan(); END $$;
SELECT expect_error($$SELECT accept_practice_invite((SELECT token FROM t_tok WHERE who = 'bob'))$$, '%no longer valid%');
SELECT expect_count($$SELECT 1 FROM practice_members$$, 2);
-- Members cannot see invites, the owner dashboard, or invite others
SELECT expect_count($$SELECT 1 FROM practice_invites$$, 0);
SELECT expect_error($$SELECT * FROM practice_overview()$$, '%Only the practice owner%');
SELECT expect_error($$SELECT invite_practice_member('carol@test.local')$$, '%Only the practice owner%');

-- The owner sees counts only, never another clinician's clients or notes
SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT expect_count($$SELECT 1 FROM clients$$, 0);
SELECT expect_count($$SELECT 1 FROM session_notes$$, 0);
SELECT expect_count($$SELECT 1 FROM get_session_note((SELECT id FROM session_notes LIMIT 1))$$, 0);
SELECT expect_count($$SELECT 1 FROM practice_overview() WHERE clinician_id = '22222222-2222-2222-2222-222222222222'
  AND active_clients = 1 AND sessions_this_month = 1 AND unsigned_notes = 1 AND role = 'member'$$, 1);
SELECT expect_count($$SELECT 1 FROM practice_overview()$$, 2);

-- Downgrading below the member count removes Group from members, not the owner
RESET ROLE;
UPDATE clinicians SET plan_seats = 1 WHERE id = '11111111-1111-1111-1111-111111111111';
SELECT test_login('22222222-2222-2222-2222-222222222222');
DO $$ BEGIN ASSERT current_plan() = 'starter', current_plan(); END $$;
SELECT test_login('11111111-1111-1111-1111-111111111111');
DO $$ BEGIN ASSERT current_plan() = 'group', current_plan(); END $$;
RESET ROLE;
UPDATE clinicians SET plan_seats = 2 WHERE id = '11111111-1111-1111-1111-111111111111';

-- Cancelled subscription → members lose Group
UPDATE clinicians SET subscription_status = 'canceled' WHERE id = '11111111-1111-1111-1111-111111111111';
SELECT test_login('22222222-2222-2222-2222-222222222222');
DO $$ BEGIN ASSERT current_plan() = 'starter', current_plan(); END $$;
RESET ROLE;
UPDATE clinicians SET subscription_status = 'active' WHERE id = '11111111-1111-1111-1111-111111111111';

-- Owner cannot leave or close while others remain; a member can leave and keeps their data
SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT expect_error($$SELECT remove_practice_member(auth.uid())$$, '%owner cannot leave%');
SELECT expect_error($$SELECT close_practice()$$, '%Remove all members%');
SELECT test_login('33333333-3333-3333-3333-333333333333');
SELECT expect_error($$SELECT remove_practice_member('22222222-2222-2222-2222-222222222222')$$, '%Member not found%');
SELECT test_login('22222222-2222-2222-2222-222222222222');
SELECT remove_practice_member(auth.uid());
SELECT expect_count($$SELECT 1 FROM clients$$, 1);
SELECT expect_count($$SELECT 1 FROM practices$$, 0);
SELECT test_login('11111111-1111-1111-1111-111111111111');
SELECT close_practice();
SELECT expect_count($$SELECT 1 FROM practices$$, 0);

-- MFA is required
SELECT test_login('11111111-1111-1111-1111-111111111111', 'aal1');
SELECT expect_error($$SELECT create_practice('Again')$$, '%Not authorised%');

RESET ROLE;
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM audit_log WHERE action IN ('PRACTICE_CREATED','PRACTICE_INVITE_SENT','PRACTICE_JOINED','PRACTICE_MEMBER_REMOVED','PRACTICE_CLOSED')) = 5,
    (SELECT string_agg(action, ',') FROM audit_log WHERE action LIKE 'PRACTICE%');
END $$;
ROLLBACK;
