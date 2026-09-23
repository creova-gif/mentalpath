-- Minimal stand-in for the Supabase platform objects that our migrations and
-- RLS policies depend on, so the suite runs against plain Postgres in CI.
-- NOT a migration. Never run this against a Supabase project.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
  CREATE ROLE authenticated NOLOGIN;
  CREATE ROLE service_role NOLOGIN BYPASSRLS;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  raw_user_meta_data jsonb,
  encrypted_password text,
  banned_until timestamptz,
  updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS auth.sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid);

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(auth.jwt()->>'sub', '')::uuid
$$;

GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Figma Make KV table (created outside migrations on the live project)
CREATE TABLE IF NOT EXISTS public.kv_store_4d1a502d (key text PRIMARY KEY, value jsonb NOT NULL);

-- Test helper: act as a signed-in user with a given assurance level
CREATE OR REPLACE FUNCTION public.test_login(uid uuid, aal text DEFAULT 'aal2') RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated', 'aal', aal)::text, false);
  EXECUTE 'SET ROLE authenticated';
END $$;

-- Test helper: assert that a statement fails (optionally with a matching message)
CREATE OR REPLACE FUNCTION public.expect_error(stmt text, msg_like text DEFAULT '%') RETURNS void
LANGUAGE plpgsql AS $$
DECLARE failed boolean := false; msg text;
BEGIN
  BEGIN
    EXECUTE stmt;
  EXCEPTION WHEN others THEN
    failed := true; msg := SQLERRM;
  END;
  IF NOT failed THEN
    RAISE EXCEPTION 'expected error but statement succeeded: %', stmt;
  END IF;
  IF msg NOT LIKE msg_like THEN
    RAISE EXCEPTION 'unexpected error "%" for: %', msg, stmt;
  END IF;
END $$;

-- Test helper: assert a row count visible to the current role
CREATE OR REPLACE FUNCTION public.expect_count(q text, expected int) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE n int;
BEGIN
  EXECUTE format('SELECT count(*) FROM (%s) s', q) INTO n;
  IF n <> expected THEN
    RAISE EXCEPTION 'expected % rows, got % for: %', expected, n, q;
  END IF;
END $$;

-- Fixed test identities
CREATE OR REPLACE FUNCTION public.test_seed_users() RETURNS void LANGUAGE sql AS $$
  INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
    ('11111111-1111-1111-1111-111111111111', 'alice@test.local', '{"first_name":"Alice","last_name":"A","profession":"psychologist"}'),
    ('22222222-2222-2222-2222-222222222222', 'bob@test.local',   '{"first_name":"Bob","last_name":"B"}')
  ON CONFLICT DO NOTHING;
$$;
