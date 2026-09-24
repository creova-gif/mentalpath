-- Effective plan, Starter client limit, webhook idempotency, AI usage metering.
BEGIN;
SELECT test_seed_users();

-- New signup: 7-day Solo trial
DO $$ BEGIN
  ASSERT (SELECT effective_plan(c) FROM clinicians c WHERE id = '11111111-1111-1111-1111-111111111111') = 'solo';
END $$;

-- Trial expired, no subscription → Starter (1 active client)
UPDATE clinicians SET trial_ends_at = now() - interval '1 day' WHERE id = '11111111-1111-1111-1111-111111111111';
SELECT test_login('11111111-1111-1111-1111-111111111111');
DO $$ BEGIN ASSERT current_plan() = 'starter'; END $$;
INSERT INTO clients (clinician_id, first_name, last_name) VALUES (auth.uid(), 'One', 'Client');
SELECT expect_error($$INSERT INTO clients (clinician_id, first_name, last_name) VALUES (auth.uid(), 'Two', 'Client')$$, '%Starter plan includes 1 active client%');
-- Waitlist / inactive clients don't count
INSERT INTO clients (clinician_id, first_name, last_name, status) VALUES (auth.uid(), 'Wait', 'Listed', 'waitlist');
SELECT expect_error($$UPDATE clients SET status = 'active' WHERE last_name = 'Listed'$$, '%Starter plan%');

-- Browser cannot grant itself a subscription
SELECT expect_error($$UPDATE clinicians SET subscription_status = 'active' WHERE id = auth.uid()$$, '%permission denied%');
SELECT expect_error($$UPDATE clinicians SET stripe_customer_id = 'cus_x' WHERE id = auth.uid()$$, '%permission denied%');
SELECT expect_error($$SELECT record_stripe_event('evt_1', 'x')$$, '%permission denied%');
SELECT expect_error($$SELECT consume_ai_assist(auth.uid(), 100)$$, '%permission denied%');

-- Webhook (service role) activates Solo → limit lifted
RESET ROLE;
SET ROLE service_role;
UPDATE clinicians SET subscription_status = 'active', plan_type = 'solo', is_trial = false
WHERE id = '11111111-1111-1111-1111-111111111111';
DO $$ BEGIN
  ASSERT record_stripe_event('evt_1', 'customer.subscription.updated') = true;
  ASSERT record_stripe_event('evt_1', 'customer.subscription.updated') = false, 'duplicate event ignored';
  ASSERT consume_ai_assist('11111111-1111-1111-1111-111111111111', 2) = 1;
  ASSERT consume_ai_assist('11111111-1111-1111-1111-111111111111', 2) = 0;
  ASSERT consume_ai_assist('11111111-1111-1111-1111-111111111111', 2) = -1, 'limit enforced';
  PERFORM refund_ai_assist('11111111-1111-1111-1111-111111111111');
  ASSERT consume_ai_assist('11111111-1111-1111-1111-111111111111', 2) = 0, 'refund restores one';
END $$;

RESET ROLE;
SELECT test_login('11111111-1111-1111-1111-111111111111');
INSERT INTO clients (clinician_id, first_name, last_name) VALUES (auth.uid(), 'Two', 'Client');
SELECT expect_count('SELECT 1 FROM ai_usage', 1);
SELECT expect_error($$UPDATE ai_usage SET used = 0$$, '%permission denied%');

-- Payment failed → past_due keeps Solo during Stripe's retry window
RESET ROLE;
UPDATE clinicians SET subscription_status = 'past_due' WHERE id = '11111111-1111-1111-1111-111111111111';
DO $$ BEGIN
  ASSERT (SELECT effective_plan(c) FROM clinicians c WHERE id = '11111111-1111-1111-1111-111111111111') = 'solo';
END $$;
-- Canceled → back to Starter
UPDATE clinicians SET subscription_status = 'canceled' WHERE id = '11111111-1111-1111-1111-111111111111';
DO $$ BEGIN
  ASSERT (SELECT effective_plan(c) FROM clinicians c WHERE id = '11111111-1111-1111-1111-111111111111') = 'starter';
END $$;
ROLLBACK;
