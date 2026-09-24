-- Recreates the parts of a Supabase project that exist before our migrations:
-- API roles, the authenticator login used by PostgREST, and the auth schema
-- owned by GoTrue's admin role. Used only by the local integration stack.
-- Supabase installs extensions in the `extensions` schema.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE ROLE anon NOLOGIN NOINHERIT;
CREATE ROLE authenticated NOLOGIN NOINHERIT;
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
CREATE ROLE authenticator LOGIN PASSWORD 'authenticator' NOINHERIT;
GRANT anon, authenticated, service_role TO authenticator;

CREATE ROLE supabase_auth_admin LOGIN PASSWORD 'auth_admin' NOINHERIT CREATEROLE;
ALTER ROLE supabase_auth_admin SET search_path = auth;
CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin;
GRANT CREATE ON DATABASE CURRENT_DATABASE_PLACEHOLDER TO supabase_auth_admin;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Figma Make KV table exists on the live project outside migrations.
CREATE TABLE public.kv_store_4d1a502d (key text PRIMARY KEY, value jsonb NOT NULL);
