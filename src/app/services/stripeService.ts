import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_PRICE_SOLO_MONTHLY,
  STRIPE_PRICE_SOLO_ANNUAL,
  STRIPE_PRICE_GROUP_MONTHLY,
  STRIPE_PRICE_GROUP_ANNUAL,
  STRIPE_PAYMENT_LINK_SOLO,
  STRIPE_PAYMENT_LINK_GROUP,
  isLiveStripeConfigured 
} from '@/utils/supabase/config';

export type PlanKey = 'solo' | 'group';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanPricing {
  id: PlanKey;
  name: string;
  monthlyPriceCAD: number;
  annualPriceCAD: number;
  monthlyPriceId: string;
  annualPriceId: string;
  paymentLink?: string;
  features: string[];
}

export const STRIPE_PLANS: Record<PlanKey, PlanPricing> = {
  solo: {
    id: 'solo',
    name: 'Solo Practitioner',
    monthlyPriceCAD: 49,
    annualPriceCAD: 490,
    monthlyPriceId: STRIPE_PRICE_SOLO_MONTHLY,
    annualPriceId: STRIPE_PRICE_SOLO_ANNUAL,
    paymentLink: STRIPE_PAYMENT_LINK_SOLO,
    features: [
      'Unlimited clients & appointments',
      'PHIPA-compliant encrypted records',
      'AI-assisted DAP, SOAP & BIRP note synthesis',
      'Pre-flight Canadian PII scrubbing (ca-central-1)',
      'College-formatted audit-ready PDF export',
      'Direct online client booking portal',
      'Automated insurance receipts & T2125 tax summaries',
      '7-day free trial · Cancel anytime',
    ],
  },
  group: {
    id: 'group',
    name: 'Group Practice',
    monthlyPriceCAD: 79,
    annualPriceCAD: 790,
    monthlyPriceId: STRIPE_PRICE_GROUP_MONTHLY,
    annualPriceId: STRIPE_PRICE_GROUP_ANNUAL,
    paymentLink: STRIPE_PAYMENT_LINK_GROUP,
    features: [
      'Everything in Solo Practitioner',
      'Multi-clinician centralized dashboard',
      'Per-seat clinician billing & role management',
      'Clinic-wide schedule & room coordination',
      'Shared client files with granular permissions',
      'Custom clinic branding on client portal',
      'Priority telephone & dedicated compliance onboarding',
    ],
  },
};

export interface CheckoutOptions {
  plan: PlanKey;
  cycle?: BillingCycle;
  userEmail?: string;
  userId?: string;
  profession?: string;
}

export interface CheckoutResult {
  url?: string;
  mode: 'stripe_checkout_redirect' | 'payment_link_redirect' | 'embedded_checkout' | 'sandbox_mode';
  clientSecret?: string;
  message?: string;
}

