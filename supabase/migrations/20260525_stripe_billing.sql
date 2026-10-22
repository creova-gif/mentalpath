-- ============================================================
-- MentalPath — Stripe Billing & Customer Tracking Migration
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE clinicians
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index for instant Stripe webhook customer lookup
CREATE INDEX IF NOT EXISTS idx_clinicians_stripe_customer_id
  ON clinicians (stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_clinicians_stripe_subscription_id
  ON clinicians (stripe_subscription_id);
