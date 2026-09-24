-- ============================================================
-- MentalPath — Group practices (shared billing, separate clinical records)
-- ============================================================
-- A practice has one owner who pays for N seats (Stripe subscription on the
-- Group price with quantity = N). Members get the Group plan while the owner's
-- subscription is in good standing and the practice fits in its seats.
--
-- Clinical records stay per clinician: membership grants NO access to another
-- clinician's clients or notes (RLS is unchanged). The owner sees only
-- aggregate, non-clinical counts through practice_overview().

CREATE TABLE IF NOT EXISTS public.practices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  owner_id   UUID NOT NULL UNIQUE REFERENCES public.clinicians(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.practice_members (
  practice_id  UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL UNIQUE REFERENCES public.clinicians(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (practice_id, clinician_id)
);

CREATE TABLE IF NOT EXISTS public.practice_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  email       TEXT NOT NULL CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 320),
  token_hash  TEXT NOT NULL UNIQUE,
  invited_by  UUID REFERENCES public.clinicians(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + interval '14 days',
  accepted_at TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS practice_invites_open_email
  ON public.practice_invites (practice_id, email) WHERE accepted_at IS NULL AND revoked_at IS NULL;

ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_invites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.practices, public.practice_members, public.practice_invites FROM anon;
-- All writes go through the functions below.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.practices, public.practice_members, public.practice_invites FROM authenticated;
-- Invite token hashes are never readable by browsers.
REVOKE SELECT ON public.practice_invites FROM authenticated;
GRANT SELECT (id, practice_id, email, invited_by, created_at, expires_at, accepted_at, revoked_at)
  ON public.practice_invites TO authenticated;

CREATE OR REPLACE FUNCTION public.my_practice_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT practice_id FROM public.practice_members WHERE clinician_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.my_practice_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_practice_id() TO authenticated;

DROP POLICY IF EXISTS practices_select_member ON public.practices;
CREATE POLICY practices_select_member ON public.practices FOR SELECT TO authenticated
  USING (id = public.my_practice_id());
DROP POLICY IF EXISTS practice_members_select_member ON public.practice_members;
CREATE POLICY practice_members_select_member ON public.practice_members FOR SELECT TO authenticated
  USING (practice_id = public.my_practice_id());
DROP POLICY IF EXISTS practice_invites_select_owner ON public.practice_invites;
CREATE POLICY practice_invites_select_owner ON public.practice_invites FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.practices p WHERE p.id = practice_id AND p.owner_id = auth.uid()));

