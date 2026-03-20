import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

type Format = 'dap' | 'soap' | 'birp' | 'progress';

const FORMAT_LABELS: Record<Format, string> = {
  dap: 'DAP — Data · Assessment · Plan',
  soap: 'SOAP — Subjective · Objective · Assessment · Plan',
  birp: 'BIRP — Behaviour · Intervention · Response · Plan',
  progress: 'Progress note',
};

type Section = {
  key: string;
  tagLabel: string;
  tagBg: string;
  tagColor: string;
  hint: string;
  placeholder: string;
  defaultValue?: string;
  hasAI?: boolean;
};

const SECTIONS: Record<Format, Section[]> = {
  dap: [
    {
      key: 'dap-data', tagLabel: 'D', tagBg: '#e8f0ed', tagColor: '#2d5049',
      hint: 'Client presentation, what was discussed, direct observations',
      placeholder: 'Client presented with... Reported that... Discussed... Affect was... Mood appeared...',
      hasAI: true,
      defaultValue: "Client presented as engaged and reflective. Reported completing the journaling exercise between sessions, noting it helped her identify and name emotions in real time — described this as a shift from 'just feeling it' to 'understanding it.' Mood was notably elevated compared to previous sessions; affect bright, appropriate, and congruent. Raised questions about workplace rights resources independently, suggesting increased self-advocacy capacity. Initiated conversation about treatment plan review without prompting.",
    },
    {
      key: 'dap-assessment', tagLabel: 'A', tagBg: '#faeeda', tagColor: '#633806',
      hint: 'Clinical interpretation, formulation, risk assessment',
      placeholder: 'Presentation consistent with... Progress toward... Clinical formulation suggests... Risk assessment...',
      hasAI: true,
      defaultValue: "Progress is consistent with resolution of acute RBTS symptoms and consolidation of treatment gains. Client demonstrates strong integration of anti-racism externalisation framework in daily life — a primary treatment goal. PHQ-9 trajectory (10→7→3) indicates clinically significant improvement. Client's unprompted self-advocacy behaviour and readiness for treatment review suggest approaching discharge readiness. No safety concerns identified. Therapeutic alliance remains strong.",
    },
    {
      key: 'dap-plan', tagLabel: 'P', tagBg: '#E6F1FB', tagColor: '#0C447C',
      hint: 'Next steps, interventions, homework, follow-up plan',
      placeholder: 'Continue... Next session will focus on... Client to... Referrals... Review date...',
      hasAI: true,
      defaultValue: "Conducted formal treatment plan 3-month review. All three treatment goals assessed as substantially met. Initiated discharge planning conversation — client receptive and expressed readiness. Discussed maintenance strategies and return-to-treatment indicators. Provide workplace rights resource (OHRC). Next session: Session 16 (likely penultimate). Offer 3-month follow-up contact post-discharge. Update treatment plan status to 'completed.'",
    },
  ],
  soap: [
    { key: 'soap-subjective', tagLabel: 'S', tagBg: '#fde8e8', tagColor: '#791F1F', hint: 'Subjective — what the client reports', placeholder: 'Client reports...', hasAI: true },
    { key: 'soap-objective', tagLabel: 'O', tagBg: '#faeeda', tagColor: '#633806', hint: 'Objective — clinician observations', placeholder: 'Client appeared... Affect was... Mood...', hasAI: true },
    { key: 'soap-assessment', tagLabel: 'A', tagBg: '#faeeda', tagColor: '#633806', hint: 'Assessment — clinical interpretation', placeholder: 'Presentation consistent with...', hasAI: true },
    { key: 'soap-plan', tagLabel: 'P', tagBg: '#E6F1FB', tagColor: '#0C447C', hint: 'Plan — next steps and interventions', placeholder: 'Continue... Next session...', hasAI: true },
  ],
  birp: [
    { key: 'birp-behaviour', tagLabel: 'B', tagBg: '#EEEDFE', tagColor: '#3C3489', hint: 'Behaviour — observable behaviours and presentation', placeholder: 'Client demonstrated...', hasAI: true },
    { key: 'birp-intervention', tagLabel: 'I', tagBg: '#fde8e8', tagColor: '#791F1F', hint: 'Intervention — what the therapist did', placeholder: 'Therapist provided...', hasAI: true },
    { key: 'birp-response', tagLabel: 'R', tagBg: '#e8f4f0', tagColor: '#2d5049', hint: 'Response — how client responded to interventions', placeholder: 'Client responded by...' },
    { key: 'birp-plan', tagLabel: 'P', tagBg: '#E6F1FB', tagColor: '#0C447C', hint: 'Plan — next steps', placeholder: 'Plan for next session...' },
  ],
  progress: [
    { key: 'progress-status', tagLabel: 'Status', tagBg: '#faeeda', tagColor: '#633806', hint: 'Current status relative to treatment goals', placeholder: 'Progress toward goals...' },
    { key: 'progress-content', tagLabel: 'Content', tagBg: '#e8f0ed', tagColor: '#2d5049', hint: 'Session content and client presentation', placeholder: 'Session focused on...' },
    { key: 'progress-assessment', tagLabel: 'Assessment', tagBg: '#faeeda', tagColor: '#633806', hint: 'Clinical formulation update', placeholder: 'Clinical assessment...' },
    { key: 'progress-next', tagLabel: 'Next steps', tagBg: '#E6F1FB', tagColor: '#0C447C', hint: 'Plan for upcoming sessions', placeholder: 'Next session will...' },
  ],
};

