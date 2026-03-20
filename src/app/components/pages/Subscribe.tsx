import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Lock, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const PLANS = {
  solo: { name: 'Solo Practitioner', price: 49, perLabel: 'per month after trial' },
  group: { name: 'Group Practice', price: 79, perLabel: 'per clinician/month after trial' },
};

type ProfKey = 'physio' | 'chiro' | 'rmt' | 'psychotherapist' | 'ot' | 'naturopath';

interface Tool { icon: string; name: string; cat: string; cost: number; note?: string; }
interface Extra { icon: string; name: string; note: string; }
interface ProfData { tools: Tool[]; extras: Extra[]; }

const DATA: Record<ProfKey, ProfData> = {
  physio: {
    tools: [
      { icon: '📅', name: 'Cliniko', cat: 'Scheduling + notes + intake', cost: 74, note: 'Australian servers — not PHIPA' },
      { icon: '💰', name: 'QuickBooks', cat: 'Invoicing + T2125', cost: 35 },
      { icon: '💪', name: 'PhysiApp', cat: 'Home exercise programs', cost: 45, note: 'Most physios pay this monthly' },
      { icon: '📋', name: 'JotForm', cat: 'Digital intake forms', cost: 27 },
      { icon: '🔐', name: 'Healthie', cat: 'Client portal', cost: 49 },
      { icon: '📹', name: 'Zoom Pro', cat: 'Video telehealth', cost: 21 },
    ],
    extras: [
      { icon: '📊', name: 'Oswestry + DASH + NPRS + PSFS + Berg', note: 'Full MSK outcome library — built in' },
      { icon: '🔄', name: 'Treatment course dashboard', note: 'Session 4 of 8 · who needs reassessment' },
      { icon: '🤖', name: 'AI CPT-standard SOAP drafting', note: 'Fills S/O/A/P in seconds from your dictation' },
      { icon: '🇨🇦', name: '100% Canadian infrastructure', note: 'Cliniko is Australian. MentalPath is ca-central-1.' },
    ],
  },
  chiro: {
    tools: [
      { icon: '📅', name: 'Cliniko', cat: 'Scheduling + notes', cost: 74, note: 'Australian servers — not PHIPA' },
      { icon: '💰', name: 'QuickBooks', cat: 'Invoicing', cost: 35 },
      { icon: '💪', name: 'PhysiApp', cat: 'Home exercise programs', cost: 45 },
      { icon: '📋', name: 'JotForm', cat: 'Intake forms', cost: 27 },
      { icon: '🔐', name: 'Healthie', cat: 'Client portal', cost: 49 },
      { icon: '📹', name: 'Doxy.me', cat: 'Video sessions', cost: 20 },
    ],
    extras: [
      { icon: '🦴', name: 'CCO-standard SOAP templates', note: 'Pre-built to College standards' },
      { icon: '📊', name: 'Oswestry + NPRS + PSFS outcomes', note: 'Track disability and pain per course' },
      { icon: '🤖', name: 'AI SOAP note drafting', note: 'No other chiro software does this' },
      { icon: '🏥', name: 'Extended health receipts', note: 'Blue Cross, Sun Life, Manulife, Green Shield, Canada Life' },
    ],
  },
  rmt: {
    tools: [
      { icon: '📅', name: 'Jane App', cat: 'Scheduling + intake', cost: 74 },
      { icon: '💰', name: 'QuickBooks', cat: 'Invoicing', cost: 35 },
      { icon: '📂', name: 'Google Drive / Dropbox', cat: 'Document storage', cost: 14 },
      { icon: '💳', name: 'Square', cat: 'Payment processing overhead', cost: 25 },
      { icon: '📅', name: 'Calendly', cat: 'Online booking', cost: 19 },
    ],
    extras: [
      { icon: '📋', name: 'CMTO-standard intake form', note: 'Seeded, PHIPA-compliant, e-signed before visit' },
      { icon: '🏥', name: 'Extended health receipts in 30s', note: 'CMTO provider number on every receipt' },
      { icon: '🤖', name: 'AI SOAP note drafting', note: 'Jane has no AI — you type everything' },
      { icon: '🫀', name: 'Therapist wellbeing check-ins', note: "No RMT tool asks how you're doing" },
    ],
  },
  psychotherapist: {
    tools: [
      { icon: '📅', name: 'Jane App', cat: 'Scheduling + intake', cost: 74, note: 'Most popular for Canadian therapists' },
      { icon: '💰', name: 'QuickBooks', cat: 'Invoicing + T2125', cost: 35 },
      { icon: '📊', name: 'Owl Practice', cat: 'PHQ-9 / GAD-7 only', cost: 29, note: 'Separate sub for outcome tracking' },
      { icon: '📹', name: 'Zoom Pro', cat: 'Video telehealth', cost: 21 },
      { icon: '📧', name: 'Mailchimp', cat: 'Client reminders', cost: 18 },
    ],
    extras: [
      { icon: '🤖', name: 'AI DAP/SOAP/BIRP/Progress drafting', note: 'Jane has zero AI. Every note is typed by hand.' },
      { icon: '🫀', name: 'Therapist wellbeing monitoring', note: 'ProQOL-5 VT tracking — nothing else has this' },
      { icon: '🌍', name: 'Cultural intake templates (7)', note: 'BIPOC, newcomer, Indigenous, LGBTQ2S+ — ready now' },
      { icon: '📋', name: 'Auto-generated T2125 summary', note: 'No accountant needed for this step' },
    ],
  },
  ot: {
    tools: [
      { icon: '📅', name: 'SimplePractice', cat: 'Practice management', cost: 109, note: 'US-hosted — not PHIPA-compliant' },
      { icon: '💰', name: 'QuickBooks', cat: 'Invoicing', cost: 35 },
      { icon: '📋', name: 'JotForm', cat: 'Intake forms', cost: 27 },
    ],
    extras: [
      { icon: '🇨🇦', name: 'Actually PHIPA-compliant', note: 'SimplePractice is US-hosted and follows HIPAA, not PHIPA' },
      { icon: '📊', name: 'WHODAS + COPM + FIM built in', note: 'OT-specific outcomes, pre-configured' },
      { icon: '🤖', name: 'AI SOAP + DAP note drafting', note: 'SimplePractice has no AI' },
      { icon: '🏥', name: 'Extended health + OHIP receipts', note: 'Both billing streams for OT' },
    ],
  },
  naturopath: {
    tools: [
      { icon: '📅', name: 'Practice Better', cat: 'Scheduling + protocols', cost: 89, note: 'US-hosted — not PHIPA' },
      { icon: '💰', name: 'QuickBooks', cat: 'Invoicing', cost: 35 },
      { icon: '📋', name: 'JotForm', cat: 'Intake forms', cost: 27 },
    ],
    extras: [
      { icon: '🇨🇦', name: 'Canadian infrastructure', note: 'Practice Better is US-hosted. ca-central-1.' },
      { icon: '📋', name: 'CONO-standard intake templates', note: 'Health history, supplements, lifestyle — seeded' },
      { icon: '🤖', name: 'AI SOAP note drafting', note: 'Practice Better has no AI' },
      { icon: '🏥', name: 'Extended health receipts', note: 'CONO provider number on every receipt' },
    ],
  },
};

