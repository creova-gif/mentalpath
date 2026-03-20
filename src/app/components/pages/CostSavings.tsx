import { useState } from 'react';
import { useUser } from '../../context/UserContext';

type ProfKey = 'chiropractor' | 'physiotherapist' | 'rmt' | 'psychotherapist' | 'occupational' | 'naturopath';

interface Tool { name: string; cat: string; cost: number; note?: string; }
interface ProfData { tools: Tool[]; mentalpath: number; bonus: { icon: string; name: string; note: string }[]; }

const DATA: Record<ProfKey, ProfData> = {
  chiropractor: {
    tools: [
      { name: 'Cliniko', cat: 'Scheduling + notes + intake', cost: 74, note: 'Most popular among Canadian chiros' },
      { name: 'QuickBooks Simple Start', cat: 'Invoicing + T2125', cost: 35 },
      { name: 'PhysiApp', cat: 'Home exercise programs', cost: 45, note: 'HEP delivery — many chiros pay this separately' },
      { name: 'JotForm (PHIPA tier)', cat: 'Digital intake forms', cost: 27 },
      { name: 'Healthie', cat: 'Secure client portal', cost: 49, note: 'Canadian-compliant portal' },
      { name: 'Doxy.me (PHIPA)', cat: 'Video sessions', cost: 20 },
    ],
    mentalpath: 49,
    bonus: [
      { icon: '🤖', name: 'AI SOAP note drafting', note: 'Cliniko has no AI — you type everything manually' },
      { icon: '🫀', name: 'Treatment course dashboard', note: 'No other tool tracks session 4 of 8 with outcome trends in one view' },
      { icon: '📊', name: 'Oswestry / NPRS / PSFS outcomes', note: 'Built in — no extra app, no manual scoring' },
      { icon: '🔒', name: 'PHIPA-compliant on Canadian servers', note: 'Cliniko is Australian-hosted. Doxy.me is US-hosted.' },
      { icon: '🩺', name: 'CCO-standard SOAP templates', note: 'Pre-built to College standards — open and start writing' },
      { icon: '🏥', name: 'Insurance receipts (Blue Cross, Sun Life…)', note: 'Generate extended health receipts in 30 seconds' },
    ],
  },
  physiotherapist: {
    tools: [
      { name: 'Cliniko', cat: 'Scheduling + notes + intake', cost: 74 },
      { name: 'QuickBooks Simple Start', cat: 'Invoicing', cost: 35 },
      { name: 'PhysiApp', cat: 'Home exercise programs', cost: 45, note: 'Most physios pay this every month' },
      { name: 'JotForm', cat: 'Digital intake forms', cost: 27 },
      { name: 'Healthie', cat: 'Client portal', cost: 49 },
      { name: 'Zoom Pro', cat: 'Video sessions', cost: 21 },
    ],
    mentalpath: 49,
    bonus: [
      { icon: '💪', name: 'HEP builder with exercise library', note: 'Issue home exercise programs directly to client portal' },
      { icon: '📈', name: 'Oswestry + DASH + NPRS + PSFS + Berg', note: 'Full musculoskeletal outcome library, built in' },
      { icon: '🔄', name: 'Treatment course progress tracker', note: 'Session 3 of 8 · who needs reassessment · who\'s near discharge' },
      { icon: '🤖', name: 'AI SOAP note drafting (CPT standard)', note: 'Fills in the S/O/A/P in seconds from your dictation' },
      { icon: '🏥', name: 'Extended health receipts', note: 'Blue Cross, Sun Life, Manulife, Green Shield, Canada Life' },
      { icon: '🔒', name: 'Canadian servers (ca-central-1)', note: 'Cliniko is Australian. Fully PHIPA-compliant infrastructure.' },
    ],
  },
  rmt: {
    tools: [
      { name: 'Jane App', cat: 'Scheduling + intake', cost: 74 },
      { name: 'QuickBooks', cat: 'Invoicing', cost: 35 },
      { name: 'Dropbox / Google Drive', cat: 'Document storage', cost: 14, note: 'Manual document management' },
      { name: 'Square (higher processing fees)', cat: 'Payment overhead vs integrated', cost: 25 },
      { name: 'Calendly', cat: 'Online booking', cost: 19 },
    ],
    mentalpath: 49,
    bonus: [
      { icon: '🔒', name: 'CMTO-standard SOAP templates', note: 'Contraindications screening, pressure preference, draping — pre-built' },
      { icon: '🏥', name: 'Extended health receipts', note: 'CMTO provider number on every receipt — client submits to their insurer' },
      { icon: '📋', name: 'CMTO-compliant intake form', note: 'Skin conditions, blood clots, pregnancy, allergies — seeded and ready' },
      { icon: '🤖', name: 'AI SOAP note drafting', note: 'Document the session in 30 seconds after the last client' },
      { icon: '🫀', name: 'Wellbeing check-in', note: 'No other RMT tool asks how you\'re doing. Ours does.' },
      { icon: '📊', name: 'NPRS + PSFS outcomes', note: 'Track client progress with validated tools — no extra app' },
    ],
  },
  psychotherapist: {
    tools: [
      { name: 'Jane App', cat: 'Scheduling + intake', cost: 74, note: 'Most popular among Canadian therapists' },
      { name: 'QuickBooks Simple Start', cat: 'Invoicing + T2125', cost: 35 },
      { name: 'Owl Practice', cat: 'Outcome measures (PHQ-9/GAD-7)', cost: 29, note: 'Separate subscription just for outcome tracking' },
      { name: 'Zoom Pro', cat: 'Video sessions', cost: 21 },
      { name: 'Wufoo / JotForm', cat: 'Digital intake forms', cost: 27 },
    ],
    mentalpath: 49,
    bonus: [
      { icon: '🧠', name: 'PHQ-9 + GAD-7 + PCL-5 outcomes', note: 'No extra app — Owl Practice costs $29/mo separately' },
      { icon: '🤖', name: 'AI DAP / process note drafting', note: 'CRPO-standard format auto-filled from session summary' },
      { icon: '🏥', name: 'Extended health receipts', note: 'Blue Cross, Sun Life, Manulife — generate in 30 seconds' },
      { icon: '🫀', name: 'Therapist wellbeing check-in', note: 'Vicarious trauma + burnout screening — just for you' },
      { icon: '📊', name: 'Cultural templates library', note: 'Anti-racism, newcomer, LGBTQ2S+, intergenerational — no other platform has this' },
      { icon: '🔒', name: 'PHIPA on Canadian servers', note: 'Jane App is Canadian but Zoom is US-hosted. We\'re fully on ca-central-1.' },
    ],
  },
  occupational: {
    tools: [
      { name: 'Cliniko', cat: 'Scheduling + notes', cost: 74 },
      { name: 'QuickBooks', cat: 'Invoicing', cost: 35 },
      { name: 'JotForm', cat: 'Digital intake forms', cost: 27 },
      { name: 'Zoom Pro', cat: 'Video sessions', cost: 21 },
    ],
    mentalpath: 49,
    bonus: [
      { icon: '📋', name: 'COTO-standard functional notes', note: 'Pre-built templates matching College standards' },
      { icon: '🤖', name: 'AI clinical note drafting', note: 'SOAP / functional progress notes in seconds' },
      { icon: '📊', name: 'COPM + FIM + Barthel outcomes', note: 'OT-specific validated outcome measures, built in' },
      { icon: '🏥', name: 'Extended health receipts', note: 'Generate in 30 seconds — no extra software needed' },
      { icon: '🔒', name: 'Canadian servers (PHIPA)', note: 'Cliniko is Australian-hosted. We\'re on ca-central-1.' },
      { icon: '🔄', name: 'Client portal with goal tracking', note: 'Clients can view their goals and communicate securely' },
    ],
  },
  naturopath: {
    tools: [
      { name: 'Jane App', cat: 'Scheduling + intake', cost: 74 },
      { name: 'QuickBooks', cat: 'Invoicing', cost: 35 },
      { name: 'FullScript', cat: 'Supplement dispensing platform', cost: 0, note: 'No cost but takes 35% margin vs wholesale' },
      { name: 'Zoom Pro', cat: 'Video consultations', cost: 21 },
      { name: 'JotForm', cat: 'Digital intake forms', cost: 27 },
    ],
    mentalpath: 49,
    bonus: [
      { icon: '🌿', name: 'CONO-standard SOAP templates', note: 'Pre-built to College of Naturopaths of Ontario standards' },
      { icon: '🤖', name: 'AI SOAP note drafting', note: 'Full S/O/A/P in seconds from your dictation or typed summary' },
      { icon: '📊', name: 'Outcome measures library', note: 'Track client progress with validated tools between visits' },
      { icon: '🏥', name: 'Extended health receipts', note: 'Generate Blue Cross, Sun Life, Manulife receipts in 30 seconds' },
      { icon: '🔒', name: 'Canadian servers (PHIPA)', note: 'Jane App and Zoom are partially on US servers. We\'re fully ca-central-1.' },
      { icon: '🫀', name: 'Practitioner wellbeing check-in', note: 'No other ND platform includes this. Yours now does.' },
    ],
  },
};

