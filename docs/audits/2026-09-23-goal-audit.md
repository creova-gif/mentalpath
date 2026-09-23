# MentalPath — Goal Audit (Production-Readiness)

**Date:** 2026-09-23 · **Branch audited:** `main` @ `5c7a826` · **Mode:** AUDIT (Web App framework) + AUDIT (SaaS framework), with Architecture Reconstruction (04) and Code Quality (05) applied
**Method:** Direct repo evidence only: source, SQL, edge functions, config. Also ran `npm ci`, `tsc`, `vite build` and `npm audit` locally. Each finding says whether it was **Verified** (seen in the repo or reproduced) or **Not Verified** (needs the live Supabase, Stripe or Anthropic environment).
**Discipline:** FACT → OBSERVATION → RISK → RECOMMENDATION.

---

## 1. Executive Summary

MentalPath has strong positioning: Canadian, PHIPA-aware, and multi-profession, with a large and polished UI surface (46 pages, EN/FR). The data layer has a sound foundation: Postgres with RLS on every table, keyed to `auth.uid()`. The database also lives in `ca-central-1`.

**The product is not launch-ready, and the repo's own `LAUNCH_AUDIT_REPORT.md` ("READY TO LAUNCH") should be retired.** Three problems block launch:

1. **Four of the five money and identity paths are broken or bypassable.**
   - Signup doesn't create an account.
   - Checkout calls an endpoint that doesn't exist.
   - The Stripe webhook is never deployed, and it writes to a table that doesn't exist.
   - Any logged-in user can grant themselves a paid plan with one API call.
   - The one path that works is login, and it ships a hard-coded demo password in the production bundle.
2. **The PHI protections that marketing claims are not real in code.**
   - Session-note "encryption" uses a key derived from the user's public UUID.
   - Drafts of clinical notes are written to `localStorage` in plaintext.
   - Note text is sent to a US AI provider, even though the README says "no client PII".
   - "Locked" notes can still be edited through the API.
3. **Most of the product runs on mock data.** Messages, Calendar, Overview, Client Portal, Outcome Measures, Group Practice and others have no backend. Only Clients, Session Notes and Billing touch the database.

**Production-readiness: 3.1 / 10.** Recommendation: **Do not launch.** Do a 4–6 week hardening sprint on the P0 list in §15, then re-audit. The UI is ahead of the platform. The work that remains is backend truth, not design.

---

## 2. Product Overview & Classification

| Dimension | Finding |
|---|---|
| Product | Practice management for Canadian regulated health practitioners: clients, clinical notes, invoicing, calendar, messaging, client portal, AI note drafting |
| Classifications (Product Eng. §3) | **Web Application** + **SaaS Platform** + **Regulated / Compliance-Heavy** (PHIPA, PIPEDA, provincial College record-keeping) + partially **AI-Native** (AI Note Assist is a headline feature) |
| SaaS audience / scope | B2B (prosumer: solo and small-group clinicians), **vertical** |
| Growth motion | Product-led, self-serve. Correct for this price point ($0 / $49 / $79 per month) and a buyer who is also the user |
| Deployment | Multi-tenant, shared schema, RLS isolation per clinician |
| Stage | Pre-revenue. No working signup or payment path exists (see §6, §7) |

**Classification mismatch (Web App §2, a flagged "expensive mismatch").** The app sells a **Group Practice** tier (per-seat, multi-clinician), but the data model is **single-user tenancy**. Every row is scoped `clinician_id = auth.uid()`. There is no `organizations`/`practices` table, no membership, no roles and no seats. `GroupPractice.tsx` is static mock data. *Verified.*

---

## 3. Architecture Reconstruction (as-is)

