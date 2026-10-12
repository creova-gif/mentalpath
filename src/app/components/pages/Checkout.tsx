import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { startCheckout } from '../../services/billing';

// Payment is handled on Stripe's hosted Checkout page (card data never touches
// MentalPath). This route only sends signed-in users there.
export function Checkout() {
  const { t } = useTranslation();
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = params.get('plan') === 'group' ? 'group' : 'solo';
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate('/onboarding', { replace: true });
      return;
    }
    // Group seats are bought by the practice owner from the practice page.
    if (plan === 'group') {
      navigate('/dashboard/group-practice', { replace: true });
      return;
    }
    startCheckout().catch(err => setError(err instanceof Error ? err.message : t('checkout.startFailed')));
  }, [isLoading, user, plan, navigate, t]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--warm)] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
        {error ? (
          <>
            <h1 className="font-serif text-2xl text-[var(--ink)]">{t('checkout.unavailable')}</h1>
            <p role="alert" className="text-sm text-[var(--ink-soft)]">{error}</p>
            <Link to="/dashboard/settings?tab=subscription" className="text-sm text-[var(--sage)] underline">{t('checkout.backToPlan')}</Link>
          </>
        ) : (
          <p role="status" className="text-sm text-[var(--ink-muted)]">{t('checkout.redirecting')}</p>
        )}
      </div>
    </main>
  );
}
