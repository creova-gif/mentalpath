import { useState } from 'react';
import { Lock } from 'lucide-react';

type View = 'checkin' | 'history';

const vtItems = [
  { key: 'intrusive', name: 'Intrusive thoughts', desc: 'Unwanted client material appearing in your personal thoughts or dreams' },
  { key: 'dread', name: 'Session dread', desc: 'Dreading a specific client or session this week' },
  { key: 'sleep', name: 'Sleep disruption', desc: 'Sleep disturbed by work-related thoughts or client material' },
  { key: 'detachment', name: 'Emotional detachment', desc: 'Feeling emotionally flat or disconnected during sessions' },
  { key: 'cynicism', name: 'Cynicism / hopelessness', desc: 'Doubting whether therapy is making any difference' },
];

const selfCareItems = [
  'Supervision this week',
  'Intentional breaks between sessions',
  'Personal therapy',
  'Exercise / movement',
  'Social connection outside work',
  'Time fully away from work',
];

const historyEntries = [
  {
    week: 'Week of March 9, 2026',
    energy: 5, load: 8, satisfaction: 6, boundary: 5,
    flags: ['Sleep disruption', 'Session dread'],
    reflection: 'The Marcus session on Tuesday stayed with me all week. I kept replaying the disclosure. Made an appointment with my supervisor.',
  },
  {
    week: 'Week of March 2, 2026',
    energy: 7, load: 6, satisfaction: 8, boundary: 7,
    flags: [],
    reflection: 'Better week. The CPD workshop on Thursday helped me reset.',
  },
  {
    week: 'Week of February 23, 2026',
    energy: 4, load: 9, satisfaction: 5, boundary: 3,
    flags: ['Intrusive thoughts', 'Sleep disruption', 'Emotional detachment'],
    reflection: '',
  },
];

