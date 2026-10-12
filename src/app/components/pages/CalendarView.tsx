import { track } from '@/app/lib/telemetry';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { uiLocale } from '@/app/lib/locale';
import { useUser } from '../../context/UserContext';
import {
  createAppointment, listAppointments, listClients, setAppointmentStatus,
  type Appointment, type AppointmentStatus, type ClientRecord,
} from '../../services/practice';

function startOfWeek(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); // Monday
  return s;
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  scheduled: 'bg-[var(--sage-pale)] text-[var(--sage-deep)]',
  completed: 'bg-[#e8f0ed] text-[var(--ink-muted)]',
  cancelled: 'bg-[#f3f3f1] text-[var(--ink-muted)] line-through',
  no_show: 'bg-[#fde8e8] text-[#791F1F]',
};

export function CalendarView() {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: '', date: new Date().toISOString().slice(0, 10), time: '10:00', duration: 50, type: 'individual' });
  const [saving, setSaving] = useState(false);

  const weekEnd = useMemo(() => { const e = new Date(weekStart); e.setDate(e.getDate() + 7); return e; }, [weekStart]);

  const load = useCallback(() => {
    setAppointments(null);
    listAppointments(weekStart.toISOString(), weekEnd.toISOString())
      .then(setAppointments)
      .catch(() => { setAppointments([]); toast.error(t('calendar.loadFailed')); });
  }, [weekStart, weekEnd]);

  useEffect(load, [load]);
  useEffect(() => { listClients('active').then(setClients).catch(() => setClients([])); }, []);

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const byDay = (d: Date) => (appointments ?? []).filter(a => new Date(a.scheduledAt).toDateString() === d.toDateString());

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.clientId) return;
    setSaving(true);
    try {
      await createAppointment(user.id, {
        clientId: form.clientId,
        scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
        durationMinutes: form.duration,
        sessionType: form.type,
      });
      track('appointment_scheduled');
      toast.success(t('calendar.scheduled'));
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(t('calendar.scheduleFailed'), { description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (a: Appointment, status: AppointmentStatus) => {
    const reason = status === 'cancelled' ? window.prompt(t('calendar.cancelReason')) ?? undefined : undefined;
    try {
      await setAppointmentStatus(a.id, status, reason);
      load();
    } catch {
      toast.error(t('calendar.updateFailed'));
    }
  };

  const shift = (weeks: number) => setWeekStart(w => { const n = new Date(w); n.setDate(n.getDate() + weeks * 7); return n; });
  const input = 'px-3 py-2 rounded-lg border border-[var(--border)] text-[13px] bg-white';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} aria-label={t('calendar.prevWeek')} className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white cursor-pointer">←</button>
          <h1 className="text-sm font-medium min-w-[210px] text-center" aria-live="polite">
            {weekStart.toLocaleDateString(uiLocale(), { month: 'short', day: 'numeric' })} – {new Date(weekEnd.getTime() - 86400000).toLocaleDateString(uiLocale(), { month: 'short', day: 'numeric', year: 'numeric' })}
          </h1>
          <button onClick={() => shift(1)} aria-label={t('calendar.nextWeek')} className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white cursor-pointer">→</button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="px-2.5 py-1.5 rounded-md text-xs border border-[var(--border)] bg-white cursor-pointer">{t('calendar.today')}</button>
        </div>
        <button onClick={() => setShowForm(s => !s)} aria-expanded={showForm}
          className="px-3.5 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)]">
          + {t('calendar.schedule')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-[var(--border)] rounded-xl p-4 mb-5 flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-xs gap-1">{t('calendar.client')}
            <select required value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} className={input}>
              <option value="">{t('calendar.select')}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs gap-1">{t('calendar.date')}
            <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={input} />
          </label>
          <label className="flex flex-col text-xs gap-1">{t('calendar.time')}
            <input type="time" required value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className={input} />
          </label>
          <label className="flex flex-col text-xs gap-1">{t('calendar.length')}
            <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className={input}>
              {[25, 50, 60, 80, 90].map(d => <option key={d} value={d}>{t('noteEditor.minutes', { n: d })}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs gap-1">{t('calendar.type')}
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={input}>
              {['individual', 'couples', 'family', 'group', 'intake'].map(st => <option key={st} value={st}>{t(`calendar.types.${st}`)}</option>)}
            </select>
          </label>
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--ink)] text-white text-[13px] border-none cursor-pointer disabled:opacity-60">
            {saving ? t('calendar.saving') : t('calendar.save')}
          </button>
          {clients.length === 0 && <p className="text-xs text-[var(--ink-muted)] w-full">{t('calendar.addClientFirst')}</p>}
        </form>
      )}

      <div className="grid gap-3 md:grid-cols-7" aria-busy={appointments === null}>
        {days.map(d => {
          const isToday = d.toDateString() === new Date().toDateString();
          const items = byDay(d);
          return (
            <section key={d.toISOString()} className={`bg-white border rounded-xl min-h-[140px] ${isToday ? 'border-[var(--sage)]' : 'border-[var(--border)]'}`}
              aria-label={d.toLocaleDateString(uiLocale(), { weekday: 'long', month: 'long', day: 'numeric' })}>
              <h2 className="px-3 py-2 border-b border-[var(--border)] text-xs font-medium">
                {d.toLocaleDateString(uiLocale(), { weekday: 'short' })} <span className="text-[var(--ink-muted)]">{d.getDate()}</span>
              </h2>
              <ul className="p-2 space-y-2">
                {items.map(a => (
                  <li key={a.id} className={`rounded-lg p-2 text-xs ${STATUS_STYLE[a.status]}`}>
                    <div className="font-medium">{new Date(a.scheduledAt).toLocaleTimeString(uiLocale(), { hour: 'numeric', minute: '2-digit' })}</div>
                    <div className="truncate">{a.clientName}</div>
                    <div className="opacity-70">{t('noteEditor.minutes', { n: a.durationMinutes })} · {t(`calendar.status.${a.status}`)}</div>
                    {a.status === 'scheduled' && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {a.clientId && (
                          <button onClick={() => navigate(`/session-note-editor?clientId=${a.clientId}`)} className="underline bg-transparent border-none cursor-pointer p-0 text-[11px]">{t('calendar.note')}</button>
                        )}
                        <button onClick={() => changeStatus(a, 'completed')} className="underline bg-transparent border-none cursor-pointer p-0 text-[11px]">{t('calendar.done')}</button>
                        <button onClick={() => changeStatus(a, 'no_show')} className="underline bg-transparent border-none cursor-pointer p-0 text-[11px]">{t('calendar.noShow')}</button>
                        <button onClick={() => changeStatus(a, 'cancelled')} className="underline bg-transparent border-none cursor-pointer p-0 text-[11px]">{t('calendar.cancel')}</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
