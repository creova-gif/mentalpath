import { useState } from 'react';
import { Search, Bell, Plus, Menu } from 'lucide-react';
import { useLocation } from 'react-router';
import { NewClientModal } from '../modals/NewClientModal';
import { TrialStatusBadge } from '../dashboard/TrialStatusBadge';
import { useUser } from '../../context/UserContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { user } = useUser();
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const notesLabel = user?.notesLabel ?? 'Session Notes';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Overview';
      case '/dashboard/clients':
        return 'Clients';
      case '/dashboard/notes':
        return notesLabel;
      case '/dashboard/billing':
        return 'Billing';
      case '/dashboard/insurance-receipts':
        return 'Insurance Receipts';
      case '/dashboard/group-practice':
        return 'Group Practice';
      case '/dashboard/calendar':
        return 'Calendar';
      case '/dashboard/messages':
        return 'Secure Messages';
      case '/dashboard/settings':
        return 'Practice Settings';
      case '/dashboard/compliance':
        return 'Compliance';
      case '/dashboard/cultural-templates':
        return 'Cultural Templates';
      case '/dashboard/clinical-tools':
        return 'Clinical Tools';
      case '/dashboard/session-prep':
        return 'Session Prep';
      case '/dashboard/outcome-measures':
        return 'Outcome Measures';
      case '/dashboard/waitlist':
        return 'Waitlist';
      case '/dashboard/resources':
        return 'Resources';
      case '/dashboard/therapist-wellbeing':
        return 'Your Wellbeing';
      case '/dashboard/treatment-courses':
        return 'Treatment Courses';
      case '/dashboard/hep-builder':
        return 'HEP Builder';
      case '/dashboard/cost-savings':
        return 'What You Save';
      case '/dashboard/faq':
        return 'FAQ';
      case '/dashboard/support':
        return 'Support';
      default:
        return 'MentalPath';
    }
  };

  return (
    <>
      <div className="h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 md:px-7 sticky top-0 z-40">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
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
          <div className="hidden lg:flex items-center gap-2 bg-[var(--warm)] border border-[var(--border)] rounded-lg px-3 py-[7px] text-[13px] text-[var(--ink-muted)]">
            <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="hidden xl:inline">Search clients, notes...</span>
            <span className="xl:hidden">Search...</span>
          </div>

          {/* Search button on mobile */}
          <button className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[var(--ink-muted)] border border-[var(--border)] hover:bg-[var(--warm)] hover:text-[var(--ink)] transition-colors">
            <Search className="w-4 h-4" strokeWidth={1.8} />
          </button>

          {/* Notifications */}
          <button className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--ink-muted)] border border-[var(--border)] hover:bg-[var(--warm)] hover:text-[var(--ink)] transition-colors">
            <Bell className="w-4 h-4" strokeWidth={1.8} />
          </button>

          {/* New client button */}
          <button
            onClick={() => setShowNewClientModal(true)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">New client</span>
          </button>
        </div>
      </div>

      {showNewClientModal && <NewClientModal onClose={() => setShowNewClientModal(false)} />}
    </>
  );
}