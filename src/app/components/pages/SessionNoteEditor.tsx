import { track } from '@/app/lib/telemetry';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useUser } from '../../context/UserContext';
import { generateNoteAssist } from '../../services/aiNoteService';
import {
  addAmendment, getNote, listAmendments, listClientOptions, listNotes, lockNote, saveDraft,
  type Amendment, type ClientOption, type NoteFormat, type NoteSummary,
} from '../../services/sessionNotes';
import { AiConsentDialog } from '../modals/AiConsentDialog';

const FORMAT_LABELS: Record<NoteFormat, string> = {
  dap: 'DAP — Data · Assessment · Plan',
  soap: 'SOAP — Subjective · Objective · Assessment · Plan',
  birp: 'BIRP — Behaviour · Intervention · Response · Plan',
  progress: 'Progress note',
};

type Section = { tagLabel: string; tagBg: string; tagColor: string; hint: string; placeholder: string };

// Each format maps onto the four stored columns section_1..section_4.
const SECTIONS: Record<NoteFormat, Section[]> = {
  dap: [
    { tagLabel: 'D', tagBg: '#e8f0ed', tagColor: '#2d5049', hint: 'Client presentation, what was discussed, direct observations', placeholder: 'Client presented with… Reported that… Discussed… Affect was…' },
    { tagLabel: 'A', tagBg: '#faeeda', tagColor: '#633806', hint: 'Clinical interpretation, formulation, risk assessment', placeholder: 'Presentation consistent with… Progress toward… Risk assessment…' },
    { tagLabel: 'P', tagBg: '#E6F1FB', tagColor: '#0C447C', hint: 'Next steps, interventions, homework, follow-up plan', placeholder: 'Continue… Next session will focus on… Client to…' },
  ],
  soap: [
    { tagLabel: 'S', tagBg: '#fde8e8', tagColor: '#791F1F', hint: 'Subjective — what the client reports', placeholder: 'Client reports…' },
    { tagLabel: 'O', tagBg: '#faeeda', tagColor: '#633806', hint: 'Objective — clinician observations', placeholder: 'Client appeared… Affect was…' },
    { tagLabel: 'A', tagBg: '#faeeda', tagColor: '#633806', hint: 'Assessment — clinical interpretation', placeholder: 'Presentation consistent with…' },
    { tagLabel: 'P', tagBg: '#E6F1FB', tagColor: '#0C447C', hint: 'Plan — next steps and interventions', placeholder: 'Continue… Next session…' },
  ],
  birp: [
    { tagLabel: 'B', tagBg: '#EEEDFE', tagColor: '#3C3489', hint: 'Behaviour — observable behaviours and presentation', placeholder: 'Client demonstrated…' },
    { tagLabel: 'I', tagBg: '#fde8e8', tagColor: '#791F1F', hint: 'Intervention — what the clinician did', placeholder: 'Clinician provided…' },
    { tagLabel: 'R', tagBg: '#e8f4f0', tagColor: '#2d5049', hint: 'Response — how the client responded', placeholder: 'Client responded by…' },
    { tagLabel: 'P', tagBg: '#E6F1FB', tagColor: '#0C447C', hint: 'Plan — next steps', placeholder: 'Plan for next session…' },
  ],
  progress: [
    { tagLabel: 'Summary', tagBg: '#faeeda', tagColor: '#633806', hint: 'Session content and client presentation', placeholder: 'Session focused on…' },
    { tagLabel: 'Observations', tagBg: '#e8f0ed', tagColor: '#2d5049', hint: 'Progress, strengths, barriers, risk or safety considerations', placeholder: 'Observed…' },
    { tagLabel: 'Plan', tagBg: '#E6F1FB', tagColor: '#0C447C', hint: 'Treatment direction and next steps', placeholder: 'Next session will…' },
  ],
};

const DURATIONS = [25, 50, 60, 80, 90];
const SESSION_TYPES = ['video', 'in-person', 'phone'];
const EMPTY: [string, string, string, string] = ['', '', '', ''];

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function AutoTextarea({ id, label, value, onChange, placeholder, readOnly }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; readOnly?: boolean;
}) {
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
      aria-label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={5}
      className="w-full bg-transparent border-none outline-none resize-none text-sm leading-7 min-h-[80px] pt-1 pb-5"
      style={{ color: readOnly ? 'var(--ink-muted)' : 'var(--ink)', fontFamily: 'inherit' }}
    />
  );
}