| Layer | As observed (Verified) |
|---|---|
| Frontend | React 18.3, Vite 6.3, Tailwind v4, Radix UI **and** MUI 7 + Emotion, Motion, Recharts, react-router 7.13 (data router SPA), i18next (EN/FR), Sonner |
| Origin | Generated in Figma Make (`package.json` name `@figma/my-make-file`, `figma[bot]` commits, `src/imports/*.html` prototypes), then developed in Replit (`.replit`, port 5000) |
| Auth | Supabase Auth, email and password only (`signInWithPassword`). No signup, no password reset, no MFA wired. Client-side demo-login fallback |
| Authorization | Client: `RequireAuth` route guard. Server: Postgres RLS `owner = auth.uid()` on `clinicians`, `clients`, `invoices`, `session_notes`, `appointments`, `intake_forms`, `audit_log`. Edge routes use `auth.getUser(token)` |
| Database | Supabase Postgres, project `hkhwgbkijepsxtixdmrs`, pooler `aws-1-ca-central-1` ✅. 7 relational tables + `kv_store_4d1a502d` (JSONB key-value) |
| Backend | 1 Supabase Edge Function (Hono) `make-server-4d1a502d` mounting `trial-manager`, `ai-routes`, `billing-routes`. `stripe-webhook.ts` sits in the same folder as a standalone `Deno.serve`, **but it is not imported or mounted** |
| State split | Subscriptions, trials, AI usage and one invoice store live in **KV**. Clients, notes and a second invoice store live in **Postgres**. Two sources of truth for billing |
| AI | Anthropic Messages API (`claude-sonnet-4-20250514` default) via the edge function. Regex PII scrub. No evals, no output checks |
| Payments | Stripe Elements on the client. Server intent endpoint missing. Webhook unmounted |
| Integrations | Sentry (browser tracing 100% + session replay), PostHog (US host). Both optional via env |
| Background jobs / queues | None. No reminders, dunning, auto-lock or retention jobs, even though several are claimed in the README |
| Storage | None (no Supabase Storage usage) |
| CI | GitHub Actions: `tsc --noEmit` → `build` → Playwright. Dependabot. CODEOWNERS |
| Hosting | Replit (dev). Production host not documented. *Not Verified* |

**Structural observation.** The layout is duplicated. `supabase/functions/server/` and `supabase/functions/make-server-4d1a502d/` are byte-identical, and each contains `index.ts` **and** `index.tsx` (different CORS logic) plus `kv_store.ts` **and** `kv_store.tsx`. It isn't possible to tell from the repo which one is deployed. *Verified.*

---

## 4. Personas, Roles & Permissions

| Action | Clinician (owner) | Client (portal) | Group admin | Platform admin |
|---|---|---|---|---|
| View / create / edit own clients & notes | ✓ (RLS) | – | **not modelled** | **not modelled** |
| Edit a *locked* note | **✓ (should be ✗)** | – | – | – |
| Submit intake form | – | **no path** (RLS allows clinician only; portal is mock) | – | – |
| Write audit log | ✓ **arbitrary rows** | – | – | – |
| Change own plan / trial dates | **✓ (should be ✗)** via `clinicians_update_own` | – | – | – |
| Activate paid subscription | **✓ with no payment** via `POST /trial/upgrade` | – | – | – |

Privilege-escalation tests (Web App §3) were run by code review: **two confirmed escalation paths** (P0-1). Client-portal and group roles don't exist yet.

---

## 5. Screen Inventory & Screen Audit

46 page components. The table shows each one's data wiring (*Verified* by grep of Supabase or fetch usage).

| Status | Screens |
|---|---|
| **Live (Supabase)** | Clients, NewClientModal, SessionNotes (list), SessionNoteEditor, NoteModal, Billing |
| **Calls a non-existent endpoint** | Checkout (`/api/create-payment-intent`), Contact (`/api/contact`) |
| **Static mock data** | Overview (the dashboard home), Messages, CalendarView, BookingPage, ClientProfile, ClientPortal, ClientPortalFull, OutcomeMeasures, SessionPrep, Waitlist, GroupPractice, InsuranceReceipts, ClinicalTools, CulturalTemplates, Compliance, TreatmentCourses, HEPBuilder |
| **Non-functional controls** | Onboarding "Complete setup" (no account created), Login "Forgot password" (no reset flow), Settings "Delete account" and "Export data" (no `onClick`) |
| **Dead / duplicate** | `Calendar.tsx` (unused next to `CalendarView`), `Placeholder.tsx`, `ClientPortal.tsx.orig`, `AITest.tsx` (a **public** route `/ai-test` in production) |

Per-screen state coverage (Web App §4): Suspense fallbacks are `null` everywhere (blank screen while chunks load). The `LoadingSkeleton` component exists but is rarely used. There is one generic route `errorElement`. Unauthorized state = redirect. Empty states are mostly absent because the data is mocked.

