import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Eye, EyeOff, Shield, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { startTrial } from '../../hooks/useTrialStatus';
import { OnboardingProgress } from '../ui/ProgressBar';
import { fireSuccessConfetti } from '../ui/SuccessAnimation';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

const professions = [
  { id: 'psychotherapist', icon: '🧠', name: 'Psycho-therapist', college: 'CRPO (ON)', notes: 'DAP, SOAP, BIRP, Progress', outcomes: 'PHQ-9, GAD-7, WHODAS', billing: 'Self-pay / private', hst: 'Exempt (ON)', credentials: 'RP' },
  { id: 'psychologist', icon: '🔬', name: 'Psychologist', college: 'CPO (ON)', notes: 'DAP, SOAP, BIRP, Progress', outcomes: 'PHQ-9, GAD-7, WHODAS', billing: 'Self-pay / OHIP', hst: 'Exempt (ON)', credentials: 'PhD, C.Psych' },
  { id: 'social_worker', icon: '🤝', name: 'Social Worker', college: 'OCSWSSW (ON)', notes: 'DAP, SOAP, Progress', outcomes: 'PHQ-9, GAD-7', billing: 'Self-pay / EAP', hst: 'Exempt (ON)', credentials: 'RSW' },
  { id: 'chiropractor', icon: '🦴', name: 'Chiropractor', college: 'CCO (ON)', notes: 'SOAP, Progress', outcomes: 'Oswestry, NPRS, PSFS', billing: 'Extended health', hst: 'Taxable (13%)', credentials: 'DC' },
  { id: 'physiotherapist', icon: '⚡', name: 'Physio-therapist', college: 'CPT (ON)', notes: 'SOAP, Progress', outcomes: 'Oswestry, DASH, NPRS', billing: 'Extended health', hst: 'Taxable (13%)', credentials: 'PT' },
  { id: 'rmt', icon: '💆', name: 'Massage Therapist', college: 'CMTO (ON)', notes: 'SOAP, Progress', outcomes: 'NPRS, PSFS', billing: 'Extended health', hst: 'Taxable (13%)', credentials: 'RMT' },
  { id: 'occupational', icon: '🔧', name: 'Occupational Therapist', college: 'COTO (ON)', notes: 'SOAP, DAP, Progress', outcomes: 'WHODAS, COPM, FIM', billing: 'Extended / OHIP', hst: 'Varies', credentials: 'OT Reg. (Ont.)' },
  { id: 'naturopath', icon: '🌿', name: 'Naturopath', college: 'CONO (ON)', notes: 'SOAP, Progress', outcomes: 'PHQ-9, GAD-7', billing: 'Extended health', hst: 'Varies', credentials: 'ND' },
  { id: 'acupuncturist', icon: '🪡', name: 'Acupuncturist', college: 'CTCMPAO (ON)', notes: 'SOAP, Progress', outcomes: 'NPRS, PHQ-9', billing: 'Extended health', hst: 'Taxable', credentials: 'R.Ac.' },
  { id: 'dietitian', icon: '🥗', name: 'Dietitian', college: 'CDO (ON)', notes: 'SOAP, DAP, Progress', outcomes: 'PHQ-9, GAD-7', billing: 'Extended / self-pay', hst: 'Exempt', credentials: 'RD' },
  { id: 'slp', icon: '🗣️', name: 'Speech-Language Pathologist', college: 'CASLPO (ON)', notes: 'SOAP, Progress', outcomes: 'Functional scales', billing: 'Extended / OHIP', hst: 'Exempt', credentials: 'SLP Reg. (Ont.)' },
];

const colleges = [
  { id: 'CRPO', name: 'CRPO (ON)' },
  { id: 'OCSWSSW', name: 'OCSWSSW (ON)' },
  { id: 'CPO', name: 'CPO (ON)' },
  { id: 'CPSBC', name: 'CPSBC (BC)' },
  { id: 'CCPA', name: 'CCPA (National)' },
  { id: 'OPQ', name: 'OPQ (QC)' },
  { id: 'Other', name: 'Other' },
];

const provinces = [
  { code: 'ON', name: 'Ontario' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'AB', name: 'Alberta' },
  { code: 'QC', name: 'Quebec' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'PE', name: 'PEI' },
  { code: 'NL', name: 'Newfoundland' },
];

const intakeTemplates = [
  { value: 'standard', name: 'Standard general intake' },
  { value: 'newcomer', name: 'Newcomer / immigrant stress' },
  { value: 'bipoc', name: 'BIPOC mental health' },
  { value: 'lgbtq', name: 'LGBTQ+ affirming intake' },
  { value: 'youth', name: 'Youth & emerging adults' },
  { value: 'trauma', name: 'Trauma-informed intake' },
  { value: 'couples', name: 'Couples therapy intake' },
];

