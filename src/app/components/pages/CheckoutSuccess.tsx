import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';

// Stripe redirects here after Checkout. The plan is activated by the Stripe
// webhook, which can take a few seconds — poll the profile until it shows up.
export function CheckoutSuccess() {
  const { subscription, refreshProfile } = useUser();
  const [timedOut, setTimedOut] = useState(false);
  const active = subscription && ['active', 'trialing'].includes(subscription.status);

  useEffect(() => {
    if (active) return;
    let attempts = 0;
    const id = setInterval(async () => {
      attempts += 1;
      await refreshProfile();
      if (attempts >= 15) {
        clearInterval(id);
        setTimedOut(true);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [active, refreshProfile]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--warm)] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4" aria-live="polite">
        {active ? (
          <>
            <CheckCircle className="w-12 h-12 text-[var(--sage)] mx-auto" aria-hidden="true" />
            <h1 className="font-serif text-2xl text-[var(--ink)]">You're subscribed to Solo</h1>
            <p className="text-sm text-[var(--ink-soft)]">
              {subscription?.isTrial
                ? `Your card will be charged when your trial ends on ${subscription.renewsOn}.`
                : `Next renewal: ${subscription?.renewsOn}. Receipts are emailed by Stripe.`}
            </p>
            <Link to="/dashboard" className="inline-block px-5 py-2.5 rounded-lg bg-[var(--sage)] text-white text-sm no-underline">Go to dashboard</Link>
          </>
        ) : timedOut ? (
          <>
            <h1 className="font-serif text-2xl text-[var(--ink)]">Payment received — finishing up</h1>
            <p className="text-sm text-[var(--ink-soft)]">
              Your plan is taking longer than usual to update. It will appear in Settings shortly; you won't be charged twice. Contact support if it hasn't updated within an hour.
            </p>
            <Link to="/dashboard/settings?tab=subscription" className="text-sm text-[var(--sage)] underline">View your plan</Link>
          </>
        ) : (
          <p role="status" className="text-sm text-[var(--ink-muted)]">Confirming your subscription…</p>
        )}
      </div>
    </main>
  );
}
