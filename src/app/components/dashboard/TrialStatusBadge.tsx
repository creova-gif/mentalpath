import { Crown, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { useUser } from '../../context/UserContext';
import { PLANS } from '@/config/pricing';

export function TrialStatusBadge() {
  const { subscription } = useUser();
  if (!subscription) return null;

  if (subscription.isTrial) {
    const days = subscription.trialDaysRemaining ?? 0;
    return (
      <Link to="/dashboard/settings?tab=subscription"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg no-underline hover:bg-amber-100">
        <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
        <span className="text-xs font-medium text-amber-800">Trial · {days}d left</span>
      </Link>
    );
  }

  return (
    <Link to="/dashboard/settings?tab=subscription"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--sage-pale)] border border-[var(--sage-light)] rounded-lg no-underline">
      <Crown className="w-3.5 h-3.5 text-[var(--sage)]" aria-hidden="true" />
      <span className="text-xs font-medium text-[var(--sage-deep)]">{PLANS[subscription.type].name}</span>
    </Link>
  );
}
