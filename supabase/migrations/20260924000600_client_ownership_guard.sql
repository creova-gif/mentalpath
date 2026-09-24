-- ============================================================
-- MentalPath — Cross-tenant reference guard
-- ============================================================
-- RLS checks the row's own clinician_id, but a foreign key to clients(id)
-- would still accept ANOTHER clinician's client id (FK checks bypass RLS).
-- That would let a clinician attach notes/appointments/invoices to — and
-- probe the existence of — someone else's client. Enforce same-owner here.
CREATE OR REPLACE FUNCTION public.enforce_same_owner_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS NULL THEN RETURN NEW; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.clients c WHERE c.id = NEW.client_id AND c.clinician_id = NEW.clinician_id
  ) THEN
    RAISE EXCEPTION 'Client not found' USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['session_notes','appointments','invoices']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS enforce_same_owner_client ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER enforce_same_owner_client BEFORE INSERT OR UPDATE OF client_id, clinician_id ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.enforce_same_owner_client()', t);
  END LOOP;
END $$;
