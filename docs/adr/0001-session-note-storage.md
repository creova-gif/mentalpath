# ADR 0001 — How session-note content is stored and protected

- **Status:** Accepted (2026-09-24)
- **Context source:** `docs/audits/2026-09-23-goal-audit.md` finding P0-3 / A04

## Context

Session notes were "encrypted" in the browser with AES-GCM using a key derived
(PBKDF2) from the clinician's user id and a fixed salt. The user id is stored
in the same row (`clinician_id`) and appears in every access token, so anyone
with database read access could decrypt every note. The scheme added
complexity and a false sense of security while protecting nothing. Failed
decryption silently showed a placeholder string (fail-open).

Real options considered:

| Option | Protects against | Cost / risk |
|---|---|---|
| A. Plain text + database controls | Other tenants (RLS), stolen passwords (MFA/AAL2 RLS), casual API scraping (column privileges + audited read function), disk/backup theft (Supabase AES-256 at rest) | Supabase staff/service-role key holders can read notes |
| B. Server-side envelope encryption (per-clinician data keys wrapped by a KMS key; decrypt only in an Edge Function) | Adds protection against DB dump / SQL-level compromise | KMS integration, key rotation, search impossible, every read via Edge Function; weeks of work |
| C. True end-to-end encryption (key derived from a clinician secret the server never sees) | Also protects against the operator | Lost secret = lost clinical record (unacceptable under College record-retention duties); no server-side AI, export, or support |

## Decision

Adopt **A now**, and plan **B** before onboarding group practices or storing
more than pilot volumes:

1. New notes are stored as text (`enc_version = 0`).
2. Clinical data requires an MFA-verified (AAL2) session, enforced by
   RESTRICTIVE RLS policies, not only by the UI.
3. Browser roles cannot `SELECT` note content columns. Content is returned only
   by `get_session_note()`, which checks ownership + AAL2 and writes a
   `NOTE_ACCESSED` audit row.
4. All inserts/updates/deletes on clinical tables are audited by trigger
   (column names only — never values).
5. Existing rows written by the retired scheme are marked `enc_version = 1` and
   are decrypted read-only in the browser (`legacyDecrypt`). Saving such a draft
   rewrites it as `enc_version = 0`. Decryption failure is shown as an error,
   never as note text.

## Consequences

- Marketing and README must not claim "therapist-specific encryption keys".
- Option B is tracked as a follow-up; it will change `get_session_note()` into
  an Edge Function and add a `note_keys` table.
