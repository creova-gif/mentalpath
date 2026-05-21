import { useState, useMemo } from 'react';
import { Search, Plus, Check, X, Send } from 'lucide-react';

type ExCat = 'all' | 'cervical' | 'shoulder' | 'lumbar' | 'hip' | 'core';

interface Exercise {
  id: string; name: string; cat: Exclude<ExCat, 'all'>; icon: string;
  defaults: string; sets: number; reps: number; hold: number; rest: number;
  instructions: string;
}

interface AddedExercise extends Exercise {
  sets: number; reps: number; hold: number; rest: number;
}

const EXERCISES: Exercise[] = [
  { id: 'e1', name: 'Pendulum', cat: 'shoulder', icon: '⚡', defaults: '3 × 30 sec', sets: 3, reps: 1, hold: 30, rest: 30, instructions: 'Lean forward, arm hanging freely. Let arm swing in small circles. Use body weight only — no active arm movement.' },
  { id: 'e2', name: 'Scapular Retraction', cat: 'shoulder', icon: '💪', defaults: '3 × 15 reps', sets: 3, reps: 15, hold: 5, rest: 30, instructions: 'Sitting upright, squeeze shoulder blades together and slightly down. Do not shrug. Hold 5 seconds, then release.' },
  { id: 'e3', name: 'Theraband External Rotation', cat: 'shoulder', icon: '🏋️', defaults: '3 × 12 reps', sets: 3, reps: 12, hold: 2, rest: 30, instructions: 'Band at elbow height, elbow at 90°. Rotate arm outward against resistance. Keep elbow close to side. Slowly return.' },
  { id: 'e4', name: 'Doorway Chest Stretch', cat: 'shoulder', icon: '🚪', defaults: '3 × 30 sec', sets: 3, reps: 1, hold: 30, rest: 15, instructions: 'Stand in doorway, arms at 90°. Step forward until chest stretch felt. Do not lean forward at waist. Breathe and hold.' },
  { id: 'e5', name: 'Theraband Row', cat: 'shoulder', icon: '🎯', defaults: '3 × 12 reps', sets: 3, reps: 12, hold: 2, rest: 30, instructions: 'Band at chest height. Pull back, keeping elbow at 90°. Squeeze shoulder blade at end range. Slowly return.' },
  { id: 'e6', name: 'Chin Tuck', cat: 'cervical', icon: '🧠', defaults: '3 × 10 reps × 5s hold', sets: 3, reps: 10, hold: 5, rest: 10, instructions: 'Sitting tall, gently tuck chin straight back — not down. Hold. Slowly release. Keep eyes level throughout.' },
  { id: 'e7', name: 'Cervical Side Bend', cat: 'cervical', icon: '↔️', defaults: '3 × 30 sec each side', sets: 3, reps: 1, hold: 30, rest: 15, instructions: 'Tilt ear toward shoulder until light stretch felt. Breathe and hold. Return to centre. Repeat other side.' },
  { id: 'e8', name: 'Cat-Cow', cat: 'lumbar', icon: '🐱', defaults: '1 × 10 reps', sets: 1, reps: 10, hold: 3, rest: 10, instructions: 'On hands and knees. Inhale: arch back, lift head (cow). Exhale: round back, tuck chin (cat). Move slowly.' },
  { id: 'e9', name: 'Bird Dog', cat: 'core', icon: '🦅', defaults: '3 × 8 each side', sets: 3, reps: 8, hold: 5, rest: 15, instructions: 'On hands and knees. Extend opposite arm and leg. Hold. Keep hips level throughout. Slowly return and repeat.' },
  { id: 'e10', name: 'Clam Shell', cat: 'hip', icon: '🦪', defaults: '3 × 15 reps', sets: 3, reps: 15, hold: 2, rest: 20, instructions: 'Side lying, hips at 45°, knees bent. Rotate top knee up without rolling pelvis back. Slowly lower.' },
  { id: 'e11', name: 'Terminal Knee Extension', cat: 'hip', icon: '🦵', defaults: '3 × 15 reps × 3s hold', sets: 3, reps: 15, hold: 3, rest: 20, instructions: 'Band behind knee, slight bend. Press knee straight against resistance. Hold. Keep heel on ground. Slowly return.' },
  { id: 'e12', name: 'Ankle Alphabet', cat: 'lumbar', icon: '🦶', defaults: '1 set × 1 rep', sets: 1, reps: 1, hold: 0, rest: 0, instructions: 'Seated, foot elevated. Trace full alphabet with big toe. Move only ankle — keep leg still. Do both feet.' },
];

const CATS: { key: ExCat; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cervical', label: 'Cervical' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'lumbar', label: 'Lumbar' },
  { key: 'hip', label: 'Hip/Knee' },
  { key: 'core', label: 'Core' },
];

