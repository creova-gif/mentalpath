import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '../../context/UserContext';
import { addWaitlistClient, listClients, setClientStatus, type ClientRecord } from '../../services/practice';

export function Waitlist() {
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
      toast.success('Added to waitlist');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add to waitlist');
    } finally {
      setSaving(false);
    }
  };

  const offerSpot = async (p: ClientRecord) => {
    try {
      await setClientStatus(p.id, 'active');
      toast.success(`${p.name} is now an active client`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not activate client');
    }
  };

  const remove = async (p: ClientRecord) => {
    if (!window.confirm(`Remove ${p.name} from the waitlist? Their record is kept as inactive.`)) return;
    await setClientStatus(p.id, 'inactive').then(load, () => toast.error('Could not update'));
  };

  const avg = people && people.length
    ? Math.round(people.reduce((s, p) => s + daysWaiting(p.createdAt), 0) / people.length) : 0;
  const input = 'px-3 py-2 rounded-lg border border-[var(--border)] text-[13px]';

  return (
    <>
      <p className="text-sm text-[var(--ink-muted)] mb-4" aria-live="polite">
        {people === null ? 'Loading…' : `${people.length} waiting · average wait ${avg} days`}
      </p>

      <form onSubmit={handleAdd} className="bg-white border border-[var(--border)] rounded-xl p-4 mb-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
        <label className="flex flex-col text-xs gap-1">First name<input required maxLength={100} className={input} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></label>
        <label className="flex flex-col text-xs gap-1">Last name<input required maxLength={100} className={input} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></label>
        <label className="flex flex-col text-xs gap-1">Email<input type="email" className={input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] border-none cursor-pointer disabled:opacity-60">Add to waitlist</button>
        <label className="flex flex-col text-xs gap-1 md:col-span-4">Reason for referral (optional)
          <input maxLength={500} className={input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </label>
      </form>

      <ul className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        {people?.length === 0 && <li className="px-5 py-6 text-sm text-[var(--ink-muted)]">Nobody is waiting.</li>}
        {people?.map((p, i) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-t border-[var(--border)] first:border-t-0">
            <span className="text-xs text-[var(--ink-muted)] w-6">#{i + 1}</span>
            <div className="flex-1 min-w-[160px]">
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-xs text-[var(--ink-muted)]">{p.email ?? 'No email'}{p.notes ? ` · ${p.notes}` : ''}</div>
            </div>
            <span className="text-xs text-[var(--ink-muted)]">{daysWaiting(p.createdAt)} days</span>
            <button onClick={() => offerSpot(p)} className="px-2.5 py-1.5 rounded-md text-xs border border-[var(--border)] bg-white cursor-pointer hover:bg-[var(--sage-pale)]">Offer a spot</button>
            <button onClick={() => remove(p)} className="px-2.5 py-1.5 rounded-md text-xs border border-[var(--border)] bg-white cursor-pointer">Remove</button>
          </li>
        ))}
      </ul>
    </>
  );
}
