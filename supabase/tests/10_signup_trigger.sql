-- New auth users get a clinicians row with server-controlled billing fields.
BEGIN;
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('33333333-3333-3333-3333-333333333333', 'carol@test.local',
   '{"first_name":"Carol","last_name":"C","profession":"slp","session_rate":"175","hst_exempt":"true",
     "is_trial":false,"plan_type":"group","trial_ends_at":"2999-01-01"}'),
  ('44444444-4444-4444-4444-444444444444', 'dave@test.local',
   '{"profession":"not-a-profession","session_rate":"abc; drop table x","hst_exempt":"maybe"}');

DO $$
DECLARE r record;
BEGIN
  SELECT * INTO r FROM clinicians WHERE id = '33333333-3333-3333-3333-333333333333';
  ASSERT r.first_name = 'Carol' AND r.profession = 'slp' AND r.session_rate = 175, 'profile fields copied';
  ASSERT r.is_trial AND r.plan_type = 'solo', 'billing fields must ignore metadata';
  ASSERT r.trial_ends_at BETWEEN now() + interval '6 days' AND now() + interval '8 days', '7-day trial';

  SELECT * INTO r FROM clinicians WHERE id = '44444444-4444-4444-4444-444444444444';
  ASSERT r.first_name = 'dave', 'falls back to email local part';
  ASSERT r.profession = 'psychotherapist', 'unknown profession defaults';
  ASSERT r.session_rate = 140 AND r.hst_exempt, 'invalid values default';
END $$;
ROLLBACK;