function SliderBlock({
  name, desc, value, onChange, leftLabel, rightLabel, color,
}: {
  name: string; desc: string; value: number; onChange: (v: number) => void;
  leftLabel: string; rightLabel: string; color: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-1.5">
        <div>
          <div className="text-[14px] font-medium text-[var(--ink)]">{name}</div>
          <div className="text-[12px] text-[var(--ink-muted)] mt-0.5">{desc}</div>
        </div>
        <div className="font-[var(--font-display)] text-[24px] ml-4 flex-shrink-0" style={{ color }}>{value}</div>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1 rounded-sm cursor-pointer appearance-none outline-none"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${(value - 1) / 9 * 100}%, var(--warm-mid, #ede9e0) ${(value - 1) / 9 * 100}%, var(--warm-mid, #ede9e0) 100%)`,
        }}
      />
      <div className="flex justify-between mt-1 text-[11px] text-[var(--ink-muted)]">
        <span>1 — {leftLabel}</span><span>10 — {rightLabel}</span>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[var(--sage)]' : 'bg-[rgba(0,0,0,0.13)]'}`}
    >
      <span
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-all ${checked ? 'left-[22px]' : 'left-[3px]'}`}
      />
    </button>
  );
}

export function TherapistWellbeing() {
  const [view, setView] = useState<View>('checkin');
  const [energy, setEnergy] = useState(6);
  const [load, setLoad] = useState(7);
  const [satisfaction, setSatisfaction] = useState(7);
  const [boundary, setBoundary] = useState(7);
  const [vtFlags, setVtFlags] = useState<Record<string, boolean>>({
    intrusive: false, dread: false, sleep: true, detachment: false, cynicism: false,
  });
  const [selfCare, setSelfCare] = useState<Record<string, boolean>>({});
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openHistory, setOpenHistory] = useState<number | null>(null);

  const activeFlags = Object.values(vtFlags).filter(Boolean).length;

  function toggleVt(key: string) {
    setVtFlags({ ...vtFlags, [key]: !vtFlags[key] });
  }

  function toggleSelfCare(item: string) {
    setSelfCare({ ...selfCare, [item]: !selfCare[item] });
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  const vtMeterColor = activeFlags >= 4 ? '#c0392b' : activeFlags >= 2 ? '#BA7517' : '#1D9E75';
  const vtMeterText = activeFlags >= 4
    ? 'Several indicators active. This is a pattern worth bringing to supervision.'
    : activeFlags >= 2
    ? 'A couple of things active this week. Worth noticing.'
    : activeFlags === 0
    ? 'No vicarious trauma indicators active. Good week on this dimension.'
    : 'One indicator active. Keep an eye on it.';

  return (
    <div>
      {/* Nav tabs */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[var(--font-display)] text-[22px] text-[var(--ink)]">Your wellbeing</h1>
          <p className="text-[13px] text-[var(--ink-muted)] mt-0.5 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Private to you only · Never audited · Never exported
          </p>
        </div>
        <div className="flex bg-white border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
          {([['checkin', 'This week'], ['history', 'History']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`px-4 py-2 text-[13px] font-medium transition-colors ${view === id ? 'bg-[var(--sage)] text-white' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CHECK-IN VIEW */}
      {view === 'checkin' && (
        <div className="max-w-[660px]">
          <div className="text-[11px] font-medium uppercase tracking-[0.8px] text-[var(--ink-muted)] mb-1.5">Week of March 16, 2026</div>
          <div className="font-[var(--font-display)] text-[28px] text-[var(--ink)] leading-[1.15] mb-2">How are you doing<br />this week?</div>
          <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed mb-2">
            A private check-in, just for you. Nothing here is visible to clients, shared with anyone, or part of your clinical record.
          </p>
          <div className="inline-flex items-center gap-1.5 bg-white border border-[rgba(0,0,0,0.07)] rounded-full px-3 py-1.5 text-[11px] font-medium text-[var(--ink-muted)] mb-8">
            <Lock className="w-3 h-3 text-[var(--sage)]" />
            Private to you only · Never audited · Never exported
          </div>

          {/* Sliders */}
          <div className="mb-6">
            <div className="text-[10px] font-medium uppercase tracking-[0.8px] text-[var(--ink-muted)] pb-3 border-b border-[rgba(0,0,0,0.07)] mb-5">This week in numbers</div>
            <SliderBlock name="Energy" desc="How resourced did you feel going into sessions?" value={energy} onChange={setEnergy} leftLabel="depleted" rightLabel="energised" color="#4a7c6f" />
            <SliderBlock name="Emotional load" desc="How heavy did the work feel?" value={load} onChange={setLoad} leftLabel="light" rightLabel="very heavy" color="#BA7517" />
            <SliderBlock name="Satisfaction" desc="How meaningful did the work feel?" value={satisfaction} onChange={setSatisfaction} leftLabel="going through motions" rightLabel="deeply purposeful" color="#4a7c6f" />
            <SliderBlock name="Boundary clarity" desc="How well did work stay at work?" value={boundary} onChange={setBoundary} leftLabel="work followed me everywhere" rightLabel="clean separation" color="#4a7c6f" />
          </div>

          {/* VT Indicators */}
          <div className="mb-6">
            <div className="text-[10px] font-medium uppercase tracking-[0.8px] text-[var(--ink-muted)] pb-3 border-b border-[rgba(0,0,0,0.07)] mb-4">Vicarious trauma indicators</div>

            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl px-4 py-3 mb-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] mb-2">VT load this week</div>
              <div className="flex gap-1.5 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-colors"
                    style={{ background: i < activeFlags ? vtMeterColor : 'var(--warm-mid, #ede9e0)' }}
                  />
                ))}
              </div>
              <div className="text-[12px] text-[var(--ink-muted)]">{vtMeterText}</div>
            </div>

            <div className="divide-y divide-[rgba(0,0,0,0.06)]">
              {vtItems.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-5 py-3.5">
                  <div>
                    <div className="text-[14px] font-medium text-[var(--ink)] mb-0.5">{item.name}</div>
                    <div className="text-[12px] text-[var(--ink-muted)] leading-[1.45]">{item.desc}</div>
                  </div>
                  <Toggle checked={vtFlags[item.key]} onChange={() => toggleVt(item.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Self-care */}
          <div className="mb-6">
            <div className="text-[10px] font-medium uppercase tracking-[0.8px] text-[var(--ink-muted)] pb-3 border-b border-[rgba(0,0,0,0.07)] mb-4">Self-care this week</div>
            <div className="grid grid-cols-2 gap-2">
              {selfCareItems.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleSelfCare(item)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left transition-all ${
                    selfCare[item]
                      ? 'bg-[var(--sage-pale)] border-[var(--sage)]'
                      : 'bg-white border-[rgba(0,0,0,0.08)] hover:border-[var(--sage-light)]'
                  }`}
                >
                  <div className={`w-[18px] h-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                    selfCare[item] ? 'bg-[var(--sage)] border-[var(--sage)]' : 'bg-white border-[rgba(0,0,0,0.18)]'
                  }`}>
                    {selfCare[item] && (
                      <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[13px] font-medium ${selfCare[item] ? 'text-[var(--sage-deep)]' : 'text-[var(--ink-soft)]'}`}>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <div className="text-[10px] font-medium uppercase tracking-[0.8px] text-[var(--ink-muted)] pb-3 border-b border-[rgba(0,0,0,0.07)] mb-4">Private reflection</div>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Anything sitting with you this week? This is yours alone — no one reads it, no one can access it."
              className="w-full min-h-[110px] px-4 py-3.5 border border-[rgba(0,0,0,0.08)] rounded-xl bg-white text-[14px] text-[var(--ink-soft)] leading-[1.7] resize-none outline-none transition-colors focus:border-[var(--sage)]"
            />
            <p className="text-[11px] text-[var(--ink-muted)] mt-1.5 italic leading-[1.5]">
              This is never read by anyone at MentalPath. No share button. No export. No audit entry.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-[var(--sage)] text-white rounded-xl text-[15px] font-medium hover:bg-[var(--sage-deep)] transition-colors mb-6"
          >
            {submitted ? 'Check-in saved ✓' : 'Save this week\'s check-in'}
          </button>

          {/* AI response */}
          {submitted && (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[13px] overflow-hidden">
              <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.7px] text-[var(--ink-muted)]">
                <span>A reflection back</span>
                <span className="text-[11px] bg-[var(--sage-pale)] text-[var(--sage-deep)] px-2 py-0.5 rounded font-medium normal-case tracking-normal">Private · AI generated</span>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--sage)] mb-1.5">What this week held</div>
                  <p className="text-[14px] text-[var(--ink-soft)] leading-[1.75] italic">
                    "Energy at {energy}, load at {load} — you were carrying more than you had available this week. That gap between what the work asked and what you had is worth noticing."
                  </p>
                </div>
                {activeFlags > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--sage)] mb-1.5">One thing noticed</div>
                    <p className="text-[14px] text-[var(--ink-soft)] leading-[1.75] italic">
                      "{activeFlags >= 3
                        ? 'Several vicarious trauma indicators are active. This is the kind of week that genuinely calls for supervision, not just rest.'
                        : 'Sleep being disrupted by work thoughts isn\'t just fatigue — it\'s a sign that something landed somewhere deeper than usual, and that\'s worth paying attention to.'}"
                    </p>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--sage)] mb-1.5">One possibility</div>
                  <p className="text-[14px] text-[var(--ink-soft)] leading-[1.75] italic">
                    "Before your first session Monday, five minutes of deliberate transition. Not email. Not prep. Just a conscious boundary between you and the first client."
                  </p>
                </div>

                <div className="flex items-center gap-2.5 bg-[var(--warm)] rounded-lg px-4 py-3 mt-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < activeFlags ? vtMeterColor : 'var(--warm-mid, #ede9e0)' }} />
                    ))}
                  </div>
                  <span className="text-[12px] text-[var(--ink-muted)]">VT load: {activeFlags} of 5 indicators active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <div className="max-w-[680px]">
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { n: '8', l: 'Check-ins completed' },
              { n: '6.4', l: 'Avg energy score' },
              { n: '7.1', l: 'Avg load score' },
              { n: '2', l: 'High-flag weeks' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-3.5">
                <div className="font-[var(--font-display)] text-[22px] text-[var(--ink)]">{s.n}</div>
                <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 leading-snug">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Trend chart (simplified visual) */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-4 mb-5">
            <div className="text-[13px] font-medium text-[var(--ink)] mb-3">Energy vs. emotional load — past 8 weeks</div>
            <div className="flex items-end gap-1.5 h-[70px]">
              {[
                { e: 5, l: 8 }, { e: 7, l: 6 }, { e: 4, l: 9 }, { e: 6, l: 7 },
                { e: 8, l: 5 }, { e: 6, l: 6 }, { e: 5, l: 8 }, { e: 6, l: 7 },
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end" style={{ height: 60 }}>
                    <div className="flex-1 bg-[#e8f0ed] rounded-sm" style={{ height: `${d.e / 10 * 60}px` }} />
                    <div className="flex-1 bg-[#faeeda] rounded-sm" style={{ height: `${d.l / 10 * 60}px` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2.5">
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink-muted)]">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#e8f0ed]" /> Energy
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink-muted)]">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#faeeda]" /> Emotional load
              </div>
            </div>
          </div>

          {/* History entries */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-medium uppercase tracking-[0.8px] text-[var(--ink-muted)] mb-3">Previous check-ins</div>
            {historyEntries.map((entry, i) => (
              <div
                key={i}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-4 cursor-pointer hover:border-[var(--sage-light)] transition-colors"
                onClick={() => setOpenHistory(openHistory === i ? null : i)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-medium text-[var(--ink)]">{entry.week}</div>
                  <div className="flex gap-3 text-[12px] text-[var(--ink-muted)]">
                    <span>Energy <strong className="text-[var(--ink)]">{entry.energy}</strong></span>
                    <span>Load <strong className="text-[var(--ink)]">{entry.load}</strong></span>
                    <span>Satisfaction <strong className="text-[var(--ink)]">{entry.satisfaction}</strong></span>
                  </div>
                </div>
                {entry.flags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-1">
                    {entry.flags.map((f, j) => (
                      <span key={j} className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#fde8e8] text-[#791F1F]">{f}</span>
                    ))}
                  </div>
                )}
                {openHistory === i && entry.reflection && (
                  <div className="text-[13px] text-[var(--ink-muted)] leading-[1.6] mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)]">
                    {entry.reflection}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: var(--sage);
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        input[type=range] { -webkit-appearance: none; appearance: none; }
        :root { --warm-mid: #ede9e0; }
      `}</style>
    </div>
  );
}
