# MentalPath 🍁

**Practice management dashboard for Canadian mental health practitioners**

Built with React, Supabase, and Stripe. Designed for PHIPA-aligned, culturally-informed practice management for solo and small-group practices in Canada.

> **Status: pre-launch.** Several features below are in development and several screens still use sample data. See [`docs/audits/2026-09-23-goal-audit.md`](./docs/audits/2026-09-23-goal-audit.md) for the current production-readiness assessment. Do not store real client data until the P0 items in that audit are closed.

---

## ✨ Features

### 🏥 Practice Management
- **Client Management** — Track clients with status pills, cultural context tags, and detailed profiles
- **Session Notes** — DAP/SOAP/BIRP/Progress formats with AI-powered draft assist
- **Billing & Invoicing** — Create invoices, track payments, export T2125 for CRA
- **Calendar** — Appointment scheduling *(in development — UI only)*
- **Secure Messaging** — Client communication *(in development — UI only)*

### 🤖 AI Note Assist
- Powered by Claude (Anthropic)
- Generates draft session notes in professional clinical language
- Obvious identifiers (phone, email, 9-digit numbers) are redacted before sending; the remaining clinical text **is** sent to Anthropic (US). Clinicians must not include client names or other identifiers
- Supports all major note formats (DAP, SOAP, BIRP, Progress)
- Review and edit before saving

### 💳 Billing Integration
- **Stripe** for Canadian dollar subscriptions
- Starter (free, 1 active client), Solo C$49/month with a 7-day no-card trial; Group Practice coming soon
- Client invoices with server-assigned numbers, paid tracking and insurer receipts

### 👥 Client Portal *(in development — UI prototype, no backend yet)*
- Intake form templates, self-serve booking, culturally-informed intake questions
- E-signature for informed consent and session reminders are planned, not implemented

### 🔒 Privacy & Security (current state)
- ✅ Database hosted in Canada (Supabase, ca-central-1)
- ✅ Row-level security: each clinician can only access their own rows
- ✅ Automatic sign-out after 15 minutes of inactivity
- ⏳ Field-level encryption with managed keys — planned (current client-side scheme is not a security control)
- ⏳ Server-side audit logging, note auto-lock, consent management, data export/deletion — planned

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Stripe account (for billing features)
- Anthropic API key (for AI note assist)

### Installation

```bash
# Clone the repository
git clone https://github.com/creova-gif/mentalpath.git
cd mentalpath

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local
# See DEPLOYMENT.md for detailed setup instructions

# Start development server
npm run dev
```

Visit `http://localhost:8765` to see the landing page.

---

## 📁 Project Structure

```
mentalpath/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── pages/          # Screens (Overview, Clients, SessionNoteEditor, Billing, Settings…)
│   │   │   ├── auth/           # MfaGate (TOTP enrolment/challenge)
│   │   │   ├── settings/       # Profile, Security, Subscription, Danger zone
│   │   │   ├── layout/         # DashboardLayout, Sidebar, Topbar
│   │   │   ├── modals/         # NewClient, Invoice, AI consent
│   │   │   └── ui/             # Radix-based primitives, PreviewPage
│   │   ├── services/           # Data access: sessionNotes, practice, billing, aiNoteService
│   │   ├── context/            # UserContext (auth session, profile, plan)
│   │   ├── lib/telemetry.ts    # PHI-safe Sentry/PostHog wrapper
│   │   └── routes.tsx
│   ├── config/pricing.ts       # Plans and prices (single source of truth)
│   ├── i18n/                   # EN / FR strings
│   └── test/                   # Vitest unit tests
├── supabase/
│   ├── migrations/             # Schema, RLS, MFA, audit, billing (apply in order)
│   ├── tests/                  # SQL security suite + runner (RLS, MFA, tenant isolation)
│   ├── scripts/                # One-off operational SQL (e.g. disable demo users)
│   ├── config.toml             # Auth (MFA, password policy) + function settings
│   └── functions/
│       ├── make-server-4d1a502d/  # API: AI assist, checkout/portal, T2125, export, contact
│       └── stripe-webhook/        # Stripe → billing columns (idempotent)
├── e2e/                        # Playwright E2E + axe accessibility tests
├── docs/
│   ├── audits/                 # Production-readiness audit + remediation log
│   ├── adr/                    # Architecture decision records
│   ├── privacy/                # PIA, subprocessors
│   └── archive/                # Superseded status docs (historical only)
├── DEPLOYMENT.md
└── README.md
```

---

## 🧭 Application Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Marketing landing page with pricing, testimonials, and features |
| `/portal` | Client intake portal (5-step booking + intake form) |

### Dashboard Routes (Protected)
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — today's sessions, revenue charts, quick stats |
| `/dashboard/clients` | Client management with status tracking and detail panels |
| `/dashboard/notes` | Session notes with AI assist and format switching |
| `/dashboard/billing` | Invoice creation, payment tracking, T2125 export |
| `/dashboard/calendar` | Appointment scheduling and availability |
| `/dashboard/messages` | Secure client messaging (PHIPA-compliant) |
| `/dashboard/settings` | Practice settings and preferences |
| `/dashboard/compliance` | Compliance dashboard with encryption status |

