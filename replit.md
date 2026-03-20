# MentalPath - Practice Management Dashboard

## Overview
MentalPath is a specialized practice management dashboard for Canadian mental health practitioners. It includes client management, AI-powered session note drafting (PHIPA-compliant), billing/invoicing with Stripe (CAD), secure messaging, and a client portal.

## Tech Stack
- **Frontend:** React 18, React Router 7, Tailwind CSS v4, Radix UI, Shadcn UI
- **Build Tool:** Vite 6
- **Package Manager:** npm
- **Language:** TypeScript
- **Backend Platform:** Supabase (Database + Edge Functions via Deno/Hono)
- **AI:** Anthropic Claude (claude-sonnet-4-20250514) for clinical notes
- **Payments:** Stripe (CAD)
- **i18n:** i18next (English + French)

## Project Structure
```
src/
  app/
    components/     # UI components (dashboard, layout, modals, pages, ui)
    hooks/          # Custom React hooks
    services/       # API services (aiNoteService)
    utils/          # Shared utilities
    App.tsx         # Root component
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
- `/book` - Public therapist booking page (5-step flow: session type, date/time, about you, consent, confirmation)
- `/dashboard/clients/:clientId` - Full client profile (7 tabs: overview, notes, invoices, outcomes, treatment, intake, safety)
- `/session-note-editor` - Session note editor (DAP/SOAP/BIRP/Progress formats, AI assist, lock & finalise)
- `/dashboard/*` - Dashboard routes (clients, notes, billing, calendar, messages, etc.)

## Key Notes
- Canadian market focus: PHIPA compliance, Ontario CRPO standards, CAD currency
- AI generates clinical notes in DAP, SOAP, BIRP, and Progress formats
- 7-day trial system tracked via backend + local storage
- Vite dev server configured with `allowedHosts: true` for Replit proxy support