export const stripeService = {
  isConfigured(): boolean {
    return isLiveStripeConfigured;
  },

  getPublishableKey(): string {
    return STRIPE_PUBLISHABLE_KEY;
  },

  getPriceId(plan: PlanKey, cycle: BillingCycle = 'monthly'): string {
    const config = STRIPE_PLANS[plan];
    return cycle === 'annual' ? config.annualPriceId : config.monthlyPriceId;
  },

  /**
   * Starts checkout. Attempts live Stripe session creation via Edge Function,
   * falls back to direct Stripe Payment Link if configured, or initiates embedded/sandbox flow.
   */
  async startCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const { plan, cycle = 'monthly', userEmail, userId, profession } = options;
    const planConfig = STRIPE_PLANS[plan];

    // 1. Direct Stripe Payment Link if present in environment
    if (planConfig.paymentLink && planConfig.paymentLink.startsWith('https://buy.stripe.com')) {
      const targetUrl = new URL(planConfig.paymentLink);
      if (userEmail) targetUrl.searchParams.set('prefilled_email', userEmail);
      if (userId) targetUrl.searchParams.set('client_reference_id', userId);
      return {
        url: targetUrl.toString(),
        mode: 'payment_link_redirect',
      };
    }

    // 2. Try Calling Backend Stripe Edge Function
    try {
      const sessionToken = localStorage.getItem('mentalpath_session');
      let accessToken = SUPABASE_ANON_KEY;
      if (sessionToken) {
        try {
          const parsed = JSON.parse(sessionToken);
          accessToken = parsed.access_token || parsed.currentSession?.access_token || SUPABASE_ANON_KEY;
        } catch {
          // ignore
        }
      }

      const endpoints = [
        `${SUPABASE_URL}/functions/v1/stripe-checkout`,
        `${SUPABASE_URL}/functions/v1/make-server-4d1a502d/stripe-checkout`,
      ];

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const response = await fetch(endpoint, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              plan,
              cycle,
              email: userEmail,
              user_id: userId,
              profession,
              origin: window.location.origin,
            }),
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.checkout_url) {
              return { url: data.checkout_url, mode: 'stripe_checkout_redirect' };
            }
            if (data.portal_url) {
              return { url: data.portal_url, mode: 'stripe_checkout_redirect' };
            }
            if (data.client_secret) {
              return { clientSecret: data.client_secret, mode: 'embedded_checkout' };
            }
          }
        } catch {
          // Continue to next fallback
        }
      }
    } catch (err) {
      console.warn('Stripe edge function unreachable, falling back to embedded/sandbox:', err);
    }

    // 3. Fallback: Return sandbox mode / embedded checkout path
    return {
      url: `/checkout?plan=${plan}&cycle=${cycle}`,
      mode: isLiveStripeConfigured ? 'embedded_checkout' : 'sandbox_mode',
      message: isLiveStripeConfigured 
        ? 'Loading embedded Stripe payment elements...'
        : 'Sandbox Evaluation Mode Active (Stripe keys not configured in environment).',
    };
  },

  /**
   * Activates local trial/subscription state in storage to ensure realistic behavior
   * in development and sandbox environments.
   */
  activateLocalSubscription(plan: PlanKey, cycle: BillingCycle = 'monthly', email?: string): void {
    try {
      const planConfig = STRIPE_PLANS[plan];
      const now = new Date();
      const renews = new Date();
      if (cycle === 'annual') {
        renews.setFullYear(now.getFullYear() + 1);
      } else {
        renews.setMonth(now.getMonth() + 1);
      }

      const activeSub = {
        type: plan,
        cycle,
        seats: plan === 'group' ? 3 : 1,
        pricePerSeat: cycle === 'annual' ? Math.round(planConfig.annualPriceCAD / 12) : planConfig.monthlyPriceCAD,
        trialDaysRemaining: null,
        isTrial: false,
        startDate: now.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
        renewsOn: renews.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
        nextBillingAmount: cycle === 'annual' ? planConfig.annualPriceCAD : planConfig.monthlyPriceCAD,
      };

      const cached = localStorage.getItem('mentalpath_demo_session');
      let profile = null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          profile = parsed.profile;
        } catch {
          // ignore
        }
      }

      localStorage.setItem('mentalpath_demo_session', JSON.stringify({
        profile: profile || {
          id: 'clinician_active',
          email: email || 'dr.osei@mentalpath.ca',
          name: 'Dr. Abena Osei-Mensah, RP',
          profession: 'Registered Psychotherapist',
          registrationNumber: 'CRPO-004821',
          city: 'Toronto, ON',
          sessionRate: 140,
          hstExempt: true,
        },
        subscription: activeSub,
      }));

      // Also mark in useTrialStatus
      localStorage.setItem('mentalpath_plan_type', plan);
      localStorage.setItem('mentalpath_trial_active', 'false');
    } catch (e) {
      console.error('Failed to update local subscription cache:', e);
    }
  },
};