export function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'solo' | 'group'>('solo');
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    practiceName: '',
    credentials: '',
    registrationNumber: '',
    province: 'ON',
    sessionRate: '140',
    clientFirstName: '',
    clientLastName: '',
    clientEmail: '',
    clientTemplate: 'standard',
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });
    checkPasswordStrength(value);
  };

  const handleSubmit = (isSkip = false) => {
    // Save email for later use
    localStorage.setItem('user_email', formData.email);
    
    // Start the 7-day free trial with user's email
    startTrial(formData.email);
    
    // In production, this would create the account and redirect to dashboard
    console.log('Onboarding completed:', formData);
    console.log('7-day free trial started for:', formData.email);

    if (!isSkip && formData.clientFirstName && formData.clientLastName) {
      fireSuccessConfetti();
    }

    navigate('/dashboard');
  };

  const selectedProfession = professions.find(p => p.id === selectedProfessionId);

  const canContinueStep1 = formData.fullName && formData.email && formData.password.length >= 8;
  const canContinueStep2 = !!selectedProfessionId;
  const canContinueStep3 = formData.credentials && formData.registrationNumber && selectedCollege;

  return (
    <div className="grid md:grid-cols-2 min-h-screen">
      {/* Left Panel */}
      <div className="bg-[var(--ink)] flex flex-col justify-between p-12 hidden md:flex">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--sage)] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-none stroke-white stroke-2 [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span className="font-[var(--font-display)] text-lg text-white">MentalPath</span>
        </div>

        <div>
          <h1 className="font-[var(--font-display)] text-[32px] text-white leading-[1.25] mb-4">
            {t('onboarding.leftPanel.title.line1')}<em className="italic text-[var(--sage-light)]">{t('onboarding.leftPanel.title.line2')}</em><br/>{t('onboarding.leftPanel.title.line3')}
          </h1>
          <p className="text-[15px] text-white/50 leading-relaxed mb-6">
            {t('onboarding.leftPanel.description')}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {['Psychotherapists', 'Psychologists', 'Social Workers', 'Chiropractors', 'Physiotherapists', 'RMTs', 'OTs', 'Naturopaths', 'Acupuncturists', 'Dietitians', 'SLPs'].map(tag => (
              <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.07] text-white/55 border border-white/[0.08]">{tag}</span>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/[0.08]">
            <p className="text-[15px] text-white/75 leading-relaxed italic mb-3.5">
              {t('onboarding.leftPanel.testimonial')}
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--sage)] flex items-center justify-center text-[11px] font-medium text-white">
                AO
              </div>
              <div>
                <div className="text-[13px] font-medium text-white/75">{t('onboarding.leftPanel.author')}</div>
                <div className="text-xs text-white/35">{t('onboarding.leftPanel.authorRole')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[rgba(74,124,111,0.15)] border border-[rgba(74,124,111,0.25)] rounded-md px-2.5 py-1.5 text-xs text-[var(--sage-light)]">
            <Shield className="w-3 h-3" />
            {t('onboarding.leftPanel.badges.phipa')}
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(74,124,111,0.15)] border border-[rgba(74,124,111,0.25)] rounded-md px-2.5 py-1.5 text-xs text-[var(--sage-light)]">
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-none stroke-current stroke-[1.5]">
              <rect x="2" y="2" width="12" height="12" rx="2"/>
              <path d="M5 8h6M8 5v6"/>
            </svg>
            {t('onboarding.leftPanel.badges.servers')}
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(74,124,111,0.15)] border border-[rgba(74,124,111,0.25)] rounded-md px-2.5 py-1.5 text-xs text-[var(--sage-light)]">
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-none stroke-current stroke-[1.5]">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3l2 2"/>
            </svg>
            {t('onboarding.leftPanel.badges.trial')}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col justify-center items-center p-12 bg-[var(--white)]">
        <div className="w-full max-w-[420px]">
          {/* Step Dots */}
          <div className="w-full mb-8">
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={5}
              stepLabels={[
                t('onboarding.stepNames.1'),
                t('onboarding.stepNames.2'),
                t('onboarding.stepNames.3'),
                t('onboarding.stepNames.4'),
                t('onboarding.stepNames.5')
              ]}
            />
          </div>

          {/* Step 1: Account */}
          {currentStep === 1 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                {t('onboarding.step1.title')}
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                {t('onboarding.step1.subtitle')}
              </p>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  {t('onboarding.step1.fullName')} <span className="text-[var(--sage)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t('onboarding.step1.fullNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  {t('onboarding.step1.workEmail')} <span className="text-[var(--sage)]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('onboarding.step1.workEmailPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  {t('onboarding.step1.password')} <span className="text-[var(--sage)]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder={t('onboarding.step1.passwordPlaceholder')}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="h-0.75 bg-[var(--border)] rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: passwordStrength >= 75 ? 'var(--sage)' : passwordStrength >= 50 ? '#BA7517' : '#D85A30'
                    }}
                  />
                </div>
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">{t('onboarding.step1.passwordHint')}</p>
              </div>

              <button
                onClick={() => canContinueStep1 && setCurrentStep(2)}
                disabled={!canContinueStep1}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {t('onboarding.step1.continue')}
              </button>

              <div className="text-center mt-4 text-[13px] text-[var(--ink-muted)]">
                {t('onboarding.step1.alreadyHaveAccount')} <a href="/login" className="text-[var(--sage)] font-medium hover:text-[var(--sage-deep)]">{t('onboarding.step1.signIn')}</a>
              </div>
            </div>
          )}

          {/* Step 2: Your profession */}
          {currentStep === 2 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                {t('onboarding.step2.title')}
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-5">
                {t('onboarding.step2.subtitle')}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {professions.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfessionId(prof.id)}
                    className={`bg-[var(--warm)] border-[1.5px] rounded-[11px] p-3 cursor-pointer transition-all text-center ${
                      selectedProfessionId === prof.id
                        ? 'border-[var(--sage)] bg-[var(--sage-pale)]'
                        : 'border-[var(--border)] hover:border-[var(--sage-light)] hover:bg-white'
                    }`}
                  >
                    <div className="text-[22px] mb-1.5">{prof.icon}</div>
                    <div className={`text-[12px] font-medium leading-tight mb-0.5 ${selectedProfessionId === prof.id ? 'text-[var(--sage-deep)]' : 'text-[var(--ink)]'}`}>{prof.name}</div>
                    <div className={`text-[10px] ${selectedProfessionId === prof.id ? 'text-[var(--sage)]' : 'text-[var(--ink-muted)]'}`}>{prof.college}</div>
                  </button>
                ))}
              </div>

              {selectedProfession && (
                <div className="bg-[var(--sage-pale)] border border-[rgba(74,124,111,0.2)] rounded-xl p-4 mb-4 text-[13px] text-[var(--sage-deep)] leading-relaxed">
                  <div className="font-medium mb-2">{t('onboarding.step2.configuresFor', { profession: selectedProfession.name })}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                    <div><span className="text-[var(--sage)]">{t('onboarding.step2.noteFormats')}</span> {selectedProfession.notes}</div>
                    <div><span className="text-[var(--sage)]">{t('onboarding.step2.outcomeMeasures')}</span> {selectedProfession.outcomes}</div>
                    <div><span className="text-[var(--sage)]">{t('onboarding.step2.billing')}</span> {selectedProfession.billing}</div>
                    <div><span className="text-[var(--sage)]">{t('onboarding.step2.hst')}</span> {selectedProfession.hst}</div>
                  </div>
                </div>
              )}

              <button
                onClick={() => canContinueStep2 && setCurrentStep(3)}
                disabled={!canContinueStep2}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {t('onboarding.step2.continue')}
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 rounded-[10px] bg-transparent text-[var(--ink-soft)] text-sm border border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--warm)] mt-2"
              >
                {t('onboarding.step2.back')}
              </button>
            </div>
          )}

          {/* Step 3: Professional Info */}
          {currentStep === 3 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                {t('onboarding.step3.title')}
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                {t('onboarding.step3.subtitle')}
              </p>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  {t('onboarding.step3.practiceName')}
                </label>
                <input
                  type="text"
                  value={formData.practiceName}
                  onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                  placeholder={t('onboarding.step3.practiceNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                />
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">{t('onboarding.step3.practiceNameHint')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    {t('onboarding.step3.credentials')} <span className="text-[var(--sage)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.credentials}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    placeholder={t('onboarding.step3.credentialsPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    {t('onboarding.step3.registrationNum')} <span className="text-[var(--sage)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder={t('onboarding.step3.registrationPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  {t('onboarding.step3.college')} <span className="text-[var(--sage)]">*</span>
                </label>
                <div className="flex flex-wrap gap-1.75">
                  {colleges.map((college) => (
                    <button
                      key={college.id}
                      onClick={() => setSelectedCollege(college.id)}
                      className={`px-3 py-1.5 rounded-full border-[1.5px] text-xs font-medium transition-all ${
                        selectedCollege === college.id
                          ? 'border-[var(--sage)] bg-[var(--sage-pale)] text-[var(--sage-deep)]'
                          : 'border-[var(--border)] bg-white text-[var(--ink-soft)] hover:border-[var(--sage-light)]'
                      }`}
                    >
                      {college.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    {t('onboarding.step3.province')} <span className="text-[var(--sage)]">*</span>
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  >
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.code}>{prov.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    {t('onboarding.step3.sessionRate')}
                  </label>
                  <input
                    type="text"
                    value={formData.sessionRate}
                    onChange={(e) => setFormData({ ...formData, sessionRate: e.target.value })}
                    placeholder={t('onboarding.step3.sessionRatePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
              </div>

              <button
                onClick={() => canContinueStep3 && setCurrentStep(4)}
                disabled={!canContinueStep3}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {t('onboarding.step3.continue')}
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 rounded-[10px] bg-transparent text-[var(--ink-soft)] text-sm border border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--warm)] mt-2"
              >
                {t('onboarding.step3.back')}
              </button>
            </div>
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 4 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                {t('onboarding.step4.title')}
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                {t('onboarding.step4.subtitle')}
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <button
                  onClick={() => setSelectedPlan('solo')}
                  className={`border-[1.5px] rounded-[10px] p-3.5 cursor-pointer transition-all text-left ${
                    selectedPlan === 'solo'
                      ? 'border-[var(--sage)] bg-[var(--sage-pale)]'
                      : 'border-[var(--border)] bg-white hover:border-[var(--sage-light)]'
                  }`}
                >
                  <div className="text-sm font-medium text-[var(--ink)] mb-0.5">{t('onboarding.step4.solo')}</div>
                  <div className="text-xl font-medium text-[var(--sage-deep)] mb-1">
                    {t('onboarding.step4.soloPrice')}<span className="text-[13px] font-normal text-[var(--ink-muted)]">{t('onboarding.step4.soloPeriod')}</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] leading-snug">
                    {t('onboarding.step4.soloDesc')}
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPlan('group')}
                  className={`border-[1.5px] rounded-[10px] p-3.5 cursor-pointer transition-all text-left ${
                    selectedPlan === 'group'
                      ? 'border-[var(--sage)] bg-[var(--sage-pale)]'
                      : 'border-[var(--border)] bg-white hover:border-[var(--sage-light)]'
                  }`}
                >
                  <div className="text-sm font-medium text-[var(--ink)] mb-0.5">{t('onboarding.step4.group')}</div>
                  <div className="text-xl font-medium text-[var(--sage-deep)] mb-1">
                    {t('onboarding.step4.groupPrice')}<span className="text-[13px] font-normal text-[var(--ink-muted)]">{t('onboarding.step4.groupPeriod')}</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] leading-snug">
                    {t('onboarding.step4.groupDesc')}
                  </div>
                </button>
              </div>

              <div className="bg-[var(--sage-pale)] rounded-lg p-3 text-[13px] text-[var(--sage-deep)] leading-relaxed mb-4">
                {t('onboarding.step4.trialNotice')}
              </div>

              <button
                onClick={() => setCurrentStep(5)}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] mt-2"
              >
                {t('onboarding.step4.startTrial')}
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="w-full py-3 rounded-[10px] bg-transparent text-[var(--ink-soft)] text-sm border border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--warm)] mt-2"
              >
                {t('onboarding.step4.back')}
              </button>
            </div>
          )}

          {/* Step 5: First Client */}
          {currentStep === 5 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                {t('onboarding.step5.title')}
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                {t('onboarding.step5.subtitle')}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    {t('onboarding.step5.firstName')}
                  </label>
                  <input
                    type="text"
                    value={formData.clientFirstName}
                    onChange={(e) => setFormData({ ...formData, clientFirstName: e.target.value })}
                    placeholder={t('onboarding.step5.firstName')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    {t('onboarding.step5.lastName')}
                  </label>
                  <input
                    type="text"
                    value={formData.clientLastName}
                    onChange={(e) => setFormData({ ...formData, clientLastName: e.target.value })}
                    placeholder={t('onboarding.step5.lastName')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  {t('onboarding.step5.email')}
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="client@email.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  {t('onboarding.step5.intakeTemplate')}
                </label>
                <select
                  value={formData.clientTemplate}
                  onChange={(e) => setFormData({ ...formData, clientTemplate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                >
                  {intakeTemplates.map((template) => (
                    <option key={template.value} value={template.value}>{template.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleSubmit(false)}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] mt-2"
              >
                {t('onboarding.step5.completeSetup')}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="w-full py-3 rounded-[10px] bg-transparent text-[var(--ink-soft)] text-sm border border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--warm)] mt-2"
              >
                {t('onboarding.step5.skip')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}