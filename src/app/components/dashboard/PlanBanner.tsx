import { useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../../context/UserContext';
import { openBillingPortal, startCheckout } from '../../services/billing';
import { PLANS, formatPrice } from '@/config/pricing';

// Plan status for the dashboard: trial countdown, Starter limits after the
// trial, or a failed payment. It never blocks access to clinical records.
export function PlanBanner() {
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

  const button = (label: string, fn: () => Promise<void>) => (
    <button
      onClick={() => run(fn)}
      disabled={busy}
      className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60"
    >
      {label}
    </button>
  );

  if (subscription.isPastDue) {
    return (
      <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 text-sm text-red-900">
          <strong className="block mb-1">Your last payment didn't go through.</strong>
          Stripe will retry automatically. Update your card to avoid moving to the free Starter plan. Your records stay available either way.
        </div>
        {button('Update payment method', openBillingPortal)}
      </div>
    );
  }

  if (subscription.isTrial && subscription.status === 'none') {
    const days = subscription.trialDaysRemaining ?? 0;
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 text-sm text-amber-900">
          <strong>{days} day{days === 1 ? '' : 's'} left in your Solo trial.</strong>{' '}
          Afterwards you'll move to the free Starter plan (1 active client, no AI Assist) unless you subscribe for {formatPrice(PLANS.solo.priceCad)}/month.
        </div>
        {button('Subscribe to Solo', startCheckout)}
      </div>
    );
  }

  if (subscription.type === 'starter') {
    return (
      <div className="flex items-center gap-3 bg-[var(--sage-pale)] border border-[var(--sage-light)] rounded-xl p-4 mb-6">
        <div className="flex-1 text-sm text-[var(--sage-deep)]">
          You're on the free <strong>Starter</strong> plan: 1 active client, no AI Assist. All your existing records remain available.
        </div>
        {button(`Upgrade to Solo — ${formatPrice(PLANS.solo.priceCad)}/mo`, startCheckout)}
      </div>
    );
  }

  return null;
}
