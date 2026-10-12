import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import {
  formatCad, getDashboardStats, listAppointments, type Appointment, type DashboardStats,
} from '../../services/practice';
import { listNotes, type NoteSummary } from '../../services/sessionNotes';
import { formatDate, uiLocale } from '@/app/lib/locale';

function StatCard({ label, value, hint, onClick }: { label: string; value: string | number; hint?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 cursor-pointer hover:border-[var(--sage-light)] transition-colors"
    >
      <div className="text-xs text-[var(--ink-muted)] mb-1.5">{label}</div>
      <div className="text-[26px] leading-none text-[var(--ink)]" style={{ fontFamily: 'var(--font-display)' }}>{value}</div>
      {hint && <div className="text-[11px] text-[var(--ink-muted)] mt-1.5">{hint}</div>}
    </button>
  );
}

export function Overview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [today, setToday] = useState<Appointment[] | null>(null);
  const [drafts, setDrafts] = useState<NoteSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    Promise.all([
      getDashboardStats(),
      listAppointments(start.toISOString(), end.toISOString()),
      listNotes({ limit: 50 }),
    ])
      .then(([s, appts, notes]) => {
        setStats(s);
        setToday(appts.filter(a => a.status !== 'cancelled'));
        setDrafts(notes.filter(n => !n.isLocked).slice(0, 5));
      })
      .catch(() => setError(true));
  }, []);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetings.morning');
    if (hour < 17) return t('dashboard.greetings.afternoon');
    return t('dashboard.greetings.evening');
  })();

  const dateLabel = new Date().toLocaleDateString(uiLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
  const time = (iso: string) => new Date(iso).toLocaleTimeString(uiLocale(), { hour: 'numeric', minute: '2-digit' });

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl text-[var(--ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            {greeting}, {user?.firstName ?? ''}
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            {dateLabel} · {user ? t(`common.professions.${user.profession}`, { defaultValue: user.profession }) : ''}{user?.registrationNumber ? ` · ${user.registrationNumber}` : ''}
          </p>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-[var(--red)]">{t('overview.loadFailed')}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6" aria-busy={!stats && !error}>
        <StatCard label={t('overview.sessionsToday')} value={today?.length ?? '—'} onClick={() => navigate('/dashboard/calendar')} />
        <StatCard label={t('overview.activeClients')} value={stats?.activeClients ?? '—'}
          hint={stats?.waitlist ? t('overview.onWaitlist', { count: stats.waitlist }) : undefined} onClick={() => navigate('/dashboard/clients')} />
        <StatCard label={t('overview.collected')} value={stats ? formatCad(stats.collectedThisMonth) : '—'}
          hint={stats?.outstandingCount ? t('overview.outstanding', { amount: formatCad(stats.outstandingAmount), count: stats.outstandingCount }) : undefined}
          onClick={() => navigate('/dashboard/billing')} />
        <StatCard label={t('overview.draftNotes')} value={stats?.draftNotes ?? '—'} hint={t('overview.lockHint')} onClick={() => navigate('/dashboard/notes')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden" aria-labelledby="today-heading">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <h2 id="today-heading" className="text-sm font-medium">{t('overview.todaysSessions')}</h2>
            <button onClick={() => navigate('/dashboard/calendar')} className="text-xs text-[var(--sage)] bg-transparent border-none cursor-pointer">{t('overview.openCalendar')} →</button>
          </div>
          <ul>
            {today !== null && today.length === 0 && (
              <li className="px-5 py-6 text-sm text-[var(--ink-muted)]">{t('overview.noSessions')}</li>
            )}
            {today?.map(a => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3 border-t border-[var(--border)] first:border-t-0">
                <div className="text-sm font-medium w-20 text-[var(--ink)]">{time(a.scheduledAt)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{a.clientName}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{t('noteEditor.minutes', { n: a.durationMinutes })} · {t(`calendar.types.${a.sessionType}`, { defaultValue: a.sessionType })}</div>
                </div>
                {a.clientId && (
                  <button
                    onClick={() => navigate(a.noteId ? `/session-note-editor?noteId=${a.noteId}` : `/session-note-editor?clientId=${a.clientId}`)}
                    className="px-2.5 py-[5px] rounded-md text-xs border border-[var(--border)] bg-transparent cursor-pointer hover:bg-[var(--sage-pale)]"
                  >
                    {a.noteId ? t('overview.openNote') : t('overview.writeNote')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden" aria-labelledby="drafts-heading">
            <div className="px-5 py-3.5 border-b border-[var(--border)]">
              <h2 id="drafts-heading" className="text-sm font-medium">{t('overview.notesToFinish')}</h2>
            </div>
            <ul>
              {drafts !== null && drafts.length === 0 && <li className="px-5 py-5 text-sm text-[var(--ink-muted)]">{t('overview.allLocked')}</li>}
              {drafts?.map(n => (
                <li key={n.id}>
                  <button onClick={() => navigate(`/session-note-editor?noteId=${n.id}`)}
                    className="w-full text-left px-5 py-3 border-t border-[var(--border)] first:border-t-0 bg-transparent cursor-pointer hover:bg-[var(--warm)]">
                    <div className="text-sm">{n.clientName}</div>
                    <div className="text-xs text-[var(--ink-muted)]">
                      {formatDate(n.sessionDate)} · {(n.noteFormat ?? '').toUpperCase()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden" aria-labelledby="actions-heading">
            <div className="px-5 py-3.5 border-b border-[var(--border)]">
              <h2 id="actions-heading" className="text-sm font-medium">{t('dashboard.quickActions.title')}</h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)]">
              {[
                { label: t('overview.newNote'), path: '/session-note-editor' },
                { label: t('dashboard.quickActions.newInvoice'), path: '/dashboard/billing' },
                { label: t('overview.schedule'), path: '/dashboard/calendar' },
                { label: t('dashboard.quickActions.addClient'), path: '/dashboard/clients' },
              ].map(action => (
                <button key={action.path} onClick={() => navigate(action.path)}
                  className="px-4 py-3 bg-transparent border-none cursor-pointer text-left text-[12px] text-[var(--ink-soft)] font-medium hover:bg-[var(--warm)]">
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