Hard-coded demo data in live clinical screens:
- `SessionNoteEditor` defaults `diagnosis` to `'F43.10 PTSD'` and `session_number: 15`, and uses the draft key `'session_note_draft_amara-mensah'` for every client.
- `NoteModal` inserts notes **without `client_id`**, which creates orphaned clinical records.

*Verified.*

---

## 6. Onboarding, Activation & First Run (SaaS §5)

- **FACT:** `Onboarding.handleSubmit` stores the email in `localStorage`, calls `startTrial()`, `console.log`s the form **including the password**, and navigates to `/dashboard`. `supabase.auth.signUp` does not exist anywhere in `src/app`. No `clinicians` row is created.
- **OBSERVATION:** `/dashboard` is behind `RequireAuth`, so a new user is bounced to `/login` with no account.
- **RISK:** Activation rate is structurally 0%. The only people who can log in are pre-seeded users.
- **RECOMMENDATION:** Implement `signUp` with email confirmation. Create the `clinicians` row with a DB trigger on `auth.users` insert, not from the client. Add a password reset (`resetPasswordForEmail` + `/reset-password` route). Define the aha moment (hypothesis: *first client created + first note locked within 48h*) and instrument it.

`useTrialStatus` identifies users with a random `localStorage` id and sends the public anon key. The server's `requireAuth` rejects the anon key, so trial banners and gates always receive a 401. *Verified by code path.*

---

## 7. Billing & Subscription Lifecycle (SaaS §7)

| Element | Status |
|---|---|
| Checkout | ❌ `fetch('/api/create-payment-intent')`. No such route exists in a static Vite SPA. Solo price ID falls back to `'price_solo_placeholder'` |
| Webhook delivery | ❌ `stripe-webhook.ts` is a standalone `Deno.serve` inside the `server` function folder and is not mounted by `index.ts`. It is unreachable unless it is deployed separately. *Deployment Not Verified* |
| Webhook → DB | ❌ Writes `therapists.{subscription_tier, subscription_status, stripe_customer_id, cancel_at}`. The table is `clinicians`, and none of those columns exist (`20260505_production_schema.sql`). Every update would fail |
| Signature verification | ✅ HMAC-SHA256, 300s tolerance, constant-time compare |
| Idempotency | ❌ No `event.id` dedupe store |
| Entitlement source | ❌ Three disagreeing sources: KV `subscription:{id}` (trial-manager), KV `user:{id}:status` (read by AI, **written by nothing**), and `clinicians.plan_type/is_trial` (read by UI) |
| Upgrade | ❌ **`POST /trial/upgrade` sets `status:'active'` from request body with no Stripe check** (P0-1) |
| Dunning / grace | ⚠️ Sets `past_due` only. No user-facing state, no grace logic |
| Cancellation | ⚠️ KV flag only. It doesn't cancel in Stripe |
| Proration / downgrade data policy | Not defined |
| Price consistency | ❌ Solo is **$49** in Checkout, README and Subscribe, but **$79** in the DB default `price_per_seat` and in the in-app subscription display. Group is $79 in the README and **$69/seat** in `DEMO_ACCOUNTS` |

Recommendation: make **Stripe the single source of truth**. Use a Checkout Session created server-side with `client_reference_id = auth.uid()`. Deploy a separate `stripe-webhook` function with `verify_jwt=false`, idempotent on `event.id`, writing `clinicians.subscription_*` columns that are **not writable by users** (see §9 A01). Delete the KV subscription and trial paths.

---

## 8. API & Backend Audit (Web App §7)

- ✅ Trial and billing routes validate the bearer token server-side and enforce `requestedUserId === user.id`. Invoice creation validates amount, sessions, name and date. CSV export neutralises formula injection.
- ❌ **AI route treats the public anon key as a valid identity** (`role === 'anon'` → `userId = "demo-user"`). The anon key is in the shipped bundle, so the Anthropic proxy is callable by anyone on the internet. Every visitor also shares **one global 20-assists/month quota**.
- ❌ The frontend **always** sends the anon key (`aiNoteService.ts`), so real users never authenticate. The JWT path reads `user:{id}:status`, which nothing writes, so it would return 403. In production, AI Assist dies after 20 calls per month across all customers.
- ❌ `PATCH /invoices/:id` writes `status` straight from the body with no enum validation.
- ❌ No rate limiting on any route. No versioning. `console.log` is the only "audit".
- ❌ KV read-modify-write counters (invoice numbers, AI usage) are non-atomic and race under concurrency.
- ⚠️ CORS: `index.ts` reflects **any** origin when `ALLOWED_ORIGINS` is unset. `index.tsx` restricts to localhost/Replit. Which file deploys is ambiguous.

