import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

type Format = 'dap' | 'soap' | 'birp' | 'progress';

const FORMAT_LABELS: Record<Format, string> = {
  dap: 'DAP — Data · Assessment · Plan',
  soap: 'SOAP — Subjective · Objective · Assessment · Plan',
  birp: 'BIRP — Behaviour · Intervention · Response · Plan',
  progress: 'Progress note',
};

type NoteSection = {
  key: string;
  tagLabel: string;
  tagClass: string;
  hint: string;
  placeholder: string;
  defaultValue?: string;
  aiKey?: string;
};

const FORMAT_SECTIONS: Record<Format, NoteSection[]> = {
  dap: [
    { key: 'dap-data', tagLabel: 'D', tagClass: 'bg-[#e8f0ed] text-[var(--sage-deep)]', hint: 'Client presentation, what was discussed, direct observations', placeholder: 'Client presented with... Reported that... Discussed... Affect was... Mood appeared...', aiKey: 'dap-data', defaultValue: "Client presented as engaged and reflective. Reported completing the journaling exercise between sessions, noting it helped her identify and name emotions in real time — described this as a shift from 'just feeling it' to 'understanding it.' Mood was notably elevated compared to previous sessions; affect bright, appropriate, and congruent. Raised questions about workplace rights resources independently, suggesting increased self-advocacy capacity. Initiated conversation about treatment plan review without prompting." },
    { key: 'dap-assessment', tagLabel: 'A', tagClass: 'bg-[#faeeda] text-[#633806]', hint: 'Clinical interpretation, formulation, risk assessment', placeholder: 'Presentation consistent with... Progress toward... Clinical formulation suggests... Risk assessment...', aiKey: 'dap-assessment', defaultValue: 'Progress is consistent with resolution of acute RBTS symptoms and consolidation of treatment gains. Client demonstrates strong integration of anti-racism externalisation framework in daily life — a primary treatment goal. PHQ-9 trajectory (10→7→3) indicates clinically significant improvement. Client\'s unprompted self-advocacy behaviour and readiness for treatment review suggest approaching discharge readiness. No safety concerns identified. Therapeutic alliance remains strong.' },
    { key: 'dap-plan', tagLabel: 'P', tagClass: 'bg-[#E6F1FB] text-[#0C447C]', hint: 'Next steps, interventions, homework, follow-up plan', placeholder: 'Continue... Next session will focus on... Client to... Referrals... Review date...', aiKey: 'dap-plan', defaultValue: "Conducted formal treatment plan 3-month review. All three treatment goals assessed as substantially met. Initiated discharge planning conversation — client receptive and expressed readiness. Discussed maintenance strategies and return-to-treatment indicators. Provide workplace rights resource (OHRC). Next session: Session 16 (likely penultimate). Offer 3-month follow-up contact post-discharge. Update treatment plan status to 'completed.'" },
  ],
  soap: [
    { key: 'soap-subjective', tagLabel: 'S', tagClass: 'bg-[#fde8e8] text-[#791F1F]', hint: 'Subjective — what the client reports', placeholder: 'Client reports...' },
    { key: 'soap-objective', tagLabel: 'O', tagClass: 'bg-[#faeeda] text-[#633806]', hint: 'Objective — clinician observations', placeholder: 'Client appeared... Affect was... Mood...' },
    { key: 'soap-assessment', tagLabel: 'A', tagClass: 'bg-[#faeeda] text-[#633806]', hint: 'Assessment — clinical interpretation', placeholder: 'Presentation consistent with...' },
    { key: 'soap-plan', tagLabel: 'P', tagClass: 'bg-[#E6F1FB] text-[#0C447C]', hint: 'Plan — next steps and interventions', placeholder: 'Continue... Next session...' },
  ],
  birp: [
    { key: 'birp-behaviour', tagLabel: 'B', tagClass: 'bg-[#EEEDFE] text-[#3C3489]', hint: 'Behaviour — observable behaviours and presentation', placeholder: 'Client demonstrated...' },
    { key: 'birp-intervention', tagLabel: 'I', tagClass: 'bg-[#fde8e8] text-[#791F1F]', hint: 'Intervention — what the therapist did', placeholder: 'Therapist provided...' },
    { key: 'birp-response', tagLabel: 'R', tagClass: 'bg-[#e8f4f0] text-[var(--sage-deep)]', hint: 'Response — how client responded to interventions', placeholder: 'Client responded by...' },
    { key: 'birp-plan', tagLabel: 'P', tagClass: 'bg-[#E6F1FB] text-[#0C447C]', hint: 'Plan — next steps', placeholder: 'Plan for next session...' },
  ],
  progress: [
    { key: 'progress-status', tagLabel: 'Status', tagClass: 'bg-[#faeeda] text-[#633806]', hint: 'Current status relative to treatment goals', placeholder: 'Progress toward goals...' },
    { key: 'progress-content', tagLabel: 'Content', tagClass: 'bg-[#e8f0ed] text-[var(--sage-deep)]', hint: 'Session content and client presentation', placeholder: 'Session focused on...' },
    { key: 'progress-assessment', tagLabel: 'Assessment', tagClass: 'bg-[#faeeda] text-[#633806]', hint: 'Clinical formulation update', placeholder: 'Clinical assessment...' },
    { key: 'progress-next', tagLabel: 'Next steps', tagClass: 'bg-[#E6F1FB] text-[#0C447C]', hint: 'Plan for upcoming sessions', placeholder: 'Next session will...' },
  ],
};

