# MentalPath — Deployment Guide

## Architecture

| Layer | What runs there |
|---|---|
| Frontend | React 18 + Vite static build (any static host / CDN) |
| Database & auth | Supabase project `hkhwgbkijepsxtixdmrs` (Postgres 17, ca-central-1). RLS on every table, MFA (TOTP) required for clinical data |
| API | Edge Function `make-server-4d1a502d` (Hono): AI Note Assist, Stripe Checkout/Portal sessions, T2125 export, data export, account closure, contact form |
| Webhooks | Edge Function `stripe-webhook` (no Supabase JWT; Stripe signature verified) |
| Payments | Stripe Checkout + Customer Portal (CAD) |
| AI | Anthropic Messages API (`claude-opus-5` by default), opt-in per clinician |

Stripe is the single source of truth for paid status: only `stripe-webhook` writes billing columns.

## 1. Before the first real client record

Work through the **Open items** in [`docs/privacy/privacy-impact-assessment.md`](docs/privacy/privacy-impact-assessment.md) (vendor agreements, privacy policy review, retention job, incident runbook).

## 2. Database

```bash
npx supabase link --project-ref hkhwgbkijepsxtixdmrs
npx supabase db push            # applies supabase/migrations/* in order
npx supabase config push        # auth settings from supabase/config.toml (MFA, password policy, confirmations)
```

One-off, production only — lock out the demo accounts that were seeded with a public password:

```sql
-- run supabase/scripts/disable_demo_users.sql in the SQL editor
```

**Note encryption (ADR 0001).** The envelope-encryption migration creates the note master key in Supabase Vault (`mentalpath_note_master_key`). Back it up in your secrets manager; without it, note content cannot be decrypted. If any notes were written by the retired browser scheme, migrate them once:

```bash
SUPABASE_URL=https://hkhwgbkijepsxtixdmrs.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
  node scripts/reencrypt-legacy-notes.mjs --dry-run   # then without --dry-run
```

To rotate the master key: `SELECT private.rewrap_all_deks('<old>', '<new>')` in the SQL editor, then update the Vault secret.

**Retention.** Enable the `pg_cron` extension (Database → Extensions) *before* `db push` so the nightly `private.purge_expired_records()` job is scheduled; otherwise run `SELECT cron.schedule('mentalpath-retention-purge', '17 3 * * *', 'SELECT private.purge_expired_records()')` afterwards. Check runs with `SELECT * FROM private.retention_runs ORDER BY id DESC`.

Never run `supabase/seed_demo_users_fixed.sql` against production. For a local/dev project you may relax MFA:

```sql
INSERT INTO private.app_settings VALUES ('mfa_optional', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

(and set `VITE_MFA_OPTIONAL=true` in the dev frontend).

In the Supabase dashboard also set: **Auth → URL configuration** (Site URL = your app URL; redirect URLs for `/login` and `/reset-password`), and **Auth → SMTP** to a production mail sender.

## 3. Edge Functions

```bash
npx supabase secrets set --project-ref hkhwgbkijepsxtixdmrs \
  APP_URL=https://app.example.ca \
  ALLOWED_ORIGINS=https://app.example.ca \
  ANTHROPIC_API_KEY=sk-ant-... \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  STRIPE_SOLO_PRICE_ID=price_...
# optional:
#   ANTHROPIC_MODEL=claude-opus-5
#   STRIPE_AUTOMATIC_TAX=true            (requires Stripe Tax set up for GST/HST)
#   STRIPE_GROUP_PRICE_ID=price_...      (only when the Group plan ships)

npx supabase functions deploy make-server-4d1a502d --project-ref hkhwgbkijepsxtixdmrs
npx supabase functions deploy stripe-webhook --no-verify-jwt --project-ref hkhwgbkijepsxtixdmrs
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.

## 4. Stripe

1. Create product **MentalPath Solo** with a recurring price of **C$49/month** → `STRIPE_SOLO_PRICE_ID`.
2. Configure the **Customer Portal** (Settings → Billing → Customer portal): allow payment-method updates, invoice history and cancellation.
3. Add a webhook endpoint `https://hkhwgbkijepsxtixdmrs.supabase.co/functions/v1/stripe-webhook` for:
   `checkout.session.completed`, `customer.subscription.created|updated|deleted|paused|resumed`, `invoice.paid`, `invoice.payment_failed`.
4. Local testing: `stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook`.

## 5. Frontend

```bash
npm ci
npm run build   # outputs dist/
```

Build-time variables (see `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`. Only enable Sentry/PostHog after a data-processing agreement is in place; they are configured to exclude PHI (`src/app/lib/telemetry.ts`).

Serve with security headers at the host/CDN, at minimum:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; connect-src 'self' https://hkhwgbkijepsxtixdmrs.supabase.co wss://hkhwgbkijepsxtixdmrs.supabase.co https://*.sentry.io https://eu.i.posthog.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 6. Verification

```bash
npx tsc --noEmit && npx vitest run      # typecheck + unit tests
npx playwright test                     # E2E + WCAG 2.2 AA (axe) against a mocked backend
PGHOST=... PGUSER=... supabase/tests/run.sh   # RLS / MFA / tenant-isolation suite on a scratch Postgres
cd supabase/functions && deno test --allow-env
PGHOST=127.0.0.1 PGUSER=postgres npm run test:integration   # real GoTrue + PostgREST + all migrations (downloads binaries once)
```

AI quality check before changing the model, prompts or scrubber (costs a few cents per run):

```bash
cd supabase/functions/make-server-4d1a502d
ANTHROPIC_API_KEY=... deno run --allow-env --allow-net --allow-read evals/run.ts
```

After deploying, smoke-test: sign up → confirm email → enrol TOTP → add client → write and lock a note → subscribe in Stripe test mode → confirm the plan updates in Settings.