const PROF_OPTIONS: { key: ProfKey; label: string; icon: string }[] = [
  { key: 'chiropractor', label: 'Chiropractor', icon: '🦴' },
  { key: 'physiotherapist', label: 'Physiotherapist', icon: '⚡' },
  { key: 'rmt', label: 'RMT', icon: '💆' },
  { key: 'psychotherapist', label: 'Psychotherapist', icon: '🧠' },
  { key: 'occupational', label: 'OT', icon: '🔧' },
  { key: 'naturopath', label: 'Naturopath', icon: '🌿' },
];

function profFromUserProfession(profession: string): ProfKey {
  if (profession.includes('Chiropractor')) return 'chiropractor';
  if (profession.includes('Physiotherapist')) return 'physiotherapist';
  if (profession.includes('Massage')) return 'rmt';
  if (profession.includes('Naturopath')) return 'naturopath';
  if (profession.includes('Occupational')) return 'occupational';
  return 'psychotherapist';
}

export function CostSavings() {
  const { user } = useUser();
  const defaultProf = user ? profFromUserProfession(user.profession) : 'psychotherapist';
  const [activeProf, setActiveProf] = useState<ProfKey>(defaultProf);

  const data = DATA[activeProf];
  const oldTotal = data.tools.reduce((s, t) => s + t.cost, 0);
  const saving = oldTotal - data.mentalpath;
  const annualSaving = saving * 12;

  return (
    <div className="max-w-[860px] mx-auto px-5 py-10 pb-20">
      <div className="text-[11px] font-medium tracking-[1.5px] uppercase text-[var(--sage)] mb-3">
        Built for Canadian regulated health professionals
      </div>
      <h1 className="font-[var(--font-display)] text-[clamp(28px,5vw,44px)] text-[var(--ink)] leading-[1.1] mb-3">
        One subscription.<br /><em className="italic text-[var(--sage-deep)]">Everything</em> you need.
      </h1>
      <p className="text-[15px] text-[var(--ink-muted)] leading-[1.65] mb-9 max-w-[540px]">
        See exactly what MentalPath replaces, what it saves you, and what you get that your current stack doesn't even offer — for every regulated health profession in Canada.
      </p>

      {/* Profession selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PROF_OPTIONS.map(p => (
          <button
            key={p.key}
            onClick={() => setActiveProf(p.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] cursor-pointer transition-all duration-150 ${
              activeProf === p.key
                ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                : 'bg-white border-[rgba(0,0,0,0.08)] text-[var(--ink-muted)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]'
            }`}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Hero savings card */}
      <div className="bg-[var(--ink)] rounded-2xl p-7 mb-6 flex items-center justify-between flex-wrap gap-5">
        <div>
          <div className="text-[10px] font-medium tracking-[1.2px] uppercase text-white/40 mb-2.5">Your monthly savings</div>
          <div className="font-[var(--font-display)] text-[52px] text-white leading-none">${saving}</div>
          <div className="text-[16px] text-white/50 mt-1">per month · <span>${annualSaving.toLocaleString()} per year</span></div>
        </div>
        <div className="flex gap-5 flex-wrap">
          <div className="text-center">
            <div className="font-[var(--font-display)] text-[28px] text-white leading-none">${oldTotal}</div>
            <div className="text-[12px] text-white/50 mt-1">Old stack / mo</div>
          </div>
          <div className="w-px h-10 bg-white/10 self-center" />
          <div className="text-center">
            <div className="font-[var(--font-display)] text-[28px] text-white leading-none">${data.mentalpath}</div>
            <div className="text-[12px] text-white/50 mt-1">MentalPath / mo</div>
          </div>
          <div className="w-px h-10 bg-white/10 self-center" />
          <div className="text-center">
            <div className="font-[var(--font-display)] text-[28px] text-white leading-none">{data.tools.length}</div>
            <div className="text-[12px] text-white/50 mt-1">Tools replaced</div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden mb-5">
        <div className="grid gap-2.5 px-[18px] py-[11px] bg-[var(--warm)] text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)]" style={{ gridTemplateColumns: '1fr 100px 80px 80px' }}>
          <div>What you're replacing</div>
          <div className="text-right">Monthly cost</div>
          <div className="text-center">Replaced</div>
          <div />
        </div>

        {data.tools.map((tool, i) => (
          <div
            key={i}
            className="grid gap-2.5 px-[18px] py-[14px] border-t border-[rgba(0,0,0,0.08)] items-center hover:bg-[var(--warm)] transition-colors duration-150"
            style={{ gridTemplateColumns: '1fr 100px 80px 80px' }}
          >
            <div>
              <div className="text-[14px] font-medium text-[var(--ink)]">{tool.name}</div>
              <div className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--warm)] text-[var(--ink-muted)] inline-block mt-1">{tool.cat}</div>
              {tool.note && <div className="text-[11px] text-[var(--ink-muted)] mt-1">{tool.note}</div>}
            </div>
            <div className="text-[14px] font-medium text-right">${tool.cost}/mo</div>
            <div className="flex justify-center">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--sage)' }}>
                <svg viewBox="0 0 12 10" className="w-2.5 h-2.5 fill-none stroke-white stroke-[2.5]">
                  <path d="M1 5l3.5 3.5L11 1" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div />
          </div>
        ))}

        {/* Old total */}
        <div className="grid gap-2.5 px-[18px] py-[14px] bg-[var(--warm)] border-t border-[rgba(0,0,0,0.13)] items-center" style={{ gridTemplateColumns: '1fr 100px 80px 80px' }}>
          <div className="text-[14px] font-medium text-[var(--ink)]">Old stack total</div>
          <div className="font-[var(--font-display)] text-[22px] text-right text-[#c0392b] line-through">${oldTotal}/mo</div>
          <div /><div />
        </div>

        {/* MentalPath row */}
        <div className="grid gap-2.5 px-[18px] py-[14px] border-t border-[rgba(0,0,0,0.08)] items-center" style={{ gridTemplateColumns: '1fr 100px 80px 80px', background: 'var(--sage-pale)' }}>
          <div className="text-[14px] font-medium text-[var(--sage-deep)]">MentalPath (all-in)</div>
          <div className="font-[var(--font-display)] text-[22px] text-right text-[var(--sage-deep)]">${data.mentalpath}/mo</div>
          <div /><div />
        </div>
      </div>

      {/* Bonus section */}
      <div className="rounded-[13px] p-7 mb-6" style={{ background: 'var(--sage-deep)' }}>
        <div className="font-[var(--font-display)] text-[20px] text-white mb-4">And things your old stack never had.</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.bonus.map((b, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-[9px] p-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="text-[18px] flex-shrink-0">{b.icon}</span>
              <div>
                <div className="text-[13px] font-medium text-white mb-0.5">{b.name}</div>
                <div className="text-[11px] text-white/55">{b.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border-[1.5px] border-[var(--sage-light)] rounded-[14px] p-7 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-[var(--font-display)] text-[22px] text-[var(--ink)] mb-1">Try it free for 30 days.</h3>
          <p className="text-[13px] text-[var(--ink-muted)] leading-[1.55]">
            No credit card charged today. Full access. Cancel anytime.<br />
            Set up takes less than 5 minutes — your first client can book before you finish your coffee.
          </p>
        </div>
        <div>
          <button className="px-8 py-3.5 bg-[var(--sage)] text-white rounded-[10px] text-[15px] font-medium cursor-pointer hover:bg-[var(--sage-deep)] transition-colors duration-150 whitespace-nowrap">
            Start free trial →
          </button>
          <div className="text-[12px] text-[var(--ink-muted)] mt-1.5 text-center">
            $49/month after trial · Canadian servers · PHIPA compliant
          </div>
        </div>
      </div>
    </div>
  );
}
