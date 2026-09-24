import { useState } from 'react';
import { Check, Shield, Lock, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type Step = 1 | 2 | 3 | 4 | 5;

export function ClientPortal() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { t } = useTranslation();
  const [consentsChecked, setConsentsChecked] = useState({
    services: false,
    privacy: false
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    pronouns: '',
    sessionFormat: 'either',
    concerns: [] as string[],
    wellbeing: null as number | null,
    reasonForTherapy: ''
  });

  const days = [
    { name: 'Mon', date: '16', month: 'Mar', available: true },
    { name: 'Tue', date: '17', month: 'Mar', available: true },
    { name: 'Wed', date: '18', month: 'Mar', available: false },
    { name: 'Thu', date: '19', month: 'Mar', available: true },
    { name: 'Fri', date: '20', month: 'Mar', available: true },
  ];

  const timeSlots = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

  const concerns = [
    t('clientPortalApp.needs.concerns.anxiety'), t('clientPortalApp.needs.concerns.depression'), t('clientPortalApp.needs.concerns.workplaceStress'), t('clientPortalApp.needs.concerns.racializedStress'),
    t('clientPortalApp.needs.concerns.culturalAdjustment'), t('clientPortalApp.needs.concerns.trauma'), t('clientPortalApp.needs.concerns.relationship'), t('clientPortalApp.needs.concerns.immigration'),
    t('clientPortalApp.needs.concerns.identity'), t('clientPortalApp.needs.concerns.grief'), t('clientPortalApp.needs.concerns.family'), t('clientPortalApp.needs.concerns.other')
  ];

  const nextStep = () => {
    // Validation for Step 2: Check required fields
    if (currentStep === 2) {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        toast.error(t('clientPortalApp.validation.requiredFields'));
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error(t('clientPortalApp.validation.validEmail'));
        return;
      }
    }
    
    // Validation for Step 4: Check consent checkboxes
    if (currentStep === 4) {
      if (!consentsChecked.services || !consentsChecked.privacy) {
        toast.error(t('clientPortalApp.validation.consentRequired'));
        return;
      }
    }
    
    if (currentStep < 5) setCurrentStep((currentStep + 1) as Step);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
  };

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--warm)]">
      {/* Header */}
      <div className="bg-[var(--ink)] h-14 px-[5vw] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-[var(--sage)] rounded-[7px] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-none stroke-white stroke-2 [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span className="font-[var(--font-display)] text-base text-white">MentalPath</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Shield className="w-[13px] h-[13px] stroke-[var(--sage-light)]" />
            {t('clientPortalApp.header.security')}
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors no-underline"
          >
            <Home className="w-[14px] h-[14px]" />
            {t('clientPortalApp.header.backToHome')}
          </Link>
        </div>
      </div>

      {/* Therapist Banner */}
      <div className="bg-white border-b border-[var(--border)] py-4 px-[5vw] flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-full bg-[var(--sage-pale)] flex items-center justify-center text-[15px] font-medium text-[var(--sage-deep)]">
          AO
        </div>
        <div>
          <div className="text-[15px] font-medium text-[var(--ink)]">Dr. Abena Osei-Mensah</div>
          <div className="text-[13px] text-[var(--ink-muted)]">Registered Psychotherapist · CRPO #004821 · Toronto, ON</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[var(--sage-deep)] bg-[var(--sage-pale)] px-3 py-1.5 rounded-full">
          <Lock className="w-[13px] h-[13px]" />
          Secure portal
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[680px] mx-auto py-8 px-5 pb-[60px]">
        {/* Step Progress */}
        <div className="flex items-center gap-0 mb-8">
          {[1, 2, 3, 4, 5].map((step, idx) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step === currentStep ? 'active' : step < currentStep ? 'done' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-[1.5px] transition-all ${
                  step === currentStep 
                    ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                    : step < currentStep
                    ? 'bg-[var(--sage-pale)] border-[var(--sage)] text-[var(--sage-deep)]'
                    : 'bg-white border-[var(--border)] text-[var(--ink-muted)]'
                }`}>
                  {step}
                </div>
                <div className={`text-xs font-medium ${
                  step === currentStep ? 'text-[var(--sage-deep)]' : step < currentStep ? 'text-[var(--sage)]' : 'text-[var(--ink-muted)]'
                }`}>
                  {[t('clientPortalApp.steps.book'), t('clientPortalApp.steps.about'), t('clientPortalApp.steps.needs'), t('clientPortalApp.steps.consent'), t('clientPortalApp.steps.confirm')][step - 1]}
                </div>
              </div>
              {idx < 4 && (
                <div className={`flex-1 h-px mx-2 ${step < currentStep ? 'bg-[var(--sage-light)]' : 'bg-[var(--border)]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Booking */}
        {currentStep === 1 && (
          <div className="animate-[fadeUp_0.3s_ease]">
            <div className="bg-white rounded-[14px] border border-[var(--border)] overflow-hidden mb-5">
              <div className="bg-[var(--warm)] border-b border-[var(--border)] py-4 px-6">
                <div className="font-[var(--font-display)] text-[17px] text-[var(--ink)] mb-1">{t('clientPortalApp.booking.title')}</div>
                <div className="text-[13px] text-[var(--ink-muted)]">{t('clientPortalApp.booking.subtitle')}</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--ink-soft)] hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] transition-all">
                    {t('clientPortalApp.booking.previous')}
                  </button>
                  <span className="text-sm font-medium text-[var(--ink)]">Mar 16 – Mar 20, 2026</span>
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--ink-soft)] hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] transition-all">
                    {t('clientPortalApp.booking.next')}
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-5">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => day.available && setSelectedDate(`${day.month} ${day.date}`)}
                      disabled={!day.available}
                      className={`text-center py-2.5 px-1.5 rounded-lg border transition-all ${
                        selectedDate === `${day.month} ${day.date}`
                          ? 'bg-[var(--sage)] border-[var(--sage)]'
                          : day.available
                          ? 'bg-white border-[var(--border)] hover:border-[var(--sage-light)]'
                          : 'bg-white border-[var(--border)] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className={`text-[11px] mb-1 ${selectedDate === `${day.month} ${day.date}` ? 'text-white' : 'text-[var(--ink-muted)]'}`}>
                        {day.name}
                      </div>
                      <div className={`text-base font-medium ${selectedDate === `${day.month} ${day.date}` ? 'text-white' : 'text-[var(--ink)]'}`}>
                        {day.date}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <div className="text-xs font-medium uppercase tracking-[0.6px] text-[var(--ink-muted)] mb-2.5">{t('clientPortalApp.booking.availableTimes')}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 text-center rounded-lg border-[1.5px] text-[13px] font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                              : 'bg-white border-[var(--border)] text-[var(--ink-soft)] hover:border-[var(--sage-light)] hover:text-[var(--sage)]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {selectedDate && selectedTime && (
                  <div className="bg-[var(--sage-pale)] rounded-[10px] p-4 mt-4">
                    <div className="flex justify-between text-[13px] py-1">
                      <span className="text-[var(--ink-muted)]">{t('clientPortalApp.booking.date')}</span>
                      <span className="font-medium text-[var(--sage-deep)]">{selectedDate}, 2026</span>
                    </div>
                    <div className="flex justify-between text-[13px] py-1">
                      <span className="text-[var(--ink-muted)]">{t('clientPortalApp.booking.time')}</span>
                      <span className="font-medium text-[var(--sage-deep)]">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-[13px] py-1">
                      <span className="text-[var(--ink-muted)]">{t('clientPortalApp.booking.duration')}</span>
                      <span className="font-medium text-[var(--sage-deep)]">{t('clientPortalApp.booking.durationValue')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-[13px] text-[var(--ink-muted)]">{t('clientPortalApp.steps.stepOf', { current: currentStep, total: 5 })}</div>
              <button
                onClick={nextStep}
                disabled={!selectedDate || !selectedTime}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  selectedDate && selectedTime
                    ? 'bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]'
                    : 'bg-[var(--sage)] text-white opacity-50 cursor-not-allowed'
                }`}
              >
                {t('clientPortalApp.booking.continueButton')}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: About You */}
        {currentStep === 2 && (
          <div className="animate-[fadeUp_0.3s_ease]">
            <div className="bg-white rounded-[14px] border border-[var(--border)] overflow-hidden mb-5">
              <div className="bg-[var(--warm)] border-b border-[var(--border)] py-4 px-6">
                <div className="font-[var(--font-display)] text-[17px] text-[var(--ink)] mb-1">{t('clientPortalApp.about.title')}</div>
                <div className="text-[13px] text-[var(--ink-muted)]">{t('clientPortalApp.about.subtitle')}</div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="text-[11px] font-medium tracking-[0.8px] uppercase text-[var(--sage)] mb-3 pb-2 border-b border-[var(--sage-pale)]">
                    {t('clientPortalApp.about.contactInfo')}
                  </div>
                  <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                    <div>
                      <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">
                        {t('clientPortalApp.about.firstName')} <span className="text-[var(--sage)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder={t('clientPortalApp.about.firstName')}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">
                        {t('clientPortalApp.about.lastName')} <span className="text-[var(--sage)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder={t('clientPortalApp.about.lastName')}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                    <div>
                      <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">
                        {t('clientPortalApp.about.email')} <span className="text-[var(--sage)]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">{t('clientPortalApp.about.phone')}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (416) 000-0000"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="dob" className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">{t('clientPortalApp.about.dob')}</label>
                      <input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="pronouns" className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">{t('clientPortalApp.about.pronouns.label')}</label>
                      <select
                        id="pronouns"
                        title={t('clientPortalApp.about.pronouns.label')}
                        aria-label={t('clientPortalApp.about.pronouns.label')}
                        value={formData.pronouns}
                        onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                      >
                        <option value="">{t('clientPortalApp.about.pronouns.preferNotToSay')}</option>
                        <option>{t('clientPortalApp.about.pronouns.sheHer')}</option>
                        <option>{t('clientPortalApp.about.pronouns.heHim')}</option>
                        <option>{t('clientPortalApp.about.pronouns.theyThem')}</option>
                        <option>{t('clientPortalApp.about.pronouns.sheThey')}</option>
                        <option>{t('clientPortalApp.about.pronouns.heThey')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[11px] font-medium tracking-[0.8px] uppercase text-[var(--sage)] mb-3 pb-2 border-b border-[var(--sage-pale)]">
                    {t('clientPortalApp.about.sessionPreferences')}
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">{t('clientPortalApp.about.formatPreference')}</label>
                    <div className="flex flex-wrap gap-2">
                      {[t('clientPortalApp.about.formats.either'), t('clientPortalApp.about.formats.video'), t('clientPortalApp.about.formats.inPerson')].map((format, idx) => (
                        <button
                          key={format}
                          onClick={() => setFormData({ ...formData, sessionFormat: ['either', 'video', 'inperson'][idx] })}
                          className={`px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] transition-all ${
                            formData.sessionFormat === ['either', 'video', 'inperson'][idx]
                              ? 'border-[var(--sage)] bg-[var(--sage-pale)] text-[var(--sage-deep)] font-medium'
                              : 'border-[var(--border)] bg-white text-[var(--ink-soft)] hover:border-[var(--sage-light)]'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={prevStep} className="px-6 py-3 rounded-lg text-sm font-medium bg-white border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--warm)] transition-all">
                {t('clientPortalApp.about.back')}
              </button>
              <button onClick={nextStep} className="px-6 py-3 rounded-lg text-sm font-medium bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)] transition-all">
                {t('clientPortalApp.about.continue')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Your Needs */}
        {currentStep === 3 && (
          <div className="animate-[fadeUp_0.3s_ease]">
            <div className="bg-white rounded-[14px] border border-[var(--border)] overflow-hidden mb-5">
              <div className="bg-[var(--warm)] border-b border-[var(--border)] py-4 px-6">
                <div className="font-[var(--font-display)] text-[17px] text-[var(--ink)] mb-1">{t('clientPortalApp.needs.title')}</div>
                <div className="text-[13px] text-[var(--ink-muted)]">{t('clientPortalApp.needs.subtitle')}</div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="text-[11px] font-medium tracking-[0.8px] uppercase text-[var(--sage)] mb-3 pb-2 border-b border-[var(--sage-pale)]">
                    {t('clientPortalApp.needs.concernsTitle')}
                  </div>
                  <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-2.5 block">
                    {t('clientPortalApp.needs.concernsQuestion')}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3.5">
                    {concerns.map((concern) => (
                      <button
                        key={concern}
                        onClick={() => toggleConcern(concern)}
                        className={`px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] transition-all ${
                          formData.concerns.includes(concern)
                            ? 'border-[var(--sage)] bg-[var(--sage-pale)] text-[var(--sage-deep)] font-medium'
                            : 'border-[var(--border)] bg-white text-[var(--ink-soft)] hover:border-[var(--sage-light)]'
                        }`}
                      >
                        {concern}
                      </button>
                    ))}
                  </div>
                  <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-1.5 block">
                    {t('clientPortalApp.needs.reasonQuestion')}
                  </label>
                  <textarea
                    value={formData.reasonForTherapy}
                    onChange={(e) => setFormData({ ...formData, reasonForTherapy: e.target.value })}
                    placeholder={t('clientPortalApp.needs.reasonPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)] min-h-[100px] resize-y leading-relaxed"
                  />
                </div>

                <div className="mb-6">
                  <div className="text-[11px] font-medium tracking-[0.8px] uppercase text-[var(--sage)] mb-3 pb-2 border-b border-[var(--sage-pale)]">
                    {t('clientPortalApp.needs.wellbeingTitle')}
                  </div>
                  <label className="text-[13px] font-medium text-[var(--ink-soft)] mb-2.5 block">
                    {t('clientPortalApp.needs.wellbeingQuestion')}
                  </label>
                  <div className="mb-1">
                    <div className="grid grid-cols-10 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setFormData({ ...formData, wellbeing: num })}
                          className={`aspect-square rounded-md border-[1.5px] text-[13px] font-medium transition-all ${
                            formData.wellbeing === num
                              ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                              : 'bg-white border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] text-[var(--ink-muted)] mt-1">
                      <span>{t('clientPortalApp.needs.veryLow')}</span>
                      <span>{t('clientPortalApp.needs.veryGood')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={prevStep} className="px-6 py-3 rounded-lg text-sm font-medium bg-white border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--warm)] transition-all">
                {t('clientPortalApp.about.back')}
              </button>
              <button onClick={nextStep} className="px-6 py-3 rounded-lg text-sm font-medium bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)] transition-all">
                {t('clientPortalApp.about.continue')}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Consent */}
        {currentStep === 4 && (
          <div className="animate-[fadeUp_0.3s_ease]">
            <div className="bg-white rounded-[14px] border border-[var(--border)] overflow-hidden mb-5">
              <div className="bg-[var(--warm)] border-b border-[var(--border)] py-4 px-6">
                <div className="font-[var(--font-display)] text-[17px] text-[var(--ink)] mb-1">{t('clientPortalApp.consent.title')}</div>
                <div className="text-[13px] text-[var(--ink-muted)]">{t('clientPortalApp.consent.subtitle')}</div>
              </div>
              <div className="p-6">
                <div className="bg-[var(--warm)] rounded-[10px] p-4.5 border border-[var(--border)] text-[13px] text-[var(--ink-soft)] leading-relaxed max-h-[200px] overflow-y-auto mb-3.5">
                  <h4 className="text-sm font-medium text-[var(--ink)] mb-2">{t('clientPortalApp.consent.noticeTitle')}</h4>
                  <p className="mb-3">{t('clientPortalApp.consent.noticeIntro')}</p>
                  <p className="mb-3">
                    <strong>{t('clientPortalApp.consent.natureLabel')}</strong> {t('clientPortalApp.consent.natureDesc')}
                  </p>
                  <p className="mb-3">
                    <strong>{t('clientPortalApp.consent.confidentialityLabel')}</strong> {t('clientPortalApp.consent.confidentialityDesc')}
                  </p>
                  <p>
                    <strong>{t('clientPortalApp.consent.privacyLabel')}</strong> {t('clientPortalApp.consent.privacyDesc')}
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-lg border-[1.5px] border-[var(--border)] bg-white mb-2.5">
                  <input
                    type="checkbox"
                    id="consent-services"
                    title={t('clientPortalApp.consent.checkboxServices')}
                    aria-label={t('clientPortalApp.consent.checkboxServices')}
                    className="w-4.5 h-4.5 mt-0.5 accent-[var(--sage)] cursor-pointer"
                    checked={consentsChecked.services}
                    onChange={() => setConsentsChecked({ ...consentsChecked, services: !consentsChecked.services })}
                  />
                  <label htmlFor="consent-services" className="text-[13px] text-[var(--ink-soft)] leading-relaxed cursor-pointer">
                    {t('clientPortalApp.consent.checkboxServices')}
                  </label>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-lg border-[1.5px] border-[var(--border)] bg-white">
                  <input
                    type="checkbox"
                    id="consent-privacy"
                    title={t('clientPortalApp.consent.checkboxPrivacy')}
                    aria-label={t('clientPortalApp.consent.checkboxPrivacy')}
                    className="w-4.5 h-4.5 mt-0.5 accent-[var(--sage)] cursor-pointer"
                    checked={consentsChecked.privacy}
                    onChange={() => setConsentsChecked({ ...consentsChecked, privacy: !consentsChecked.privacy })}
                  />
                  <label htmlFor="consent-privacy" className="text-[13px] text-[var(--ink-soft)] leading-relaxed cursor-pointer">
                    {t('clientPortalApp.consent.checkboxPrivacy')}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={prevStep} className="px-6 py-3 rounded-lg text-sm font-medium bg-white border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--warm)] transition-all">
                {t('clientPortalApp.about.back')}
              </button>
              <button onClick={nextStep} className="px-6 py-3 rounded-lg text-sm font-medium bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)] transition-all">
                {t('clientPortalApp.about.continue')}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 5 && (
          <div className="animate-[fadeUp_0.3s_ease]">
            <div className="bg-white rounded-[14px] border border-[var(--border)] overflow-hidden mb-5">
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--sage-pale)] flex items-center justify-center mx-auto mb-5">
                  <Check className="w-7 h-7 stroke-[var(--sage)] stroke-2" />
                </div>
                <h2 className="font-[var(--font-display)] text-2xl text-[var(--ink)] mb-2.5">{t('clientPortalApp.confirmation.title')}</h2>
                <p className="text-[15px] text-[var(--ink-muted)] leading-relaxed max-w-[420px] mx-auto mb-7">
                  {t('clientPortalApp.confirmation.description', { email: formData.email || t('clientPortalApp.about.email') })}
                </p>
                <div className="bg-[var(--sage-pale)] rounded-[10px] p-4 text-left max-w-[360px] mx-auto mb-6">
                  <div className="flex justify-between py-1.5 text-[13px] border-b border-[rgba(74,124,111,0.12)]">
                    <span className="text-[var(--sage-deep)]">{t('clientPortalApp.booking.date')}</span>
                    <span className="font-medium text-[var(--ink)]">{selectedDate}, 2026</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[13px] border-b border-[rgba(74,124,111,0.12)]">
                    <span className="text-[var(--sage-deep)]">{t('clientPortalApp.booking.time')}</span>
                    <span className="font-medium text-[var(--ink)]">{selectedTime} ET</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[13px] border-b border-[rgba(74,124,111,0.12)]">
                    <span className="text-[var(--sage-deep)]">{t('clientPortalApp.booking.duration')}</span>
                    <span className="font-medium text-[var(--ink)]">{t('clientPortalApp.booking.durationValue')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[13px]">
                    <span className="text-[var(--sage-deep)]">{t('clientPortalApp.confirmation.therapist')}</span>
                    <span className="font-medium text-[var(--ink)]">Dr. Abena Osei-Mensah</span>
                  </div>
                </div>
                <button
                  className="w-full max-w-[360px] px-8 py-3.5 rounded-[11px] text-base font-medium bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)] transition-all"
                  onClick={() => {
                    toast.success(t('clientPortalApp.confirmation.successMessage'));
                    navigate('/');
                  }}
                >
                  {t('clientPortalApp.confirmation.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}