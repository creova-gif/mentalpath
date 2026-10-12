import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { addWaitlistClient, listClients, setClientStatus, type ClientRecord } from '../../services/practice';

export function Waitlist() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [people, setPeople] = useState<ClientRecord[] | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    listClients('waitlist').then(p => setPeople([...p].reverse())).catch(() => setPeople([]));
  }, []);
  useEffect(load, [load]);

  const daysWaiting = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await addWaitlistClient(user.id, form);
      setForm({ firstName: '', lastName: '', email: '', notes: '' });
      toast.success(t('waitlist.added'));
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('waitlist.addFailed'));
    } finally {
      setSaving(false);
    }
  };

  const offerSpot = async (p: ClientRecord) => {
    try {
      await setClientStatus(p.id, 'active');
      toast.success(t('waitlist.activated', { name: p.name }));
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('waitlist.activateFailed'));
    }
  };

  const remove = async (p: ClientRecord) => {
    if (!window.confirm(t('waitlist.removeConfirm', { name: p.name }))) return;
    await setClientStatus(p.id, 'inactive').then(load, () => toast.error(t('waitlist.updateFailed')));
  };

  const avg = people && people.length
    ? Math.round(people.reduce((s, p) => s + daysWaiting(p.createdAt), 0) / people.length) : 0;
  const input = 'px-3 py-2 rounded-lg border border-[var(--border)] text-[13px]';

  return (
    <>
      <p className="text-sm text-[var(--ink-muted)] mb-4" aria-live="polite">
        {people === null ? t('waitlist.loading') : t('waitlist.summary', { count: people.length, avg })}
      </p>

      <form onSubmit={handleAdd} className="bg-white border border-[var(--border)] rounded-xl p-4 mb-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
        <label className="flex flex-col text-xs gap-1">{t('waitlist.firstName')}<input required maxLength={100} className={input} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></label>
        <label className="flex flex-col text-xs gap-1">{t('waitlist.lastName')}<input required maxLength={100} className={input} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></label>
        <label className="flex flex-col text-xs gap-1">{t('waitlist.email')}<input type="email" className={input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] border-none cursor-pointer disabled:opacity-60">{t('waitlist.add')}</button>
        <label className="flex flex-col text-xs gap-1 md:col-span-4">{t('waitlist.reason')}
          <input maxLength={500} className={input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </label>
      </form>

      <ul className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        {people?.length === 0 && <li className="px-5 py-6 text-sm text-[var(--ink-muted)]">{t('waitlist.empty')}</li>}
        {people?.map((p, i) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-t border-[var(--border)] first:border-t-0">
            <span className="text-xs text-[var(--ink-muted)] w-6">#{i + 1}</span>
            <div className="flex-1 min-w-[160px]">
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-xs text-[var(--ink-muted)]">{p.email ?? t('waitlist.noEmail')}{p.notes ? ` · ${p.notes}` : ''}</div>
            </div>
            <span className="text-xs text-[var(--ink-muted)]">{t('waitlist.days', { count: daysWaiting(p.createdAt) })}</span>
            <button onClick={() => offerSpot(p)} className="px-2.5 py-1.5 rounded-md text-xs border border-[var(--border)] bg-white cursor-pointer hover:bg-[var(--sage-pale)]">{t('waitlist.offer')}</button>
            <button onClick={() => remove(p)} className="px-2.5 py-1.5 rounded-md text-xs border border-[var(--border)] bg-white cursor-pointer">{t('waitlist.remove')}</button>
          </li>
        ))}
      </ul>
    </>
  );
}
