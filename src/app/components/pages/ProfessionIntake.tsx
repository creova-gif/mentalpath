import { useState } from 'react';
import { Lock, Check } from 'lucide-react';

type ProfKey = 'chiro' | 'physio' | 'rmt';

interface FormField {
  type: 'textarea' | 'date' | 'select' | 'scale' | 'multicheck' | 'yesno' | 'consent' | 'text';
  label: string; req?: boolean; placeholder?: string; options?: string[]; id?: string;
}

interface FormSection {
  head: string; sub: string; consent?: boolean; fields: FormField[];
}

interface ProfForm {
  practice: string; creds: string; title: string; college: string;
  steps: string[]; sections: FormSection[];
}

const FORMS: Record<ProfKey, ProfForm> = {
  chiro: {
    practice: 'Northside Chiropractic Clinic',
    creds: 'Dr. Jane Smith, DC · College of Chiropractors of Ontario · CCO-009834',
    title: 'Chiropractic New Patient Intake',
    college: 'CCO Standard',
    steps: ['Chief Complaint', 'Health History', 'Functional Impact', 'Consent'],
    sections: [
      {
        head: 'What brings you in today?',
        sub: "Tell us about your main concern. This helps Dr. Smith prepare for your visit.",
        fields: [
          { type: 'textarea', label: 'Chief complaint', req: true, placeholder: "Describe your main concern — location, what happened, how long it's been bothering you..." },
          { type: 'date', label: 'When did this start?' },
          { type: 'select', label: 'How did this occur?', options: ['Gradual onset', 'Acute injury / fall', 'Motor vehicle accident', 'Work injury', 'Sports injury', 'Unknown', 'Other'] },
          { type: 'scale', label: 'Pain intensity right now', id: 'painScale' },
          { type: 'multicheck', label: 'Describe your pain', options: ['Sharp', 'Dull', 'Aching', 'Burning', 'Throbbing', 'Shooting', 'Stabbing', 'Constant', 'Intermittent'] },
          { type: 'textarea', label: 'What makes it worse?', placeholder: 'Certain movements, sitting, standing, driving...' },
          { type: 'textarea', label: 'What makes it better?', placeholder: 'Rest, heat, ice, movement...' },
        ],
      },
      {
        head: 'Your health history',
        sub: 'This helps us understand your full health picture and ensure treatment is safe for you.',
        fields: [
          { type: 'yesno', label: 'Have you seen a chiropractor before?' },
          { type: 'yesno', label: 'Have you had X-rays of this area?' },
          { type: 'textarea', label: 'Any surgeries? (area, approximate year)', placeholder: 'e.g. Left knee replacement 2019, appendix removed 2008' },
          { type: 'textarea', label: 'Current medications and supplements', placeholder: 'Include all prescription medications, over-the-counter, vitamins, supplements...' },
          { type: 'yesno', label: 'Have you been diagnosed with osteoporosis?' },
          { type: 'yesno', label: 'Are you currently on blood thinners?' },
          { type: 'textarea', label: 'Any other health conditions we should know about?', placeholder: 'Diabetes, heart conditions, cancer, neurological conditions...' },
        ],
      },
      {
        head: 'How is this affecting your life?',
        sub: 'Understanding the functional impact helps us set meaningful goals for your care.',
        fields: [
          { type: 'yesno', label: 'Has this affected your ability to work?' },
          { type: 'yesno', label: 'Is your sleep affected?' },
          { type: 'textarea', label: 'What activities are you unable to do because of this?', placeholder: 'Exercise, driving, work tasks, hobbies, caring for family...' },
          { type: 'multicheck', label: 'Goals for chiropractic care', options: ['Reduce pain', 'Return to work', 'Return to sport/activity', 'Improve posture', 'Better sleep', 'Reduce medication', 'Prevent recurrence', 'Other'] },
          { type: 'textarea', label: "Anything else you'd like Dr. Smith to know before your first visit?", placeholder: 'Optional — anything that helps us serve you better' },
        ],
      },
      {
        head: 'Informed consent',
        sub: 'Please read and acknowledge the following before your first visit.',
        consent: true,
        fields: [
          { type: 'consent', label: 'I consent to chiropractic assessment and treatment. I understand I may withdraw consent at any time, and that chiropractic treatment involves physical contact and joint manipulation.', req: true },
          { type: 'consent', label: 'I consent to spinal X-rays if deemed clinically necessary by Dr. Smith to support diagnosis and treatment planning.' },
          { type: 'consent', label: 'I have read and understood the Privacy Notice. I consent to my health information being collected, stored, and used for my treatment in compliance with PHIPA.', req: true },
          { type: 'consent', label: 'I consent to receiving appointment reminders and health information via email and/or SMS. I understand I can opt out at any time.' },
        ],
      },
    ],
  },
  physio: {
    practice: 'Riverside Physiotherapy',
    creds: 'Sarah Chen, PT, MSc · College of Physiotherapists of Ontario · CPT-012847',
    title: 'Physiotherapy New Patient Intake',
    college: 'CPT Standard',
    steps: ['Your Injury', 'Previous Care', 'Your Goals', 'Consent'],
    sections: [
      {
        head: 'Tell us about your injury or concern',
        sub: 'The more detail you can share, the better Sarah can prepare for your assessment.',
        fields: [
          { type: 'textarea', label: 'What brings you to physiotherapy today?', req: true, placeholder: 'Describe your main concern — what happened, when, how it feels...' },
          { type: 'multicheck', label: 'Area(s) affected', options: ['Neck', 'Upper back', 'Lower back', 'Shoulder (L)', 'Shoulder (R)', 'Elbow (L)', 'Elbow (R)', 'Wrist/Hand', 'Hip (L)', 'Hip (R)', 'Knee (L)', 'Knee (R)', 'Ankle/Foot (L)', 'Ankle/Foot (R)', 'Other'] },
          { type: 'date', label: 'When did this start?' },
          { type: 'select', label: 'Cause', options: ['Sudden injury', 'Gradual / overuse', 'Post-surgery', 'Motor vehicle accident', 'Workplace injury', 'Sport or exercise', 'Repetitive strain', 'Unknown'] },
          { type: 'scale', label: 'Current pain level', id: 'painScale' },
          { type: 'textarea', label: 'What makes it worse?', placeholder: 'Certain movements, positions, activities...' },
          { type: 'textarea', label: 'What makes it better?', placeholder: 'Rest, heat, ice, stretching, medication...' },
        ],
      },
      {
        head: 'Previous treatment',
        sub: "This helps us build on what's worked before and avoid repeating what hasn't.",
        fields: [
          { type: 'yesno', label: 'Have you had physiotherapy for this before?' },
          { type: 'multicheck', label: 'Imaging already completed', options: ['None', 'X-ray', 'MRI', 'CT scan', 'Ultrasound', 'Other'] },
          { type: 'yesno', label: 'Have you seen a specialist (orthopaedic surgeon, neurologist, etc.)?' },
          { type: 'textarea', label: 'Current medications', placeholder: 'Prescription, over-the-counter, supplements...' },
          { type: 'textarea', label: 'Relevant health conditions', placeholder: 'Diabetes, heart conditions, osteoporosis, neurological conditions...' },
        ],
      },
      {
        head: 'Your goals',
        sub: 'Physiotherapy works best when we know what matters to you.',
        fields: [
          { type: 'textarea', label: "What do you want to be able to do when you're better?", req: true, placeholder: "Return to running, go back to work, pick up my kids, play golf — be specific" },
          { type: 'yesno', label: 'Is return to work a goal?' },
          { type: 'yesno', label: 'Is return to sport or specific activity a goal?' },
          { type: 'textarea', label: "Is there anything else you'd like Sarah to know?", placeholder: 'Optional' },
        ],
      },
      {
        head: 'Informed consent',
        sub: 'Please read and acknowledge the following.',
        consent: true,
        fields: [
          { type: 'consent', label: 'I consent to physiotherapy assessment and treatment, including manual therapy, exercise prescription, and therapeutic modalities.', req: true },
          { type: 'consent', label: 'I understand that physiotherapy involves hands-on treatment and physical contact, and that I can withdraw consent at any time.' },
          { type: 'consent', label: 'I have read and understood the Privacy Notice. I consent to my health information being stored and used for my treatment in compliance with PHIPA.', req: true },
          { type: 'consent', label: 'I consent to receiving appointment reminders via email and/or SMS.' },
        ],
      },
    ],
  },
  rmt: {
    practice: 'Harmony Massage Therapy',
    creds: 'Michael Torres, RMT · College of Massage Therapists of Ontario · CMTO-007291',
    title: 'RMT New Client Intake',
    college: 'CMTO Standard',
    steps: ['Visit Purpose', 'Health Screen', 'Preferences', 'Consent'],
    sections: [
      {
        head: "Why are you visiting today?",
        sub: "This helps Michael understand what you're hoping to get from your session.",
        fields: [
          { type: 'multicheck', label: 'Reason for visit', options: ['Relaxation', 'Muscle tension / tightness', 'Pain relief', 'Injury recovery', 'Headaches', 'Stress reduction', 'Post-surgery', 'Athletic recovery', 'Prenatal massage', 'Workplace injury', 'Other'] },
          { type: 'textarea', label: "Specific areas you'd like focused on", placeholder: 'Upper back, neck, shoulders, lower back...' },
          { type: 'scale', label: 'Discomfort level right now (0 = none)', id: 'painScale' },
        ],
      },
      {
        head: 'Quick health screening',
        sub: 'This is required by the CMTO to ensure massage therapy is safe for you. All answers are confidential.',
        fields: [
          { type: 'textarea', label: 'Any skin conditions? (rash, open wounds, recent tattoos/piercings)', placeholder: 'None, or describe...' },
          { type: 'yesno', label: 'Any history of blood clots (DVT) or clotting disorders?' },
          { type: 'yesno', label: 'Are you currently receiving treatment for cancer?' },
          { type: 'yesno', label: 'Are you pregnant or recently postpartum?' },
          { type: 'yesno', label: 'Do you have osteoporosis?' },
          { type: 'textarea', label: 'Medications that affect sensation, bleeding, or bruising?', placeholder: 'Blood thinners, steroids, neuropathy medications...' },
          { type: 'textarea', label: 'Any allergies (oils, lotions, latex)?', placeholder: 'None, or describe...' },
        ],
      },
      {
        head: 'Your preferences',
        sub: 'Every client is different. Let us know what makes your session best.',
        fields: [
          { type: 'select', label: 'Preferred pressure', options: ['Light', 'Medium', 'Deep', 'Deep — as tolerated', 'Varies by area', "Not sure — therapist's discretion"] },
          { type: 'select', label: 'Draping preference', options: ['Full draping (standard)', 'Comfortable with therapist guidance'] },
          { type: 'yesno', label: 'Do you prefer music during the session?' },
          { type: 'textarea', label: 'Any areas you prefer NOT to be worked on?', placeholder: 'Optional — e.g. feet, abdomen...' },
          { type: 'textarea', label: 'Anything else that would help us give you a better experience?', placeholder: 'Optional' },
        ],
      },
      {
        head: 'Informed consent',
        sub: 'CMTO standards require informed consent before each treatment.',
        consent: true,
        fields: [
          { type: 'consent', label: 'I consent to massage therapy assessment and treatment. I understand I may modify or withdraw consent at any time, including during treatment.', req: true },
          { type: 'consent', label: 'I understand that massage therapy involves hands-on physical contact and that I may choose to stop treatment at any point without negative consequences.' },
          { type: 'consent', label: 'I consent to my health information being collected and stored by this practice in compliance with PHIPA. I understand my information will not be shared without my consent except as required by law.', req: true },
          { type: 'consent', label: 'I consent to appointment reminders via email and/or SMS.' },
        ],
      },
    ],
  },
};

