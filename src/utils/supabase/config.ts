import { projectId, publicAnonKey } from '/utils/supabase/info';

/**
 * Single source of truth for Supabase and Stripe application configuration.
 * Prioritizes environment variables from .env / Vercel / Cloudflare,
 * with graceful fallback to project defaults.
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;
export const SERVER_URL = `${SUPABASE_URL}/functions/v1/make-server-4d1a502d`;

// Stripe Public Configuration
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
export const STRIPE_PRICE_SOLO_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_SOLO || '';
export const STRIPE_PRICE_SOLO_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_SOLO_ANNUAL || '';
export const STRIPE_PRICE_GROUP_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_GROUP || '';
export const STRIPE_PRICE_GROUP_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_GROUP_ANNUAL || '';

// Optional Direct Stripe Payment Links (No backend required)
export const STRIPE_PAYMENT_LINK_SOLO = import.meta.env.VITE_STRIPE_PAYMENT_LINK_SOLO || '';
export const STRIPE_PAYMENT_LINK_GROUP = import.meta.env.VITE_STRIPE_PAYMENT_LINK_GROUP || '';

export const isLiveStripeConfigured = Boolean(
  STRIPE_PUBLISHABLE_KEY && 
  (STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_') || STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) &&
  !STRIPE_PUBLISHABLE_KEY.includes('placeholder')
);
