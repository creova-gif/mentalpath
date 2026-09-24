-- ============================================================
-- MentalPath — Account closure and contact messages
-- ============================================================
-- Clinical records have College-mandated retention periods (often 10 years
-- after last contact, longer for minors), so account "deletion" closes the
-- account and records when it was requested; purging after retention is an
-- operational job (docs/privacy/data-retention.md).
ALTER TABLE public.clinicians
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email      TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  subject    TEXT CHECK (char_length(subject) <= 200),
  message    TEXT NOT NULL CHECK (char_length(message) BETWEEN 5 AND 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Written only by the contact Edge Function (service role); never readable from browsers.
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_messages FROM anon, authenticated;
