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
- Three tiers: Free Starter, $49 Solo Practitioner, $79 Group Practice
- Automated invoice generation
- Payment tracking and reminders

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

Visit `http://localhost:3000` to see the landing page.

---

## 📁 Project Structure

```
mentalpath/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── pages/          # Main application pages
│   │   │   │   ├── Landing.tsx        # Marketing landing page
│   │   │   │   ├── ClientPortal.tsx   # Client intake portal
│   │   │   │   ├── Overview.tsx       # Dashboard overview
│   │   │   │   ├── Clients.tsx        # Client management
│   │   │   │   ├── SessionNotes.tsx   # Session notes with AI
│   │   │   │   ├── Billing.tsx        # Invoice management
│   │   │   │   └── ...
│   │   │   ├── layout/         # Layout components
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Topbar.tsx
│   │   │   └── modals/         # Modal dialogs
│   │   │       ├── NoteModal.tsx      # AI-powered note editor
│   │   │       ├── ClientModal.tsx
│   │   │       └── InvoiceModal.tsx
│   │   ├── routes.tsx          # React Router configuration
│   │   └── App.tsx             # Main app component
│   ├── styles/
│   │   ├── theme.css           # Design tokens (sage green palette)
│   │   └── fonts.css           # DM Serif Display + DM Sans
│   └── imports/                # Static assets
├── supabase/
│   └── functions/
│       └── make-server-4d1a502d/  # Single Hono edge function (deployed under this name)
│           ├── index.ts               # Entry: CORS + route mounting
│           ├── ai-routes.ts           # Claude AI note assist
│           ├── billing-routes.ts      # Invoices + T2125 export
│           ├── trial-manager.ts       # Trial status
│           └── stripe-webhook.ts      # Stripe handler (not yet mounted/deployed — Sprint 2)
├── .env.example                # Environment variables template
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
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

# Lint code
npm run lint
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
# Run unit tests (coming soon)
npm test

# E2E tests with Playwright (coming soon)
npm run test:e2e
```

---

## 📦 Environment Variables

See `.env.example` for a complete list. Key variables:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://hkhwgbkijepsxtixdmrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (required for billing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SOLO_PRICE_ID=price_... # $49 CAD/month
STRIPE_GROUP_PRICE_ID=price_... # $79 CAD/month

# Anthropic (required for AI note assist)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Email & SMS
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
```

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