const PROFESSIONS: { id: ProfKey; label: string }[] = [
  { id: 'physio', label: '⚡ Physiotherapist' },
  { id: 'chiro', label: '🦴 Chiropractor' },
  { id: 'rmt', label: '💆 RMT' },
  { id: 'psychotherapist', label: '🧠 Psychotherapist' },
  { id: 'ot', label: '🔧 OT' },
  { id: 'naturopath', label: '🌿 Naturopath' },
];

const FAQ_ITEMS = [
  {
    q: 'When will I be charged?',
    a: 'Not until your 30-day free trial ends. You can add your payment method now — nothing is charged until the trial ends. If you cancel before the trial ends, you pay nothing.',
  },
  {
    q: 'What taxes will I pay?',
    a: 'MentalPath is a Canadian SaaS product. GST/HST applies based on your province. Ontario: 13% HST. Alberta/territories: 5% GST. Atlantic provinces: 15% HST. Quebec adds QST on top of GST. Stripe collects and remits this automatically — your invoice shows the tax breakdown clearly.',
  },
  {
    q: 'What are the Stripe payment processing fees?',
    a: 'Stripe charges 2.9% + $0.30 CAD for Canadian cards, 3.9% + $0.30 for international cards. These apply when your clients pay invoices through MentalPath. If a client pays a $140 invoice, you receive ~$135.74 after the 2.9% + $0.30 fee.',
  },
  {
    q: 'Is my client data safe and PHIPA-compliant?',
    a: 'All client health records are stored on AWS ca-central-1 (Montreal + Calgary) — physically in Canada. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). Session notes are auto-locked after 24 hours. There is an append-only audit log for all PHI access.',
  },
  {
    q: 'Can I get a discount?',
    a: 'Yes — 20% community rate ($39/mo) for practitioners who primarily serve BIPOC, newcomer, refugee, or rural/remote communities. Email hello@mentalpath.ca with a brief description of your practice. Use code COMMUNITY at checkout.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your account is paused — not deleted. You retain read-only access for 90 days. Clinical records are retained for 10 years as required by PHIPA regardless of subscription status. You\'ll receive a full data export before any deletion.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes — upgrade from Solo to Group any time from Settings. Downgrade at next renewal. Upgrades are prorated to the day.',
  },
];