export function SessionNoteEditor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOnline = useOnlineStatus();
  const { user, setAiAssistEnabled } = useUser();

  const [noteId, setNoteId] = useState<string | null>(searchParams.get('noteId'));
  const [clientId, setClientId] = useState<string | null>(searchParams.get('clientId'));
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [format, setFormat] = useState<NoteFormat>('dap');
  const [sections, setSections] = useState<[string, string, string, string]>(EMPTY);
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState(50);
  const [sessionType, setSessionType] = useState('video');
  const [aiUsed, setAiUsed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [previousNotes, setPreviousNotes] = useState<NoteSummary[]>([]);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [amendBody, setAmendBody] = useState('');
  const [amendReason, setAmendReason] = useState('');

  const client = clients.find(c => c.id === clientId) ?? null;

  // ── Load clients + existing note ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const options = await listClientOptions();
        if (cancelled) return;
        setClients(options);
        const id = searchParams.get('noteId');
        if (id) {
          const note = await getNote(id, user.id);
          if (cancelled) return;
          if (!note) {
            setLoadError('This note does not exist or you do not have access to it.');
          } else {
            setClientId(note.clientId);
            setFormat(note.noteFormat);
            setSections(note.sections);
            setSessionDate(note.sessionDate);
            setDuration(note.durationMinutes ?? 50);
            setSessionType(note.sessionType ?? 'video');
            setAiUsed(note.aiUsed);
            setLocked(note.isLocked);
            setLockedAt(note.lockedAt);
            setSessionNumber(note.sessionNumber);
            if (note.isLocked) setAmendments(await listAmendments(note.id));
          }
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load this note.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // Load once per mount; later URL updates come from our own saves.
  }, [user]);

  useEffect(() => {
    if (!clientId) return;
    listNotes({ clientId, limit: 6 })
      .then(notes => setPreviousNotes(notes.filter(n => n.id !== noteId).slice(0, 5)))
      .catch(() => setPreviousNotes([]));
  }, [clientId, noteId]);

  // ── Autosave ───────────────────────────────────────────────────────────────
  const draft = useMemo(
    () => ({ clientId, format, sections, sessionDate, duration, sessionType, aiUsed }),
    [clientId, format, sections, sessionDate, duration, sessionType, aiUsed],
  );

  const persist = useCallback(async (d: typeof draft) => {
    if (!user || !d.clientId) return;
    const id = await saveDraft(noteId, {
      clientId: d.clientId,
      sessionDate: d.sessionDate,
      sessionType: d.sessionType,
      durationMinutes: d.duration,
      noteFormat: d.format,
      sections: d.sections,
      aiUsed: d.aiUsed,
    }, user.id);
    if (id !== noteId) {
      setNoteId(id);
      setSearchParams(prev => { prev.set('noteId', id); prev.delete('clientId'); return prev; }, { replace: true });
    }
  }, [user, noteId, setSearchParams]);

  const { status, flush, markSaved, dirty } = useAutoSave({
    data: draft,
    onSave: persist,
    enabled: !loading && !locked && !!clientId && !loadError,
  });

  // Loaded content is the saved baseline.
  const baselineSet = useRef(false);
  useEffect(() => {
    if (!loading && !baselineSet.current) {
      baselineSet.current = true;
      markSaved(draft);
    }
  }, [loading, draft, markSaved]);

  const setSection = (index: number, value: string) => {
    setSections(prev => {
      const next = [...prev] as [string, string, string, string];
      next[index] = value;
      return next;
    });
  };

  // ── AI assist ──────────────────────────────────────────────────────────────
  const runAiAssist = async () => {
    setAiLoading(true);
    try {
      const response = await generateNoteAssist({
        noteFormat: format.toUpperCase() as 'DAP' | 'SOAP' | 'BIRP' | 'PROGRESS',
        section1: sections[0],
        section2: sections[1],
        section3: sections[2],
        section4: SECTIONS[format].length > 3 ? sections[3] : undefined,
        sessionContext: `${sessionType} session, ${duration} minutes`,
      });
      const s = response.sections ?? {};
      setSections(prev => [
        s.section1 ?? prev[0], s.section2 ?? prev[1], s.section3 ?? prev[2], s.section4 ?? prev[3],
      ]);
      setAiUsed(true);
      track('ai_assist_used', { note_format: format });
      toast.success('AI draft added — review and edit before locking', { description: response.disclaimer });
    } catch (err) {
      toast.error('AI Assist is unavailable', { description: err instanceof Error ? err.message : undefined });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiClick = () => {
    if (!user?.aiAssistEnabled) return setShowConsent(true);
    runAiAssist();
  };

  // ── Lock & amend ───────────────────────────────────────────────────────────
  const handleLock = async () => {
    if (!noteId) {
      toast.error('Write the note before locking it.');
      return;
    }
    if (!window.confirm('Lock and finalise this note? Locked notes cannot be edited or deleted — corrections are added as dated amendments.')) return;
    try {
      await flush();
      await lockNote(noteId);
      track('note_locked', { note_format: format, ai_used: aiUsed });
      setLocked(true);
      setLockedAt(new Date().toISOString());
      toast.success('Note locked');
    } catch (err) {
      toast.error('Could not lock the note', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const handleAmend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteId || !amendBody.trim()) return;
    try {
      await addAmendment(noteId, amendBody.trim(), amendReason.trim());
      setAmendments(await listAmendments(noteId));
      setAmendBody('');
      setAmendReason('');
      toast.success('Amendment added');
    } catch (err) {
      toast.error('Could not add amendment', { description: err instanceof Error ? err.message : undefined });
    }
  };

  const statusLabel = locked
    ? `Locked${lockedAt ? ' · ' + new Date(lockedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) : ''}`
    : { idle: noteId ? 'Saved' : 'Not saved yet', unsaved: 'Unsaved changes', saving: 'Saving…', saved: 'Saved', error: 'Save failed — retrying on next change' }[status];
  const dotColor = locked ? 'var(--ink-muted)' : status === 'error' ? 'var(--red)' : dirty ? '#BA7517' : 'var(--sage)';

  if (loading) {
    return <div role="status" className="min-h-screen flex items-center justify-center text-sm text-[var(--ink-muted)]">Loading note…</div>;
  }
  if (loadError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-[var(--ink-soft)] max-w-md">{loadError}</p>
        <Link to="/dashboard/notes" className="text-sm text-[var(--sage)] underline">Back to notes</Link>
      </main>
    );
  }

  const sectionDefs = SECTIONS[format];
  const backTo = clientId ? `/dashboard/clients/${clientId}` : '/dashboard/notes';

  return (
    <div className="flex flex-col h-screen bg-[var(--warm)] text-[var(--ink)]" style={{ fontFamily: 'var(--font-body)' }}>
      {!isOnline && !locked && (
        <div role="alert" className="bg-[#FFF9E6] border-b border-[#FFE0B2] px-5 py-2.5 text-[13px] text-[#8a6100]">
          <strong>You're offline.</strong> Changes are kept in this tab only and will save when you reconnect — don't close this tab.
        </div>
      )}

      {/* TOPBAR */}
      <header className="h-[52px] bg-white border-b border-[var(--border)] flex items-center px-5 gap-3 flex-shrink-0">
        <button
          onClick={async () => { if (dirty) await flush(); navigate(backTo); }}
          className="flex items-center gap-1.5 text-[13px] text-[var(--ink-muted)] px-2.5 py-1.5 rounded-md border-none bg-transparent cursor-pointer hover:bg-[var(--warm)]"
        >
          ← Back
        </button>
        <div className="w-px h-5 bg-[var(--border)]" />
        {client ? (
          <div className="text-[13px]">
            <span className="font-medium">{client.name}</span>
            <span className="text-[var(--ink-muted)]">
              {sessionNumber ? ` · Session ${sessionNumber}` : ''} · {new Date(sessionDate + 'T00:00').toLocaleDateString('en-CA', { dateStyle: 'medium' })}
            </span>
          </div>
        ) : (
          <label className="text-[13px] flex items-center gap-2">
            <span className="text-[var(--ink-muted)]">Client</span>
            <select
              value=""
              onChange={e => setClientId(e.target.value || null)}
              className="border border-[var(--border)] rounded-md px-2 py-1 text-[13px] bg-white"
            >
              <option value="">Select a client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs" aria-live="polite">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} aria-hidden="true" />
          <span className="text-[var(--ink-muted)]">{statusLabel}</span>
        </div>
        {!locked && (
          <>
            <button
              onClick={() => flush()}
              disabled={!clientId}
              className="px-3.5 py-[7px] rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              onClick={handleLock}
              disabled={!noteId}
              className="px-4 py-[7px] rounded-lg bg-[var(--ink)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[#333] disabled:opacity-50"
            >
              Lock &amp; finalise
            </button>
          </>
        )}
      </header>

      <div className="grid flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: '220px 1fr 280px' }}>
        {/* LEFT: format + session details */}
        <aside className="bg-white border-r border-[var(--border)] overflow-y-auto">
          <div className="px-3.5 pt-3.5 pb-1.5 text-[10px] font-medium tracking-[0.7px] uppercase text-[var(--ink-muted)]">Note format</div>
          <div role="radiogroup" aria-label="Note format">
            {(Object.keys(FORMAT_LABELS) as NoteFormat[]).map(f => (
              <button
                key={f}
                role="radio"
                aria-checked={format === f}
                disabled={locked}
                onClick={() => setFormat(f)}
                className="flex items-center w-full px-3.5 py-2 text-[13px] text-left border-none cursor-pointer disabled:cursor-default"
                style={{
                  borderLeft: `2px solid ${format === f ? 'var(--sage)' : 'transparent'}`,
                  background: format === f ? 'var(--sage-pale)' : 'transparent',
                  color: format === f ? 'var(--sage-deep)' : 'var(--ink-soft)',
                }}
              >
                {f === 'progress' ? 'Progress' : f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-px bg-[var(--border)] my-2" />
          <div className="px-3.5 pt-3.5 pb-1.5 text-[10px] font-medium tracking-[0.7px] uppercase text-[var(--ink-muted)]">Session details</div>
          <div className="px-3.5 pb-3 text-xs space-y-2">
            <label className="flex justify-between items-center gap-2">
              <span className="text-[var(--ink-muted)]">Date</span>
              <input type="date" value={sessionDate} disabled={locked} onChange={e => setSessionDate(e.target.value)}
                className="text-xs border-none bg-transparent text-right" />
            </label>
            <label className="flex justify-between items-center gap-2">
              <span className="text-[var(--ink-muted)]">Duration</span>
              <select value={duration} disabled={locked} onChange={e => setDuration(Number(e.target.value))} className="text-xs border-none bg-transparent">
                {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </label>
            <label className="flex justify-between items-center gap-2">
              <span className="text-[var(--ink-muted)]">Type</span>
              <select value={sessionType} disabled={locked} onChange={e => setSessionType(e.target.value)} className="text-xs border-none bg-transparent">
                {SESSION_TYPES.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
              </select>
            </label>
            <div className="flex justify-between">
              <span className="text-[var(--ink-muted)]">Session #</span>
              <span className="font-medium">{sessionNumber ?? 'Assigned on save'}</span>
            </div>
            {aiUsed && <div className="text-[11px] text-[var(--sage-deep)]">✦ AI Assist was used for this note</div>}
          </div>
        </aside>

        {/* MAIN EDITOR */}
        <main className="overflow-y-auto px-10 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[11px] tracking-[1px] uppercase text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-display)' }}>
              {FORMAT_LABELS[format]}
            </h1>
            {!locked && (
              <button
                onClick={handleAiClick}
                disabled={aiLoading || !isOnline}
                aria-busy={aiLoading}
                className="px-2.5 py-1.5 rounded-md border border-[rgba(74,124,111,0.25)] bg-[var(--sage-pale)] text-[var(--sage-deep)] text-xs font-medium cursor-pointer hover:bg-[var(--sage)] hover:text-white disabled:opacity-60"
              >
                {aiLoading ? 'Drafting…' : '✦ AI assist'}
              </button>
            )}
          </div>

          {!clientId && (
            <p role="status" className="mb-6 text-sm text-[var(--ink-soft)] bg-white border border-[var(--border)] rounded-lg p-3">
              Choose a client above to start this note. Notes are saved to that client's record.
            </p>
          )}

          {sectionDefs.map((section, i) => (
            <section key={`${format}-${i}`} className={i < sectionDefs.length - 1 ? 'border-b border-[var(--border)]' : ''}>
              <div className="flex items-center gap-2.5 pt-4 pb-2.5">
                <span className="text-[10px] font-semibold tracking-[0.8px] uppercase px-2 py-[3px] rounded"
                  style={{ background: section.tagBg, color: section.tagColor }}>
                  {section.tagLabel}
                </span>
                <span className="text-[11px] text-[var(--ink-muted)]">{section.hint}</span>
              </div>
              <AutoTextarea
                id={`note-section-${i + 1}`}
                label={`${section.tagLabel}: ${section.hint}`}
                value={sections[i]}
                onChange={v => setSection(i, v)}
                placeholder={section.placeholder}
                readOnly={locked || !clientId}
              />
              <div className="text-[11px] text-[var(--ink-muted)] text-right pb-2">
                {countWords(sections[i])} word{countWords(sections[i]) !== 1 ? 's' : ''}
              </div>
            </section>
          ))}

          {locked && (
            <section className="mt-8" aria-labelledby="amendments-heading">
              <h2 id="amendments-heading" className="text-sm font-medium mb-3">Amendments</h2>
              {amendments.length === 0 && <p className="text-xs text-[var(--ink-muted)] mb-3">No amendments.</p>}
              <ol className="space-y-3 mb-4">
                {amendments.map(a => (
                  <li key={a.id} className="bg-white border border-[var(--border)] rounded-lg p-3 text-sm">
                    <div className="text-[11px] text-[var(--ink-muted)] mb-1">
                      {new Date(a.createdAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}
                      {a.reason ? ` · ${a.reason}` : ''}
                    </div>
                    <p className="whitespace-pre-wrap">{a.body}</p>
                  </li>
                ))}
              </ol>
              <form onSubmit={handleAmend} className="bg-white border border-[var(--border)] rounded-lg p-3 space-y-2">
                <label htmlFor="amend-body" className="block text-xs font-medium">Add an amendment</label>
                <textarea id="amend-body" required value={amendBody} onChange={e => setAmendBody(e.target.value)} rows={3}
                  className="w-full border border-[var(--border)] rounded-md p-2 text-sm" />
                <label htmlFor="amend-reason" className="block text-xs text-[var(--ink-muted)]">Reason (optional)</label>
                <input id="amend-reason" value={amendReason} onChange={e => setAmendReason(e.target.value)} maxLength={500}
                  className="w-full border border-[var(--border)] rounded-md p-2 text-sm" />
                <button type="submit" className="px-3 py-1.5 rounded-md bg-[var(--ink)] text-white text-xs border-none cursor-pointer">
                  Add amendment
                </button>
              </form>
            </section>
          )}
        </main>

        {/* RIGHT: context */}
        <aside className="bg-white border-l border-[var(--border)] overflow-y-auto">
          <div className="px-4 py-3.5 border-b border-[var(--border)] text-xs font-medium">
            {client ? client.name : 'No client selected'}
          </div>
          <div className="px-4 py-3.5 text-xs font-medium">Previous notes</div>
          <ul className="px-3.5 pb-3 space-y-2">
            {previousNotes.length === 0 && <li className="text-xs text-[var(--ink-muted)]">No previous notes for this client.</li>}
            {previousNotes.map(n => (
              <li key={n.id}>
                <Link to={`/session-note-editor?noteId=${n.id}`} reloadDocument
                  className="block bg-[var(--warm)] rounded-lg px-3 py-2.5 text-xs text-[var(--ink-soft)] no-underline hover:bg-[var(--sage-pale)]">
                  Session {n.sessionNumber ?? '—'} · {new Date(n.sessionDate + 'T00:00').toLocaleDateString('en-CA', { dateStyle: 'medium' })} · {n.noteFormat.toUpperCase()}
                  {n.isLocked ? ' · Locked' : ' · Draft'}
                </Link>
              </li>
            ))}
          </ul>
          <p className="px-4 pb-4 text-[11px] text-[var(--ink-muted)] leading-relaxed">
            Locked notes can't be edited or deleted. Keep records for the period your College requires; corrections are added as dated amendments.
          </p>
        </aside>
      </div>

      {showConsent && (
        <AiConsentDialog
          onCancel={() => setShowConsent(false)}
          onAccept={async () => {
            const ok = await setAiAssistEnabled(true);
            setShowConsent(false);
            if (ok) runAiAssist();
            else toast.error('Could not save your AI Assist preference.');
          }}
        />
      )}
    </div>
  );
}
