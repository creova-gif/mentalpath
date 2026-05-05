# MentalPath - Practice Management Dashboard

## Overview
MentalPath is a PHIPA-compliant practice management platform for Canadian regulated health practitioners — psychotherapists, chiropractors, physiotherapists, RMTs, naturopaths, and more. Features include CAD billing, college-standard clinical notes, AI note drafting, client management, secure messaging, public booking, and a client portal.

Currently a **pitch-ready frontend-only demo** with multi-profession login and subscription management.

## Tech Stack
- **Frontend:** React 18, React Router 7, Tailwind CSS v4, Radix UI, Shadcn UI
- **Build Tool:** Vite 6
- **Package Manager:** npm
- **Language:** TypeScript
- **Backend Platform:** Supabase (Database + Edge Functions via Deno/Hono) — coexists with UserContext demo system
- **AI:** Anthropic Claude (claude-sonnet-4-20250514) for clinical notes
- **Payments:** Stripe (CAD)
- **i18n:** i18next (English + French)

## Project Structure
```
src/
  app/
    components/     # UI components (dashboard, layout, modals, pages, ui)
    context/        # UserContext.tsx — multi-profession demo state
    hooks/          # Custom React hooks
    services/       # API services (aiNoteService)
    utils/          # Shared utilities
    App.tsx         # Root component (wrapped with UserProvider)
    routes.tsx      # Route definitions
  i18n/             # Translation configs and locales
  styles/           # Global CSS and theme tokens
  main.tsx          # Entry point
supabase/
  functions/server/ # Deno Edge Functions (Hono server, AI/billing routes)
utils/supabase/     # Supabase configuration
```

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`

## Deployment
- Type: Static site
- Build command: `npm run build`
- Public directory: `dist`

## Pages
- `/` - Landing page
- `/login` - Multi-profession login with 4 demo accounts
- `/book` - Public practitioner booking page (5-step flow)
- `/dashboard/clients/:clientId` - Full client profile (7 tabs)
- `/session-note-editor` - Session note editor (DAP/SOAP/BIRP/Progress formats, AI assist)
- `/dashboard/*` - Dashboard routes (clients, notes, billing, calendar, messages, compliance, settings, etc.)

## Multi-Profession Demo System (UserContext)

### Demo Accounts (all password: `demo1234`)
| Account | Profession | City | Plan |
|---|---|---|---|
| `dr.osei@mentalpath.ca` | Registered Psychotherapist | Toronto, ON | Solo monthly |
| `dr.chen@spine360.ca` | Chiropractor | Vancouver, BC | Solo annual |
| `sarah.patel@physiocare.ca` | Physiotherapist | Calgary, AB | Group (4 seats) |
| `j.williams@rmtcare.ca` | Registered Massage Therapist | Ottawa, ON | Trial (4 days) |

### UserContext (`src/app/context/UserContext.tsx`)
- Stores: `user` (profession, name, registration number, notes label) and `subscription` (type, trial status)
- Consumed by: Overview, Sidebar, Topbar, Settings, Compliance, Login
- Profession-specific data: session lists, tasks, stats, college names, notes label ("Session Notes" / "SOAP Notes" / "Treatment Notes")

## Key Notes
- **Design system:** Tailwind CSS v4 with CSS custom properties (`var(--sage)`, `var(--ink)`, etc.). Never hardcode colors.
- **Dynamic Tailwind:** Use inline styles or literal class strings — dynamic classes from JS variables are not picked up at build time.
- **Routing:** ClientProfile and SessionNoteEditor are standalone routes (not nested in DashboardLayout). New dashboard routes go before the catch-all.
- **Fixed/backdrop-blur:** Fixed positioned overlays must be siblings to nav, not children.
- `vite.config.ts` must keep `allowedHosts: true` and `host: '0.0.0.0'`.
- Canadian market: PHIPA, college-specific compliance (CRPO/CCO/CPO/CMTO), CAD currency.
- Onboarding has 5 steps; `OnboardingStep = 1 | 2 | 3 | 4 | 5`.
- Group Practice sidebar link is conditional: shown only when `subscription.type === 'group' || 'enterprise'`.
- Trial banner shown in Sidebar and Overview when `subscription.isTrial === true`.
- Pre-existing hook warning in GroupPractice (key prop) and invalid hook call in TrialGate — not blockers.
- `useTrialStatus` hook uses Supabase backend — coexists with UserContext independently.
