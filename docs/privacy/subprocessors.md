# Subprocessors

| Vendor | Purpose | Data | Location | Enabled by |
|---|---|---|---|---|
| Supabase (on AWS) | Database, authentication, Edge Functions | All account and clinical data | Canada (ca-central-1) | Always |
| Stripe | Subscription billing | Clinician email, billing details (no PHI) | Canada/US | Always |
| Anthropic | AI Note Assist drafting | Note text written by the clinician (identifiers scrubbed) | United States | Clinician opt-in per account |
| Sentry | Frontend error monitoring | Error stack traces, route templates (no PHI) | Configurable (set DSN region) | `VITE_SENTRY_DSN` |
| PostHog | Product analytics | Allow-listed events, pseudonymous user ID (no PHI) | EU by default (`VITE_POSTHOG_HOST`) | `VITE_POSTHOG_KEY` |

Update this list and notify customers before adding a subprocessor that can access client health information.
