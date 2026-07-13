# MentalPath 🍁

**Practice management dashboard for Canadian mental health practitioners**

Built with React, Supabase, and Stripe. PHIPA-compliant, culturally-informed, and designed specifically for solo and small-group practices in Canada.

---

## ✨ Features

### 🏥 Practice Management
- **Client Management** — Track clients with status pills, cultural context tags, and detailed profiles
- **Session Notes** — DAP/SOAP/BIRP/Progress formats with AI-powered draft assist
- **Billing & Invoicing** — Create invoices, track payments, export T2125 for CRA
- **Calendar** — Appointment scheduling with availability management
- **Secure Messaging** — PHIPA-compliant client communication

### 🤖 AI Note Assist
- Powered by Claude (Anthropic)
- Generates draft session notes in professional clinical language
- PHIPA-safe: No client PII sent to AI service
- Supports all major note formats (DAP, SOAP, BIRP, Progress)
- Review and edit before saving

### 💳 Billing Integration
- **Stripe** for Canadian dollar subscriptions
- Three tiers: Free Starter, $49 Solo Practitioner, $79 Group Practice
- Automated invoice generation
- Payment tracking and reminders

### 👥 Client Portal
- **PHIPA-compliant intake forms** with 7 templates
- Self-serve booking with calendar integration
- Culturally-informed intake questions (racialized stress, immigration, etc.)
- E-signature for informed consent
- Session reminders via email/SMS

### 🔒 PHIPA Compliance
- ✅ Data stored on Canadian servers (ca-central-1)
- ✅ Encryption at rest and in transit
- ✅ Auto-lock session notes after 24 hours
- ✅ Audit logging for all AI assist usage
- ✅ Client consent management
- ✅ No client PII exposed to third-party AI services

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
│       └── server/
│           ├── ai-note-assist.ts      # Claude AI integration
│           ├── stripe-webhook.ts      # Stripe event handler
│           └── index.tsx              # Main edge function server
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
- All UI follows WCAG 2.1 AA accessibility standards
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
# Deploy AI note assist function
npx supabase functions deploy ai-note-assist \
  --project-ref hkhwgbkijepsxtixdmrs

# Deploy Stripe webhook handler
npx supabase functions deploy stripe-webhook \
  --project-ref hkhwgbkijepsxtixdmrs

# View logs
npx supabase functions logs ai-note-assist
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

### PHIPA Compliance

MentalPath is built to meet Ontario's Personal Health Information Protection Act (PHIPA) requirements:

1. **Data Residency** — All data stored in ca-central-1 (Canada)
2. **Encryption** — AES-256 at rest, TLS 1.3 in transit
3. **Access Controls** — Role-based access with Supabase RLS
4. **Audit Logging** — All AI assist calls logged (no PII)
5. **Data Minimization** — Only collect necessary client information
6. **Consent Management** — Built-in consent forms with e-signature

### PII Handling in AI Features

When using AI note assist:
- ❌ Client names are NOT sent to Anthropic
- ❌ Contact information is NOT sent
- ❌ Dates of birth are NOT sent
- ✅ Only clinical note text is sent (sanitized)
- ✅ Session identified by UUID only
- ✅ All calls logged for audit trail

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Full deployment guide with Supabase, Stripe, and Anthropic setup
- **[.env.example](./.env.example)** — Environment variables reference
- **College Guidelines** — Compliant with CRPO (College of Registered Psychotherapists of Ontario) record-keeping standards

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
