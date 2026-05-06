import { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NoteModal } from '../modals/NoteModal';

const dueNotes = [
  { initials: 'JL', name: 'Jamal Lee', time: 'Today 11:30am', type: 'Individual · Session 22 · DAP format', color: 'c-av-c' },
  { initials: 'SM', name: 'Sadia Mohamoud', time: 'Today 9:00am', type: 'Individual · Session 8 · SOAP format', color: 'c-av-a' },
  { initials: 'AM', name: 'Amara Mensah', time: 'Today 10:00am', type: 'Individual · Session 14 · DAP format', color: 'c-av-b' },
];

const completedNotes = [
  { initials: 'AM', name: 'Amara Mensah — Session 13', date: 'Mar 9 · DAP', color: 'c-av-b' },
  { initials: 'JL', name: 'Jamal Lee — Session 21', date: 'Mar 9 · DAP', color: 'c-av-c' },
  { initials: 'PC', name: 'Priya & Chetan — Session 2', date: 'Mar 7 · BIRP', color: 'c-av-d' },
  { initials: 'SM', name: 'Sadia Mohamoud — Session 7', date: 'Mar 6 · SOAP', color: 'c-av-a' },
];

export function SessionNotes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-[var(--ink-muted)]">
          {t('sessionNotes.summary', { dueCount: 3, completedCount: 47 })}
        </div>
        <button
          onClick={() => navigate('/session-note-editor')}
          className="flex items-center gap-[7px] px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          {t('sessionNotes.newNote')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.6px] text-[var(--red)] mb-2.5">
            {t('sessionNotes.dueTitle')}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-0">
            <div className="flex flex-col gap-0">
              {dueNotes.map((note, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedClient(note.name)}
                  className="flex items-center gap-3.5 px-5 py-3.5 border-t border-[var(--border)] cursor-pointer transition-all duration-100 hover:bg-[var(--warm)] first:border-t-0"
                >
                  <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(note.color)}`}>
                    {note.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--ink)]">{note.name}</div>
                    <div className="text-xs text-[var(--ink-muted)]">{note.time} · {note.type}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedClient(note.name); }}
                    className="px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]"
                  >
                    {t('sessionNotes.writeNote')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-[0.6px] text-[var(--ink-muted)] mb-2.5">
            {t('sessionNotes.recentCompleted')}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-0">
            <div className="flex flex-col gap-0">
              {completedNotes.map((note, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 px-5 py-3.5 border-t border-[var(--border)] cursor-pointer transition-all duration-100 hover:bg-[var(--warm)] first:border-t-0"
                >
                  <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(note.color)}`}>
                    {note.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--ink)]">{note.name}</div>
                    <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1">
                      {note.date} · <span className="text-[var(--sage)] text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {t('sessionNotes.locked')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedClient(note.name)}
                    className="px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]"
                  >
                    {t('sessionNotes.view')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedClient !== null && <NoteModal clientName={selectedClient} onClose={() => setSelectedClient(null)} />}
    </>
  );
}

function getAvatarColor(color: string) {
  const colors: Record<string, string> = {
    'c-av-a': 'bg-[#d4e8e4] text-[var(--sage-deep)]',
    'c-av-b': 'bg-[#e8d4d4] text-[#7a3030]',
    'c-av-c': 'bg-[#d4d4e8] text-[#303070]',
    'c-av-d': 'bg-[#e8e4d4] text-[#5a4a10]',
    'c-av-e': 'bg-[#e4d4e8] text-[#5a1a6a]',
    'c-av-f': 'bg-[#d4e8d4] text-[#1a5a1a]',
  };
  return colors[color] || colors['c-av-a'];
}