function PainScale({ label }: { label: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">{label}</label>
      <div className="flex gap-1.5">
        {Array.from({ length: 11 }, (_, n) => {
          const isHigh = n >= 7;
          const isMod = n >= 4 && n < 7;
          const isOn = selected === n;
          let base = 'flex-1 aspect-square border-[1.5px] rounded-[7px] text-[13px] font-medium cursor-pointer flex items-center justify-center transition-all duration-150';
          if (isOn && isHigh) base += ' bg-[#c0392b] border-[#c0392b] text-white';
          else if (isOn && isMod) base += ' bg-[#BA7517] border-[#BA7517] text-white';
          else if (isOn) base += ' bg-[var(--sage)] border-[var(--sage)] text-white';
          else if (isHigh) base += ' bg-[#fde8e8] border-[#c0392b] text-[#791F1F] hover:border-[#c0392b]';
          else if (isMod) base += ' bg-[#faeeda] border-[#BA7517] text-[#633806] hover:border-[#BA7517]';
          else base += ' bg-white border-[rgba(0,0,0,0.09)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]';
          return <button key={n} className={base} onClick={() => setSelected(n)}>{n}</button>;
        })}
      </div>
      <div className="flex justify-between text-[10px] text-[var(--ink-muted)] mt-1">
        <span>0 — no pain</span><span>5 — moderate</span><span>10 — worst</span>
      </div>
    </div>
  );
}

