import { NavLink, Link, useNavigate } from 'react-router';
import { LayoutGrid, Users, FileText, CreditCard, Calendar, MessageSquare, Settings, Shield, Sparkles, Clipboard, Activity, TrendingUp, UserPlus, BookOpen, X, HelpCircle, Mail, Building2, Receipt, Heart, LogOut, CreditCard as PlanIcon } from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, subscription, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notesLabel = user?.notesLabel ?? 'Session Notes';
  const isGroup = subscription?.type === 'group' || subscription?.type === 'enterprise';
  const isTrial = subscription?.isTrial;
  const trialDays = subscription?.trialDaysRemaining ?? 0;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        w-[230px] bg-[var(--ink)] fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-white/70 hover:text-white">
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
            <div className="text-[11px] font-medium text-amber-300">{trialDays} days left in trial</div>
            <Link to="/dashboard/settings?tab=subscription" className="text-[10px] text-amber-400 no-underline hover:text-amber-200">Upgrade now →</Link>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/30 px-2 mb-1">Practice</div>
            <NavItem to="/dashboard" icon={LayoutGrid} label="Overview" onClick={onClose} />
            <NavItem to="/dashboard/clients" icon={Users} label="Clients" badge="23" onClick={onClose} />
            <NavItem to="/dashboard/notes" icon={FileText} label={notesLabel} badge="3" onClick={onClose} />
            <NavItem to="/dashboard/billing" icon={CreditCard} label="Billing" onClick={onClose} />
            <NavItem to="/dashboard/insurance-receipts" icon={Receipt} label="Insurance Receipts" onClick={onClose} />
            {isGroup && <NavItem to="/dashboard/group-practice" icon={Building2} label="Group Practice" onClick={onClose} />}
            <NavItem to="/dashboard/cultural-templates" icon={Sparkles} label="Cultural Templates" onClick={onClose} />
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/30 px-2 mb-1">Clinical</div>
            <NavItem to="/dashboard/clinical-tools" icon={Clipboard} label="Clinical Tools" onClick={onClose} />
            <NavItem to="/dashboard/session-prep" icon={Activity} label="Session Prep" onClick={onClose} />
            <NavItem to="/dashboard/outcome-measures" icon={TrendingUp} label="Outcome Measures" onClick={onClose} />
            <NavItem to="/dashboard/waitlist" icon={UserPlus} label="Waitlist" onClick={onClose} />
            <NavItem to="/dashboard/resources" icon={BookOpen} label="Resources" onClick={onClose} />
            <NavItem to="/dashboard/therapist-wellbeing" icon={Heart} label="Your Wellbeing" onClick={onClose} />
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/30 px-2 mb-1">Schedule</div>
            <NavItem to="/dashboard/calendar" icon={Calendar} label="Calendar" onClick={onClose} />
            <NavItem to="/dashboard/messages" icon={MessageSquare} label="Secure Messages" onClick={onClose} />
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/30 px-2 mb-1">Settings</div>
            <NavItem to="/dashboard/settings" icon={Settings} label="Practice Settings" onClick={onClose} />
            <NavItem to="/dashboard/compliance" icon={Shield} label="Compliance" onClick={onClose} />
          </div>

          <div className="py-4 px-3">
            <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/30 px-2 mb-1">Help</div>
            <NavItem to="/dashboard/faq" icon={HelpCircle} label="FAQ" onClick={onClose} />
            <NavItem to="/dashboard/support" icon={Mail} label="Support" onClick={onClose} />
          </div>
        </div>

        {/* Plan badge */}
        <div className="mx-3 mb-2 flex items-center gap-2 bg-[var(--sage)]/20 rounded-md px-2.5 py-[7px] text-[11px] text-[var(--sage-light)] font-medium">
          <svg viewBox="0 0 16 16" className="w-3 h-3 flex-shrink-0 fill-none stroke-current stroke-[1.5]">
            <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z"/>
            <path d="M5.5 8l1.5 1.5 3-3"/>
          </svg>
          <span>CA servers · PHIPA compliant</span>
          {subscription && (
            <span className="ml-auto text-[9px] text-white/40 uppercase font-semibold tracking-wider">
              {subscription.type === 'group' ? 'Group' : subscription.type === 'enterprise' ? 'Enterprise' : isTrial ? 'Trial' : 'Solo'}
            </span>
          )}
        </div>

        {/* User profile */}
        <div className="p-3.5 border-t border-white/[0.07] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--sage)] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
            {user?.initials ?? 'MP'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-white/85 truncate">{user ? `${user.firstName} ${user.lastName}` : 'Practitioner'}</div>
            <div className="text-[10px] text-white/35 truncate">{user?.profession ?? 'Health Professional'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 bg-transparent border-none cursor-pointer p-1"
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
        `flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-sm text-white/55 no-underline cursor-pointer transition-all duration-150 mb-0.5 ${
          isActive ? 'bg-[var(--sage)] text-white' : 'hover:bg-white/[0.07] hover:text-white/85'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
      <span className="truncate">{label}</span>
      {badge && (
        <span className="ml-auto bg-[var(--sage-light)] text-white text-[10px] px-1.5 py-0.5 rounded-lg font-medium flex-shrink-0">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
