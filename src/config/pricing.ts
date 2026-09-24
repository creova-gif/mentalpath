// Single source of truth for plans and prices shown in the app.
// Stripe prices must match: STRIPE_SOLO_PRICE_ID = C$49/month, STRIPE_GROUP_PRICE_ID = C$79/seat/month.
// Server-side limits live in supabase/migrations/20260924000400_billing_entitlements.sql
// and supabase/functions/make-server-4d1a502d/ai-routes.ts — keep them in sync.

export type PlanId = 'starter' | 'solo' | 'group';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceCad: number; // per clinician per month
  activeClientLimit: number | null; // null = unlimited
  aiAssistsPerMonth: number;
  available: boolean; // false = not yet sold
}

export const TRIAL_DAYS = 7;
export const TRIAL_AI_ASSISTS = 20;
export const CURRENCY = 'CAD';

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: { id: 'starter', name: 'Starter', priceCad: 0, activeClientLimit: 1, aiAssistsPerMonth: 0, available: true },
  solo: { id: 'solo', name: 'Solo Practitioner', priceCad: 49, activeClientLimit: null, aiAssistsPerMonth: 500, available: true },
  // Per seat; the practice owner buys seats (STRIPE_GROUP_PRICE_ID, quantity = seats).
  group: { id: 'group', name: 'Group Practice', priceCad: 79, activeClientLimit: null, aiAssistsPerMonth: 500, available: true },
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(amount);
}
