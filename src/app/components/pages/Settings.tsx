import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { User, Briefcase, Calendar, DollarSign, Globe, Bell, Lock, Trash2, Save, Check, CreditCard, Zap, Users, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { SecuritySettings } from '../settings/SecuritySettings';
import { ProfileSettings } from '../settings/ProfileSettings';
import { SubscriptionSettings } from '../settings/SubscriptionSettings';
import { DangerZone } from '../settings/DangerZone';

type SettingsTab = 'profile' | 'practice' | 'scheduling' | 'billing' | 'subscription' | 'regions' | 'notifications' | 'security' | 'danger';

// Tabs whose controls are not persisted yet (no backing columns). Shown with a
// clear "preview" label instead of a Save button that silently does nothing.
const SETTINGS_TABS: SettingsTab[] = ['profile', 'scheduling', 'billing', 'subscription', 'regions', 'notifications', 'security', 'danger'];
const PREVIEW_TABS: SettingsTab[] = ['scheduling', 'billing', 'notifications'];

export function Settings() {
  const { t } = useTranslation();
  const { user, subscription } = useUser();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    SETTINGS_TABS.includes(requestedTab as SettingsTab) ? (requestedTab as SettingsTab) : 'profile',
  );
  const [saved, setSaved] = useState(false);

  const [bookingSlug, setBookingSlug] = useState('dr-osei');
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [sessionRate, setSessionRate] = useState(String(user?.sessionRate ?? 140));
  const [currency, setCurrency] = useState('CAD');
  const [timezone, setTimezone] = useState('America/Toronto');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const tabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: User },
    { id: 'scheduling', label: t('settings.tabs.scheduling'), icon: Calendar },
    { id: 'billing', label: t('settings.tabs.billing'), icon: DollarSign },
    { id: 'subscription', label: t('settings.tabs.subscription'), icon: CreditCard },
    { id: 'regions', label: t('settings.tabs.regions'), icon: Globe },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('settings.tabs.security'), icon: Lock },
    { id: 'danger', label: t('settings.tabs.danger'), icon: Trash2 },
  ];

  return (
    <div className="flex flex-col">
      {/* Top Bar */}
      <div className="h-[52px] bg-white border-b border-[var(--border)] flex items-center justify-between px-7 sticky top-0 z-40">
        <h1 className="font-[var(--font-display)] text-lg text-[var(--ink)]">{t('settings.title')}</h1>
        <div className="flex items-center gap-2.5">
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--green)]">
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              {t('settings.saved')}
            </div>
          )}
          {PREVIEW_TABS.includes(activeTab) && (
            <span className="text-xs text-[var(--ink-muted)] bg-[var(--warm)] border border-[var(--border)] rounded-md px-2.5 py-1">
              Preview — these settings are not saved yet
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-6 p-7">
        {/* Sidebar Nav */}
        <div className="w-[200px] flex-shrink-0">
          <div className="sticky top-[76px] space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-left rounded-lg border-none transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--sage)] text-white'
                    : 'bg-transparent text-[var(--ink-soft)] hover:bg-[var(--warm)]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                {tab.label}
                {tab.id === 'subscription' && subscription?.isTrial && (
                  <span className="ml-auto text-[9px] font-semibold bg-amber-700 text-white rounded px-1 py-0.5">TRIAL</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* Profile Tab */}
          {activeTab === 'profile' && <ProfileSettings />}

          {/* Scheduling Tab */}
          {activeTab === 'scheduling' && (
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{t('settings.scheduling.title')}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.scheduling.subtitle')}</div>
                </div>
              </div>
              <div className="p-6 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.scheduling.bookingUrl')}</label>
                  <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden max-w-[480px]">
                    <div className="px-3 py-2.5 bg-[var(--warm)] border-r border-[var(--border)] text-xs text-[var(--ink-muted)] whitespace-nowrap">mentalpath.ca/book/</div>
                    <input type="text" value={bookingSlug} onChange={e => setBookingSlug(e.target.value)} className="flex-1 px-3 py-2.5 border-none bg-transparent text-[13px] outline-none" />
                    <button className="px-3.5 py-2.5 border-l border-[var(--border)] bg-transparent text-[var(--sage)] text-xs font-medium cursor-pointer hover:bg-[var(--sage-pale)]">{t('settings.scheduling.copyLink')}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-2">{t('settings.scheduling.workingDays')}</label>
                  <div className="flex gap-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-9 h-9 rounded-lg border-[1.5px] text-xs font-medium cursor-pointer transition-all ${
                          workingDays.includes(day) ? 'bg-[var(--sage)] border-[var(--sage)] text-white' : 'bg-white border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
                        }`}
                      >{t(`settings.scheduling.days.${day}`)}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.scheduling.startTime')}</label>
                    <select className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                      <option>9:00 AM</option><option>10:00 AM</option><option>8:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.scheduling.endTime')}</label>
                    <select className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                      <option>5:00 PM</option><option>6:00 PM</option><option>4:00 PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.scheduling.sessionDuration')}</label>
                  <select className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                    <option value="50">{t('settings.scheduling.durations.50')}</option>
                    <option value="60">{t('settings.scheduling.durations.60')}</option>
                    <option value="30">{t('settings.scheduling.durations.30')}</option>
                    <option value="80">{t('settings.scheduling.durations.80')}</option>
                    <option value="45">{t('settings.scheduling.durations.45')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{t('settings.billing.title')}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.billing.subtitle')}</div>
                </div>
              </div>
              <div className="p-6 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.billing.sessionRate')}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[var(--ink-muted)]">C$</span>
                      <input type="number" value={sessionRate} onChange={e => setSessionRate(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.billing.currency')}</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                      <option value="CAD">{t('settings.billing.currencies.CAD')}</option>
                      <option value="USD">{t('settings.billing.currencies.USD')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)] cursor-pointer py-0.5">
                    <input type="checkbox" defaultChecked={user?.hstExempt === false} className="w-4 h-4 accent-[var(--sage)] cursor-pointer" />
                    {t('settings.billing.hstRegistered')}
                  </label>
                  <div className="text-xs text-[var(--ink-muted)] ml-6 mt-1">
                    {user?.hstExempt ? t('settings.billing.hstExempt') : t('settings.billing.hstAdded')}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)] cursor-pointer py-0.5">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--sage)] cursor-pointer" />
                    {t('settings.billing.acceptStripe')}
                  </label>
                  <div className="text-xs text-[var(--ink-muted)] ml-6 mt-1">{t('settings.billing.stripeDesc')}</div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)] cursor-pointer py-0.5">
                    <input type="checkbox" className="w-4 h-4 accent-[var(--sage)] cursor-pointer" />
                    {t('settings.billing.slidingScale')}
                  </label>
                  <div className="text-xs text-[var(--ink-muted)] ml-6 mt-1">{t('settings.billing.slidingScaleDesc')}</div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && <SubscriptionSettings />}

          {/* Region/Language Tab */}
          {activeTab === 'regions' && (
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{t('settings.regions.title')}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.regions.subtitle')}</div>
                </div>
              </div>
              <div className="p-6 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.regions.timezone')}</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                    <optgroup label={t('settings.regions.canadianTimezones')}>
                      <option value="America/Toronto">Eastern Time (Toronto)</option>
                      <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                      <option value="America/Edmonton">Mountain Time (Edmonton)</option>
                      <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                    </optgroup>
                    <optgroup label={t('settings.regions.usTimezones')}>
                      <option value="America/New_York">Eastern Time (New York)</option>
                      <option value="America/Chicago">Central Time (Chicago)</option>
                      <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.regions.dateFormat')}</label>
                  <select className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                    <option>YYYY-MM-DD (2026-03-16)</option>
                    <option>MM/DD/YYYY (03/16/2026)</option>
                    <option>DD/MM/YYYY (16/03/2026)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.regions.language')}</label>
                  <select 
                    value={i18n.language} 
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]"
                  >
                    <option value="en">{t('settings.regions.english')}</option>
                    <option value="fr">{t('settings.regions.french')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{t('settings.notifications.title')}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.notifications.subtitle')}</div>
                </div>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {[
                  { key: 'bookings' },
                  { key: 'reminders' },
                  { key: 'payment' },
                  { key: 'summary' },
                  { key: 'renewal', params: { college: user?.collegeAbbr ?? 'College' } },
                  { key: 'cpd' },
                ].map((notif, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-6 px-6 py-3.5">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--ink)] mb-0.5">{t(`settings.notifications.items.${notif.key}.label`, notif.params || {})}</div>
                      <div className="text-xs text-[var(--ink-muted)]">{t(`settings.notifications.items.${notif.key}.hint`)}</div>
                    </div>
                    <div className="relative w-10 h-[22px] flex-shrink-0">
                      <input type="checkbox" defaultChecked className="peer sr-only" id={`notif-${idx}`} />
                      <label htmlFor={`notif-${idx}`} className="absolute inset-0 rounded-full bg-black/15 cursor-pointer transition-colors peer-checked:bg-[var(--sage)]" />
                      <div className="absolute w-4 h-4 bg-white rounded-full top-[3px] left-[3px] transition-transform peer-checked:translate-x-[18px] shadow-sm pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{t('settings.security.title')}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.security.subtitle')}</div>
                </div>
              </div>
              <SecuritySettings />
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && <DangerZone />}
        </div>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2L3 7v5c0 5.25 3.9 10.15 9 11.25C17.1 22.15 21 17.25 21 12V7L12 2z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}
