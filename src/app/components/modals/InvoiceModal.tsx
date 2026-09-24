import { track } from '@/app/lib/telemetry';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '../../context/UserContext';
import { supabase } from '@/utils/supabase/client';
import { formatCad, listClients, type ClientRecord } from '../../services/practice';

const HST_RATE = 0.13; // Ontario HST; other provinces differ — see Settings.

export interface SavedInvoice {
  id: string; invoiceNumber: string; clientName: string; date: string; amount: number; status: 'pending'; sessions: number;
}

export function InvoiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: (invoice: SavedInvoice) => void }) {
  const { user } = useUser();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sessions, setSessions] = useState(1);
  const [rate, setRate] = useState(user?.sessionRate ?? 140);
  const [hst, setHst] = useState(!(user?.hstExempt ?? true));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
    listClients().then(cs => setClients(cs.filter(c => c.status !== 'waitlist'))).catch(() => setClients([]));
  }, []);

  const client = clients.find(c => c.id === clientId);
  useEffect(() => { if (client?.rate) setRate(client.rate); }, [client]);

  const subtotal = sessions * rate;
  const tax = hst ? Math.round(subtotal * HST_RATE * 100) / 100 : 0;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !client) return;
    setSaving(true);
    const { data, error } = await supabase.from('invoices').insert({
      clinician_id: user.id,
      client_id: client.id,
      client_name: client.name,
      date,
      sessions,
      amount: total,
      status: 'pending',
      notes: hst ? `Includes HST ${formatCad(tax)}` : null,
    }).select('id, invoice_number, client_name, date, amount, sessions').single();
    setSaving(false);
    if (error || !data) {
      toast.error('Could not create the invoice', { description: error?.message });
      return;
    }
    onSaved({
      id: data.id, invoiceNumber: data.invoice_number, clientName: data.client_name,
      date: data.date, amount: Number(data.amount), status: 'pending', sessions: data.sessions,
    });
    track('invoice_created');
    toast.success(`Invoice ${data.invoice_number} created`);
    onClose();
  };

  const input = 'w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm';

  return (
    <dialog ref={dialogRef} onCancel={e => { e.preventDefault(); onClose(); }} aria-labelledby="invoice-title"
      className="rounded-2xl border border-[var(--border)] p-0 w-[calc(100%-32px)] max-w-[560px] backdrop:bg-black/40">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h2 id="invoice-title" className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Create invoice</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="bg-transparent border-none cursor-pointer text-lg">×</button>
        </div>
        <label className="block text-[13px] font-medium">Client
          <select required value={clientId} onChange={e => setClientId(e.target.value)} className={`${input} mt-1.5`}>
            <option value="">Select a client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-[13px] font-medium">Date
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={`${input} mt-1.5`} />
          </label>
          <label className="block text-[13px] font-medium">Sessions
            <input type="number" min={1} max={100} required value={sessions} onChange={e => setSessions(Number(e.target.value))} className={`${input} mt-1.5`} />
          </label>
          <label className="block text-[13px] font-medium">Rate (CAD)
            <input type="number" min={0} step="0.01" required value={rate} onChange={e => setRate(Number(e.target.value))} className={`${input} mt-1.5`} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={hst} onChange={e => setHst(e.target.checked)} className="w-4 h-4 accent-[var(--sage)]" />
          Charge HST (13%)
        </label>
        <dl className="bg-[var(--warm)] rounded-lg p-3 text-[13px] space-y-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCad(subtotal)}</dd></div>
          {hst && <div className="flex justify-between"><dt>HST</dt><dd>{formatCad(tax)}</dd></div>}
          <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatCad(total)}</dd></div>
        </dl>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer">Cancel</button>
          <button type="submit" disabled={saving || !clientId || total > 99999}
            className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-60">
            {saving ? 'Saving…' : 'Create invoice'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
