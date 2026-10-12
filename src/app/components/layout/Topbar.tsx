import { useState } from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import { Link } from 'react-router';
import { useLocation } from 'react-router';
import { NewClientModal } from '../modals/NewClientModal';
import { TrialStatusBadge } from '../dashboard/TrialStatusBadge';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useUser();
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const notesLabel = t(`common.notesLabels.${user?.notesLabel ?? 'Session Notes'}`, { defaultValue: user?.notesLabel ?? 'Session Notes' });

  const TITLES: Record<string, string> = {
    '/dashboard': 'overview', '/dashboard/clients': 'clients', '/dashboard/billing': 'billing',
    '/dashboard/insurance-receipts': 'insuranceReceipts', '/dashboard/group-practice': 'groupPractice',
    '/dashboard/calendar': 'calendar', '/dashboard/messages': 'messages', '/dashboard/settings': 'settings',
    '/dashboard/cultural-templates': 'culturalTemplates', '/dashboard/clinical-tools': 'clinicalTools',
    '/dashboard/session-prep': 'sessionPrep', '/dashboard/outcome-measures': 'outcomeMeasures', '/dashboard/waitlist': 'waitlist',
    '/dashboard/resources': 'resources', '/dashboard/therapist-wellbeing': 'wellbeing', '/dashboard/treatment-courses': 'treatmentCourses',
    '/dashboard/hep-builder': 'hepBuilder', '/dashboard/faq': 'faq', '/dashboard/support': 'support',
  };
  const getPageTitle = () => {
    if (location.pathname === '/dashboard/notes') return notesLabel;
    if (location.pathname === '/dashboard/compliance') return t('sidebar.pageTitles.compliance');
    const key = TITLES[location.pathname];
    return key ? t(`sidebar.items.${key}`) : 'MentalPath';
  };

  return (
    <>
      <div className="h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 md:px-7 sticky top-0 z-40">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label={t('sidebar.openNav')}
            className="md:hidden p-2 -ml-2 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-[var(--font-display)] text-lg sm:text-xl text-[var(--ink)] tracking-tight">
            {getPageTitle()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Trial Status Badge */}
          <TrialStatusBadge />
          
          {/* Search - hidden on mobile */}
          <Link to="/dashboard/clients" className="hidden lg:flex items-center gap-2 bg-[var(--warm)] border border-[var(--border)] rounded-lg px-3 py-[7px] text-[13px] text-[var(--ink-muted)] no-underline hover:text-[var(--ink)]">
            <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
            {t('sidebar.searchClients')}
          </Link>

          {/* New client button */}
          <button
            onClick={() => setShowNewClientModal(true)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">{t('sidebar.newClient')}</span>
          </button>
        </div>
      </div>

      {showNewClientModal && <NewClientModal onClose={() => setShowNewClientModal(false)} />}
    </>
  );
}