---

## 9. Security Audit — OWASP Top 10:2025

| # | Finding | Sev | Evidence |
|---|---|---|---|
| **A01** Broken Access Control | **Self-serve paid plan (two paths).** (a) `POST /trial/upgrade` activates any plan with no payment. (b) RLS `clinicians_update_own` lets a user `UPDATE clinicians SET plan_type='group', is_trial=false, trial_ends_at='2099-…'` directly through PostgREST | **P0** | `trial-manager.ts`, `20260505_production_schema.sql:37` |
| A01 | Locked notes are mutable. RLS `FOR ALL USING (clinician_id = auth.uid())` has no `is_locked` guard or immutability trigger. College record-keeping expects amendments, not overwrites | P1 | `20260520_session_notes_rls.sql` |
| A01 | Audit log is client-authored. Clinicians can insert **arbitrary** rows and skip logging entirely. Failures are swallowed | P1 | `SessionNoteEditor.tsx:163`, RLS insert policy |
| **A02** Misconfiguration | Public `/ai-test` route in production. The AI endpoint accepts the anon key. CORS fallback is permissive. No CSP or security headers (`index.html`, no host config) | P1 | routes.tsx, ai-routes.ts |
| **A03** Supply chain | `npm audit --omit=dev`: **3 high** (react-router 7.13.0 [<7.18.2], protobufjs, ws) + 11 moderate. Dependabot is on, but only one bump has merged. The `lint` script references ESLint, which isn't installed and has no config | P1 | `npm audit` run 2026-09-23 |
| **A04** Cryptographic failures | **Note "encryption" is obfuscation.** The AES-GCM key is PBKDF2(`user.id`, static salt `'mentalpath-salt'`). `user.id` is stored in the same row (`clinician_id`) and sits in every JWT, so anyone with DB read access (service role, backups, support staff, a SQL injection anywhere) decrypts everything. Decryption failures silently render `"*** Decryption failed ***"` | **P0** | `src/utils/encryption.ts` |
| A04 | **Plaintext PHI at rest in the browser.** `useAutoSave` mirrors every note draft to `localStorage`. It is not cleared on logout or on the 15-min inactivity timeout. `SessionNoteEditor` uses one fixed key for all clients, so client A's draft can be "restored" into client B's note | **P0** | `useAutoSave.ts`, `SessionNoteEditor.tsx:175` |
| **A05** Injection | No raw SQL. PostgREST is parameterised. CSV formula protection is present. No `dangerouslySetInnerHTML` found in app pages. **Low risk** | – | |
| **A06** Insecure design | Demo accounts with a **known shared password (`demo1234`)** are created by `seed_production.sql` in the real auth schema. The client-side bypass logs anyone in as those personas with a fake UUID. `demo1234` is present in the built `Login` and `index` chunks | **P0** | `UserContext.tsx:283`, `seed_production.sql:96`, `dist/assets/*` |
| **A07** Auth failures | No MFA for PHI access. No password reset. Password strength is only a UI meter. Supabase-side password policy *Not Verified* | P1 | |
| **A08** Integrity | Stripe signature ✅. No webhook idempotency. `package-lock` committed ✅ | P2 | |
| **A09** Logging & alerting | Security events go to `console.log` only. No alerting. The audit log is client-side. Sentry is optional and PHI-unsafe as configured (below) | P1 | |
| **A10** Exceptional conditions | Decrypt failure *fails open to a placeholder string*. `supabase.from('clinicians')` errors are ignored and demo data is filled in. The "Session Expired" toast shows only after `signOut` resolves | P2 | |

Tenant-isolation testing (SaaS §9): **none exist.** RLS policies look correct for single-owner isolation on the 7 migrated tables, but that is *Not Verified* against the live DB. The `kv_store_4d1a502d` table's RLS state is *Not Verified*, and it holds every user's subscription and invoice JSON.

---

## 10. Privacy & Compliance (PHIPA / PIPEDA / Quebec Law 25)

The README claims, set against code evidence:

