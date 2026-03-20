import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Eye, EyeOff, Shield, Plus } from 'lucide-react';
import { startTrial } from '../../hooks/useTrialStatus';

type OnboardingStep = 1 | 2 | 3 | 4;

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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'solo' | 'group'>('solo');
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  
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

  const handleSubmit = () => {
    // Save email for later use
    localStorage.setItem('user_email', formData.email);
    
    // Start the 7-day free trial with user's email
    startTrial(formData.email);
    
    // In production, this would create the account and redirect to dashboard
    console.log('Onboarding completed:', formData);
    console.log('7-day free trial started for:', formData.email);
    navigate('/dashboard');
  };

  const canContinueStep1 = formData.fullName && formData.email && formData.password.length >= 8;
  const canContinueStep2 = formData.credentials && formData.registrationNumber && selectedCollege;

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
            Practice management<br/>built for <em className="italic text-[var(--sage-light)]">Canadian</em><br/>therapists.
          </h1>
          <p className="text-[15px] text-white/50 leading-relaxed mb-10">
            PHIPA-compliant. Canadian servers. Culturally-adapted intake forms. AI-assisted notes. $49/month — less than you spend on coffee.
          </p>

          <div className="bg-white/5 rounded-xl p-6 border border-white/[0.08]">
            <p className="text-[15px] text-white/75 leading-relaxed italic mb-3.5">
              "Switched from TherapyNotes in an afternoon. The culturally-adapted intake templates alone saved me two weeks of work — and I'm finally PHIPA-compliant."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--sage)] flex items-center justify-center text-[11px] font-medium text-white">
                AO
              </div>
              <div>
                <div className="text-[13px] font-medium text-white/75">Dr. Abena Osei-Mensah, RP</div>
                <div className="text-xs text-white/35">Registered Psychotherapist · Toronto, ON</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[rgba(74,124,111,0.15)] border border-[rgba(74,124,111,0.25)] rounded-md px-2.5 py-1.5 text-xs text-[var(--sage-light)]">
            <Shield className="w-3 h-3" />
            PHIPA compliant
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(74,124,111,0.15)] border border-[rgba(74,124,111,0.25)] rounded-md px-2.5 py-1.5 text-xs text-[var(--sage-light)]">
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-none stroke-current stroke-[1.5]">
              <rect x="2" y="2" width="12" height="12" rx="2"/>
              <path d="M5 8h6M8 5v6"/>
            </svg>
            Canadian servers
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(74,124,111,0.15)] border border-[rgba(74,124,111,0.25)] rounded-md px-2.5 py-1.5 text-xs text-[var(--sage-light)]">
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-none stroke-current stroke-[1.5]">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3l2 2"/>
            </svg>
            7-day free trial
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col justify-center items-center p-12 bg-[var(--white)]">
        <div className="w-full max-w-[420px]">
          {/* Step Dots */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  step === currentStep
                    ? 'w-5 bg-[var(--sage)]'
                    : step < currentStep
                    ? 'w-1.5 bg-[var(--sage-light)]'
                    : 'w-1.5 bg-[var(--border)]'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Account */}
          {currentStep === 1 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                Create your account
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                Free for 7 days. No credit card required.
              </p>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  Full name <span className="text-[var(--sage)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Dr. Jane Smith"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  Work email <span className="text-[var(--sage)]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@practice.ca"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  Password <span className="text-[var(--sage)]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="At least 8 characters"
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
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">Use 8+ characters, a number, and a symbol</p>
              </div>

              <button
                onClick={() => canContinueStep1 && setCurrentStep(2)}
                disabled={!canContinueStep1}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Continue →
              </button>

              <div className="text-center mt-4 text-[13px] text-[var(--ink-muted)]">
                Already have an account? <a href="/login" className="text-[var(--sage)] font-medium hover:text-[var(--sage-deep)]">Sign in</a>
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {currentStep === 2 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                Your practice
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                This appears on invoices and receipts sent to your clients.
              </p>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  Practice / clinic name
                </label>
                <input
                  type="text"
                  value={formData.practiceName}
                  onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                  placeholder="Smith Psychotherapy & Wellness"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                />
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">Leave blank to use your full name</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    Credentials <span className="text-[var(--sage)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.credentials}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    placeholder="RP, PhD"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    Registration # <span className="text-[var(--sage)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="CRPO-004821"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  Regulatory college <span className="text-[var(--sage)]">*</span>
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
                    Province <span className="text-[var(--sage)]">*</span>
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
                    Default session rate
                  </label>
                  <input
                    type="text"
                    value={formData.sessionRate}
                    onChange={(e) => setFormData({ ...formData, sessionRate: e.target.value })}
                    placeholder="$140"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
              </div>

              <button
                onClick={() => canContinueStep2 && setCurrentStep(3)}
                disabled={!canContinueStep2}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Continue →
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 rounded-[10px] bg-transparent text-[var(--ink-soft)] text-sm border border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--warm)] mt-2"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {currentStep === 3 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                Choose your plan
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                Both plans include a 7-day free trial. Cancel anytime.
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
                  <div className="text-sm font-medium text-[var(--ink)] mb-0.5">Solo practitioner</div>
                  <div className="text-xl font-medium text-[var(--sage-deep)] mb-1">
                    $49<span className="text-[13px] font-normal text-[var(--ink-muted)]">/mo</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] leading-snug">
                    Unlimited clients, all features, 1 clinician
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
                  <div className="text-sm font-medium text-[var(--ink)] mb-0.5">Group practice</div>
                  <div className="text-xl font-medium text-[var(--sage-deep)] mb-1">
                    $79<span className="text-[13px] font-normal text-[var(--ink-muted)]">/clinician</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] leading-snug">
                    Multi-clinician, shared scheduling, owner dashboard
                  </div>
                </button>
              </div>

              <div className="bg-[var(--sage-pale)] rounded-lg p-3 text-[13px] text-[var(--sage-deep)] leading-relaxed mb-4">
                Your 7-day free trial starts today. You will not be charged until your trial ends. Cancel anytime from your settings.
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] mt-2"
              >
                Start free trial →
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 rounded-[10px] bg-transparent text-[var(--ink-soft)] text-sm border border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--warm)] mt-2"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 4: First Client */}
          {currentStep === 4 && (
            <div>
              <h2 className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-1.5 tracking-[-0.3px]">
                Add your first client
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                Optional — you can skip this and add clients from your dashboard.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    First name
                  </label>
                  <input
                    type="text"
                    value={formData.clientFirstName}
                    onChange={(e) => setFormData({ ...formData, clientFirstName: e.target.value })}
                    placeholder="First name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={formData.clientLastName}
                    onChange={(e) => setFormData({ ...formData, clientLastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
                  Email (for portal invite)
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
                  Intake template
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
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-[10px] bg-[var(--sage)] text-white text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-[var(--sage-deep)] mt-2"
              >
                Complete setup →
              </button>
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-[10px] bg-transparent text-[var(--ink-soft)] text-sm border border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--warm)] mt-2"
              >
                Skip and go to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}