const AI_DRAFTS: Record<string, string> = {
  'dap-data': 'Client presented as engaged and reflective. Initiated review of treatment goals unprompted, suggesting readiness. Affect bright, mood notably elevated from previous sessions.',
  'dap-assessment': 'Progress consistent with resolution of acute RBTS symptoms. PHQ-9 trajectory indicates clinically significant improvement. Client approaching discharge readiness.',
  'dap-plan': 'Conducted 3-month treatment plan review. Initiated discharge planning conversation. Discuss maintenance strategies and return-to-treatment indicators next session.',
};

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(w => w).length;
}

type NoteValues = Record<string, string>;

export function SessionNoteEditor() {
  const navigate = useNavigate();
  const [format, setFormat] = useState<Format>('dap');
  const [values, setValues] = useState<NoteValues>(() => {
    const v: NoteValues = {};
    Object.values(FORMAT_SECTIONS).flat().forEach(s => { v[s.key] = s.defaultValue || ''; });
    return v;
  });
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'saved' | 'unsaved' | 'locked'>('saved');
  const [locked, setLocked] = useState(false);
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [duration, setDuration] = useState('50 min');
  const [sessionFormat, setSessionFormat] = useState('Video');
  const [diagnosis, setDiagnosis] = useState('F43.10 PTSD');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markUnsaved = useCallback(() => {
    setStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setStatus('saved'), 2000);
  }, []);

  const handleChange = (key: string, val: string) => {
    setValues(v => ({ ...v, [key]: val }));
    markUnsaved();
  };

  const aiAssist = (section: NoteSection) => {
    if (!section.aiKey) return;
    setAiLoading(l => ({ ...l, [section.key]: true }));
    setTimeout(() => {
      setAiLoading(l => ({ ...l, [section.key]: false }));
      if (!values[section.key]?.trim()) {
        const draft = AI_DRAFTS[section.aiKey!] || 'AI draft would appear here in production.';
        setValues(v => ({ ...v, [section.key]: draft }));
        markUnsaved();
      }
    }, 1400);
  };

  const lockNote = () => {
    setShowLockWarning(true);
    setTimeout(() => {
      if (window.confirm('Lock and finalise this note? It cannot be edited after locking.')) {
        setLocked(true);
        setStatus('locked');
      }
    }, 200);
  };

  const sections = FORMAT_SECTIONS[format];

  return (
    <div className="h-screen bg-[var(--warm)] font-sans flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[52px] bg-white border-b border-[var(--border)] flex items-center px-5 gap-3 flex-shrink-0 sticky top-0 z-50">
        <button
          onClick={() => navigate('/dashboard/clients/amara-mensah')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--ink-muted)] cursor-pointer px-2.5 py-1.5 rounded-[7px] border-none bg-transparent hover:bg-[var(--warm)]"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          Dashboard
        </button>
        <div className="w-px h-5 bg-[var(--border)]" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--sage-pale)] flex items-center justify-center text-[9px] font-medium text-[var(--sage-deep)]">AM</div>
          <div>
            <span className="text-[13px] font-medium text-[var(--ink)]">Amara Mensah</span>
            <span className="text-xs text-[var(--ink-muted)]"> · Session 15 · March 16, 2026</span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'saved' ? 'bg-[var(--sage)]' : status === 'locked' ? 'bg-[var(--ink-muted)]' : 'bg-[#BA7517]'}`} />
          <span className="text-[var(--ink-muted)]">{status === 'saved' ? 'Draft saved' : status === 'locked' ? 'Locked' : 'Unsaved changes'}</span>
        </div>
        {!locked && (
          <>
            <button
              onClick={() => setStatus('saved')}
              className="flex items-center gap-1.5 px-3.5 py-[7px] bg-[var(--sage)] text-white border-none rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[var(--sage-deep)]"
            >
              <svg viewBox="0 0 16 16" className="w-[13px] h-[13px]" fill="none" stroke="white" strokeWidth={1.5}><path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5l-3-3z"/><path d="M11 2v4H5V2M5 9h6"/></svg>
              Save draft
            </button>
            <button
              onClick={lockNote}
              className="flex items-center gap-1.5 px-4 py-[7px] bg-[var(--ink)] text-white border-none rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#333]"
            >
              <svg viewBox="0 0 16 16" className="w-[13px] h-[13px]" fill="none" stroke="white" strokeWidth={2}><rect x="3" y="7" width="10" height="8" rx="1"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>
              Lock & finalise
            </button>
          </>
        )}
      </div>

      {/* Editor shell */}
      <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: '220px 1fr 280px' }}>
        {/* Left sidebar */}
        <div className="bg-white border-r border-[var(--border)] flex flex-col overflow-y-auto">
          <div className="px-3.5 pt-3.5 pb-1.5 text-[10px] font-medium tracking-[0.7px] uppercase text-[var(--ink-muted)]">Note format</div>
          {(['dap','soap','birp','progress'] as Format[]).map(f => (
            <button
              key={f}
              onClick={() => !locked && setFormat(f)}
              className={`flex items-center gap-2 w-full px-3.5 py-[9px] border-none text-[13px] cursor-pointer border-l-2 transition-all duration-150 text-left ${format === f ? 'bg-[var(--sage-pale)] text-[var(--sage-deep)] border-l-[var(--sage)]' : 'bg-transparent text-[var(--ink-soft)] border-l-transparent hover:bg-[var(--warm)] hover:text-[var(--ink)]'}`}
            >
              {f === 'dap' ? 'DAP' : f === 'soap' ? 'SOAP' : f === 'birp' ? 'BIRP' : 'Progress'}
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ml-auto ${format === f ? 'bg-[var(--sage)] text-white' : 'bg-[var(--sage-pale)] text-[var(--sage)]'}`}>
                {f === 'dap' ? 'DAP' : f === 'soap' ? 'SOAP' : f === 'birp' ? 'BIRP' : 'PROG'}
              </span>
            </button>
          ))}

          <div className="h-px bg-[var(--border)] my-2" />
          <div className="px-3.5 pb-1.5 text-[10px] font-medium tracking-[0.7px] uppercase text-[var(--ink-muted)]">Session prep AI</div>
          <div className="mx-3 mb-2 bg-[var(--sage-pale)] rounded-[9px] p-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--sage)] mb-1.5">✦ Pre-session brief</div>
            <div className="mb-2">
              <div className="text-[10px] font-medium uppercase tracking-[0.4px] text-[var(--sage-deep)] mb-0.5">Where we left off</div>
              <div className="text-xs text-[var(--sage-deep)] leading-[1.55]">Explored workplace microaggression incident using anti-racism framework. Strong externalisation. Cautiously hopeful tone.</div>
            </div>
            <div className="mb-2">
              <div className="text-[10px] font-medium uppercase tracking-[0.4px] text-[var(--sage-deep)] mb-0.5">Watch for</div>
              <div className="text-xs text-[var(--sage-deep)] leading-[1.55]">Treatment plan 3-month review due today. PHQ-9 now 3 (minimal). Watch for premature closure impulse.</div>
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.4px] text-[var(--sage-deep)] mb-0.5">Suggested focus</div>
              <div className="text-xs text-[var(--sage-deep)] leading-[1.55]">Formal treatment plan review. Celebrate progress. Begin discharge planning discussion if criteria met.</div>
            </div>
          </div>

          <div className="h-px bg-[var(--border)] my-2" />
          <div className="px-3.5 pb-1.5 text-[10px] font-medium tracking-[0.7px] uppercase text-[var(--ink-muted)]">Session details</div>
          <div className="px-3.5 pb-3">
            {[
              { label: 'Date', value: 'Mar 16, 2026', type: 'static' as const },
              { label: 'Duration', value: duration, type: 'select' as const, options: ['50 min','25 min','80 min'], onChange: setDuration },
              { label: 'Format', value: sessionFormat, type: 'select' as const, options: ['Video','In-person','Phone'], onChange: setSessionFormat },
              { label: 'Session #', value: '15', type: 'static' as const },
              { label: 'Presenting Dx', value: diagnosis, type: 'select' as const, options: ['F43.10 PTSD','F41.1 GAD','F32.1 MDD'], onChange: setDiagnosis },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-[5px] border-b border-[var(--border)/50] last:border-b-0 text-xs">
                <span className="text-[var(--ink-muted)]">{row.label}</span>
                {row.type === 'static' ? (
                  <span className="font-medium text-[var(--ink)]">{row.value}</span>
                ) : (
                  <select
                    value={row.value}
                    onChange={e => row.onChange?.(e.target.value)}
                    className="border-none bg-transparent text-xs font-medium text-[var(--ink)] cursor-pointer outline-none p-0"
                  >
                    {row.options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main editor */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-10 py-8">
            <div className="font-serif text-[11px] tracking-[1px] uppercase text-[var(--ink-muted)] mb-6">{FORMAT_LABELS[format]}</div>
            <div className="flex flex-col">
              {sections.map((section, i) => (
                <div key={section.key} className={`border-b border-[var(--border)] ${i === sections.length - 1 ? 'border-b-0' : ''}`}>
                  <div className="flex items-center gap-2.5 pt-4 pb-2.5">
                    <span className={`text-[10px] font-semibold tracking-[0.8px] uppercase px-[9px] py-0.5 rounded flex-shrink-0 ${section.tagClass}`}>{section.tagLabel}</span>
                    <span className="text-[11px] text-[var(--ink-muted)] leading-snug flex-1">{section.hint}</span>
                    {section.aiKey && !locked && (
                      <button
                        onClick={() => aiAssist(section)}
                        className="flex items-center gap-1.5 px-2.5 py-[5px] border border-[rgba(74,124,111,0.25)] rounded-md bg-[var(--sage-pale)] text-[var(--sage-deep)] text-[11px] font-medium cursor-pointer flex-shrink-0 hover:bg-[var(--sage)] hover:text-white transition-all duration-150"
                      >
                        {aiLoading[section.key] ? (
                          <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] animate-spin" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>
                        ) : (
                          <svg viewBox="0 0 16 16" className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                        )}
                        {aiLoading[section.key] ? 'Drafting...' : 'AI assist'}
                      </button>
                    )}
                  </div>
                  {aiLoading[section.key] && (
                    <div className="bg-[var(--sage-pale)] rounded-lg px-3 py-2.5 mb-2 text-xs text-[var(--sage-deep)] flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 animate-spin flex-shrink-0" fill="none" stroke="var(--sage)" strokeWidth={1.5}><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>
                      Drafting from session context and last 3 notes...
                    </div>
                  )}
                  <AutoTextarea
                    value={values[section.key] || ''}
                    onChange={val => handleChange(section.key, val)}
                    placeholder={section.placeholder}
                    readOnly={locked}
                  />
                  <div className="text-[11px] text-[var(--ink-muted)] text-right pb-2">
                    {wordCount(values[section.key] || '')} word{wordCount(values[section.key] || '') !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="bg-white border-l border-[var(--border)] flex flex-col overflow-y-auto">
          <div className="px-4 py-3.5 border-b border-[var(--border)] text-xs font-medium text-[var(--ink)] flex items-center justify-between">
            Amara Mensah
            <span className="font-normal text-[var(--ink-muted)]">Session 15</span>
          </div>

          <div className="px-4 py-3.5 border-b border-[var(--border)] text-xs font-medium text-[var(--ink)]">Outcome scores</div>
          <div className="px-3.5 py-3 border-b border-[var(--border)]">
            {[{label:'PHQ-9',val:'3',max:'27',trend:'↓ from 10',up:true},{label:'GAD-7',val:'4',max:'21',trend:'↓ from 8',up:true},{label:'Wellbeing (portal)',val:'7',max:'10',trend:'↑ +2',up:true}].map(r => (
              <div key={r.label} className="flex items-center justify-between py-[7px] border-b border-[var(--border)/50] last:border-b-0 text-xs">
                <span className="text-[var(--ink-muted)]">{r.label}</span>
                <span className="font-medium text-[var(--ink)]">{r.val}<span className="text-[11px] text-[var(--ink-muted)] font-normal">/{r.max}</span></span>
                <span className={`text-[10px] font-medium ${r.up ? 'text-[var(--sage)]' : 'text-[#c0392b]'}`}>{r.trend}</span>
              </div>
            ))}
            <button className="w-full mt-1 py-2 border-[1.5px] border-dashed border-[var(--sage-light)] rounded-lg bg-transparent text-[var(--sage)] text-xs font-medium cursor-pointer hover:bg-[var(--sage-pale)]">
              + Assign PHQ-9 for today
            </button>
          </div>

          <div className="px-4 py-3.5 border-b border-[var(--border)] text-xs font-medium text-[var(--ink)]">Treatment goals</div>
          <div className="px-3.5 py-3 border-b border-[var(--border)]">
            {[{text:'Develop grounding techniques for acute stress responses',pct:100,note:'✓ Met — session 8'},{text:'Externalise systemic nature of racism, reduce self-blame',pct:90,note:'90% · Substantially met'},{text:'Rebuild professional identity integrating cultural heritage',pct:80,note:'80% · Strong progress'}].map((g,i) => (
              <div key={i} className="py-2 border-b border-[var(--border)/50] last:border-b-0">
                <div className="text-xs text-[var(--ink-soft)] leading-relaxed mb-1.5">{g.text}</div>
                <div className="h-[3px] bg-[var(--warm)] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[var(--sage)]" style={{width:`${g.pct}%`}} /></div>
                <div className="text-[10px] text-[var(--ink-muted)] mt-0.5">{g.note}</div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3.5 border-b border-[var(--border)] text-xs font-medium text-[var(--ink)]">Previous notes</div>
          <div className="px-3.5 py-3">
            {[{date:'Session 14 · Mar 10, 2026 · DAP',text:"Client explored workplace microaggression incident from the previous week using anti-racism framework. Demonstrated strong externalisation skills and showed reduced self-blame..."},{date:'Session 13 · Mar 3, 2026 · DAP',text:"Session focused on somatic responses to hypervigilance at work. Introduced body scan technique. Client receptive. Practiced in-session grounding..."},{date:'Session 12 · Feb 24, 2026 · DAP',text:"Explored family-of-origin patterns and their intersection with current workplace dynamics. Cultural genogram exercise initiated..."}].map((n,i) => (
              <div key={i} className="bg-[var(--warm)] rounded-lg p-3 mb-2 last:mb-0 cursor-pointer hover:bg-[var(--sage-pale)] transition-all duration-150">
                <div className="text-[11px] font-medium text-[var(--ink-muted)] mb-1">{n.date}</div>
                <div className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-3">{n.text}</div>
              </div>
            ))}
          </div>

          {showLockWarning && (
            <div className="mx-3 mb-3 bg-[#faeeda] border border-[rgba(186,117,23,0.3)] rounded-lg p-3 text-xs text-[#633806] leading-relaxed">
              Once locked, this note cannot be edited. It will be retained for 10 years per PHIPA s.20. Locked notes appear in your audit log.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AutoTextarea({ value, onChange, placeholder, readOnly }: { value: string; onChange: (v: string) => void; placeholder: string; readOnly?: boolean }) {
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
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={5}
      className={`w-full py-1 pb-5 border-none bg-transparent text-sm text-[var(--ink-soft)] leading-[1.75] resize-none outline-none min-h-[80px] placeholder:text-[var(--ink-muted)] focus:text-[var(--ink)] ${readOnly ? 'text-[var(--ink-muted)] cursor-default' : ''}`}
    />
  );
}