const AI_DRAFTS: Record<string, string> = {
  'dap-data': 'Client presented as engaged and reflective. Initiated review of treatment goals unprompted, suggesting readiness. Affect bright, mood notably elevated from previous sessions.',
  'dap-assessment': 'Progress consistent with resolution of acute RBTS symptoms. PHQ-9 trajectory indicates clinically significant improvement. Client approaching discharge readiness.',
  'dap-plan': 'Conducted 3-month treatment plan review. Initiated discharge planning conversation. Discuss maintenance strategies and return-to-treatment indicators next session.',
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function AutoTextarea({
  id, value, onChange, placeholder, readOnly,
}: { id: string; value: string; onChange: (v: string) => void; placeholder: string; readOnly?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={5}
      style={{
        width: '100%',
        padding: '4px 0 20px',
        border: 'none',
        background: 'transparent',
        fontSize: '14px',
        color: readOnly ? 'var(--ink-muted)' : 'var(--ink-soft)',
        lineHeight: '1.75',
        resize: 'none',
        outline: 'none',
        minHeight: '80px',
        fontFamily: 'inherit',
      }}
      onFocus={e => { if (!readOnly) e.target.style.color = 'var(--ink)'; }}
      onBlur={e => { if (!readOnly) e.target.style.color = 'var(--ink-soft)'; }}
    />
  );
}

export function SessionNoteEditor() {
  const navigate = useNavigate();
  const [format, setFormat] = useState<Format>('dap');
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    Object.values(SECTIONS).flat().forEach(s => { v[s.key] = s.defaultValue || ''; });
    return v;
  });
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [statusDot, setStatusDot] = useState<'saved' | 'unsaved' | 'locked'>('saved');
  const [statusText, setStatusText] = useState('Draft saved');
  const [locked, setLocked] = useState(false);
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [duration, setDuration] = useState('50 min');
  const [sessionFormat, setSessionFormat] = useState('Video');
  const [diagnosis, setDiagnosis] = useState('F43.10 PTSD');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markUnsaved = () => {
    setStatusDot('unsaved');
    setStatusText('Unsaved changes');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setStatusDot('saved');
      setStatusText('Draft saved');
    }, 2000);
  };

  const handleChange = (key: string, val: string) => {
    setValues(v => ({ ...v, [key]: val }));
    markUnsaved();
  };

  const aiAssist = (section: Section) => {
    if (!section.hasAI) return;
    setAiLoading(l => ({ ...l, [section.key]: true }));
    setTimeout(() => {
      setAiLoading(l => ({ ...l, [section.key]: false }));
      if (!values[section.key]?.trim()) {
        const draft = AI_DRAFTS[section.key] || 'AI draft would appear here in production, calling the ai-note-assist edge function with PII stripped.';
        setValues(v => ({ ...v, [section.key]: draft }));
        markUnsaved();
      }
    }, 1400);
  };

  const saveDraft = () => {
    setStatusDot('saved');
    setStatusText('Draft saved');
  };

  const lockNote = () => {
    setShowLockWarning(true);
    setTimeout(() => {
      if (window.confirm('Lock and finalise this note? It cannot be edited after locking.')) {
        setLocked(true);
        setStatusDot('locked');
        setStatusText('Locked · ' + new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }));
      }
    }, 200);
  };

  const dotColor = statusDot === 'saved' ? 'var(--sage)' : statusDot === 'locked' ? 'var(--ink-muted)' : '#BA7517';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--warm)', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>

      {/* TOPBAR */}
      <div style={{ height: 52, background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/dashboard/clients/amara-mensah')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-muted)', cursor: 'pointer', padding: '6px 10px', borderRadius: 7, border: 'none', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--warm)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }}><path d="M15 18l-6-6 6-6"/></svg>
          Dashboard
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--sage-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: 'var(--sage-deep)' }}>AM</div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Amara Mensah</span>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}> · Session 15 · March 16, 2026</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor }} />
          <span style={{ color: 'var(--ink-muted)' }}>{statusText}</span>
        </div>
        {!locked && (
          <>
            <button
              onClick={saveDraft}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-deep)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--sage)')}
            >
              <svg viewBox="0 0 16 16" style={{ width: 13, height: 13, fill: 'none', stroke: 'white', strokeWidth: 1.5 }}><path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5l-3-3z"/><path d="M11 2v4H5V2M5 9h6"/></svg>
              Save draft
            </button>
            <button
              onClick={lockNote}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}
            >
              <svg viewBox="0 0 16 16" style={{ width: 13, height: 13, fill: 'none', stroke: 'white', strokeWidth: 2 }}><rect x="3" y="7" width="10" height="8" rx="1"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>
              Lock & finalise
            </button>
          </>
        )}
      </div>

      {/* EDITOR SHELL */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT SIDEBAR */}
        <div style={{ background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '14px 14px 6px', fontSize: 10, fontWeight: 500, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Note format</div>
          {(['dap', 'soap', 'birp', 'progress'] as Format[]).map(f => (
            <button
              key={f}
              onClick={() => !locked && setFormat(f)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px',
                border: 'none', borderLeft: `2px solid ${format === f ? 'var(--sage)' : 'transparent'}`,
                background: format === f ? 'var(--sage-pale)' : 'transparent',
                fontSize: 13, color: format === f ? 'var(--sage-deep)' : 'var(--ink-soft)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (format !== f) { e.currentTarget.style.background = 'var(--warm)'; e.currentTarget.style.color = 'var(--ink)'; } }}
              onMouseLeave={e => { if (format !== f) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)'; } }}
            >
              {f === 'dap' ? 'DAP' : f === 'soap' ? 'SOAP' : f === 'birp' ? 'BIRP' : 'Progress'}
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 3, marginLeft: 'auto',
                background: format === f ? 'var(--sage)' : 'var(--sage-pale)',
                color: format === f ? 'white' : 'var(--sage)',
              }}>
                {f === 'dap' ? 'DAP' : f === 'soap' ? 'SOAP' : f === 'birp' ? 'BIRP' : 'PROG'}
              </span>
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          <div style={{ padding: '14px 14px 6px', fontSize: 10, fontWeight: 500, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Session prep AI</div>
          <div style={{ margin: 12, background: 'var(--sage-pale)', borderRadius: 9, padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--sage)', marginBottom: 7 }}>✦ Pre-session brief</div>
            {[
              { label: 'Where we left off', text: 'Explored workplace microaggression incident using anti-racism framework. Strong externalisation. Cautiously hopeful tone.' },
              { label: 'Watch for', text: 'Treatment plan 3-month review due today. PHQ-9 now 3 (minimal). Watch for premature closure impulse.' },
              { label: 'Suggested focus', text: 'Formal treatment plan review. Celebrate progress. Begin discharge planning discussion if criteria met.' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 8 : 0 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--sage-deep)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--sage-deep)', lineHeight: 1.55 }}>{s.text}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          <div style={{ padding: '14px 14px 6px', fontSize: 10, fontWeight: 500, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Session details</div>
          <div style={{ padding: '0 14px 12px' }}>
            {[
              { label: 'Date', value: 'Mar 16, 2026', static: true },
              { label: 'Duration', value: duration, options: ['50 min', '25 min', '80 min'], onChange: setDuration },
              { label: 'Format', value: sessionFormat, options: ['Video', 'In-person', 'Phone'], onChange: setSessionFormat },
              { label: 'Session #', value: '15', static: true },
              { label: 'Presenting Dx', value: diagnosis, options: ['F43.10 PTSD', 'F41.1 GAD', 'F32.1 MDD'], onChange: setDiagnosis },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <span style={{ color: 'var(--ink-muted)' }}>{row.label}</span>
                {row.static ? (
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{row.value}</span>
                ) : (
                  <select
                    value={row.value}
                    onChange={e => row.onChange?.(e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: 12, color: 'var(--ink)', fontWeight: 500, cursor: 'pointer', padding: 0, outline: 'none' }}
                  >
                    {row.options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN EDITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 24 }}>
              {FORMAT_LABELS[format]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {SECTIONS[format].map((section, i, arr) => (
                <div key={section.key} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0 10px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 4, flexShrink: 0, background: section.tagBg, color: section.tagColor }}>
                      {section.tagLabel}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.4, flex: 1 }}>{section.hint}</span>
                    {section.hasAI && !locked && (
                      <button
                        onClick={() => aiAssist(section)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid rgba(74,124,111,0.25)', borderRadius: 6, background: 'var(--sage-pale)', color: 'var(--sage-deep)', fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--sage-pale)'; e.currentTarget.style.color = 'var(--sage-deep)'; }}
                      >
                        {aiLoading[section.key] ? (
                          <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>
                        ) : (
                          <svg viewBox="0 0 16 16" style={{ width: 11, height: 11, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                        )}
                        {aiLoading[section.key] ? 'Drafting...' : 'AI assist'}
                      </button>
                    )}
                  </div>
                  {aiLoading[section.key] && (
                    <div style={{ background: 'var(--sage-pale)', borderRadius: 8, padding: '10px 13px', marginBottom: 8, fontSize: 12, color: 'var(--sage-deep)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: 'var(--sage)', strokeWidth: 1.5, flexShrink: 0, animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>
                      Drafting from session context and last 3 notes...
                    </div>
                  )}
                  <AutoTextarea
                    id={section.key}
                    value={values[section.key] || ''}
                    onChange={val => handleChange(section.key, val)}
                    placeholder={section.placeholder}
                    readOnly={locked}
                  />
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', textAlign: 'right', paddingBottom: 8 }}>
                    {countWords(values[section.key] || '')} word{countWords(values[section.key] || '') !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ background: 'white', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Amara Mensah
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--ink-muted)' }}>Session 15</span>
          </div>

          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>Outcome scores</div>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            {[
              { label: 'PHQ-9', val: '3', max: '27', trend: '↓ from 10', up: true },
              { label: 'GAD-7', val: '4', max: '21', trend: '↓ from 8', up: true },
              { label: 'Wellbeing (portal)', val: '7', max: '10', trend: '↑ +2', up: true },
            ].map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-muted)' }}>{r.label}</span>
                <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.val} <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>/ {r.max}</span></span>
                <span style={{ fontSize: 10, color: r.up ? 'var(--sage)' : '#c0392b' }}>{r.trend}</span>
              </div>
            ))}
            <button
              style={{ width: '100%', padding: 8, border: '1.5px dashed var(--sage-light)', borderRadius: 8, background: 'transparent', color: 'var(--sage)', fontSize: 12, fontWeight: 500, cursor: 'pointer', marginTop: 4 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-pale)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              + Assign PHQ-9 for today
            </button>
          </div>

          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>Treatment goals</div>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            {[
              { text: 'Develop grounding techniques for acute stress responses', pct: 100, note: '✓ Met — session 8' },
              { text: 'Externalise systemic nature of racism, reduce self-blame', pct: 90, note: '90% · Substantially met' },
              { text: 'Rebuild professional identity integrating cultural heritage', pct: 80, note: '80% · Strong progress' },
            ].map((g, i, arr) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 5 }}>{g.text}</div>
                <div style={{ height: 3, background: 'var(--warm)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.pct}%`, borderRadius: 2, background: 'var(--sage)' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 3 }}>{g.note}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>Previous notes</div>
          <div style={{ padding: '12px 14px' }}>
            {[
              { date: 'Session 14 · Mar 10, 2026 · DAP', text: 'Client explored workplace microaggression incident from the previous week using anti-racism framework. Demonstrated strong externalisation skills and showed reduced self-blame...' },
              { date: 'Session 13 · Mar 3, 2026 · DAP', text: 'Session focused on somatic responses to hypervigilance at work. Introduced body scan technique. Client receptive. Practiced in-session grounding...' },
              { date: 'Session 12 · Feb 24, 2026 · DAP', text: 'Explored family-of-origin patterns and their intersection with current workplace dynamics. Cultural genogram exercise initiated...' },
            ].map((n, i) => (
              <div
                key={i}
                style={{ background: 'var(--warm)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-pale)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--warm)')}
              >
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)', marginBottom: 4 }}>{n.date}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.text}</div>
              </div>
            ))}
          </div>

          {showLockWarning && (
            <div style={{ background: '#faeeda', border: '1px solid rgba(186,117,23,0.3)', borderRadius: 8, padding: '10px 12px', margin: 12, fontSize: 12, color: '#633806', lineHeight: 1.5 }}>
              Once locked, this note cannot be edited. It will be retained for 10 years per PHIPA s.20. Locked notes appear in your audit log.
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
