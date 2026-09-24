import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '../../context/UserContext';
import { openBillingPortal, startCheckout } from '../../services/billing';
import { PLANS, TRIAL_AI_ASSISTS, formatPrice, type PlanId } from '@/config/pricing';

const STATUS_LABEL: Record<string, string> = {
  none: 'No subscription', trialing: 'Trial', active: 'Active', past_due: 'Payment failed — retrying',
  unpaid: 'Unpaid', canceled: 'Cancelled', incomplete: 'Incomplete', incomplete_expired: 'Expired', paused: 'Paused',
};

const FEATURES: Record<PlanId, string[]> = {
  starter: ['1 active client', 'All note templates', 'Canadian data residency', 'Invoices & T2125 export'],
  solo: ['Unlimited clients', 'AI Note Assist (500/month)', 'Everything in Starter'],
  group: ['Multi-clinician practice', 'Owner dashboard & roles', 'Everything in Solo'],
};

export function SubscriptionSettings() {
  const { subscription } = useUser();
  const [busy, setBusy] = useState(false);
  if (!subscription) return null;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  };

  const plan = PLANS[subscription.type];
  const paid = ['active', 'trialing', 'past_due'].includes(subscription.status);

  return (
    <div className="space-y-4 max-w-3xl">
      <section className="bg-white border border-[var(--border)] rounded-xl p-6" aria-labelledby="current-plan">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="current-plan" className="text-sm font-medium text-[var(--ink)]">Current plan: {plan.name}</h2>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              {subscription.isTrial
                ? `Trial — ${subscription.trialDaysRemaining ?? 0} days left (${TRIAL_AI_ASSISTS} AI assists included)`
                : STATUS_LABEL[subscription.status] ?? subscription.status}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
              {plan.priceCad === 0 ? 'Free' : `${formatPrice(plan.priceCad)}`}
              {plan.priceCad > 0 && <span className="text-xs text-[var(--ink-muted)]"> /month</span>}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-[13px] mb-5">
          <div><dt className="text-xs text-[var(--ink-muted)]">{subscription.isTrial ? 'Trial ends' : 'Renews'}</dt><dd>{subscription.renewsOn}</dd></div>
          <div><dt className="text-xs text-[var(--ink-muted)]">Next charge</dt><dd>{paid && subscription.nextBillingAmount ? formatPrice(subscription.nextBillingAmount) : '—'}</dd></div>
          {subscription.cancelAt && (
            <div className="col-span-2 text-amber-800 text-xs">
              Cancels on {new Date(subscription.cancelAt).toLocaleDateString('en-CA', { dateStyle: 'long' })}. You'll move to Starter; your records stay available.
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          {!paid && (
            <button onClick={() => run(startCheckout)} disabled={busy}
              className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60">
              Subscribe to Solo — {formatPrice(PLANS.solo.priceCad)}/month
            </button>
          )}
          {subscription.hasBillingAccount && (
            <button onClick={() => run(openBillingPortal)} disabled={busy}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer hover:bg-[var(--warm)] disabled:opacity-60">
              Manage billing, invoices & cancellation
            </button>
          )}
        </div>
        {subscription.isTrial && subscription.status === 'none' && (
          <p className="text-xs text-[var(--ink-muted)] mt-3">
            Subscribing now keeps your remaining trial days — your card is charged when the trial ends. Prices in CAD; applicable taxes are shown at checkout.
          </p>
        )}
      </section>

      <section aria-labelledby="plans" className="grid md:grid-cols-3 gap-3">
        <h2 id="plans" className="sr-only">Plans</h2>
        {(Object.keys(PLANS) as PlanId[]).map(id => {
          const p = PLANS[id];
          const current = id === subscription.type;
          return (
            <div key={id} className={`bg-white border rounded-xl p-4 ${current ? 'border-[var(--sage)]' : 'border-[var(--border)]'}`}>
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="text-lg my-1" style={{ fontFamily: 'var(--font-display)' }}>
                {p.priceCad === 0 ? 'Free' : formatPrice(p.priceCad)}
                {p.priceCad > 0 && <span className="text-xs text-[var(--ink-muted)]"> /{id === 'group' ? 'clinician/' : ''}month</span>}
              </div>
              <ul className="text-xs text-[var(--ink-soft)] space-y-1 mb-3">
                {FEATURES[id].map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              {current ? (
                <span className="text-xs font-medium text-[var(--sage-deep)]">Current plan</span>
              ) : !p.available ? (
                <span className="text-xs text-[var(--ink-muted)]">Coming soon — <a href="/contact" className="underline">join the waitlist</a></span>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}
