import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/supabase/client', () => ({ supabase: {} }));
const { buildSubscriptionFromClinicianRow } = await import('@/app/context/UserContext');

const NOW = new Date('2026-09-24T12:00:00Z');
const base = {
  id: 'u', first_name: 'A', last_name: 'B', profession: 'psychotherapist', reg_number: null, city: null,
  session_rate: 150, hst_exempt: true, plan_type: 'solo', plan_cycle: 'monthly', plan_seats: 1, price_per_seat: 49,
  is_trial: true, trial_ends_at: null as string | null, plan_starts_at: null, plan_renews_at: null,
  created_at: null, updated_at: null, ai_assist_enabled: false, subscription_status: 'none',
  stripe_customer_id: null, current_period_end: null, cancel_at: null,
};

// Mirrors public.effective_plan() — keep these cases in sync with supabase/tests/15_billing_entitlements.sql
describe('buildSubscriptionFromClinicianRow', () => {
  it('signup trial → Solo with days remaining', () => {
    const s = buildSubscriptionFromClinicianRow({ ...base, trial_ends_at: '2026-09-27T12:00:00Z' }, NOW);
    expect(s).toMatchObject({ type: 'solo', isTrial: true, trialDaysRemaining: 3, nextBillingAmount: 0 });
  });

  it('expired trial without subscription → Starter (free)', () => {
    const s = buildSubscriptionFromClinicianRow({ ...base, trial_ends_at: '2026-09-20T12:00:00Z' }, NOW);
    expect(s).toMatchObject({ type: 'starter', isTrial: false, pricePerSeat: 0, nextBillingAmount: 0 });
  });

  it('active Stripe subscription → paid Solo', () => {
    const s = buildSubscriptionFromClinicianRow({
      ...base, is_trial: false, subscription_status: 'active', stripe_customer_id: 'cus_1',
      current_period_end: '2026-10-24T12:00:00Z',
    }, NOW);
    expect(s).toMatchObject({ type: 'solo', isTrial: false, hasBillingAccount: true, nextBillingAmount: 49 });
    expect(s.renewsOn).toContain('2026');
  });

  it('past_due keeps Solo and flags the payment problem', () => {
    const s = buildSubscriptionFromClinicianRow({ ...base, is_trial: false, subscription_status: 'past_due' }, NOW);
    expect(s).toMatchObject({ type: 'solo', isPastDue: true });
  });

  it('canceled → Starter', () => {
    const s = buildSubscriptionFromClinicianRow({ ...base, is_trial: false, subscription_status: 'canceled' }, NOW);
    expect(s.type).toBe('starter');
  });

  it('no profile row → Starter', () => {
    expect(buildSubscriptionFromClinicianRow(null, NOW).type).toBe('starter');
  });

  it('members of a paid practice get Group without paying themselves', () => {
    const s = buildSubscriptionFromClinicianRow({ ...base, is_trial: false }, NOW, 'group');
    expect(s.type).toBe('group');
    expect(s.viaPractice).toBe(true);
    expect(s.nextBillingAmount).toBe(0);
    expect(buildSubscriptionFromClinicianRow({ ...base, is_trial: false }, NOW, 'starter').type).toBe('starter');
  });
});
