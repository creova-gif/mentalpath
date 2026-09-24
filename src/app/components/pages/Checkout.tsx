import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useUser } from '../../context/UserContext';
import { startCheckout } from '../../services/billing';
import { PLANS, formatPrice } from '@/config/pricing';

// Payment is handled on Stripe's hosted Checkout page (card data never touches
// MentalPath). This route only sends signed-in users there.
export function Checkout() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = params.get('plan') === 'group' ? 'group' : 'solo';
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading || plan === 'group') return;
    if (!user) {
      navigate('/onboarding', { replace: true });
      return;
    }
    startCheckout().catch(err => setError(err instanceof Error ? err.message : 'Could not start checkout.'));
  }, [isLoading, user, plan, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--warm)] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
        {plan === 'group' ? (
          <>
            <h1 className="font-serif text-2xl text-[var(--ink)]">Group Practice is coming soon</h1>
            <p className="text-sm text-[var(--ink-soft)]">
              Multi-clinician practices ({formatPrice(PLANS.group.priceCad)}/clinician/month) aren't available yet. Start with Solo today, or tell us about your practice and we'll let you know when Group opens.
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/checkout?plan=solo" className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-sm no-underline">Choose Solo</Link>
              <Link to="/contact" className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm no-underline text-[var(--ink)]">Join the waitlist</Link>
            </div>
          </>
        ) : error ? (
          <>
            <h1 className="font-serif text-2xl text-[var(--ink)]">Checkout unavailable</h1>
            <p role="alert" className="text-sm text-[var(--ink-soft)]">{error}</p>
            <Link to="/dashboard/settings?tab=subscription" className="text-sm text-[var(--sage)] underline">Back to your plan</Link>
          </>
        ) : (
          <p role="status" className="text-sm text-[var(--ink-muted)]">Taking you to secure checkout…</p>
        )}
      </div>
    </main>
  );
}