-- ── Entitlements ─────────────────────────────────────────────────────────────
-- Seats the practice pays for, or 0 if the owner's Group subscription is not
-- in good standing.
CREATE OR REPLACE FUNCTION public.practice_paid_seats(p_practice UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN o.subscription_status IN ('active', 'trialing', 'past_due') AND o.plan_type = 'group'
      THEN greatest(coalesce(o.plan_seats, 1), 1)
    ELSE 0 END
  FROM public.practices p JOIN public.clinicians o ON o.id = p.owner_id
  WHERE p.id = p_practice
$$;
REVOKE ALL ON FUNCTION public.practice_paid_seats(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.effective_plan(c public.clinicians)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN c.subscription_status IN ('active', 'trialing', 'past_due') THEN coalesce(c.plan_type, 'solo')
    WHEN EXISTS (
      SELECT 1 FROM public.practice_members m
      WHERE m.clinician_id = c.id
        AND (SELECT count(*) FROM public.practice_members x WHERE x.practice_id = m.practice_id)
            <= coalesce(public.practice_paid_seats(m.practice_id), 0)
    ) THEN 'group'
    WHEN c.is_trial AND c.trial_ends_at IS NOT NULL AND c.trial_ends_at > NOW() THEN 'solo'
    ELSE 'starter'
  END
$$;

-- ── Practice lifecycle ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.require_clinician()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.create_practice(p_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := private.require_clinician();
  pid UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.practice_members WHERE clinician_id = uid) THEN
    RAISE EXCEPTION 'You already belong to a practice' USING ERRCODE = 'unique_violation';
  END IF;
  INSERT INTO public.practices (name, owner_id) VALUES (trim(p_name), uid) RETURNING id INTO pid;
  INSERT INTO public.practice_members (practice_id, clinician_id, role) VALUES (pid, uid, 'owner');
  PERFORM public.write_audit('PRACTICE_CREATED', 'practices', pid, uid, NULL);
  RETURN pid;
END;
$$;

-- Returns the one-time invite token; only its SHA-256 is stored.
CREATE OR REPLACE FUNCTION public.invite_practice_member(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := private.require_clinician();
  pid UUID;
  token TEXT := encode(extensions.gen_random_bytes(24), 'hex');
  v_email TEXT := lower(trim(p_email));
  used INTEGER;
BEGIN
  SELECT id INTO pid FROM public.practices WHERE owner_id = uid;
  IF pid IS NULL THEN RAISE EXCEPTION 'Only the practice owner can invite' USING ERRCODE = 'insufficient_privilege'; END IF;
  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'Enter a valid email address' USING ERRCODE = 'check_violation'; END IF;

  SELECT (SELECT count(*) FROM public.practice_members WHERE practice_id = pid)
       + (SELECT count(*) FROM public.practice_invites
           WHERE practice_id = pid AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW())
    INTO used;
  IF used >= coalesce(public.practice_paid_seats(pid), 0) THEN
    RAISE EXCEPTION 'All paid seats are in use. Add seats from Billing first.'
      USING ERRCODE = 'check_violation', HINT = 'SEATS_FULL';
  END IF;

  UPDATE public.practice_invites SET revoked_at = NOW()
  WHERE practice_id = pid AND practice_invites.email = v_email AND accepted_at IS NULL AND revoked_at IS NULL;
  INSERT INTO public.practice_invites (practice_id, email, token_hash, invited_by)
  VALUES (pid, v_email, encode(extensions.digest(token, 'sha256'), 'hex'), uid);
  PERFORM public.write_audit('PRACTICE_INVITE_SENT', 'practice_invites', NULL, uid, NULL);
  RETURN token;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_practice_invite(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := private.require_clinician();
  inv public.practice_invites;
  members INTEGER;
BEGIN
  SELECT * INTO inv FROM public.practice_invites
  WHERE token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
  FOR UPDATE;
  IF inv.id IS NULL OR inv.accepted_at IS NOT NULL OR inv.revoked_at IS NOT NULL OR inv.expires_at <= NOW() THEN
    RAISE EXCEPTION 'This invitation is no longer valid' USING ERRCODE = 'no_data_found';
  END IF;
  IF lower(coalesce(auth.jwt()->>'email', '')) <> inv.email THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF EXISTS (SELECT 1 FROM public.practice_members WHERE clinician_id = uid) THEN
    RAISE EXCEPTION 'You already belong to a practice' USING ERRCODE = 'unique_violation';
  END IF;
  PERFORM 1 FROM public.practices WHERE id = inv.practice_id FOR UPDATE;
  SELECT count(*) INTO members FROM public.practice_members WHERE practice_id = inv.practice_id;
  IF members >= coalesce(public.practice_paid_seats(inv.practice_id), 0) THEN
    RAISE EXCEPTION 'This practice has no free seats' USING ERRCODE = 'check_violation', HINT = 'SEATS_FULL';
  END IF;

  INSERT INTO public.practice_members (practice_id, clinician_id) VALUES (inv.practice_id, uid);
  UPDATE public.practice_invites SET accepted_at = NOW() WHERE id = inv.id;
  PERFORM public.write_audit('PRACTICE_JOINED', 'practice_members', inv.practice_id, uid, NULL);
  RETURN inv.practice_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_practice_invite(p_invite UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid UUID := private.require_clinician();
BEGIN
  UPDATE public.practice_invites i SET revoked_at = NOW()
  FROM public.practices p
  WHERE i.id = p_invite AND p.id = i.practice_id AND p.owner_id = uid AND i.accepted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found' USING ERRCODE = 'no_data_found'; END IF;
END;
$$;

-- Owner removes a member, or a member leaves (p_clinician = self). The
-- member keeps their own clients and notes; only shared billing ends.
CREATE OR REPLACE FUNCTION public.remove_practice_member(p_clinician UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := private.require_clinician();
  pid UUID;
  owner UUID;
BEGIN
  SELECT m.practice_id, p.owner_id INTO pid, owner
  FROM public.practice_members m JOIN public.practices p ON p.id = m.practice_id
  WHERE m.clinician_id = p_clinician;
  IF pid IS NULL OR (uid <> owner AND uid <> p_clinician) THEN
    RAISE EXCEPTION 'Member not found' USING ERRCODE = 'no_data_found';
  END IF;
  IF p_clinician = owner THEN
    RAISE EXCEPTION 'The owner cannot leave; close the practice instead' USING ERRCODE = 'check_violation';
  END IF;
  DELETE FROM public.practice_members WHERE clinician_id = p_clinician;
  PERFORM public.write_audit('PRACTICE_MEMBER_REMOVED', 'practice_members', pid, uid, NULL);
END;
$$;

-- Owner closes the practice once no one else is in it.
CREATE OR REPLACE FUNCTION public.close_practice()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := private.require_clinician();
  pid UUID;
BEGIN
  SELECT id INTO pid FROM public.practices WHERE owner_id = uid;
  IF pid IS NULL THEN RAISE EXCEPTION 'Practice not found' USING ERRCODE = 'no_data_found'; END IF;
  IF EXISTS (SELECT 1 FROM public.practice_members WHERE practice_id = pid AND clinician_id <> uid) THEN
    RAISE EXCEPTION 'Remove all members before closing the practice' USING ERRCODE = 'check_violation';
  END IF;
  DELETE FROM public.practices WHERE id = pid;
  PERFORM public.write_audit('PRACTICE_CLOSED', 'practices', pid, uid, NULL);
END;
$$;

-- Owner dashboard: aggregate operational counts only. No client names, no
-- note content, no per-client data.
CREATE OR REPLACE FUNCTION public.practice_overview()
RETURNS TABLE (
  clinician_id UUID, first_name TEXT, last_name TEXT, profession TEXT, role TEXT, joined_at TIMESTAMPTZ,
  active_clients BIGINT, sessions_this_month BIGINT, unsigned_notes BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := private.require_clinician();
  pid UUID;
BEGIN
  SELECT id INTO pid FROM public.practices WHERE owner_id = uid;
  IF pid IS NULL THEN RAISE EXCEPTION 'Only the practice owner can view this' USING ERRCODE = 'insufficient_privilege'; END IF;
  RETURN QUERY
    SELECT m.clinician_id, k.first_name, k.last_name, k.profession, m.role, m.joined_at,
      (SELECT count(*) FROM public.clients c WHERE c.clinician_id = m.clinician_id AND coalesce(c.status, 'active') = 'active'),
      (SELECT count(*) FROM public.session_notes n WHERE n.clinician_id = m.clinician_id
         AND n.session_date >= date_trunc('month', current_date)),
      (SELECT count(*) FROM public.session_notes n WHERE n.clinician_id = m.clinician_id AND NOT n.is_locked)
    FROM public.practice_members m JOIN public.clinicians k ON k.id = m.clinician_id
    WHERE m.practice_id = pid
    ORDER BY m.role DESC, m.joined_at;
END;
$$;

-- Seats for the owner's billing screen.
CREATE OR REPLACE FUNCTION public.my_practice_seats()
RETURNS TABLE (paid INTEGER, used INTEGER, pending INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(public.practice_paid_seats(p.id), 0),
         (SELECT count(*)::int FROM public.practice_members WHERE practice_id = p.id),
         (SELECT count(*)::int FROM public.practice_invites
           WHERE practice_id = p.id AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW())
  FROM public.practices p WHERE p.id = public.my_practice_id()
$$;

DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.create_practice(TEXT)', 'public.invite_practice_member(TEXT)', 'public.accept_practice_invite(TEXT)',
    'public.revoke_practice_invite(UUID)', 'public.remove_practice_member(UUID)', 'public.close_practice()',
    'public.practice_overview()', 'public.my_practice_seats()'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION private.require_clinician() FROM PUBLIC, anon, authenticated;
