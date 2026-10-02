-- Per-practice data keys for session-note envelope encryption.
-- wrapped_dek is AES-GCM ciphertext under NOTE_MASTER_KEY (or, later, a KMS key).
-- practice_id is the clinician auth user id until a practices table exists.
-- A group practice must share one row. Do not copy data keys per seat.
-- Clients cannot read or write this table. The edge function uses the service role.

CREATE TABLE IF NOT EXISTS public.practice_data_keys (
  practice_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wrapped_dek TEXT NOT NULL CHECK (char_length(wrapped_dek) > 0),
  kek_id TEXT NOT NULL CHECK (char_length(kek_id) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.practice_data_keys ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_practice_data_keys_updated_at ON public.practice_data_keys;
CREATE TRIGGER set_practice_data_keys_updated_at
  BEFORE UPDATE ON public.practice_data_keys
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

REVOKE ALL ON TABLE public.practice_data_keys FROM anon, authenticated;
GRANT ALL ON TABLE public.practice_data_keys TO service_role;