| Claim | Reality |
|---|---|
| "Data stored on Canadian servers (ca-central-1)" | ✅ DB pooler is `aws-1-ca-central-1`. ⚠️ Anthropic, Sentry (default US ingest) and PostHog (`us.i.posthog.com`) receive data outside Canada |
| "Encryption at rest" | Supabase disk encryption ✅. The app-level encryption is reversible by anyone with DB access (§9 A04) |
| "No client PII sent to AI" | ❌ Free-text clinical narrative (PHI by definition) is sent. The regex removes only phones, emails and 9-digit numbers. Names, addresses, employers and diagnoses pass through |
| "Auto-lock session notes after 24 hours" | ❌ No job, trigger or code implements this |
| "Audit logging for all AI assist usage" | ❌ `console.log` only |
| "Client consent management", "E-signature" | ❌ Portal is mock. `intake_forms` has no client insert path |
| Data export / deletion (PIPEDA access, Law 25 portability) | ❌ Buttons have no handlers |

Session replay (`Sentry.replayIntegration`, 10% of sessions / 100% on error) and PostHog autocapture run on clinical screens. Replay text masking defaults need explicit confirmation and a written Sentry/PostHog data-processing assessment. *Not Verified.*

**Recommendation:** Treat every compliance statement in the README and marketing pages as a **legal liability until evidenced.** Remove or qualify the claims now. Then:
- Get a PHIPA-aligned agreement / zero-data-retention setup from the AI vendor, or route AI through a Canadian-region provider. Add explicit clinician-side consent before AI use.
- Pin Sentry and PostHog to EU/CA-resident or self-hosted ingest, or disable them on authenticated routes.
- Complete a Privacy Impact Assessment before the first real client record.

---

## 11. Database & Data Model (Web App §8)

- ✅ FK constraints, `ON DELETE RESTRICT` on notes → clients (protects the clinical record), indexes on `clinician_id`, and an `updated_at` trigger.
- ❌ Migrations are not reproducible from zero. There's no `supabase/config.toml`. `seed_production.sql` re-declares the schema. Migration 2 opens with a `therapist_id → clinician_id` rename loop, which is evidence of drift. The `supabase:types` script targets a **different project** (`jbmsddrddtyhllfowtxe`), and `src/integrations/supabase/types.ts` doesn't exist, so queries are untyped.
- ❌ No tables for messages, organizations/memberships, consents, or subscriptions/billing events.
- ❌ No indexes on `session_notes(clinician_id, client_id, session_date)` or `appointments(clinician_id, scheduled_at)`.
- ❌ Soft delete, retention (College-mandated retention of 10+ years for some professions) and amendment history are not modelled.

---

## 12. Performance, Reliability, Accessibility, Analytics

**Performance** (*Verified*, `vite build`): the main chunk is **910 kB / 270 kB gzip**. Landing and DashboardLayout are eager-loaded, and the bundle ships **both** MUI+Emotion and Radix. Real-user web vitals are *Unscored, needs live environment*.

**Reliability:**
- An offline banner and autosave exist ✅.
- Autosave to the server fails silently to console.
- All Suspense fallbacks are `null`.
- There's no retry/backoff on edge calls.

**Accessibility** (WCAG 2.2 AA):
- ✅ Radix primitives provide focus management.
- Only **21 `aria-*` attributes across 46 pages**, and 9 clickable `<div>`s.
- No live regions for autosave or AI status.
- No automated axe checks.
- *Partially scored. Needs a manual keyboard and screen-reader pass.*

**i18n:** only 13 files use `useTranslation`, and most dashboard pages are English-only. This matters for Quebec (Bill 96 / Charter of the French Language) given the FR marketing.

**Analytics** (SaaS §11): PostHog is initialised, but **no core events** are defined (signup, activation, note locked, upgrade, cancel with reason). No cohort tracking is possible.

---

## 13. Code Quality (05) & Testing (Web App §14)

**Sampled deeply:** the auth flow (`UserContext`, `Login`, `Onboarding`), a data-mutation path (`NoteModal` / `SessionNoteEditor` → `session_notes`), a core screen (`Overview`), and the full backend.

