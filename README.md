# MentalPath 🍁

**Practice management dashboard for Canadian mental health practitioners**

Built with React, Supabase, and Stripe. Designed with PHIPA compliance requirements as a first-class consideration from the start, culturally-informed, and built specifically for solo and small-group practices in Canada.

> **On the PHIPA compliance claim:** this app has real, specific engineering behind PHIPA-aware design — audit logging on note access (`audit_log` table, written to on every view/edit), a 10-year retention policy citing PHIPA s.20 directly in the UI copy, and note auto-locking. That is a genuinely different starting point from a bare marketing claim. It is not the same as a formal legal compliance certification, which hasn't been independently verified here and shouldn't be asserted as complete without that review — especially since the backend is currently unreachable (see Project Status) and live configuration (data residency region, encryption settings) can't currently be confirmed from code alone.

## Overview

A practice management system for therapists and counsellors — client records, session notes, billing, and a client-facing intake portal, built around Canadian privacy law and culturally-informed care from the ground up.

## Problem

Generic practice-management software isn't built for Canadian health-privacy requirements (PHIPA) or for culturally-informed intake and care — practitioners serving racialized or immigrant clients often adapt US-centric tools that don't fit either their legal obligations or their clients' context.

## Solution

Client management, session notes (DAP/SOAP/BIRP/Progress formats with AI-assisted drafting), billing, and a client portal — with PHIPA-aware architecture (audit logging, retention policy, consent tracking) designed in from the start rather than retrofitted.

## Key Capabilities

- Client management with cultural-context tags
- Session notes with AI-powered draft assist (Claude) — no client PII sent to the AI service by design
- Billing/invoicing with Stripe, T2125 export for CRA
- Client portal: self-serve booking, culturally-informed intake templates, e-signature consent
- Audit logging on session note access, 10-year retention per PHIPA s.20, auto-lock after 24 hours

## Architecture

React frontend, Supabase backend (Postgres, Auth), Stripe for billing, Anthropic API for note-drafting assistance. Real Supabase seed data and edge functions exist in this repo (`seed_production.sql`, `seed_demo_users_fixed.sql`).

**Current blocker:** the Supabase project is paused behind an organization-level unpaid invoice (shared with two other CREOVA products). This is a billing issue, not a missing-backend issue — real backend work exists and was seeded.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Supabase (Postgres, Auth) |
| Billing | Stripe |
| AI | Anthropic API (note drafting) |

## Getting Started

```bash
git clone https://github.com/creova-gif/mentalpath.git
cd mentalpath
npm install
cp .env.example .env.local
npm run dev
```

See `DEPLOYMENT.md` for detailed setup.

## Configuration

Requires a Supabase project, Stripe account, and Anthropic API key — see `.env.example`.

## Security

Two candidate edge function directories exist (`server/`, `make-server-4d1a502d/`) — verify which is actually live before modifying either; this has not been confirmed yet.

## Project Status

Active development. Real PHIPA-aware engineering exists (audit logging, retention policy, note locking) but cannot currently be verified against live infrastructure — the Supabase project is paused. Do not represent this as a certified-compliant product externally until that verification happens and a formal compliance review is done.

## Roadmap

- [ ] Resolve Supabase billing block
- [ ] Verify audit logging and data residency configuration against live infrastructure
- [ ] Formal PHIPA compliance review
- [ ] Confirm which edge function directory is live; remove the dead one

## Contributing

Private, proprietary CREOVA product.

## License

Proprietary — © CREOVA. All rights reserved.

## Author / Organization

Built by [Justin Mafie](https://github.com/creova-gif) under CREOVA.

## Documentation

See `CLAUDE.md` for AI-agent-specific notes on this repo's real-but-unverified backend state.
