# ADR 0001 — How session-note content is stored and protected

- **Status:** Accepted (2026-09-24); amended 2026-09-25 — option B implemented
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

## Amendment (2026-09-25): option B implemented in the database

Migration `20260925000100_note_envelope_encryption.sql`:

1. Each clinician gets a random 256-bit data key (DEK) in
   `private.clinician_keys`, stored only wrapped (pgcrypto, AES-256) by a master
   key held in Supabase Vault (`mentalpath_note_master_key`).
2. Note sections are encrypted with the clinician's DEK (`enc_version = 2`).
   A dump, backup, replica or SQL read of `session_notes` yields PGP ciphertext.
3. Browser roles have no INSERT/UPDATE on `session_notes`. Writes go through
   `save_session_note()` / `lock_session_note()`; reads through the audited
   `get_session_note()`. All require AAL2 and ownership.
4. Interim plaintext rows (`enc_version = 0`) are encrypted by the migration.
   Legacy browser rows (`enc_version = 1`) are migrated by
   `scripts/reencrypt-legacy-notes.mjs` via the service-role-only
   `reencrypt_legacy_note()`.
5. The locked-note trigger can be bypassed only by trusted definer functions
   holding a per-database maintenance token (re-encryption, retention purge).
6. Master-key rotation: `private.rewrap_all_deks(old, new)`; note ciphertext
   does not change.

Decryption happens inside Postgres rather than an Edge Function: the master
key never leaves the database, and the threat addressed (dumps, backups, SQL
read access to tables) is covered. It does not protect against an attacker with
superuser access to the live database — documented as residual risk in the PIA.

Verified by `supabase/tests/14_clinical_record_integrity.sql` (ciphertext at
rest, export role, maintenance bypass not reachable) and the integration suite
(`supabase/integration/app.test.mjs`, real PostgREST).

## Consequences

- Marketing may say "notes are encrypted at rest with a per-clinician key";
  it must not claim end-to-end encryption.
- Losing the Vault master key makes notes unrecoverable: it is backed up per
  DEPLOYMENT.md.
- Full-text search over note content is not possible in SQL.
