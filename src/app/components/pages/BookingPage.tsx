import { useState, useCallback } from 'react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AVAILABLE_DAYS = [1, 2, 3, 4]; // Mon–Thu
const SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'];

type SessionType = {
  name: string;
  desc: string;
  price: string;
  duration: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
};

const SESSION_TYPES: SessionType[] = [
  {
    name: 'Initial consultation (intake)',
    desc: 'First session · Assessment & getting to know each other',
    price: '$140',
    duration: '50 min',
    iconBg: 'bg-[var(--sage-pale)]',
    iconColor: 'text-[var(--sage)]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
      </svg>
    ),
  },
  {
    name: 'Individual therapy session',
    desc: 'Returning client · Ongoing work',
    price: '$140',
    duration: '50 min',
    iconBg: 'bg-[#E6F1FB]',
    iconColor: 'text-[#185FA5]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    name: 'Couples session',
    desc: 'Relationship therapy · Two partners',
    price: '$175',
    duration: '80 min',
    iconBg: 'bg-[#faeeda]',
    iconColor: 'text-[#633806]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    name: 'Extended session',
    desc: 'Individual · More time for complex topics',
    price: '$210',
    duration: '80 min',
    iconBg: 'bg-[#EEEDFE]',
    iconColor: 'text-[#3C3489]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Array<{ day: number | null; past: boolean; available: boolean; isToday: boolean }> = [];
  for (let i = 0; i < offset; i++) days.push({ day: null, past: false, available: false, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const isPast = date < today;
    const available = !isPast && AVAILABLE_DAYS.includes(dow === 0 ? 6 : dow - 1);
    days.push({ day: d, past: isPast, available, isToday: date.getTime() === today.getTime() });
  }
  return days;
}

export function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(0);
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(2);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '', pronouns: '', reason: '', referral: '', prevTherapy: 'Yes, and it was helpful' });
  const [consents, setConsents] = useState([false, false, false, false]);
  const [confirmed, setConfirmed] = useState(false);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null); setSelectedSlot(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null); setSelectedSlot(null);
  };

  const toggleConsent = (i: number) => {
    setConsents(c => { const n = [...c]; n[i] = !n[i]; return n; });
  };

  const confirmBooking = () => {
    setConfirmed(true);
    setStep(5);
  };

  const calDays = buildCalendarDays(calYear, calMonth);
  const selectedDateLabel = selectedDay
    ? new Date(calYear, calMonth, selectedDay).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';
  const confDateTime = selectedDay
    ? new Date(calYear, calMonth, selectedDay).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + (selectedSlot || '10:00 AM') + ' ET'
    : 'Monday March 30 at 10:00 AM ET';

  const stepClass = (s: number) => {
    if (s === step) return 'flex-1 py-3 px-2 text-center text-xs cursor-pointer border-r border-[var(--border)] last:border-r-0 bg-[var(--sage-pale)] text-[var(--sage-deep)] font-medium';
    if (s < step) return 'flex-1 py-3 px-2 text-center text-xs cursor-pointer border-r border-[var(--border)] last:border-r-0 text-[var(--sage)] font-medium';
    return 'flex-1 py-3 px-2 text-center text-xs cursor-pointer border-r border-[var(--border)] last:border-r-0 text-[var(--ink-muted)]';
  };

  return (
    <div className="min-h-screen bg-[var(--warm)] font-sans">
      {/* Header */}
      <div className="bg-[var(--sage-deep)] px-6 py-8 text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3.5 border-2 border-white/30">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="white" strokeWidth={1.5}>
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div className="font-serif text-2xl text-white mb-1">Dr. Abena Osei-Mensah</div>
        <div className="text-[13px] text-white/70 mb-3">Registered Psychotherapist, PhD · CRPO #004821 · Toronto, ON</div>
        <div className="flex gap-[7px] justify-center flex-wrap">
          {['Anti-racism & RBTS', 'Newcomer support', 'LGBTQ2S+ affirming', 'Trauma', 'Individual & couples'].map(t => (
            <span key={t} className="text-[11px] font-medium px-[10px] py-1 rounded-full bg-white/10 text-white/80 border border-white/15">{t}</span>
          ))}
        </div>
      </div>
      <div className="bg-white/7 px-4 py-2 text-center text-[11px] text-white/50 flex items-center justify-center gap-1.5 bg-[var(--sage-deep)] border-t border-white/10">
        <svg viewBox="0 0 16 16" className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="2" y="7" width="12" height="8" rx="1"/><path d="M5 7V5a3 3 0 016 0v2"/>
        </svg>
        <span className="text-white/50">Booking secured by MentalPath · Canadian servers · PHIPA-compliant</span>
      </div>

      <div className="max-w-[680px] mx-auto px-5 py-6 pb-16">
        {/* Steps bar */}
        <div className="flex items-center bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-7">
          {[{n:1,label:'Session type'},{n:2,label:'Date & time'},{n:3,label:'About you'},{n:4,label:'Consent'},{n:5,label:'Confirm'}].map(s => (
            <div key={s.n} className={stepClass(s.n)}>
              <span className={`block text-base font-medium mb-0.5 ${s.n === step ? 'text-[var(--sage)]' : s.n < step ? 'text-[var(--sage-light)]' : ''}`}>{s.n}</span>
              {s.label}
            </div>
          ))}
        </div>

        {/* Step 1: Session type */}
        {step === 1 && (
          <div>
            <div className="bg-white border border-[var(--border)] rounded-[14px] overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <div className="font-serif text-lg text-[var(--ink)] mb-0.5">What brings you here?</div>
                <div className="text-[13px] text-[var(--ink-muted)]">Choose the type of session. All sessions are confidential.</div>
              </div>
              <div className="p-5 flex flex-col gap-2.5">
                {SESSION_TYPES.map((t, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedType(i)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 border-[1.5px] rounded-[10px] cursor-pointer transition-all duration-150 ${selectedType === i ? 'border-[var(--sage)] bg-[var(--sage-pale)]' : 'border-[var(--border)] hover:border-[var(--sage-light)]'}`}
                  >
                    <div className={`w-10 h-10 rounded-[9px] flex items-center justify-center flex-shrink-0 ${t.iconBg} ${t.iconColor}`}>{t.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--ink)]">{t.name}</div>
                      <div className="text-xs text-[var(--ink-muted)] mt-0.5">{t.desc}</div>
                    </div>
                    <div className="ml-auto text-right flex-shrink-0">
                      <div className="text-[15px] font-medium text-[var(--sage-deep)]">{t.price}</div>
                      <div className="text-[11px] text-[var(--ink-muted)]">{t.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About section */}
            <div className="bg-white border border-[var(--border)] rounded-[14px] p-5 mb-4">
              <div className="text-sm font-medium text-[var(--ink)] mb-2.5">About Dr. Osei-Mensah</div>
              <div className="text-sm text-[var(--ink-soft)] leading-[1.7] mb-3.5">
                I'm a Registered Psychotherapist and PhD psychologist specialising in anti-racism frameworks, race-based traumatic stress, and culturally-informed therapy. I work with individuals and couples — particularly Black, racialized, and newcomer clients navigating the intersection of identity, systemic racism, and mental health in Canada.
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Race-based traumatic stress','Anxiety & depression','Trauma & PTSD','Newcomer adjustment','Professional burnout','Couples','Cultural identity','LGBTQ2S+ affirming'].map(s => (
                  <span key={s} className="text-[11px] font-medium px-[10px] py-1 rounded-full bg-[var(--sage-pale)] text-[var(--sage-deep)]">{s}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3.5 bg-[var(--sage)] text-white border-none rounded-[11px] text-[15px] font-medium cursor-pointer transition-all duration-200 hover:bg-[var(--sage-deep)]">
              Choose a date & time →
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <div className="bg-white border border-[var(--border)] rounded-[14px] overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <div className="font-serif text-lg text-[var(--ink)] mb-0.5">Choose a date</div>
                <div className="text-[13px] text-[var(--ink-muted)]">Eastern Time (ET) · Toronto</div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3.5">
                  <button onClick={prevMonth} className="px-3 py-1.5 border border-[var(--border)] rounded-[7px] bg-white cursor-pointer text-[13px] text-[var(--ink-soft)] hover:bg-[var(--warm)]">←</button>
                  <div className="text-[15px] font-medium text-[var(--ink)]">{MONTH_NAMES[calMonth]} {calYear}</div>
                  <button onClick={nextMonth} className="px-3 py-1.5 border border-[var(--border)] rounded-[7px] bg-white cursor-pointer text-[13px] text-[var(--ink-soft)] hover:bg-[var(--warm)]">→</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                    <div key={d} className="text-[11px] font-medium text-[var(--ink-muted)] py-1 uppercase tracking-[0.4px]">{d}</div>
                  ))}
                  {calDays.map((cell, i) => {
                    if (!cell.day) return <div key={i} />;
                    const isSelected = cell.day === selectedDay;
                    let cls = 'py-2 px-1 rounded-lg text-sm cursor-pointer transition-all duration-150 ';
                    if (isSelected) cls += 'bg-[var(--sage)] text-white';
                    else if (cell.past) cls += 'text-[var(--border)] cursor-default';
                    else if (cell.available) cls += 'text-[var(--ink-soft)] hover:bg-[var(--sage-pale)] hover:text-[var(--sage-deep)]' + (cell.isToday ? ' font-semibold text-[var(--sage)]' : '');
                    else cls += 'text-[var(--border)] cursor-default';
                    return (
                      <div
                        key={i}
                        className={cls}
                        onClick={() => { if (cell.available) { setSelectedDay(cell.day!); setSelectedSlot(null); } }}
                      >
                        {cell.day}
                        {cell.available && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-[var(--sage-light)] mx-auto mt-0.5" />
                        )}
                        {isSelected && (
                          <div className="w-1 h-1 rounded-full bg-white/60 mx-auto mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedDay && (
                  <div className="mt-4">
                    <div className="text-[13px] font-medium text-[var(--ink)] mb-2.5">{selectedDateLabel}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {SLOTS.map(s => (
                        <div
                          key={s}
                          onClick={() => setSelectedSlot(s)}
                          className={`py-2.5 border-[1.5px] rounded-[9px] text-center cursor-pointer text-[13px] font-medium transition-all duration-150 ${selectedSlot === s ? 'bg-[var(--sage)] border-[var(--sage)] text-white' : 'border-[var(--border)] text-[var(--ink-soft)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]'}`}
                        >
                          {s}
                          <div className="text-[11px] font-normal mt-0.5">50 min</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 bg-white border border-[rgba(0,0,0,0.13)] text-[var(--ink-soft)] rounded-[11px] text-[15px] font-medium cursor-pointer">← Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedSlot} className="flex-1 py-3.5 bg-[var(--sage)] text-white border-none rounded-[11px] text-[15px] font-medium cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-50 disabled:cursor-not-allowed">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: About you */}
        {step === 3 && (
          <div>
            <div className="bg-white border border-[var(--border)] rounded-[14px] overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <div className="font-serif text-lg text-[var(--ink)] mb-0.5">About you</div>
                <div className="text-[13px] text-[var(--ink-muted)]">All information is confidential and stored on Canadian servers (PHIPA).</div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">First name <span className="text-[var(--sage)]">*</span></label>
                    <input type="text" placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))}
                      className="w-full px-[13px] py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-sm outline-none focus:border-[var(--sage)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Last name <span className="text-[var(--sage)]">*</span></label>
                    <input type="text" placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))}
                      className="w-full px-[13px] py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-sm outline-none focus:border-[var(--sage)]" />
                  </div>
                </div>
                {[
                  { label: 'Email', req: true, type: 'email', key: 'email', placeholder: 'your@email.com' },
                  { label: 'Phone', req: false, type: 'tel', key: 'phone', placeholder: '(416) 555-0100' },
                  { label: 'Date of birth', req: false, type: 'text', key: 'dob', placeholder: 'YYYY-MM-DD' },
                ].map(f => (
                  <div key={f.key} className="mb-3.5">
                    <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">{f.label} {f.req && <span className="text-[var(--sage)]">*</span>}</label>
                    <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                      className="w-full px-[13px] py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-sm outline-none focus:border-[var(--sage)]" />
                  </div>
                ))}
                <div className="mb-3.5">
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Pronouns</label>
                  <select value={form.pronouns} onChange={e => setForm(f => ({...f, pronouns: e.target.value}))}
                    className="w-full px-[13px] py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-sm outline-none focus:border-[var(--sage)]">
                    <option value="">Prefer not to say</option>
                    <option>She / her</option><option>He / him</option><option>They / them</option>
                    <option>She / they</option><option>He / they</option><option>Use my name only</option>
                  </select>
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">What brings you to therapy? <span className="text-[var(--sage)]">*</span></label>
                  <textarea placeholder="A brief description of what you're looking for support with..." value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))}
                    className="w-full px-[13px] py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-sm outline-none focus:border-[var(--sage)] resize-y min-h-[80px] leading-relaxed" />
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">How did you hear about Dr. Osei-Mensah?</label>
                  <select value={form.referral} onChange={e => setForm(f => ({...f, referral: e.target.value}))}
                    className="w-full px-[13px] py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-sm outline-none focus:border-[var(--sage)]">
                    <option value="">Select...</option>
                    <option>Psychology Today directory</option><option>CRPO directory</option>
                    <option>Referral from GP / doctor</option><option>Referral from friend / colleague</option>
                    <option>Google search</option><option>Social media</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Have you been in therapy before?</label>
                  <select value={form.prevTherapy} onChange={e => setForm(f => ({...f, prevTherapy: e.target.value}))}
                    className="w-full px-[13px] py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-sm outline-none focus:border-[var(--sage)]">
                    <option>Yes, and it was helpful</option><option>Yes, but it wasn't a good fit</option>
                    <option>No, this would be my first time</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 bg-white border border-[rgba(0,0,0,0.13)] text-[var(--ink-soft)] rounded-[11px] text-[15px] font-medium cursor-pointer">← Back</button>
              <button onClick={() => setStep(4)} className="flex-1 py-3.5 bg-[var(--sage)] text-white border-none rounded-[11px] text-[15px] font-medium cursor-pointer hover:bg-[var(--sage-deep)]">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 4: Consent */}
        {step === 4 && (
          <div>
            <div className="bg-white border border-[var(--border)] rounded-[14px] overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <div className="font-serif text-lg text-[var(--ink)] mb-0.5">Before we confirm</div>
                <div className="text-[13px] text-[var(--ink-muted)]">Please review and agree to the following.</div>
              </div>
              <div className="p-5">
                {[
                  'I understand that all sessions are confidential. Dr. Osei-Mensah may only disclose information in limited circumstances required by law (e.g. risk of harm).',
                  'I understand that session recordings may only be made with explicit written consent from both parties. I have read the Privacy Policy / PHIPA notice.',
                  'I understand the cancellation policy: at least 24 hours notice required. Late cancellations may be subject to a fee equal to the full session rate.',
                  'For video sessions: I consent to receiving psychotherapy services via secure video platform. I understand that technology introduces limitations and risks not present in in-person sessions.',
                ].map((text, i) => (
                  <div
                    key={i}
                    onClick={() => toggleConsent(i)}
                    className="flex gap-2.5 py-2.5 border-b border-[var(--border)/50] last:border-b-0 text-[13px] text-[var(--ink-soft)] leading-relaxed cursor-pointer"
                  >
                    <input type="checkbox" checked={consents[i]} onChange={() => toggleConsent(i)}
                      className="w-4 h-4 flex-shrink-0 mt-0.5 accent-[var(--sage)] cursor-pointer" />
                    <span>{text} <span className="text-[11px] text-[var(--sage)] font-medium whitespace-nowrap">Required</span></span>
                  </div>
                ))}
                <div className="bg-[var(--sage-pale)] rounded-lg px-3.5 py-3 mt-3.5 text-xs text-[var(--sage-deep)] leading-relaxed">
                  Your e-signature on this form is legally binding. Your consent, timestamp, and IP address are stored securely on Canadian servers in compliance with PHIPA.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="flex-1 py-3.5 bg-white border border-[rgba(0,0,0,0.13)] text-[var(--ink-soft)] rounded-[11px] text-[15px] font-medium cursor-pointer">← Back</button>
              <button onClick={confirmBooking} className="flex-1 py-3.5 bg-[var(--sage)] text-white border-none rounded-[11px] text-[15px] font-medium cursor-pointer hover:bg-[var(--sage-deep)]">Confirm booking →</button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="bg-white border border-[var(--border)] rounded-[14px] overflow-hidden">
            <div className="px-5 py-8 text-center">
              <div className="w-16 h-16 bg-[var(--sage-pale)] rounded-full flex items-center justify-center mx-auto mb-4.5">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="var(--sage)" strokeWidth={2} strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div className="font-serif text-2xl text-[var(--ink)] mb-2">You're booked.</div>
              <div className="text-sm text-[var(--ink-muted)] leading-relaxed mb-6 max-w-[380px] mx-auto">
                A confirmation email is on its way to <span className="font-medium text-[var(--ink)]">{form.email || 'you@email.com'}</span>. Your intake form has been sent via your client portal.
              </div>
              <div className="bg-[var(--sage-pale)] rounded-xl p-4 text-left mb-5">
                {[
                  ['Therapist', 'Dr. Abena Osei-Mensah, RP'],
                  ['Session', `${SESSION_TYPES[selectedType].name} · ${SESSION_TYPES[selectedType].duration}`],
                  ['Date & time', confDateTime],
                  ['Format', 'Video (secure link sent separately)'],
                  ['Fee', `${SESSION_TYPES[selectedType].price} CAD · Invoiced after session`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5 text-[13px] border-b border-[rgba(74,124,111,0.2)] last:border-b-0">
                    <span className="text-[var(--sage-deep)]">{label}</span>
                    <span className="font-medium text-[var(--sage-deep)]">{val}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-3.5 bg-[var(--sage)] text-white border-none rounded-[11px] text-sm font-medium cursor-pointer hover:bg-[var(--sage-deep)]">
                Open your client portal →
              </button>
              <div className="text-xs text-[var(--ink-muted)] mt-2.5">Complete your intake form before the session</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
