-- ============================================================
-- MentalPath — Envelope encryption for session-note content (ADR 0001, option B)
-- ============================================================
-- Each clinician has a random 256-bit data key (DEK). DEKs are stored only
-- wrapped (encrypted) by a master key held in Supabase Vault. Note sections are
-- encrypted with the clinician's DEK (pgcrypto, AES-256, armored) and are
-- written and read ONLY through SECURITY DEFINER functions:
--   save_session_note()  lock_session_note()  get_session_note()
-- A database dump, backup or SQL-level read of session_notes yields ciphertext.
--
-- enc_version: 0 = plaintext (Sep 2026 interim), 1 = legacy browser scheme
--              (re-encrypt with scripts/reencrypt-legacy-notes.mjs), 2 = envelope.

CREATE SCHEMA IF NOT EXISTS private;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

-- ── Maintenance bypass for the locked-note trigger ───────────────────────────
-- Only trusted code (migrations, the retention job, the service-role
-- maintenance functions below) may rewrite or purge a locked note. It does so by
-- setting the transaction-local GUC `mentalpath.maintenance` to a random token
-- that lives in private.app_settings, which browser roles cannot read, and
-- set_maintenance() is callable only from those trusted definer functions.
INSERT INTO private.app_settings (key, value)
VALUES ('maintenance_token', encode(extensions.gen_random_bytes(24), 'hex'))
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION private.maintenance_mode()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private
AS $$
  SELECT coalesce(current_setting('mentalpath.maintenance', true), '') <> ''
     AND current_setting('mentalpath.maintenance', true)
         = (SELECT value FROM private.app_settings WHERE key = 'maintenance_token')
$$;

CREATE OR REPLACE FUNCTION private.set_maintenance(p_on boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = private
AS $$
  SELECT set_config('mentalpath.maintenance',
    CASE WHEN p_on THEN (SELECT value FROM private.app_settings WHERE key = 'maintenance_token') ELSE '' END,
    true);
$$;

CREATE OR REPLACE FUNCTION public.session_notes_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_locked AND NOT private.maintenance_mode() THEN
      RAISE EXCEPTION 'Locked session notes cannot be deleted' USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_locked THEN
    IF private.maintenance_mode() THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Locked session notes cannot be modified; add an amendment instead'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.session_number IS NULL AND NEW.client_id IS NOT NULL THEN
      SELECT count(*) + 1 INTO NEW.session_number
      FROM public.session_notes WHERE client_id = NEW.client_id;
    END IF;
    NEW.locked_at := NULL;
  END IF;

  IF NEW.is_locked THEN
    NEW.locked_at := NOW();
    NEW.is_draft := FALSE;
  ELSE
    NEW.locked_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- ── Key hierarchy ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS private.clinician_keys (
  clinician_id UUID PRIMARY KEY REFERENCES public.clinicians(id) ON DELETE RESTRICT,
  wrapped_dek  BYTEA NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rewrapped_at TIMESTAMPTZ
);

-- Master key: Supabase Vault in real projects. Plain Postgres (CI, local stack)
-- has no Vault, so a generated key in private.app_settings stands in.
CREATE TABLE IF NOT EXISTS private.app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

DO $$
BEGIN
  IF to_regclass('vault.decrypted_secrets') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'mentalpath_note_master_key') THEN
      PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'mentalpath_note_master_key',
        'Wraps per-clinician session-note data keys (ADR 0001)');
    END IF;
  ELSE
    INSERT INTO private.app_settings (key, value)
    VALUES ('note_master_key', encode(extensions.gen_random_bytes(32), 'hex'))
    ON CONFLICT (key) DO NOTHING;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION private.master_key()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE k TEXT;
BEGIN
  IF to_regclass('vault.decrypted_secrets') IS NOT NULL THEN
    EXECUTE 'SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = $1'
      INTO k USING 'mentalpath_note_master_key';
  ELSE
    SELECT value INTO k FROM private.app_settings WHERE key = 'note_master_key';
  END IF;
  IF k IS NULL THEN RAISE EXCEPTION 'Note master key is not configured'; END IF;
  RETURN k;
END;
$$;