---

## 🎨 Design System

**Color Palette** (Sage green, warm neutrals)
- Primary: `--sage` (#4a7c6f)
- Light: `--sage-light` (#6b9e8f)
- Pale: `--sage-pale` (#e8f0ed)
- Deep: `--sage-deep` (#2d5049)

**Typography**
- Headings: DM Serif Display (italic accents)
- Body: DM Sans (300/400/500 weights)

**Components**
- Targeting WCAG 2.2 AA (not yet audited)
- Responsive design (mobile-first)
- Keyboard navigation support

---

## 🔧 Tech Stack

### Frontend
- **React 18** — UI framework
- **React Router 7** — Client-side routing
- **Tailwind CSS v4** — Utility-first styling
- **Lucide React** — Icon library

### Backend
- **Supabase** — Postgres database + edge functions (Canadian servers)
- **Hono** — Web framework for edge functions
- **Stripe** — Payment processing (CAD)
- **Anthropic Claude** — AI note generation

### Optional Integrations
- **Resend** — Email notifications
- **Twilio** — SMS reminders
- **Whereby / Daily.co** — Video sessions

---

## 🛠️ Development

### Local Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

```

### Edge Functions (Supabase)

```bash
# Deploy the API edge function (AI assist, billing, trial routes)
npx supabase functions deploy make-server-4d1a502d \
  --project-ref hkhwgbkijepsxtixdmrs

# Required in production: restrict CORS to your app's origins
npx supabase secrets set ALLOWED_ORIGINS=https://app.example.ca \
  --project-ref hkhwgbkijepsxtixdmrs
```

### Testing

```bash
npm run test:unit        # Vitest — plan/entitlement logic, telemetry scrubbing
npm run test:e2e         # Playwright — auth, MFA, notes, signup + axe WCAG 2.2 AA
npm run test:db          # SQL security suite (needs PGHOST/PGUSER for a scratch Postgres)
npm run test:functions   # Deno — Stripe webhook, identifier scrubber, CSV export, eval graders
```

---

## 📦 Environment Variables

See [`.env.example`](./.env.example) for frontend variables and [`DEPLOYMENT.md`](./DEPLOYMENT.md) for Edge Function secrets. Server secrets (Stripe, Anthropic, service role) are never placed in the frontend.

---

## 🔐 Security & Compliance

### Privacy posture (honest current state)

MentalPath is being built toward Ontario's PHIPA and federal PIPEDA requirements. **It is not yet compliant**, and no compliance certification has been obtained. Current state:

1. **Data residency** — Database in ca-central-1 (Canada). AI assist (Anthropic), and Sentry/PostHog if enabled, process data outside Canada.
2. **Encryption** — Supabase encryption at rest and TLS in transit. Application-level note encryption with managed keys is planned.
3. **Access controls** — Supabase RLS scoped to the signed-in clinician. Billing/plan fields are writable only by the server.
4. **Audit logging** — Planned (server-side). Not yet in place.
5. **Consent management** — Planned. Not yet in place.

### AI features and personal health information

- Session-note text written by the clinician **is sent to Anthropic's API** to produce a draft.
- The server redacts phone numbers, email addresses and 9-digit numbers. It does **not** remove names, addresses or other identifiers in free text.
- Clinicians must not enter client names or identifiers into AI-assisted fields.
- A vendor data-processing agreement and explicit consent flow are required before production use.

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Full deployment guide with Supabase, Stripe, and Anthropic setup
- **[.env.example](./.env.example)** — Environment variables reference

---

## 🗺️ Roadmap

### v1.1 (Q2 2026)
- [ ] Email notifications (appointment reminders, invoice delivery)
- [ ] SMS reminders via Twilio
- [ ] PDF export for invoices and T2125
- [ ] Video session integration (Whereby/Daily.co)

### v1.2 (Q3 2026)
- [ ] Client self-booking calendar
- [ ] Outcome tracking with PHQ-9, GAD-7
- [ ] Multi-language support (French for Quebec)
- [ ] Mobile app (React Native)

### v2.0 (Q4 2026)
- [ ] Group practice features (multi-therapist support)
- [ ] Insurance billing (OHIP, extended health)
- [ ] Advanced analytics and reporting
- [ ] API for third-party integrations

---

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting a PR.

### Areas We Need Help With
- Testing (unit tests, E2E tests)
- Accessibility improvements
- French translation
- Documentation
- Bug reports and feature requests

---

## 📄 License

MentalPath is proprietary software. For licensing inquiries, contact hello@mentalpath.ca.

---

## 💬 Support

- **Email**: support@mentalpath.ca
- **Community**: [community.mentalpath.ca](https://community.mentalpath.ca)
- **Documentation**: [docs.mentalpath.ca](https://docs.mentalpath.ca)

---

## 🙏 Acknowledgments

Built with support from:
- Canadian mental health practitioners who provided feedback
- The open-source community (React, Tailwind, Supabase)
- Anthropic for Claude API access
- Stripe for Canadian payment processing

---

**Made with ❤️ for Canadian therapists**

*Supporting mental health practitioners, one session note at a time.*
