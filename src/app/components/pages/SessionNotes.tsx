import { useEffect, useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { listNotes, type NoteSummary } from '../../services/sessionNotes';

function initials(name: string) {
  return name.split(/\s+/).map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase() || '—';
}

function NoteRow({ note, action, onOpen }: { note: NoteSummary; action: string; onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-3.5 px-5 py-3.5 border-t border-[var(--border)] first:border-t-0 hover:bg-[var(--warm)]">
      <div aria-hidden="true" className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 bg-[#d4e8e4] text-[var(--sage-deep)]">
        {initials(note.clientName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--ink)] truncate">
          {note.clientName}{note.sessionNumber ? ` — ${t('sessionNotes.sessionLabel', { number: note.sessionNumber })}` : ''}
        </div>
        <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1">
          {new Date(note.sessionDate + 'T00:00').toLocaleDateString('en-CA', { dateStyle: 'medium' })} · {note.noteFormat.toUpperCase()}
          {note.isLocked && (
            <span className="text-[var(--sage)] text-[11px] inline-flex items-center gap-1">
              · <Lock className="w-3 h-3" aria-hidden="true" /> {t('sessionNotes.locked')}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onOpen}
        className="px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] hover:bg-[var(--sage-pale)] hover:text-[var(--sage-deep)]"
      >
        {action}
      </button>
    </li>
  );
}

export function SessionNotes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listNotes({ limit: 200 }).then(setNotes).catch(() => setError(true));
  }, []);

  const drafts = (notes ?? []).filter(n => !n.isLocked);
  const locked = (notes ?? []).filter(n => n.isLocked);
  const open = (id: string) => navigate(`/session-note-editor?noteId=${id}`);

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-[var(--ink-muted)]" aria-live="polite">
          {notes === null && !error ? t('sessionNotes.loading') : t('sessionNotes.summary', { draftCount: drafts.length, lockedCount: locked.length })}
        </div>
        <button
          onClick={() => navigate('/session-note-editor')}
          className="flex items-center gap-[7px] px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          {t('sessionNotes.newNote')}
        </button>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-[var(--red)]">{t('sessionNotes.loadError')}</p>}

      <div className="grid md:grid-cols-2 gap-5">
        <section aria-labelledby="drafts-heading">
          <h2 id="drafts-heading" className="text-xs font-medium uppercase tracking-[0.6px] text-[var(--red)] mb-2.5">
            {t('sessionNotes.dueTitle')}
          </h2>
          <ul className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            {notes !== null && drafts.length === 0 && <li className="p-4 text-sm text-[var(--ink-muted)]">{t('sessionNotes.noDrafts')}</li>}
            {drafts.map(n => <NoteRow key={n.id} note={n} action={t('sessionNotes.writeNote')} onOpen={() => open(n.id)} />)}
          </ul>
        </section>

        <section aria-labelledby="locked-heading">
          <h2 id="locked-heading" className="text-xs font-medium uppercase tracking-[0.6px] text-[var(--ink-muted)] mb-2.5">
            {t('sessionNotes.recentCompleted')}
          </h2>
          <ul className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            {notes !== null && locked.length === 0 && <li className="p-4 text-sm text-[var(--ink-muted)]">{t('sessionNotes.noLocked')}</li>}
            {locked.map(n => <NoteRow key={n.id} note={n} action={t('sessionNotes.view')} onOpen={() => open(n.id)} />)}
          </ul>
        </section>
      </div>
    </>
  );
}
