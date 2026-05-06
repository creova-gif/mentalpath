import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Briefcase, Calendar, DollarSign, Globe, Bell, Lock, Trash2, Save, Check, CreditCard, Zap, Users, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import type { PlanType, BillingCycle } from '../../context/UserContext';

type SettingsTab = 'profile' | 'practice' | 'scheduling' | 'billing' | 'subscription' | 'regions' | 'notifications' | 'security' | 'danger';

const PLANS = [
  {
    id: 'solo' as PlanType,
    name: 'Solo',
    monthlyPrice: 79,
    annualPrice: 69,
    description: 'Perfect for independent practitioners',
    features: [
      'Unlimited clients',
      'AI note drafting',
      'Online booking page',
      'Insurance receipts',
      'Outcome measures',
      'PHIPA-compliant records',
      'Canadian server hosting',
      'Email & chat support',
    ],
  },
  {
    id: 'group' as PlanType,
    name: 'Group',
    monthlyPrice: 69,
    annualPrice: 59,
    description: 'For clinics and multi-clinician practices',
    features: [
      'Everything in Solo',
      'Per-seat pricing',
      'Group practice dashboard',
      'Shared schedule view',
      'Practice analytics',
      'Compliance dashboard',
      'Clinician onboarding',
      'Priority support',
    ],
    highlight: true,
  },
  {
    id: 'enterprise' as PlanType,
    name: 'Enterprise',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'For health networks and large clinics',
    features: [
      'Everything in Group',
      'Custom seat pricing',
      'White-label option',
      'EMR/EHR integration',
      'Dedicated CSM',
      'SLA guarantee',
      'Custom compliance reporting',
      'SSO / SAML',
    ],
  },
];

const BILLING_HISTORY = [
  { date: 'Mar 1, 2026', description: 'MentalPath Solo Plan — March 2026', amount: '$79.00', status: 'Paid', invoice: 'INV-2026-003' },
  { date: 'Feb 1, 2026', description: 'MentalPath Solo Plan — February 2026', amount: '$79.00', status: 'Paid', invoice: 'INV-2026-002' },
  { date: 'Jan 1, 2026', description: 'MentalPath Solo Plan — January 2026', amount: '$79.00', status: 'Paid', invoice: 'INV-2026-001' },
  { date: 'Dec 1, 2025', description: 'MentalPath Solo Plan — December 2025', amount: '$79.00', status: 'Paid', invoice: 'INV-2025-012' },
  { date: 'Nov 1, 2025', description: 'MentalPath Solo Plan — November 2025', amount: '$79.00', status: 'Paid', invoice: 'INV-2025-011' },
];