function MultiCheck({ label, req, options }: { label: string; req?: boolean; options: string[] }) {
  const [on, setOn] = useState<Set<string>>(new Set());
  function toggle(opt: string) { setOn(prev => { const n = new Set(prev); n.has(opt) ? n.delete(opt) : n.add(opt); return n; }); }
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">{label}{req && <span className="text-[var(--sage)]"> *</span>}</label>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map(opt => {
          const isOn = on.has(opt);
          return (
            <div key={opt} onClick={() => toggle(opt)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${isOn ? 'bg-[var(--sage-pale)] border-[var(--sage)]' : 'bg-white border-[rgba(0,0,0,0.09)] hover:border-[var(--sage-light)]'}`}>
              <div className={`w-4 h-4 rounded-[4px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${isOn ? 'bg-[var(--sage)] border-[var(--sage)]' : 'bg-white border-[rgba(0,0,0,0.13)]'}`}>
                {isOn && <Check className="w-2.5 h-2.5 stroke-white stroke-[2.5]" />}
              </div>
              <span className={`text-[13px] ${isOn ? 'text-[var(--sage-deep)]' : 'text-[var(--ink-soft)]'}`}>{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YesNo({ label }: { label: string }) {
  const [val, setVal] = useState<'yes' | 'no' | null>(null);
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {(['yes', 'no'] as const).map(v => (
          <button key={v} onClick={() => setVal(v)} className={`py-2.5 border-[1.5px] rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 ${
            val === v && v === 'yes' ? 'bg-[var(--sage-pale)] border-[var(--sage)] text-[var(--sage-deep)]' :
            val === v && v === 'no' ? 'bg-[var(--warm)] border-[rgba(0,0,0,0.13)] text-[var(--ink)]' :
            'bg-white border-[rgba(0,0,0,0.09)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
          }`}>
            {v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConsentItem({ label, req }: { label: string; req?: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <div onClick={() => setOn(!on)} className="flex gap-2.5 py-3 border-b border-[rgba(0,0,0,0.06)] cursor-pointer items-start last:border-0">
      <div className={`w-[18px] h-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${on ? 'bg-[var(--sage)] border-[var(--sage)]' : 'bg-white border-[rgba(0,0,0,0.13)]'}`}>
        {on && <Check className="w-2.5 h-2.5 stroke-white stroke-[2.5]" />}
      </div>
      <div>
        <div className="text-[13px] text-[var(--ink-soft)] leading-[1.55]">{label}</div>
        {req && <div className="text-[10px] font-medium text-[var(--sage)] mt-0.5">Required</div>}
      </div>
    </div>
  );
}

function renderField(f: FormField, fi: number) {
  if (f.type === 'scale') return <PainScale key={fi} label={f.label} />;
  if (f.type === 'multicheck') return <MultiCheck key={fi} label={f.label} req={f.req} options={f.options!} />;
  if (f.type === 'yesno') return <YesNo key={fi} label={f.label} />;
  if (f.type === 'consent') return <ConsentItem key={fi} label={f.label} req={f.req} />;
  return (
    <div key={fi} className="mb-4">
      <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
        {f.label}{f.req && <span className="text-[var(--sage)]"> *</span>}
      </label>
      {f.type === 'textarea' && <textarea rows={3} placeholder={f.placeholder} className="w-full px-3.5 py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-[14px] outline-none focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)] resize-y min-h-[72px] leading-[1.6] transition-all" />}
      {f.type === 'date' && <input type="date" className="w-full px-3.5 py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-[14px] outline-none focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)] transition-all" />}
      {f.type === 'select' && (
        <select className="w-full px-3.5 py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-[14px] outline-none focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)] transition-all">
          <option value="">Select...</option>
          {f.options?.map(o => <option key={o}>{o}</option>)}
        </select>
      )}
      {f.type === 'text' && <input type="text" placeholder={f.placeholder} className="w-full px-3.5 py-2.5 rounded-[9px] border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink)] text-[14px] outline-none focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)] transition-all" />}
    </div>
  );
}

export function ProfessionIntake() {
  const [prof, setProf] = useState<ProfKey>('chiro');
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const form = FORMS[prof];
  const totalSteps = form.steps.length;

  function switchProf(p: ProfKey) { setProf(p); setStep(0); setDone(false); }
  function goNext() {
    if (step >= totalSteps - 1) { setDone(true); return; }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goBack() {
    if (step > 0) { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  return (
    <div className="min-h-screen bg-[var(--warm)] flex flex-col">
      {/* Header */}
      <div className="px-7 py-6" style={{ background: 'var(--sage-deep)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-none stroke-white stroke-2 [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span className="font-[var(--font-display)] text-[15px] text-white">MentalPath</span>
        </div>
        <div className="font-[var(--font-display)] text-[24px] text-white mb-1">{form.practice}</div>
        <div className="text-[13px] text-white/65">{form.creds}</div>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-white/45">
          <Lock className="w-[11px] h-[11px] stroke-white/50" />
          Your information is kept strictly confidential and stored on Canadian servers (PHIPA)
        </div>
      </div>

      {/* Profession switcher (demo) */}
      <div className="flex items-center gap-2 px-7 py-2 bg-[var(--ink)] text-[12px]">
        <span className="text-white/40 flex-shrink-0">Preview as:</span>
        {(['chiro', 'physio', 'rmt'] as ProfKey[]).map(p => (
          <button
            key={p}
            onClick={() => switchProf(p)}
            className={`px-3 py-[5px] border rounded-[5px] text-[11px] font-medium cursor-pointer transition-all duration-150 ${
              prof === p
                ? 'border-[var(--sage-light)] text-white'
                : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white/80'
            }`}
            style={{ background: prof === p ? 'rgba(74,124,111,0.4)' : 'transparent' }}
          >
            {p === 'chiro' ? 'Chiropractic' : p === 'physio' ? 'Physiotherapy' : 'RMT'}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-7 py-3 flex items-center gap-4">
        <div className="flex flex-1">
          {form.steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 transition-all duration-200 ${
                done || i < step ? 'bg-[var(--sage)] text-white' :
                i === step ? 'bg-[var(--ink)] text-white' :
                'text-[var(--ink-muted)]'
              }`} style={done || i < step || i === step ? {} : { background: 'rgba(0,0,0,0.07)' }}>
                {done || i < step ? <Check className="w-3 h-3 stroke-white stroke-[2.5]" /> : i + 1}
              </div>
              {i < form.steps.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-[var(--sage)]' : 'bg-[rgba(0,0,0,0.08)]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 pb-24">
        <div className="max-w-[640px] mx-auto px-5 pt-7">
          {done ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--sage-pale)' }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-[var(--sage)] stroke-2 [stroke-linecap:round]">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="font-[var(--font-display)] text-[26px] text-[var(--ink)] mb-2">All done — thank you.</div>
              <div className="text-[14px] text-[var(--ink-muted)] leading-[1.65] max-w-[360px] mx-auto mb-6">
                Your intake form has been securely submitted to {form.practice}. Your information is stored on Canadian servers in compliance with PHIPA. You'll receive a confirmation email shortly.
              </div>
              <button className="px-8 py-3.5 bg-[var(--sage)] text-white rounded-[10px] text-[14px] font-medium cursor-pointer hover:bg-[var(--sage-deep)] transition-colors duration-150">
                Open your client portal →
              </button>
            </div>
          ) : (
            <>
              <div className="font-[var(--font-display)] text-[20px] text-[var(--ink)] mb-1">{form.sections[step].head}</div>
              <div className="text-[13px] text-[var(--ink-muted)] leading-[1.55] mb-6">{form.sections[step].sub}</div>
              {form.sections[step].fields.map((f, fi) => renderField(f, fi))}
            </>
          )}
        </div>
      </div>

      {/* Fixed bottom nav */}
      {!done && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgba(0,0,0,0.08)] px-7 py-3.5 flex items-center justify-between gap-3 z-10">
          <div className="text-[12px] text-[var(--ink-muted)]">
            Step {step + 1} of {totalSteps} — {form.steps[step]}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={goBack} className="px-5 py-3 border border-[rgba(0,0,0,0.13)] rounded-[9px] bg-white text-[14px] font-medium text-[var(--ink-soft)] cursor-pointer">
                ← Back
              </button>
            )}
            <button onClick={goNext} className="px-7 py-3 rounded-[9px] bg-[var(--sage)] text-[14px] font-medium text-white cursor-pointer hover:bg-[var(--sage-deep)] transition-colors duration-150">
              {step >= totalSteps - 1 ? 'Submit intake →' : 'Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
