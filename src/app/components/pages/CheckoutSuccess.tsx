import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';

// Stripe redirects here after Checkout. The plan is activated by the Stripe
// webhook, which can take a few seconds — poll the profile until it shows up.
export function CheckoutSuccess() {
  const { t } = useTranslation();
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
            <h1 className="font-serif text-2xl text-[var(--ink)]">{t(`checkout.subscribed.${subscription?.type === 'group' ? 'group' : 'solo'}`)}</h1>
            <p className="text-sm text-[var(--ink-soft)]">
              {subscription?.isTrial
                ? t('checkout.trialCharge', { date: subscription.renewsOn })
                : t('checkout.nextRenewal', { date: subscription?.renewsOn })}
            </p>
            <Link to="/dashboard" className="inline-block px-5 py-2.5 rounded-lg bg-[var(--sage)] text-white text-sm no-underline">{t('checkout.goDashboard')}</Link>
          </>
        ) : timedOut ? (
          <>
            <h1 className="font-serif text-2xl text-[var(--ink)]">{t('checkout.finishingTitle')}</h1>
            <p className="text-sm text-[var(--ink-soft)]">
              {t('checkout.finishingBody')}
            </p>
            <Link to="/dashboard/settings?tab=subscription" className="text-sm text-[var(--sage)] underline">{t('checkout.viewPlan')}</Link>
          </>
        ) : (
          <p role="status" className="text-sm text-[var(--ink-muted)]">{t('checkout.confirming')}</p>
        )}
      </div>
    </main>
  );
}