export function Settings() {
  const { t } = useTranslation();
  const { user, subscription, setSubscription } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription?.cycle ?? 'monthly');
  const [confirmCancel, setConfirmCancel] = useState(false);

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

  const handleUpgrade = (planId: PlanType) => {
    if (!subscription) return;
    const plan = PLANS.find(p => p.id === planId)!;
    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    setSubscription({
      ...subscription,
      type: planId,
      cycle: billingCycle,
      pricePerSeat: price,
      isTrial: false,
      trialDaysRemaining: null,
      nextBillingAmount: price * (subscription.seats || 1),
      renewsOn: 'April 1, 2026',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: User },
    { id: 'practice', label: t('settings.tabs.practice'), icon: Briefcase },
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
          {activeTab !== 'subscription' && activeTab !== 'danger' && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--sage)] text-white border-none rounded-lg text-[13px] font-medium cursor-pointer transition-colors hover:bg-[var(--sage-deep)]"
            >
              <Save className="w-3.5 h-3.5" />
              {t('settings.saveChanges')}
            </button>
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
                  <span className="ml-auto text-[9px] font-semibold bg-amber-400 text-white rounded px-1 py-0.5">TRIAL</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{t('settings.profile.title')}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.profile.subtitle')}</div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-[var(--sage)] flex items-center justify-center font-[var(--font-display)] text-xl text-white flex-shrink-0">
                    {user?.initials ?? 'MP'}
                  </div>
                  <div>
                    <div className="text-[13px] text-[var(--ink-muted)] mb-1.5">{t('settings.profile.uploadHint')}</div>
                    <button className="inline-block px-3.5 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--ink-soft)] cursor-pointer hover:bg-[var(--warm)]">
                      {t('settings.profile.uploadBtn')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.profile.firstName')}</label>
                    <input type="text" defaultValue={user?.firstName ?? ''} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.profile.lastName')}</label>
                    <input type="text" defaultValue={user?.lastName ?? ''} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.profile.email')}</label>
                  <input type="email" defaultValue={user?.email ?? ''} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.profile.phone')}</label>
                    <input type="tel" defaultValue="+1 (416) 555-0123" className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.profile.pronouns')}</label>
                    <input type="text" defaultValue="she/her" placeholder={t('settings.profile.pronounsPlaceholder')} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Practice Info Tab */}
          {activeTab === 'practice' && (
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{t('settings.practice.title')}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.practice.subtitle')}</div>
                </div>
              </div>
              <div className="p-6 space-y-3.5">
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-[var(--sage-pale)] rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-[var(--sage)]/15 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[var(--sage-deep)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--sage-deep)]">{user.college}</div>
                      <div className="text-[11px] text-[var(--ink-muted)]">{user.registrationNumber} · {user.profession}</div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.practice.clinicName')}</label>
                  <input type="text" defaultValue="Northside Therapy Practice" placeholder={t('settings.practice.clinicNamePlaceholder')} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.practice.credentials')}</label>
                    <input type="text" defaultValue={user?.profession === 'Chiropractor' ? 'DC' : user?.profession === 'Registered Psychotherapist' ? 'RP, PhD' : 'PT, MSc'} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.practice.registrationNumber')}</label>
                    <input type="text" defaultValue={user?.registrationNumber ?? ''} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.practice.college')}</label>
                  <select defaultValue={user?.collegeAbbr} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                    <option value="CRPO">{t('settings.practice.colleges.CRPO')}</option>
                    <option value="CPO">{t('settings.practice.colleges.CPO')}</option>
                    <option value="OCSWSSW">{t('settings.practice.colleges.OCSWSSW')}</option>
                    <option value="CCO">{t('settings.practice.colleges.CCO')}</option>
                    <option value="CPT">{t('settings.practice.colleges.CPT')}</option>
                    <option value="CMTO">{t('settings.practice.colleges.CMTO')}</option>
                    <option value="COTO">{t('settings.practice.colleges.COTO')}</option>
                    <option value="CONO">{t('settings.practice.colleges.CONO')}</option>
                    <option value="CTCMPAO">{t('settings.practice.colleges.CTCMPAO')}</option>
                    <option value="CDO">{t('settings.practice.colleges.CDO')}</option>
                    <option value="CASLPO">{t('settings.practice.colleges.CASLPO')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{t('settings.practice.noteFormat')}</label>
                  <input type="text" value={user?.noteFormat ?? 'DAP / Process Notes'} readOnly className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] bg-[var(--warm)] text-[var(--ink-muted)] outline-none" />
                </div>
              </div>
            </div>
          )}

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
          {activeTab === 'subscription' && !subscription && (
            <div className="bg-white border border-[var(--border)] rounded-xl p-8 text-center">
              <div className="text-[var(--ink-muted)] text-sm mb-4">{t('settings.subscription.notSignedIn')}</div>
              <a href="/login" className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg text-[13px] font-medium no-underline inline-block hover:bg-[var(--sage-deep)]">{t('settings.subscription.signIn')}</a>
            </div>
          )}
          {activeTab === 'subscription' && subscription && (
            <div className="space-y-4">
              {/* Current plan card */}
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--ink)]">{t('settings.subscription.currentPlan')}</div>
                      <div className="text-xs text-[var(--ink-muted)] mt-0.5">
                        {subscription.isTrial ? t('settings.subscription.trialRemaining', { days: subscription.trialDaysRemaining }) : t('settings.subscription.activeSince', { date: subscription.startDate })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      subscription.isTrial ? 'bg-amber-100 text-amber-700' :
                      subscription.type === 'group' ? 'bg-[var(--sage-pale)] text-[var(--sage-deep)]' :
                      'bg-[var(--surface)] text-[var(--ink-soft)]'
                    }`}>
                      {subscription.isTrial ? t('settings.subscription.trial') : t(`settings.subscription.${subscription.type}`)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div>
                      <div className="text-xs text-[var(--ink-muted)] mb-1">{t('settings.subscription.plan')}</div>
                      <div className="text-sm font-semibold text-[var(--ink)] capitalize">{t(`settings.subscription.${subscription.type}`)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--ink-muted)] mb-1">{t('settings.subscription.billingCycle')}</div>
                      <div className="text-sm font-semibold text-[var(--ink)] capitalize">{t(`settings.subscription.cycles.${subscription.cycle}`)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--ink-muted)] mb-1">
                        {subscription.isTrial ? t('settings.subscription.trialEnds') : t('settings.subscription.nextBilling')}
                      </div>
                      <div className="text-sm font-semibold text-[var(--ink)]">{subscription.renewsOn}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--ink-muted)] mb-1">{t('settings.subscription.seats')}</div>
                      <div className="text-sm font-semibold text-[var(--ink)]">{subscription.seats} {subscription.seats > 1 ? t('settings.subscription.clinicians') : t('settings.subscription.clinician')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--ink-muted)] mb-1">{t('settings.subscription.ratePerSeat')}</div>
                      <div className="text-sm font-semibold text-[var(--ink)]">{subscription.isTrial ? t('settings.subscription.free') : `C$${subscription.pricePerSeat}/mo`}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--ink-muted)] mb-1">{t('settings.subscription.nextCharge')}</div>
                      <div className="text-sm font-semibold text-[var(--ink)]">{subscription.isTrial ? '—' : `C$${subscription.nextBillingAmount}.00`}</div>
                    </div>
                  </div>

                  {/* Payment method */}
                  {!subscription.isTrial && (
                    <div className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg mb-4">
                      <div className="w-8 h-5 bg-[#1a1f71] rounded flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">VISA</span>
                      </div>
                      <div className="text-[13px] text-[var(--ink)]">Visa ending in 4821</div>
                      <div className="text-[11px] text-[var(--ink-muted)]">{t('settings.subscription.expires', { date: '09/28' })}</div>
                      <button className="ml-auto text-xs text-[var(--sage)] hover:underline bg-transparent border-none cursor-pointer">{t('settings.subscription.update')}</button>
                    </div>
                  )}

                  {subscription.isTrial && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg mb-4 flex items-start gap-3">
                      <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[13px] font-semibold text-amber-800 mb-0.5">{t('settings.subscription.addPaymentKeepDataTitle')}</div>
                        <div className="text-[12px] text-amber-700">{t('settings.subscription.addPaymentKeepDataDesc', { days: subscription.trialDaysRemaining })}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <button className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] transition-colors">
                      {subscription.isTrial ? t('settings.subscription.addPaymentMethod') : t('settings.subscription.updatePaymentMethod')}
                    </button>
                    {!subscription.isTrial && (
                      <button onClick={() => setConfirmCancel(true)} className="px-4 py-2 border border-[var(--border)] text-[var(--ink-soft)] rounded-lg text-[13px] font-medium bg-transparent cursor-pointer hover:bg-[var(--warm)] transition-colors">
                        {t('settings.subscription.cancelPlan')}
                      </button>
                    )}
                  </div>

                  {confirmCancel && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800 mb-1">{t('settings.subscription.cancelConfirmTitle')}</div>
                      <div className="text-[12px] text-red-700 mb-3">{t('settings.subscription.cancelConfirmDesc')}</div>
                      <div className="flex gap-2">
                        <button className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-[12px] font-medium border-none cursor-pointer hover:bg-red-700">{t('settings.subscription.confirmCancellation')}</button>
                        <button onClick={() => setConfirmCancel(false)} className="px-3.5 py-1.5 border border-red-200 text-red-700 rounded-lg text-[12px] bg-transparent cursor-pointer hover:bg-red-50">{t('settings.subscription.keepMyPlan')}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan selection */}
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--ink)]">{t('settings.subscription.changePlan')}</div>
                        <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t('settings.subscription.allPlansInclude')}</div>
                      </div>
                    </div>
                    {/* Billing toggle */}
                    <div className="flex items-center gap-2 bg-[var(--warm)] rounded-lg p-1">
                      {(['monthly', 'annual'] as BillingCycle[]).map(cycle => (
                        <button
                          key={cycle}
                          onClick={() => setBillingCycle(cycle)}
                          className={`px-3 py-1.5 rounded-md text-[12px] font-medium border-none cursor-pointer transition-all ${
                            billingCycle === cycle ? 'bg-white text-[var(--ink)] shadow-sm' : 'bg-transparent text-[var(--ink-muted)]'
                          }`}
                        >
                          {t(`settings.subscription.cycles.${cycle}`)}
                          {cycle === 'annual' && <span className="ml-1 text-[10px] text-[var(--sage-deep)] font-semibold">{t('settings.subscription.cycles.discount')}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-3 gap-4">
                    {PLANS.map(plan => {
                      const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                      const isCurrentPlan = subscription.type === plan.id;
                      return (
                        <div
                          key={plan.id}
                          className={`relative rounded-xl border-2 p-5 flex flex-col transition-all ${
                            plan.highlight ? 'border-[var(--sage)]' : isCurrentPlan ? 'border-[var(--sage)]/50 bg-[var(--sage-pale)]/30' : 'border-[var(--border)]'
                          }`}
                        >
                          {plan.highlight && !isCurrentPlan && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--sage)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">{t('settings.subscription.mostPopular')}</div>
                          )}
                          {isCurrentPlan && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--ink)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">{t('settings.subscription.currentPlanBtn')}</div>
                          )}
                          <div className="text-sm font-bold text-[var(--ink)] mb-0.5">{t(`settings.subscription.plans.${plan.id}.name`)}</div>
                          <div className="text-[11px] text-[var(--ink-muted)] mb-4">{t(`settings.subscription.plans.${plan.id}.description`)}</div>
                          {plan.id === 'enterprise' ? (
                            <div className="text-2xl font-[var(--font-display)] text-[var(--ink)] mb-1">{t('settings.subscription.custom')}</div>
                          ) : (
                            <div className="flex items-baseline gap-1 mb-1">
                              <span className="text-2xl font-[var(--font-display)] text-[var(--ink)]">C${price}</span>
                              <span className="text-xs text-[var(--ink-muted)]">{t('settings.subscription.perClinicianMo')}</span>
                            </div>
                          )}
                          {plan.id !== 'enterprise' && billingCycle === 'annual' && (
                            <div className="text-[10px] text-[var(--sage-deep)] font-medium mb-3">{t('settings.subscription.billedAnnually', { amount: price * 12 })}</div>
                          )}
                          <div className="flex-1 space-y-1.5 mb-4">
                            {plan.features.map((_, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[12px] text-[var(--ink-soft)]">
                                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-[var(--sage)] mt-0.5 flex-shrink-0 fill-none stroke-current stroke-[2]"><polyline points="2 8 6 12 14 4"/></svg>
                                {t(`settings.subscription.plans.${plan.id}.features.${i}`)}
                              </div>
                            ))}
                          </div>
                          {plan.id === 'enterprise' ? (
                            <button className="w-full py-2 rounded-lg border-2 border-[var(--ink)] text-[var(--ink)] text-[13px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--warm)] transition-colors">
                              {t('settings.subscription.contactSales')}
                            </button>
                          ) : isCurrentPlan ? (
                            <button disabled className="w-full py-2 rounded-lg border-2 border-[var(--border)] text-[var(--ink-muted)] text-[13px] font-semibold bg-[var(--warm)] cursor-default">
                              {t('settings.subscription.currentPlanBtn')}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpgrade(plan.id)}
                              className="w-full py-2 rounded-lg border-none text-white text-[13px] font-semibold cursor-pointer transition-colors"
                              style={{ background: plan.highlight ? 'var(--sage)' : 'var(--ink)' }}
                            >
                              {subscription.type === 'enterprise' ? t('settings.subscription.downgradeTo', { name: t(`settings.subscription.plans.${plan.id}.name`) }) : t('settings.subscription.upgradeTo', { name: t(`settings.subscription.plans.${plan.id}.name`) })}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Billing history */}
                {!subscription.isTrial && (
                  <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-medium text-[var(--ink)]">{t('settings.subscription.billingHistory')}</div>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {BILLING_HISTORY.map((row, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-3">
                          <div className="text-[12px] text-[var(--ink-muted)] w-28 flex-shrink-0">{row.date}</div>
                          <div className="flex-1 text-[13px] text-[var(--ink)]">{row.description}</div>
                          <div className="text-[13px] font-medium text-[var(--ink)]">{row.amount}</div>
                          <span className="text-[11px] font-medium text-[var(--green)] bg-green-50 px-2 py-0.5 rounded-full">{row.status}</span>
                          <button className="text-xs text-[var(--sage)] hover:underline bg-transparent border-none cursor-pointer flex-shrink-0">{t('settings.subscription.download')}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}


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
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm font-medium text-[var(--ink)] mb-3">{t('settings.security.changePassword')}</div>
                  <div className="space-y-2.5 max-w-[400px]">
                    <input type="password" placeholder={t('settings.security.currentPassword')} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                    <input type="password" placeholder={t('settings.security.newPassword')} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                    <input type="password" placeholder={t('settings.security.confirmPassword')} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]" />
                  </div>
                  <button className="mt-3 px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)]">{t('settings.security.updatePassword')}</button>
                </div>
                <div className="pt-4 border-t border-[var(--border)]">
                  <label className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)] cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--sage)] cursor-pointer" />
                    {t('settings.security.autoLock')}
                  </label>
                  <div className="text-xs text-[var(--ink-muted)] ml-6 mt-1">{t('settings.security.phipaRequired')}</div>
                </div>
                <div className="pt-3 border-t border-[var(--border)]">
                  <label className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)] cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[var(--sage)] cursor-pointer" />
                    {t('settings.security.enable2fa')}
                  </label>
                  <div className="text-xs text-[var(--ink-muted)] ml-6 mt-1">{t('settings.security.desc2fa')}</div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="bg-white border border-[#f09595] rounded-xl p-6">
              <div className="text-sm font-semibold text-[var(--red)] mb-1.5">{t('settings.danger.deleteAccount')}</div>
              <div className="text-[13px] text-[var(--ink-muted)] mb-4 leading-relaxed max-w-[500px]">
                {t('settings.danger.deleteWarning')}
              </div>
              <div className="flex gap-2.5">
                <button className="px-4 py-2 rounded-lg border border-[#f09595] bg-white text-[var(--red)] text-[13px] font-medium cursor-pointer hover:bg-[#fde8e8]">{t('settings.danger.deleteBtn')}</button>
                <button className="px-4 py-2 rounded-lg bg-transparent text-[var(--ink-soft)] text-[13px] border border-[var(--border)] cursor-pointer hover:bg-[var(--warm)]">{t('settings.danger.exportBtn')}</button>
              </div>
            </div>
          )}
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
