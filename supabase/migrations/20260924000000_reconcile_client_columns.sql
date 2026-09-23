-- ============================================================
-- MentalPath — Reconcile schema drift on clients
-- ============================================================
-- NewClientModal writes these columns, and the live project has them, but no
-- migration ever declared them. Declare them idempotently so a fresh project
-- built from migrations matches production.
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS session_type     TEXT,
  ADD COLUMN IF NOT EXISTS rate             NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS is_sliding_scale BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS intake_template  TEXT,
  ADD COLUMN IF NOT EXISTS cultural_tags    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS referral_source  TEXT;
