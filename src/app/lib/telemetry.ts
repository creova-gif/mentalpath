// PHI-safe error monitoring (Sentry) and product analytics (PostHog).
//
// Rules (see docs/privacy/privacy-impact-assessment.md):
//  • No session replay, no autocapture, no page text: clinical screens show PHI.
//  • URLs are reduced to route templates (IDs and query strings removed).
//  • Only the events and properties listed in EVENTS are sent — never names,
//    emails, note text, amounts or client identifiers.
//  • Both tools are off unless their env keys are set; configure EU/CA-hosted or
//    self-hosted ingest via VITE_POSTHOG_HOST / the Sentry DSN.
// Both SDKs are loaded on demand, only when configured, to keep them out of the
// main bundle.
type SentryModule = typeof import('@sentry/react');
type PostHog = typeof import('posthog-js').default;
let Sentry: SentryModule | null = null;
let posthog: PostHog | null = null;

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** '/dashboard/clients/3f2…?noteId=…' → '/dashboard/clients/:id' */
export function scrubUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.origin);
    return `${u.origin}${u.pathname.replace(UUID, ':id')}`;
  } catch {
    return url.split('?')[0].replace(UUID, ':id');
  }
}

// Allow-list of analytics events and their permitted properties.
const EVENTS = {
  signup_completed: ['profession', 'confirmation_required'],
  mfa_enrolled: [],
  client_created: ['is_first_client'],
  note_locked: ['note_format', 'ai_used'],
  ai_assist_enabled: [],
  ai_assist_used: ['note_format'],
  appointment_scheduled: [],
  invoice_created: [],
  checkout_started: ['plan'],
  data_exported: [],
  account_closed: [],
} as const satisfies Record<string, readonly string[]>;

export type AnalyticsEvent = keyof typeof EVENTS;


export async function initTelemetry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn) {
    Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      sendDefaultPii: false,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.1,
      // No Replay integration: screens contain client health information.
      beforeSend(event) {
        if (event.request) {
          event.request.url = scrubUrl(event.request.url);
          delete event.request.data;
          delete event.request.cookies;
          delete event.request.headers;
          delete event.request.query_string;
        }
        delete event.user;
        return event;
      },
      beforeBreadcrumb(crumb) {
        if (crumb.category === 'console' || crumb.category === 'ui.input') return null;
        if (crumb.data?.url) crumb.data.url = scrubUrl(String(crumb.data.url));
        if (crumb.data?.from) crumb.data.from = scrubUrl(String(crumb.data.from));
        if (crumb.data?.to) crumb.data.to = scrubUrl(String(crumb.data.to));
        return crumb;
      },
    });
  }

  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (key) {
    posthog = (await import('posthog-js')).default;
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      respect_dnt: true,
      ip: false,
      property_denylist: ['$initial_referrer', '$referrer', '$initial_current_url'],
      sanitize_properties: (props) => {
        for (const k of ['$current_url', '$pathname', '$referrer']) {
          if (typeof props[k] === 'string') props[k] = scrubUrl(props[k]);
        }
        return props;
      },
    });
  }
}

/** Sends an allow-listed event. Unknown properties are dropped. */
export function track(event: AnalyticsEvent, props: Record<string, string | number | boolean> = {}) {
  if (!posthog) return;
  const allowed = EVENTS[event] as readonly string[];
  const safe = Object.fromEntries(Object.entries(props).filter(([k]) => allowed.includes(k)));
  posthog.capture(event, safe);
}

/** Records a route view using the route template only. */
export function trackPageview() {
  posthog?.capture('$pageview', { $current_url: scrubUrl(window.location.href) });
}

/** Pseudonymous identify: the auth UUID only, never email or name. */
export function identify(userId: string | null) {
  if (!posthog) return;
  if (userId) posthog.identify(userId);
  else posthog.reset();
}

export function captureError(error: unknown) {
  Sentry?.captureException(error);
}
