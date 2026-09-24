-- ============================================================
-- MentalPath — Invoice numbering, status and paid timestamps
-- ============================================================
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

DO $$ BEGIN
  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_status_valid CHECK (status IN ('pending', 'paid', 'overdue', 'void')) NOT VALID;
  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_amount_valid CHECK (amount >= 0 AND amount <= 99999) NOT VALID;
  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_sessions_valid CHECK (sessions BETWEEN 1 AND 100) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sequential per-clinician invoice numbers assigned by the server (the browser
-- used to guess max+1, which raced and could duplicate numbers).
CREATE OR REPLACE FUNCTION public.invoices_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_no INTEGER;
BEGIN
  IF TG_OP = 'INSERT' AND coalesce(NEW.invoice_number, '') = '' THEN
    PERFORM pg_advisory_xact_lock(hashtext('invoice_no:' || NEW.clinician_id::text));
    SELECT coalesce(max(substring(invoice_number FROM '^INV-(\d+)$')::int), 0) + 1 INTO next_no
    FROM public.invoices WHERE clinician_id = NEW.clinician_id;
    NEW.invoice_number := 'INV-' || lpad(next_no::text, 4, '0');
  END IF;

  IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'paid') THEN
    NEW.paid_at := NOW();
  ELSIF NEW.status <> 'paid' THEN
    NEW.paid_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_before_write ON public.invoices;
CREATE TRIGGER invoices_before_write
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_before_write();