function getFirstChargeDate() {
  const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return {
    long: d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }),
    short: d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' }),
  };
}

export function Subscribe() {
  const navigate = useNavigate();
  const [prof, setProf] = useState<ProfKey>('physio');
  const [plan, setPlan] = useState<'solo' | 'group'>('solo');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const firstCharge = getFirstChargeDate();
  const profData = DATA[prof];
  const oldTotal = profData.tools.reduce((s, t) => s + t.cost, 0);
  const saving = oldTotal - 49;
  const planPrice = PLANS[plan].price;
  const tax = parseFloat((planPrice * 0.13).toFixed(2));
  const total = parseFloat((planPrice + tax).toFixed(2));

  const handleStartTrial = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 900);
  };

  return (
    <div style={{ background: '#0d0f0e', minHeight: '100vh', color: '#e8ede9', fontFamily: 'var(--font-body)' }}>

      {/* Topbar */}
      <div style={{
        height: 56, borderBottom: '1px solid rgba(232,237,233,0.07)',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, background: '#2a6b54', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4fb896" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#e8ede9' }}>MentalPath</span>
        </Link>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(232,237,233,0.45)' }}>
          <Lock size={11} stroke="#4fb896" />
          Secured by Stripe · Canadian servers (AWS ca-central-1) · PHIPA compliant
        </div>
      </div>

      {/* Main grid */}
      <div style={{
        maxWidth: 1080, margin: '0 auto', padding: '52px 20px 80px',
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start',
      }} className="subscribe-grid">

        {/* LEFT COLUMN */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#4fb896', marginBottom: 14 }}>
            For Canadian regulated health professionals
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,52px)',
            fontWeight: 300, lineHeight: 1.05, color: '#e8ede9', marginBottom: 12,
          }}>
            Stop paying five bills<br />for <em style={{ fontStyle: 'italic', color: '#4fb896' }}>one practice.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(232,237,233,0.5)', lineHeight: 1.65, marginBottom: 32, maxWidth: 480 }}>
            Every tool you're currently paying for — scheduling, notes, invoicing, reminders, HEPs, outcomes, portal, compliance — is already in MentalPath. For $49 a month.
          </p>

          {/* Profession pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {PROFESSIONS.map(p => (
              <button
                key={p.id}
                onClick={() => setProf(p.id)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: prof === p.id ? 'rgba(79,184,150,0.12)' : 'transparent',
                  border: prof === p.id ? '1px solid #4fb896' : '1px solid rgba(232,237,233,0.12)',
                  color: prof === p.id ? '#4fb896' : 'rgba(232,237,233,0.45)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Savings bar */}
          <div style={{
            background: '#131614', border: '1px solid rgba(232,237,233,0.12)',
            borderRadius: 14, padding: '20px 24px', marginBottom: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79,184,150,0.08), transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4fb896', marginBottom: 8 }}>
              Your monthly savings with MentalPath
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: '#e8ede9', lineHeight: 1 }}>${saving}</div>
                <div style={{ fontSize: 13, color: 'rgba(232,237,233,0.4)', marginTop: 4 }}>
                  per month · ${(saving * 12).toLocaleString()}/yr
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginLeft: 'auto', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#e8ede9' }}>${oldTotal}</div>
                  <div style={{ fontSize: 10, color: 'rgba(232,237,233,0.35)', marginTop: 2 }}>old stack</div>
                </div>
                <div style={{ width: 1, background: 'rgba(232,237,233,0.07)', alignSelf: 'stretch' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#4fb896' }}>$49</div>
                  <div style={{ fontSize: 10, color: 'rgba(232,237,233,0.35)', marginTop: 2 }}>MentalPath</div>
                </div>
                <div style={{ width: 1, background: 'rgba(232,237,233,0.07)', alignSelf: 'stretch' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#e8ede9' }}>{profData.tools.length}</div>
                  <div style={{ fontSize: 10, color: 'rgba(232,237,233,0.35)', marginTop: 2 }}>replaced</div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {(['solo', 'group'] as const).map(p => (
              <div
                key={p}
                onClick={() => setPlan(p)}
                style={{
                  background: '#131614', borderRadius: 14, padding: 22, cursor: 'pointer',
                  transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                  border: plan === p ? '2px solid #4fb896' : '1.5px solid rgba(232,237,233,0.07)',
                }}
              >
                {plan === p && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(79,184,150,0.04)', pointerEvents: 'none' }} />
                )}
                {p === 'group' && (
                  <div style={{
                    position: 'absolute', top: -1, right: 16, background: '#4fb896',
                    color: '#0d0f0e', fontSize: 9, fontWeight: 700, letterSpacing: '0.5px',
                    textTransform: 'uppercase', padding: '3px 10px', borderRadius: '0 0 6px 6px',
                  }}>
                    Most popular for clinics
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(232,237,233,0.4)', marginBottom: 8 }}>
                  {PLANS[p].name}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#e8ede9', lineHeight: 1, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, verticalAlign: 'top', marginTop: 6, display: 'inline-block', color: 'rgba(232,237,233,0.4)' }}>$</span>
                  {PLANS[p].price}
                  <span style={{ fontSize: 13, color: 'rgba(232,237,233,0.4)', fontFamily: 'var(--font-body)' }}>
                    {' '}CAD{p === 'group' ? '/clinician' : ''}/mo
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(232,237,233,0.4)', marginBottom: 14, lineHeight: 1.55 }}>
                  {p === 'solo' ? 'Everything a solo practitioner needs. Unlimited clients, all AI features, full compliance toolkit.' : 'Everything in Solo, plus a shared practice dashboard, multi-clinician scheduling, and owner analytics.'}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(p === 'solo' ? [
                    'Unlimited clients',
                    'AI note drafting (all formats)',
                    'All outcome measures',
                    'HEP builder + exercise library',
                    'Extended health receipts',
                    'Treatment course dashboard',
                    'PHIPA compliance toolkit',
                    'Therapist wellbeing check-ins',
                  ] : [
                    'Everything in Solo',
                    'Unlimited clinician seats',
                    'Practice owner dashboard',
                    'Shared scheduling calendar',
                    'Clinician invite + roles',
                    'Cross-clinician compliance',
                    'Practice analytics',
                    '2–50 clinicians',
                  ]).map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'rgba(232,237,233,0.55)' }}>
                      <svg width="13" height="12" viewBox="0 0 14 12" fill="none" stroke="#4fb896" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M1 6l4 4 8-8"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tools being replaced */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(232,237,233,0.4)', marginBottom: 10 }}>
              What MentalPath replaces
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profData.tools.map(t => (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', background: '#131614', borderRadius: 8,
                  border: '1px solid rgba(232,237,233,0.07)',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#e8ede9' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(232,237,233,0.35)' }}>
                      {t.cat}{t.note ? ` · ${t.note}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#e05252', textDecoration: 'line-through', flexShrink: 0 }}>
                    ${t.cost}/mo
                  </span>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(79,184,150,0.1)', border: '1px solid #2a6b54',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 12 10" fill="none" stroke="#4fb896" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M1 5l3.5 3.5L11 1"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            {/* Total row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
              background: '#191e1b', borderRadius: 8,
              border: '1px solid rgba(232,237,233,0.12)', marginTop: 6,
            }}>
              <span style={{ fontSize: 13, color: 'rgba(232,237,233,0.4)' }}>Old stack</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#e05252', textDecoration: 'line-through', opacity: 0.7 }}>
                  ${oldTotal}/mo
                </span>
                <span style={{ fontSize: 14, color: 'rgba(232,237,233,0.3)' }}>→</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#4fb896' }}>$49/mo</span>
              </div>
            </div>
          </div>

          {/* Extras grid */}
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(232,237,233,0.4)', marginBottom: 10 }}>
            Things your old stack never had
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 36 }}>
            {profData.extras.map(x => (
              <div key={x.name} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                background: '#131614', borderRadius: 8, padding: '10px 12px',
                border: '1px solid rgba(232,237,233,0.07)',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{x.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#e8ede9', lineHeight: 1.2 }}>{x.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(232,237,233,0.35)', marginTop: 2 }}>{x.note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: '#e8ede9', marginBottom: 16 }}>
              Common questions
            </div>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{ borderBottom: '1px solid rgba(232,237,233,0.07)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '14px 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, color: openFaq === i ? '#4fb896' : '#e8ede9',
                    textAlign: 'left', gap: 12,
                  }}
                >
                  {item.q}
                  {openFaq === i
                    ? <ChevronUp size={16} color="rgba(232,237,233,0.4)" style={{ flexShrink: 0 }} />
                    : <ChevronDown size={16} color="rgba(232,237,233,0.25)" style={{ flexShrink: 0 }} />
                  }
                </button>
                {openFaq === i && (
                  <div style={{
                    paddingBottom: 14, fontSize: 13,
                    color: 'rgba(232,237,233,0.5)', lineHeight: 1.65,
                  }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — Checkout */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{
            background: '#131614', border: '1px solid rgba(232,237,233,0.12)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {/* Head */}
            <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(232,237,233,0.07)' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(79,184,150,0.12)', border: '1px solid rgba(79,184,150,0.2)',
                borderRadius: 6, padding: '5px 11px', fontSize: 11, fontWeight: 500,
                color: '#6dd9b2', marginBottom: 12,
              }}>
                <Clock size={11} stroke="#6dd9b2" />
                30-day free trial active
              </div>
              {/* Plan tabs */}
              <div style={{
                display: 'flex', background: '#191e1b', borderRadius: 8,
                padding: 3, marginBottom: 14,
              }}>
                {(['solo', 'group'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 6, border: 'none',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.15s',
                      background: plan === p ? '#2a6b54' : 'transparent',
                      color: plan === p ? '#4fb896' : 'rgba(232,237,233,0.35)',
                    }}
                  >
                    {p === 'solo' ? 'Solo $49' : 'Group $79'}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#e8ede9', marginBottom: 4 }}>
                {PLANS[plan].name}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(232,237,233,0.4)' }}>
                <strong style={{ color: '#e8ede9', fontSize: 24, fontFamily: 'var(--font-display)' }}>
                  ${planPrice}
                </strong>{' '}CAD {PLANS[plan].perLabel}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px' }}>
              {[
                { label: 'Trial period', value: '30 days free', green: true },
                { label: 'Charged today', value: '$0.00', green: true },
                { label: 'First charge', value: firstCharge.long, green: false },
                { label: 'Subscription', value: `$${planPrice}.00 CAD/mo`, green: false },
                { label: 'GST/HST (Ontario)', value: `+$${tax.toFixed(2)} (13%)`, muted: true },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: '7px 0', fontSize: 13, borderBottom: '1px solid rgba(232,237,233,0.07)',
                }}>
                  <span style={{ color: 'rgba(232,237,233,0.4)' }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: row.green ? '#4fb896' : row.muted ? 'rgba(232,237,233,0.35)' : '#e8ede9', fontSize: row.muted ? 11 : 13 }}>
                    {row.value}
                  </span>
                </div>
              ))}
              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '12px 0 7px', fontSize: 13, fontWeight: 500,
                borderTop: '1px solid rgba(232,237,233,0.12)', marginTop: 4,
              }}>
                <span style={{ color: '#e8ede9' }}>Total after trial</span>
                <span style={{ color: '#6dd9b2' }}>${total.toFixed(2)} CAD/mo</span>
              </div>

              <div style={{
                fontSize: 11, color: 'rgba(232,237,233,0.35)', marginTop: 10,
                padding: '8px 10px', background: 'rgba(232,237,233,0.03)',
                borderRadius: 6, border: '1px solid rgba(232,237,233,0.07)', lineHeight: 1.65,
              }}>
                Tax calculated automatically based on your billing address. Rate varies by province: ON 13% HST · AB 5% GST · Atlantic 15% HST · QC GST+QST.
              </div>

              {errorMsg && (
                <div style={{
                  background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
                  borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#f09595',
                  lineHeight: 1.55, marginBottom: 14, marginTop: 10,
                }}>
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleStartTrial}
                disabled={isLoading}
                style={{
                  width: '100%', padding: 15, background: isLoading ? '#2a6b54' : '#4fb896',
                  color: isLoading ? '#4fb896' : '#0d0f0e', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', marginTop: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: 16, height: 16, border: '2px solid rgba(79,184,150,0.3)',
                      borderTopColor: '#4fb896', borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Starting your trial…
                  </>
                ) : (
                  `Start free trial — ${plan === 'solo' ? 'Solo' : 'Group'} →`
                )}
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 5, fontSize: 11, color: 'rgba(232,237,233,0.35)', marginTop: 10,
              }}>
                <Lock size={11} stroke="#4fb896" />
                Secured by Stripe · No charge until {firstCharge.short}
              </div>

              {/* Stripe fee info */}
              <div style={{
                fontSize: 11, color: 'rgba(232,237,233,0.3)', marginTop: 14,
                padding: '10px 12px', background: 'rgba(232,237,233,0.03)',
                borderRadius: 6, border: '1px solid rgba(232,237,233,0.07)', lineHeight: 1.75,
              }}>
                <div style={{ fontWeight: 500, color: 'rgba(232,237,233,0.35)', marginBottom: 4, fontSize: 11 }}>
                  Stripe payment processing (when clients pay invoices)
                </div>
                Canadian cards: 2.9% + $0.30 CAD per transaction<br />
                International cards: 3.9% + $0.30 CAD<br />
                Disputes: $15.00 CAD (refunded if you win)<br />
                <span style={{ color: 'rgba(232,237,233,0.2)' }}>Deducted by Stripe before payout — not billed separately</span>
              </div>
            </div>

            <div style={{
              padding: '14px 22px', borderTop: '1px solid rgba(232,237,233,0.07)',
              fontSize: 11, color: 'rgba(232,237,233,0.3)', lineHeight: 1.6,
            }}>
              By starting your trial you agree to MentalPath's{' '}
              <Link to="#" style={{ color: '#4fb896', textDecoration: 'none' }}>Terms of Service</Link>{' '}
              and{' '}
              <Link to="#" style={{ color: '#4fb896', textDecoration: 'none' }}>Privacy Policy</Link>.
              Cancel any time from Settings → Billing. HST/GST collected per Canadian tax law.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .subscribe-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