| Dimension | Assessment |
|---|---|
| Architecture / coupling | Pages call Supabase directly, with no service or repository layer. Business rules such as pricing, profession metadata and entitlement are duplicated across `UserContext`, Checkout, Subscribe, SQL defaults and the edge functions |
| Duplication | Two identical edge-function trees. `index.ts`/`.tsx`. `kv_store.ts`/`.tsx`. `Tooltip.tsx`/`tooltip.tsx`. `Calendar`/`CalendarView`. `ClientPortal`/`ClientPortalFull`. Two invoice stores. Two note editors with copy-pasted encrypt/save logic |
| Typing | `strict: true` ✅, but 37 `any`s, untyped DB rows (no generated types), and payloads typed `any` |
| Error handling | Mostly `console.error` + toast. Profile-load errors are ignored |
| Dead code / debt | `ClientPortal.tsx.orig`, `patch_*.cjs/js` (4), `test-db.mjs`, `take-screenshots.mjs`, `attached_assets/` (41 files, 1.3 MB), `src/imports/` (840 KB of prototype HTML/TS, including a second copy of the Stripe webhook), committed `playwright-report/`, `test-results/`, `tsbuildinfo`, `supabase/.temp/` |
| Documentation | **25 root-level status docs** with contradictory verdicts (`LAUNCH_AUDIT_REPORT.md` "READY TO LAUNCH" vs `MENTALPATH_PRE_LAUNCH_AUDIT.md` "75%"). They are a liability to anyone doing due diligence |
| **Build** | ❌ **`npm run build` fails on Linux** (TS1149: `tooltip.tsx` vs `Tooltip.tsx` differ only by case). CI runs on `ubuntu-latest`, so **CI on `main` is red**. It passes only on case-insensitive macOS/Windows |
| Tests | **1 Playwright test** (landing page). 0 unit, 0 integration, 0 RLS or tenant-isolation tests, 0 billing tests, 0 a11y tests. This is flagged as risk now that the product handles PHI and payments |

---

## 14. Severity-Tagged Findings (consolidated)

**P0 — Critical (blocks launch / severe data or billing risk)**
1. **Billing bypass.** Self-grant a paid plan via `POST /trial/upgrade` or a direct `UPDATE clinicians` (RLS).
2. **Known-password accounts + client-side demo login bypass** shipped in the production bundle and seeded into production auth.
3. **Reversible "encryption"** of session notes (key derived from the public user UUID).
4. **Plaintext PHI in `localStorage`** that persists after logout, with a cross-client draft collision.
5. **Unauthenticated AI proxy** (anon key accepted), and real users are locked out of AI (the entitlement key is never written).
6. **PHI sent to a US AI vendor while the README claims otherwise.** Other compliance claims are also unimplemented.
7. **No signup and no password reset.** New users cannot create accounts.
8. **Payments non-functional.** The checkout endpoint is missing, the webhook is unmounted and targets a non-existent table/columns, and there are three conflicting entitlement stores.
9. **Build and CI red on Linux** (case-colliding filenames).

**P1 — High:**
- Locked notes are mutable.
- The audit log is client-authored and forgeable.
- No MFA.
- 3 high-severity dependencies.
- Public `/ai-test` route.
- Permissive CORS fallback.
- Notes are saved without `client_id`; hard-coded diagnosis and session number.
- Group Practice tier sold without a multi-user model.
- Sentry replay and PostHog on PHI screens with US ingest.
- Delete/export account are no-ops.
- Migrations not reproducible; types point at the wrong project.
- No rate limiting.
- No tenant-isolation tests.

**P2 — Medium:**
- Pricing inconsistencies ($49 vs $79; $69 vs $79).
- Non-atomic KV counters.
- Webhook not idempotent.
- `PATCH` invoice status unvalidated.
- 910 kB main bundle / dual UI libraries.
- `null` Suspense fallbacks.
- i18n coverage ~30%.
- Missing indexes on notes and appointments.
- The password (among other form fields) is `console.log`ged in Onboarding.

**P3 — Low:**
- Repo hygiene (artifacts, `.orig`, patch scripts, 25 status docs).
- Package name.
- Missing ESLint.

**Opportunity:**
- A true Canadian-resident AI pipeline is a defensible moat against US competitors.
- Cultural intake templates plus FR-first Quebec support are a real differentiator once backed by data.
- Multi-profession templates support a vertical-SaaS expansion story.

---

## 15. Scorecards

**Web Application (§15).** Scored only where evidence exists.

