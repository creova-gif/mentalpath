# Privacy Impact Assessment (PIA) — MentalPath

**Status:** Draft for review by privacy counsel · **Version:** 0.1 (2026-09-24)
**Scope:** MentalPath web application, Supabase backend, Edge Functions, and third-party processors as of commit on branch `claude/goal-audit-1fv67r`.
**Framework:** Ontario PHIPA (MentalPath acts as an *agent / electronic service provider* to each clinician-custodian), PIPEDA (clinician account data), Quebec Law 25 where Quebec clinicians are onboarded.

> This document describes what the code does. It is not legal advice and does not certify compliance. Items marked **Open** must be resolved before real client data is stored.

## 1. Roles

| Party | Role |
|---|---|
| Clinician (account holder) | Health information custodian (PHIPA s.3) for their clients' records |
| MentalPath | Agent / electronic service provider to the custodian (PHIPA s.10(4), O. Reg. 329/04 s.6) for PHI; controller for clinician account & billing data |
| Supabase (AWS ca-central-1) | Subprocessor — database, auth, Edge Functions |
| Anthropic | Subprocessor — AI Note Assist (opt-in only) |
| Stripe | Independent controller/processor for payment data (no PHI) |
| Sentry, PostHog (optional) | Subprocessors — error monitoring and product analytics (configured to exclude PHI) |

## 2. Data inventory

| Data | Where | Who can access | Retention |
|---|---|---|---|
| Client demographics (name, contact, DOB, pronouns, cultural tags) | `clients` (Postgres, ca-central-1) | Owning clinician only (RLS + MFA/AAL2) | See §5 |
| Session notes & amendments | `session_notes`, `session_note_amendments` | Owning clinician; content only via audited `get_session_note()` | See §5; locked notes immutable |
| Appointments, invoices | `appointments`, `invoices` | Owning clinician | See §5 |
| Audit log (actions, column names, IP) | `audit_log` | Owning clinician (read-only); written only by DB triggers/service role | Retained with the record set |
| Clinician profile & billing status | `clinicians` | Clinician (profile columns); billing columns service-role only | Life of account + 7 years (tax) |
| Payment card data | Stripe only | Stripe | Stripe's policy |
| AI Assist request text | Transient; sent to Anthropic | Anthropic per its commercial terms | **Open:** confirm zero-data-retention / no-training terms in writing |
| Contact form messages | `contact_messages` | Service role only | 2 years (**Open:** automate) |

## 3. Data flows that leave Canada

| Flow | Trigger | Mitigation | Status |
|---|---|---|---|
| Note text → Anthropic (US) | Clinician clicks AI Assist after explicit opt-in | Off by default; disclosure dialog; identifier scrubbing (email, phone, health card, SIN, postal code, dated DOBs); metering; audit row `AI_ASSIST_USED` | **Open:** DPA/zero-retention agreement; evaluate Canadian-region model hosting |
| Error events → Sentry | Frontend error | No replay, no PII, URLs reduced to route templates, request bodies/headers stripped | **Open:** choose DSN region; set only after DPA |
| Product events → PostHog | Allow-listed events only | No autocapture, no session recording, masked text, no IP, IDs scrubbed, EU host default | **Open:** choose region/self-host; set only after DPA |
| Payments → Stripe | Checkout | No PHI sent; clinician email + UUID only | Accepted |

## 4. Safeguards implemented (technical)

- Row-level security on every clinical table, scoped to `auth.uid()`; cross-tenant client references blocked by trigger.
- MFA (TOTP) required: RESTRICTIVE RLS policies require AAL2 for clinical tables and the note-content function.
- Column privileges: browsers cannot write billing/entitlement columns or read note content directly.
- Locked notes immutable (update/delete rejected); corrections via append-only amendments.
- Audit trail written by triggers (column names, never values) and on every note-content read.
- 15-minute inactivity sign-out; no PHI in browser storage (legacy drafts purged).
- Security headers and per-IP rate limiting on the API; strict CORS allowlist in production.
- Automated tests: SQL security suite (RLS, MFA, tenant isolation, immutability), Playwright E2E, axe accessibility checks.

## 5. Retention and deletion

- Clinical records must be kept for the period required by each clinician's College (commonly ≥10 years after last contact, longer for minors).
- Account closure blocks sign-in immediately and records `deletion_requested_at`; records are **not** deleted until retention ends.
- `private.purge_expired_records()` (migration `20260925000200_retention_purge.sql`, nightly via pg_cron) destroys each client's record set once `client_retention_until()` has passed: 10 years after the last contact (note, past appointment or invoice) or 10 years after the client's 18th birthday, whichever is later. It covers notes, amendments, appointments, intake forms and invoices. The date is shown on the client profile.
- A closed account is removed (auth user, profile, data key) 30 days after closure once it holds no client records. The closure screen prompts the clinician to export first.
- Operational data: contact messages and AI usage counters 2 years; Stripe event ids 400 days; audit rows 10 years. Each run logs counts only (`private.retention_runs`). Tested in `supabase/tests/17_retention_purge.sql`.
- Clinicians can export all their data at any time (Settings → Danger zone), recorded as `DATA_EXPORTED`.

## 6. Individual rights (clients of clinicians)

Clients exercise access/correction rights through their clinician (the custodian). MentalPath supports this with the JSON export and amendments. **Open:** per-client export (PDF) for access requests.

## 7. Breach management

- Clinician-facing guidance is in the app (Privacy & Audit → "If a privacy breach happens").
- **Open:** internal incident response runbook (detection sources, 24h triage, custodian notification SLA, IPC reporting support).

## 8. Open items before production data

1. Signed agreements (DPA / BAA-equivalent, zero data retention) with Anthropic, Supabase, and any enabled telemetry vendor.
2. Privacy policy and terms of service reviewed by counsel (current `/privacy` page is a factual summary).
3. ~~Retention purge job and contact-message retention automation~~ — done 2026-09-25 (§5). Confirm pg_cron is enabled on the production project.
4. Incident response runbook and contact (privacy@mentalpath.ca) staffed.
5. ~~Application-level encryption with managed keys (ADR 0001, option B)~~ — done 2026-09-25: note content is encrypted at rest with per-clinician keys wrapped by a Vault master key. Residual risk: an attacker with superuser access to the live database can still decrypt. Back up the master key (DEPLOYMENT.md).
6. Quebec Law 25: privacy officer designation, PIA for transfers outside Quebec, French-language notices across the app.