export function HEPBuilder() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<ExCat>('all');
  const [added, setAdded] = useState<AddedExercise[]>([
    { ...EXERCISES[0] },
    { ...EXERCISES[1] },
    { ...EXERCISES[2] },
  ]);
  const [frequency, setFrequency] = useState('Daily');
  const [duration, setDuration] = useState('4 weeks');
  const [portalAccess, setPortalAccess] = useState('Enabled');
  const [sent, setSent] = useState(false);

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      const matchQ = !search || ex.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCat === 'all' || ex.cat === activeCat || (activeCat === 'hip' && (ex.cat === 'hip'));
      return matchQ && matchCat;
    });
  }, [search, activeCat]);

  function addExercise(ex: Exercise) {
    if (added.some(a => a.id === ex.id)) return;
    setAdded(prev => [...prev, { ...ex }]);
  }

  function removeExercise(id: string) {
    setAdded(prev => prev.filter(a => a.id !== id));
  }

  function updateParam(id: string, param: keyof AddedExercise, value: number) {
    setAdded(prev => prev.map(a => a.id === id ? { ...a, [param]: value } : a));
  }

  function sendToPortal() {
    setSent(true);
  }

  const isAdded = (id: string) => added.some(a => a.id === id);

  return (
    <div className="-m-4 sm:-m-6 md:-m-7 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex flex-1 overflow-hidden">

        {/* EXERCISE LIBRARY PANEL */}
        <div className="w-[320px] flex-shrink-0 bg-white border-r border-[rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-[rgba(0,0,0,0.08)]">
            <div className="text-[13px] font-medium text-[var(--ink)] mb-2">Exercise library</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-[rgba(0,0,0,0.08)] rounded-lg text-[13px] bg-[var(--warm)] outline-none focus:border-[var(--sage)] focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {CATS.map(c => (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  className={`px-2.5 py-1 rounded-[5px] border text-[11px] font-medium cursor-pointer transition-all duration-150 ${
                    activeCat === c.key
                      ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                      : 'bg-white border-[rgba(0,0,0,0.08)] text-[var(--ink-muted)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map(ex => {
              const done = isAdded(ex.id);
              return (
                <div key={ex.id} className={`flex items-start gap-2.5 px-4 py-3 border-b border-[rgba(0,0,0,0.05)] cursor-pointer transition-colors duration-150 ${done ? 'bg-[#e8f4f0]' : 'hover:bg-[var(--sage-pale)]'}`}>
                  <div className="w-9 h-9 rounded-lg bg-[var(--warm)] flex items-center justify-center flex-shrink-0 text-base">{ex.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--ink)]">{ex.name}</div>
                    <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">{ex.cat}</div>
                    <div className="text-[11px] text-[var(--sage)] mt-0.5 font-medium">{ex.defaults}</div>
                  </div>
                  <button
                    onClick={() => addExercise(ex)}
                    disabled={done}
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-all duration-150 ${
                      done
                        ? 'bg-[#1D9E75] text-white cursor-default'
                        : 'bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)] hover:scale-110'
                    }`}
                  >
                    {done ? <Check className="w-3 h-3" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUILDER PANEL */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Builder header */}
          <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-5 py-3.5 flex items-center justify-between flex-wrap gap-2.5">
            <div>
              <div className="text-[14px] font-medium text-[var(--ink)]">Priya Kapoor — HEP</div>
              <div className="text-[12px] text-[var(--ink-muted)]">Rotator cuff syndrome (R) · Session 4 of 8 · Mar 16, 2026</div>
            </div>
            <div className="text-[12px] font-medium text-[var(--sage-deep)] bg-[var(--sage-pale)] px-3 py-1.5 rounded-[6px]">
              {added.length} exercise{added.length !== 1 ? 's' : ''} added
            </div>
          </div>

          {/* Builder body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Meta fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
              {[
                { label: 'Frequency', options: ['Daily', 'Twice daily', '3× per week', 'Every other day'], val: frequency, set: setFrequency },
                { label: 'Duration', options: ['4 weeks', '2 weeks', '6 weeks', '8 weeks'], val: duration, set: setDuration },
                { label: 'Review date', val: 'Apr 13, 2026', isStatic: true },
                { label: 'Portal access', options: ['Enabled', 'PDF only'], val: portalAccess, set: setPortalAccess },
              ].map((f, i) => (
                <div key={i} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-3.5 py-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] mb-1">{f.label}</div>
                  {f.isStatic ? (
                    <div className="text-[13px] font-medium text-[var(--ink)]">{f.val}</div>
                  ) : (
                    <select
                      value={f.val}
                      onChange={e => f.set && f.set(e.target.value)}
                      className="w-full border-none bg-transparent text-[13px] font-medium text-[var(--ink)] outline-none cursor-pointer"
                    >
                      {f.options?.map(o => <option key={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>

            {/* Exercise cards */}
            {added.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[40px] mb-3">💪</div>
                <div className="text-[14px] font-medium text-[var(--ink-soft)] mb-1">No exercises added yet</div>
                <div className="text-[13px] text-[var(--ink-muted)] max-w-[280px] mx-auto">Search or browse the library on the left and click + to add exercises to this program.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mb-5">
                {added.map((ex, idx) => (
                  <div key={ex.id} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-[rgba(0,0,0,0.08)]">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0" style={{ background: 'var(--sage)' }}>
                        {idx + 1}
                      </div>
                      <div className="text-[14px] font-medium text-[var(--ink)] flex-1">{ex.name}</div>
                      <button onClick={() => removeExercise(ex.id)} className="w-[22px] h-[22px] rounded-full border-none flex items-center justify-center cursor-pointer text-[var(--ink-muted)] transition-all duration-150 hover:bg-[#fde8e8] hover:text-[#791F1F]" style={{ background: 'rgba(0,0,0,0.06)' }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-5 border-b border-[rgba(0,0,0,0.05)]" style={{ gridTemplateColumns: 'repeat(4, 1fr) 2fr' }}>
                      {[
                        { label: 'Sets', param: 'sets' as const, unit: 'sets', max: 10 },
                        { label: 'Reps', param: 'reps' as const, unit: 'reps', max: 30 },
                        { label: 'Hold', param: 'hold' as const, unit: 'seconds', max: 120 },
                        { label: 'Rest', param: 'rest' as const, unit: 'seconds', max: 120 },
                      ].map(p => (
                        <div key={p.param} className="px-3.5 py-2.5 border-r border-[rgba(0,0,0,0.05)]">
                          <div className="text-[10px] font-medium uppercase tracking-[0.4px] text-[var(--ink-muted)] mb-1">{p.label}</div>
                          <input
                            type="number"
                            value={(ex as unknown as Record<string, unknown>)[p.param] as number}
                            onChange={e => updateParam(ex.id, p.param, Number(e.target.value))}
                            min={0} max={p.max}
                            className="w-[60px] border border-[rgba(0,0,0,0.08)] rounded-[6px] px-2 py-1 text-[14px] font-medium text-[var(--ink)] outline-none bg-[var(--warm)] focus:border-[var(--sage)] focus:bg-white"
                          />
                          <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">{p.unit}</div>
                        </div>
                      ))}
                      <div className="px-3.5 py-2.5 bg-[var(--warm)]">
                        <div className="text-[10px] font-medium uppercase tracking-[0.4px] text-[var(--ink-muted)] mb-1">Instructions</div>
                        <div className="text-[12px] text-[var(--ink-soft)] leading-[1.5]">{ex.instructions}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Portal preview */}
            {added.length > 0 && (
              <div className="bg-[var(--sage-pale)] border border-[rgba(74,124,111,0.2)] rounded-[11px] px-4 py-3.5">
                <div className="text-[12px] font-medium text-[var(--sage-deep)] mb-1">📱 How your client sees this</div>
                <div className="text-[12px] text-[var(--sage-deep)] leading-[1.5] opacity-80">
                  This HEP will appear in Priya's client portal with step-by-step instructions. She'll receive a notification when it's issued. You can track whether she's viewed it. You can update exercises between sessions without re-issuing — she sees changes automatically.
                </div>
              </div>
            )}
          </div>

          {/* Bottom action bar */}
          <div className="bg-white border-t border-[rgba(0,0,0,0.08)] px-5 py-3.5 flex items-center gap-2.5">
            <div className="flex-1 text-[13px] text-[var(--ink-muted)]">
              {sent ? (
                <span className="text-[var(--sage-deep)] font-medium">✓ HEP issued · Priya will see this in her client portal and receive a notification.</span>
              ) : added.length === 0 ? (
                <span><strong className="text-[var(--ink)] font-medium">No exercises added</strong> — add exercises from the library to build the program</span>
              ) : (
                <span><strong className="text-[var(--ink)] font-medium">{added.length} exercises</strong> · {frequency} · {duration} · Will appear in Priya's portal immediately</span>
              )}
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-[rgba(0,0,0,0.13)] rounded-lg bg-white text-[13px] font-medium text-[var(--ink-soft)] cursor-pointer">
              Save draft
            </button>
            <button
              onClick={sendToPortal}
              disabled={added.length === 0 || sent}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 ${
                sent
                  ? 'bg-[#1D9E75] text-white'
                  : added.length === 0
                  ? 'bg-[var(--sage)] text-white opacity-40 cursor-not-allowed'
                  : 'bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {sent ? "✓ Sent to Priya's portal" : 'Send to portal →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