| Category | /10 | Basis |
|---|---|---|
| Product Strategy | 7 | Clear vertical wedge and Canadian positioning; pricing not settled |
| User Experience | 6 | Polished visual layer; broken signup; blank Suspense states |
| Feature Completeness | 2 | ~6 of 46 screens backed by data |
| Architecture | 3 | Sound Supabase+RLS base; split KV/SQL truth; duplicated functions |
| Security | 1 | Multiple P0 access-control, crypto and auth-design failures |
| Accessibility | 4 | Radix base; sparse ARIA; untested (partial) |
| Performance | 5 | Lazy routes; 910 kB main chunk (lab only) |
| Reliability | 3 | Silent failures; no retries; mocked flows |
| Analytics | 2 | SDKs present, no events defined |
| QA / Test Coverage | 1 | One smoke test; CI red |
| Scalability | 4 | Indexed per-tenant queries; KV hot-spots; no org model |
| **Production-Readiness** | **3.1** | Mean of above, capped by the P0 count |

**SaaS (§14)**

| Category | /10 |
|---|---|
| Onboarding & Activation | 1 |
| Pricing & Packaging | 4 |
| Multi-Tenancy Architecture | 4 (single-user isolation ok; group tier unsupported) |
| Billing & Subscription Lifecycle | 1 |
| Security & Compliance | 1 |
| Customer Success Infrastructure | 2 (Support/FAQ pages; no health scoring) |
| Analytics Maturity | 1 |
| Scalability | 4 |
| Metrics Health (NRR, churn, CAC:LTV) | Unscored (pre-revenue, no instrumentation) |

---

## 16. Prioritized Roadmap

**Sprint 0 (days 1–3): stop the bleeding**
- [ ] Fix the case collision (`Tooltip.tsx` → merge into `tooltip.tsx`) so CI is green.
- [ ] Delete the demo bypass from `UserContext.login`. Delete demo users from **production** auth. Rotate any shared credentials.
- [ ] Remove `POST /trial/upgrade`. Revoke plan/trial columns from the RLS update policy (column-level `GRANT UPDATE (first_name, last_name, city, …)` or move billing to a service-only table).
- [ ] AI route: reject `role=anon`. Have the frontend send the session JWT.
- [ ] Remove `/ai-test` from production routes. Set `ALLOWED_ORIGINS`. Delete the `index.tsx` / `make-server-4d1a502d` duplicates.
- [ ] Strip unverified compliance claims from the README and marketing copy.

**Sprint 1 (weeks 1–2): identity + PHI**
- [ ] `signUp` + email confirm + password reset. `clinicians` row via `auth.users` trigger. MFA (TOTP) required for dashboard access.
- [ ] Replace the client-side crypto with either (a) plain server-side storage relying on Supabase at-rest encryption plus strict RLS (honest), or (b) real envelope encryption with per-clinician DEKs held in Supabase Vault/KMS. Document an ADR (Product Eng. §7, ADR standard).
- [ ] Stop mirroring PHI to `localStorage` (or encrypt with a session-only key and wipe on logout/timeout). Key drafts by note or client id.
- [ ] DB-enforced note locking (trigger rejecting UPDATE/DELETE when `is_locked`) + an `session_note_amendments` table.
- [ ] Server-side audit via Postgres triggers (and a `SELECT`-logging RPC for note reads). Drop the client insert policy.

**Sprint 2 (weeks 3–4): money**
- [ ] Server-created Stripe Checkout Session (edge fn) → dedicated `stripe-webhook` function (idempotent, writes `clinicians.subscription_*`). Remove the KV trial/subscription stores. One entitlement check shared by UI and edge.
- [ ] Reconcile pricing ($49 vs $79) in one config. Customer Portal for cancel, downgrade and payment method. Dunning UI.
- [ ] Decide Group Practice: remove it from sale, or build `practices` + `memberships` + roles (ADR on isolation strength).

**Sprint 3 (weeks 5–6): truth + proof**
- [ ] Wire Messages, Calendar/appointments, Overview and Client Portal intake (token-scoped RLS) to real tables, or hide them behind "coming soon".
- [ ] Tests: RLS/tenant-isolation suite (two users, cross-read attempts), webhook unit tests, signup→note→lock E2E, axe checks in Playwright.
- [ ] AI: vendor DPA/zero-retention, explicit consent toggle, server-side audit rows, evaluation set for note quality and hallucination.
- [ ] Define and instrument core events and the aha moment. PIA document. Dependency upgrades (react-router ≥7.18.2).
- [ ] Repo hygiene: move status docs to `docs/archive/`, remove build artifacts and prototypes from git.

