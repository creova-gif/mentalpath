import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/app/lib/locale';
import { useUser } from '../../context/UserContext';
import { openBillingPortal, startCheckout } from '../../services/billing';
import { PLANS, TRIAL_AI_ASSISTS, formatPrice, type PlanId } from '@/config/pricing';

export function SubscriptionSettings() {
  const { t } = useTranslation();
  const { subscription } = useUser();
  const [busy, setBusy] = useState(false);
  if (!subscription) return null;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('planBanner.genericError'));
      setBusy(false);
    }
  };

  const plan = PLANS[subscription.type];
  const planName = (id: PlanId) => t(`subscription.plans.${id}.name`);
  const paid = ['active', 'trialing', 'past_due'].includes(subscription.status);

  return (
    <div className="space-y-4 max-w-3xl">
      <section className="bg-white border border-[var(--border)] rounded-xl p-6" aria-labelledby="current-plan">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="current-plan" className="text-sm font-medium text-[var(--ink)]">{t('subscription.current', { plan: planName(subscription.type) })}</h2>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              {subscription.isTrial
                ? t('subscription.trialStatus', { count: subscription.trialDaysRemaining ?? 0, assists: TRIAL_AI_ASSISTS })
                : t(`subscription.status.${subscription.status}`, { defaultValue: subscription.status })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
              {plan.priceCad === 0 ? t('subscription.free') : formatPrice(plan.priceCad)}
              {plan.priceCad > 0 && <span className="text-xs text-[var(--ink-muted)]"> {t('subscription.perMonth')}</span>}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-[13px] mb-5">
          <div><dt className="text-xs text-[var(--ink-muted)]">{subscription.isTrial ? t('subscription.trialEnds') : t('subscription.renews')}</dt><dd>{subscription.renewsOn}</dd></div>
          <div><dt className="text-xs text-[var(--ink-muted)]">{t('subscription.nextCharge')}</dt><dd>{paid && subscription.nextBillingAmount ? formatPrice(subscription.nextBillingAmount) : '—'}</dd></div>
          {subscription.cancelAt && (
            <div className="col-span-2 text-amber-800 text-xs">
              {t('subscription.cancels', { date: formatDate(subscription.cancelAt, 'long') })}
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          {subscription.viaPractice && (
            <p className="text-xs text-[var(--ink-muted)] w-full">{t('subscription.viaPractice')}</p>
          )}
          {!paid && !subscription.viaPractice && (
            <button onClick={() => run(startCheckout)} disabled={busy}
              className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60">
              {t('subscription.subscribeSolo', { price: formatPrice(PLANS.solo.priceCad) })}
            </button>
          )}
          {subscription.hasBillingAccount && (
            <button onClick={() => run(openBillingPortal)} disabled={busy}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer hover:bg-[var(--warm)] disabled:opacity-60">
              {t('subscription.manage')}
            </button>
          )}
        </div>
        {subscription.isTrial && subscription.status === 'none' && (
          <p className="text-xs text-[var(--ink-muted)] mt-3">
            {t('subscription.keepTrial')}
          </p>
        )}
      </section>

      <section aria-labelledby="plans" className="grid md:grid-cols-3 gap-3">
        <h2 id="plans" className="sr-only">{t('subscription.plansHeading')}</h2>
        {(Object.keys(PLANS) as PlanId[]).map(id => {
          const p = PLANS[id];
          const current = id === subscription.type;
          return (
            <div key={id} className={`bg-white border rounded-xl p-4 ${current ? 'border-[var(--sage)]' : 'border-[var(--border)]'}`}>
              <div className="text-sm font-semibold">{planName(id)}</div>
              <div className="text-lg my-1" style={{ fontFamily: 'var(--font-display)' }}>
                {p.priceCad === 0 ? t('subscription.free') : formatPrice(p.priceCad)}
                {p.priceCad > 0 && <span className="text-xs text-[var(--ink-muted)]"> {id === 'group' ? t('subscription.perSeat') : t('subscription.perMonth')}</span>}
              </div>
              <ul className="text-xs text-[var(--ink-soft)] space-y-1 mb-3">
                {(t(`subscription.plans.${id}.features`, { returnObjects: true }) as string[]).map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              {current ? (
                <span className="text-xs font-medium text-[var(--sage-deep)]">{t('subscription.currentPlan')}</span>
              ) : id === 'group' ? (
                <a href="/dashboard/group-practice" className="text-xs underline text-[var(--sage-deep)]">{t('subscription.setUpGroup')} →</a>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}
