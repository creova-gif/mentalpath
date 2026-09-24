-- After GoTrue has created the auth schema: expose auth helpers to API roles,
-- as the Supabase platform does.
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role, postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role, postgres;
GRANT SELECT ON auth.users TO postgres;