---

## 17. Final Recommendation

**No-go for launch with real client data.** The P0 set creates concrete exposure for a clinical product:
- A regulator or College complaint (PHI handling, unverified claims)
- Direct revenue loss (free paid plans)
- A breach vector (known-password accounts)

None of this is architecturally hard to fix. The Supabase + RLS foundation is right, and Sprints 0–2 are about 4 weeks for one experienced full-stack engineer. After Sprint 2, re-run this audit in DUE DILIGENCE mode against the live environment to score the items marked *Not Verified*.

## 18. Known Limitations

- Static review of the repo only. No access to the live Supabase project, Stripe account, deployed functions, or production host. RLS was read from migrations, not introspected from the live DB.
- No live penetration test. Findings are code-evident and should be confirmed in an authorized engagement.
- Compliance observations identify applicable requirements (PHIPA, PIPEDA, Quebec Law 25, provincial College record-keeping). They are not legal advice or certification.
- Standards referenced: OWASP Top 10:2025, WCAG 2.2 AA. Re-verify versions per engagement.

---

## 19. Remediation Log

### Sprint 0 — completed 2026-09-23 (branch `claude/goal-audit-1fv67r`)

| Item | Change | Verified |
|---|---|---|
| Build / CI red (P0-9) | Removed the unused duplicate `ui/Tooltip.tsx` (case collision with `ui/tooltip.tsx`) | `tsc --noEmit` ✅, `npm run build` ✅ on Linux, Playwright ✅ |
| Demo login bypass (P0-2) | Deleted the client-side fallback in `UserContext.login`. Login is Supabase Auth only. Demo account picker on `/login` is rendered only in `import.meta.env.DEV` builds | `demo1234` absent from the production bundle |
| Demo users in production auth (P0-2) | `seed_production.sql` no longer creates demo users. `seed_demo_users_fixed.sql` marked dev-only. Added `supabase/scripts/disable_demo_users.sql` (ban + random password + revoke sessions, no row deletes) | **Action required:** run the script in the production project |
| Self-serve paid plan (P0-1) | Removed `POST /trial/upgrade` and the browser `activatePlan()` call from `CheckoutSuccess`. New migration `20260923_lock_clinician_billing_columns.sql` limits browser `INSERT`/`UPDATE` on `clinicians` to profile columns, and revokes all browser access to `kv_store_4d1a502d` | Tested on local Postgres 16 with Supabase-style roles: self-upgrade and billing-column insert → `permission denied`. Profile update ✅. `service_role` billing update ✅ |
| Unauthenticated AI proxy / real users locked out (P0-5) | AI route rejects the anon key and requires a verified user JWT. Entitlement is read from the now server-only `clinicians.is_trial/trial_ends_at` (a trial with unset `trial_ends_at` counts as active until signup sets it in Sprint 1). Frontend sends the session access token (`authHeaders()`). Same fix applied to T2125 export and trial status calls, which were also sending the anon key | `deno check`: no new errors (9 → 7 pre-existing `kv.get<T>` typing issues remain) |
| `/ai-test` public (A02) | Route is registered only in DEV builds | Absent from the production bundle |
| CORS fallback reflected any origin (A02) | Dev fallback now allows only localhost / Replit. Production uses `ALLOWED_ORIGINS` | **Action required:** set `ALLOWED_ORIGINS` secret |
| Duplicate edge-function trees (§3) | Kept `supabase/functions/make-server-4d1a502d/` (matches the deployed URL). Removed `supabase/functions/server/`, `index.tsx`, `kv_store.tsx` | — |
| Unverified compliance claims (P0-6) | README rewritten to state the current privacy posture, AI data flow, and pre-launch status | In-app marketing copy (Landing, Compliance, profession pages) still carries claims. It needs a founder/legal wording pass |

**Deployment steps to make Sprint 0 effective:**
1. Apply `supabase/migrations/20260923_lock_clinician_billing_columns.sql`.
2. Run `supabase/scripts/disable_demo_users.sql` in production.
3. `supabase secrets set ALLOWED_ORIGINS=<prod origins>`, then redeploy `make-server-4d1a502d`.
4. Deploy the frontend.
