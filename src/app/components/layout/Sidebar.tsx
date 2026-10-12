import { NavLink, Link, useNavigate } from 'react-router';
import { LayoutGrid, Users, FileText, CreditCard, Calendar, MessageSquare, Settings, Shield, Sparkles, Clipboard, Activity, TrendingUp, UserPlus, BookOpen, X, HelpCircle, Mail, Building2, Receipt, Heart, LogOut, Dumbbell, GitBranch} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { user, subscription, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notesLabel = t(`common.notesLabels.${user?.notesLabel ?? 'Session Notes'}`, { defaultValue: user?.notesLabel ?? 'Session Notes' });
  const isTrial = subscription?.isTrial;
  const trialDays = subscription?.trialDaysRemaining ?? 0;
  const isMusculoskeletal = user?.profession === 'Physiotherapist' || user?.profession === 'Chiropractor' || user?.profession === 'Registered Massage Therapist';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        aria-label={t('sidebar.mainNav')}
        className={`
        w-[230px] bg-[var(--ink)] fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <button onClick={onClose} aria-label={t('sidebar.closeNav')} className="md:hidden absolute top-4 right-4 text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 p-5 pb-4 border-b border-white/[0.07] no-underline">
          <div className="w-[30px] h-[30px] bg-[var(--sage)] rounded-[7px] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-2 [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span className="font-[var(--font-display)] text-[17px] text-white">MentalPath</span>
        </Link>

        {/* Trial banner */}
        {isTrial && trialDays !== null && (
          <div className="mx-3 mt-2 px-2.5 py-2 bg-amber-500/20 rounded-lg border border-amber-400/20">
            <div className="text-[11px] font-medium text-amber-300">{t('sidebar.trialDays', { count: trialDays })}</div>
            <Link to="/dashboard/settings?tab=subscription" className="text-[10px] text-amber-400 no-underline hover:text-amber-200">{t('sidebar.upgrade')} →</Link>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/70 px-2 mb-1">{t('sidebar.sections.practice')}</div>
            <NavItem to="/dashboard" icon={LayoutGrid} label={t('sidebar.items.overview')} onClick={onClose} />
            <NavItem to="/dashboard/clients" icon={Users} label={t('sidebar.items.clients')} onClick={onClose} />
            <NavItem to="/dashboard/notes" icon={FileText} label={notesLabel} onClick={onClose} />
            <NavItem to="/dashboard/billing" icon={CreditCard} label={t('sidebar.items.billing')} onClick={onClose} />
            <NavItem to="/dashboard/insurance-receipts" icon={Receipt} label={t('sidebar.items.insuranceReceipts')} onClick={onClose} />
            <NavItem to="/dashboard/group-practice" icon={Building2} label={t('sidebar.items.groupPractice')} onClick={onClose} />
            <NavItem to="/dashboard/cultural-templates" icon={Sparkles} label={t('sidebar.items.culturalTemplates')} onClick={onClose} />
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/70 px-2 mb-1">{t('sidebar.sections.clinical')}</div>
            {import.meta.env.DEV && <NavItem to="/dashboard/clinical-tools" icon={Clipboard} label={t('sidebar.items.clinicalTools')} badge={t('sidebar.preview')} onClick={onClose} />}
            <NavItem to="/dashboard/session-prep" icon={Activity} label={t('sidebar.items.sessionPrep')} onClick={onClose} />
            <NavItem to="/dashboard/outcome-measures" icon={TrendingUp} label={t('sidebar.items.outcomeMeasures')} onClick={onClose} />
            {import.meta.env.DEV && isMusculoskeletal && <NavItem to="/dashboard/treatment-courses" icon={GitBranch} label={t('sidebar.items.treatmentCourses')} badge={t('sidebar.preview')} onClick={onClose} />}
            {import.meta.env.DEV && isMusculoskeletal && <NavItem to="/dashboard/hep-builder" icon={Dumbbell} label={t('sidebar.items.hepBuilder')} badge={t('sidebar.preview')} onClick={onClose} />}
            <NavItem to="/dashboard/waitlist" icon={UserPlus} label={t('sidebar.items.waitlist')} onClick={onClose} />
            <NavItem to="/dashboard/resources" icon={BookOpen} label={t('sidebar.items.resources')} onClick={onClose} />
            <NavItem to="/dashboard/therapist-wellbeing" icon={Heart} label={t('sidebar.items.wellbeing')} onClick={onClose} />
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/70 px-2 mb-1">{t('sidebar.sections.schedule')}</div>
            <NavItem to="/dashboard/calendar" icon={Calendar} label={t('sidebar.items.calendar')} onClick={onClose} />
            {import.meta.env.DEV && <NavItem to="/dashboard/messages" icon={MessageSquare} label={t('sidebar.items.messages')} badge={t('sidebar.preview')} onClick={onClose} />}
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/70 px-2 mb-1">{t('sidebar.sections.settings')}</div>
            <NavItem to="/dashboard/settings" icon={Settings} label={t('sidebar.items.settings')} onClick={onClose} />
            <NavItem to="/dashboard/compliance" icon={Shield} label={t('sidebar.items.compliance')} onClick={onClose} />
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/70 px-2 mb-1">{t('sidebar.sections.help')}</div>
            <NavItem to="/dashboard/faq" icon={HelpCircle} label={t('sidebar.items.faq')} onClick={onClose} />
            <NavItem to="/dashboard/support" icon={Mail} label={t('sidebar.items.support')} onClick={onClose} />
          </div>
        </div>

        {/* Plan badge */}
        <div className="mx-3 mb-2 flex items-center gap-2 bg-[var(--sage)]/20 rounded-md px-2.5 py-[7px] text-[11px] text-[var(--sage-light)] font-medium">
          <svg viewBox="0 0 16 16" className="w-3 h-3 flex-shrink-0 fill-none stroke-current stroke-[1.5]">
            <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z"/>
            <path d="M5.5 8l1.5 1.5 3-3"/>
          </svg>
          <span>{t('sidebar.residency')}</span>
          {subscription && (
            <span className="ml-auto text-[9px] text-white/70 uppercase font-semibold tracking-wider">
              {isTrial ? t('sidebar.trial') : t(`sidebar.plans.${subscription.type}`)}
            </span>
          )}
        </div>

        {/* User profile */}
        <div className="p-3.5 border-t border-white/[0.07] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--sage)] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
            {user?.initials ?? 'MP'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-white/85 truncate">{user ? `${user.firstName} ${user.lastName}` : t('sidebar.practitioner')}</div>
            <div className="text-[10px] text-white/70 truncate">{user ? t(`common.professions.${user.profession}`, { defaultValue: user.profession }) : t('sidebar.healthProfessional')}</div>
          </div>
          <button
            onClick={handleLogout}
            title={t('sidebar.signOut')}
            aria-label={t('sidebar.signOut')}
            className="text-white/70 hover:text-white/70 transition-colors flex-shrink-0 bg-transparent border-none cursor-pointer p-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ to, icon: Icon, label, badge, onClick }: { to: string; icon: any; label: string; badge?: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-sm no-underline cursor-pointer transition-colors duration-150 mb-0.5 ${
          isActive ? 'bg-[var(--sage)] text-white' : 'text-white/80 hover:bg-white/[0.07] hover:text-white'
        }`
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate">{label}</span>
          {badge && (
            <span className="ml-auto bg-[var(--sage-deep)] text-white text-[10px] px-1.5 py-0.5 rounded-lg font-medium flex-shrink-0">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