-- Returns the clinician's DEK (hex), creating it on first use.
CREATE OR REPLACE FUNCTION private.clinician_dek(p_clinician UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
  wrapped BYTEA;
BEGIN
  SELECT wrapped_dek INTO wrapped FROM private.clinician_keys WHERE clinician_id = p_clinician;
  IF wrapped IS NULL THEN
    INSERT INTO private.clinician_keys (clinician_id, wrapped_dek)
    VALUES (p_clinician, extensions.pgp_sym_encrypt_bytea(extensions.gen_random_bytes(32), private.master_key(), 'cipher-algo=aes256'))
    ON CONFLICT (clinician_id) DO NOTHING;
    SELECT wrapped_dek INTO wrapped FROM private.clinician_keys WHERE clinician_id = p_clinician;
  END IF;
  RETURN encode(extensions.pgp_sym_decrypt_bytea(wrapped, private.master_key()), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION private.encrypt_section(p_dek TEXT, p_text TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p_text IS NULL OR p_text = '' THEN NULL
    ELSE extensions.armor(extensions.pgp_sym_encrypt(p_text, p_dek, 'cipher-algo=aes256, compress-algo=1')) END
$$;

CREATE OR REPLACE FUNCTION private.decrypt_section(p_dek TEXT, p_cipher TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p_cipher IS NULL THEN NULL ELSE extensions.pgp_sym_decrypt(extensions.dearmor(p_cipher), p_dek) END
$$;

-- Master-key rotation: re-wraps every DEK (note ciphertext is untouched).
--   SELECT private.rewrap_all_deks('<old hex>', '<new hex>');  -- then update Vault
CREATE OR REPLACE FUNCTION private.rewrap_all_deks(p_old TEXT, p_new TEXT)
RETURNS INTEGER
LANGUAGE sql
AS $$
  WITH r AS (
    UPDATE private.clinician_keys
    SET wrapped_dek = extensions.pgp_sym_encrypt_bytea(extensions.pgp_sym_decrypt_bytea(wrapped_dek, p_old), p_new, 'cipher-algo=aes256'),
        rewrapped_at = NOW()
    RETURNING 1
  ) SELECT count(*)::int FROM r
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon, authenticated;

-- ── Browser access: metadata only; content only through the functions ─────────
REVOKE INSERT, UPDATE ON public.session_notes FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_session_note(
  p_note_id UUID, p_client_id UUID, p_session_date DATE, p_session_type TEXT,
  p_duration_minutes INTEGER, p_note_format TEXT, p_ai_used BOOLEAN,
  p_section_1 TEXT, p_section_2 TEXT, p_section_3 TEXT, p_section_4 TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  dek TEXT;
  nid UUID;
BEGIN
  IF uid IS NULL OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = 'insufficient_privilege';
  END IF;
  p_note_format := lower(p_note_format);
  IF p_note_format IS NULL OR p_note_format NOT IN ('dap', 'soap', 'birp', 'progress') THEN
    RAISE EXCEPTION 'Unknown note format' USING ERRCODE = 'check_violation';
  END IF;
  IF coalesce(length(p_section_1), 0) + coalesce(length(p_section_2), 0)
     + coalesce(length(p_section_3), 0) + coalesce(length(p_section_4), 0) > 100000 THEN
    RAISE EXCEPTION 'Note is too long' USING ERRCODE = 'check_violation';
  END IF;
  dek := private.clinician_dek(uid);

  IF p_note_id IS NULL THEN
    INSERT INTO public.session_notes (
      clinician_id, client_id, session_date, session_type, duration_minutes, note_format,
      section_1, section_2, section_3, section_4, ai_used, enc_version, is_draft, is_locked
    ) VALUES (
      uid, p_client_id, p_session_date, p_session_type, p_duration_minutes, p_note_format,
      private.encrypt_section(dek, p_section_1), private.encrypt_section(dek, p_section_2),
      private.encrypt_section(dek, p_section_3), private.encrypt_section(dek, p_section_4),
      coalesce(p_ai_used, FALSE), 2, TRUE, FALSE
    ) RETURNING id INTO nid;
  ELSE
    UPDATE public.session_notes SET
      client_id = p_client_id, session_date = p_session_date, session_type = p_session_type,
      duration_minutes = p_duration_minutes, note_format = p_note_format,
      section_1 = private.encrypt_section(dek, p_section_1), section_2 = private.encrypt_section(dek, p_section_2),
      section_3 = private.encrypt_section(dek, p_section_3), section_4 = private.encrypt_section(dek, p_section_4),
      ai_used = coalesce(p_ai_used, FALSE), enc_version = 2
    WHERE id = p_note_id AND clinician_id = uid
    RETURNING id INTO nid;
    IF nid IS NULL THEN
      RAISE EXCEPTION 'Note not found' USING ERRCODE = 'no_data_found';
    END IF;
  END IF;
  RETURN nid;
END;
$$;

CREATE OR REPLACE FUNCTION public.lock_session_note(p_note_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = 'insufficient_privilege';
  END IF;
  UPDATE public.session_notes SET is_locked = TRUE
  WHERE id = p_note_id AND clinician_id = auth.uid() AND NOT is_locked;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Note not found or already locked' USING ERRCODE = 'no_data_found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_session_note(p_note_id UUID)
RETURNS TABLE (
  id UUID, client_id UUID, session_date DATE, session_type TEXT, duration_minutes INTEGER,
  note_format TEXT, section_1 TEXT, section_2 TEXT, section_3 TEXT, section_4 TEXT,
  ai_used BOOLEAN, is_draft BOOLEAN, is_locked BOOLEAN, locked_at TIMESTAMPTZ,
  session_number INTEGER, enc_version SMALLINT, updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dek TEXT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = 'insufficient_privilege';
  END IF;
  dek := private.clinician_dek(auth.uid());

  RETURN QUERY
    SELECT n.id, n.client_id, n.session_date, n.session_type, n.duration_minutes, n.note_format,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_1) ELSE n.section_1 END,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_2) ELSE n.section_2 END,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_3) ELSE n.section_3 END,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_4) ELSE n.section_4 END,
      n.ai_used, n.is_draft, n.is_locked, n.locked_at, n.session_number, n.enc_version, n.updated_at
    FROM public.session_notes n
    WHERE n.id = p_note_id AND n.clinician_id = auth.uid();

  IF FOUND THEN
    PERFORM public.write_audit('NOTE_ACCESSED', 'session_notes', p_note_id, auth.uid(), NULL);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.save_session_note(UUID, UUID, DATE, TEXT, INTEGER, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lock_session_note(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_session_note(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_session_note(UUID, UUID, DATE, TEXT, INTEGER, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lock_session_note(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_session_note(UUID) TO authenticated;

-- ── Service-role helpers: data export and legacy re-encryption ───────────────
CREATE OR REPLACE FUNCTION public.export_session_notes(p_clinician UUID)
RETURNS TABLE (
  id UUID, client_id UUID, session_date DATE, session_type TEXT, duration_minutes INTEGER,
  note_format TEXT, section_1 TEXT, section_2 TEXT, section_3 TEXT, section_4 TEXT,
  ai_used BOOLEAN, is_locked BOOLEAN, locked_at TIMESTAMPTZ, session_number INTEGER,
  enc_version SMALLINT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE dek TEXT := private.clinician_dek(p_clinician);
BEGIN
  RETURN QUERY
    SELECT n.id, n.client_id, n.session_date, n.session_type, n.duration_minutes, n.note_format,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_1) ELSE n.section_1 END,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_2) ELSE n.section_2 END,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_3) ELSE n.section_3 END,
      CASE WHEN n.enc_version = 2 THEN private.decrypt_section(dek, n.section_4) ELSE n.section_4 END,
      n.ai_used, n.is_locked, n.locked_at, n.session_number, n.enc_version, n.created_at, n.updated_at
    FROM public.session_notes n WHERE n.clinician_id = p_clinician ORDER BY n.session_date;
END;
$$;

-- Re-encrypts one legacy (enc_version 1) note with plaintext recovered by
-- scripts/reencrypt-legacy-notes.mjs. Works on locked notes (maintenance mode).
CREATE OR REPLACE FUNCTION public.reencrypt_legacy_note(
  p_note_id UUID, p_section_1 TEXT, p_section_2 TEXT, p_section_3 TEXT, p_section_4 TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner UUID;
  dek TEXT;
BEGIN
  SELECT clinician_id INTO owner FROM public.session_notes WHERE id = p_note_id AND enc_version = 1;
  IF owner IS NULL THEN RAISE EXCEPTION 'Not a legacy note'; END IF;
  dek := private.clinician_dek(owner);
  PERFORM private.set_maintenance(true);
  UPDATE public.session_notes SET
    section_1 = private.encrypt_section(dek, p_section_1), section_2 = private.encrypt_section(dek, p_section_2),
    section_3 = private.encrypt_section(dek, p_section_3), section_4 = private.encrypt_section(dek, p_section_4),
    enc_version = 2
  WHERE id = p_note_id;
  PERFORM private.set_maintenance(false);
END;
$$;

REVOKE ALL ON FUNCTION public.export_session_notes(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reencrypt_legacy_note(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.export_session_notes(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.reencrypt_legacy_note(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- ── Encrypt interim plaintext notes (enc_version 0) in place ─────────────────
DO $$
DECLARE r RECORD; dek TEXT;
BEGIN
  PERFORM private.set_maintenance(true);
  FOR r IN SELECT id, clinician_id FROM public.session_notes WHERE enc_version = 0 LOOP
    dek := private.clinician_dek(r.clinician_id);
    UPDATE public.session_notes SET
      section_1 = private.encrypt_section(dek, section_1), section_2 = private.encrypt_section(dek, section_2),
      section_3 = private.encrypt_section(dek, section_3), section_4 = private.encrypt_section(dek, section_4),
      enc_version = 2
    WHERE id = r.id;
  END LOOP;
  PERFORM private.set_maintenance(false);
END $$;
