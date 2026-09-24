import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  formatCad, getClient, getRetentionDate, listInvoicesForClient, setClientStatus,
  type ClientRecord, type ClientStatus, type InvoiceSummary,
} from '../../services/practice';
import { listNotes, type NoteSummary } from '../../services/sessionNotes';

export function ClientProfile() {
  const { clientId = '' } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientRecord | null | undefined>(undefined);
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [retainUntil, setRetainUntil] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getClient(clientId), listNotes({ clientId }), listInvoicesForClient(clientId)])
      .then(([c, n, i]) => { setClient(c); setNotes(n); setInvoices(i); })
      .catch(() => setClient(null));
    getRetentionDate(clientId).then(setRetainUntil).catch(() => setRetainUntil(null));
  }, [clientId]);

  const changeStatus = async (status: ClientStatus) => {
    if (!client) return;
    try {
      await setClientStatus(client.id, status);
      setClient({ ...client, status });
      toast.success(`Client marked ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update status');
    }
  };

  if (client === undefined) return <div role="status" className="p-8 text-sm text-[var(--ink-muted)]">Loading client…</div>;
  if (client === null) {
    return (
      <main className="p-8 text-sm space-y-3">
        <p role="alert">This client doesn't exist or you don't have access to their record.</p>
        <Link to="/dashboard/clients" className="text-[var(--sage)] underline">Back to clients</Link>
      </main>
    );
  }

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-4 py-2 border-b border-[var(--border)] last:border-b-0 text-[13px]">
      <dt className="text-[var(--ink-muted)]">{label}</dt><dd className="text-right">{value || '—'}</dd>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--warm)]">
      <header className="h-[52px] bg-white border-b border-[var(--border)] flex items-center px-6 gap-3">
        <Link to="/dashboard/clients" className="text-[13px] text-[var(--ink-muted)] no-underline">← Clients</Link>
        <div className="w-px h-5 bg-[var(--border)]" />
        <h1 className="text-[15px] font-medium">{client.name}</h1>
        <span className="text-xs text-[var(--ink-muted)] capitalize">{client.status}</span>
        <div className="flex-1" />
        <button onClick={() => navigate(`/session-note-editor?clientId=${client.id}`)} disabled={client.status !== 'active'}
          className="px-3.5 py-[7px] rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-50">
          New session note
        </button>
      </header>

      <main className="p-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="bg-white border border-[var(--border)] rounded-xl p-5" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-sm font-medium mb-2">Details</h2>
          <dl>
            {row('Email', client.email)}
            {row('Phone', client.phone)}
            {row('Date of birth', client.dateOfBirth)}
            {row('Pronouns', client.pronouns)}
            {row('Session type', client.sessionType)}
            {row('Rate', client.rate != null ? formatCad(client.rate) : null)}
            {row('Referral source', client.referralSource)}
            {row('Cultural context', client.culturalTags.join(', '))}
            {row('Client since', new Date(client.createdAt).toLocaleDateString('en-CA', { dateStyle: 'medium' }))}
            {row('Record kept until', retainUntil
              ? <span title="10 years after the last contact, or 10 years after the client turns 18, whichever is later. Destroyed automatically after this date.">
                  {new Date(`${retainUntil}T00:00:00`).toLocaleDateString('en-CA', { dateStyle: 'medium' })}
                </span>
              : null)}
          </dl>
          {client.notes && <p className="mt-3 text-[13px] text-[var(--ink-soft)] whitespace-pre-wrap">{client.notes}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {client.status !== 'active' && <button onClick={() => changeStatus('active')} className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white cursor-pointer">Mark active</button>}
            {client.status !== 'inactive' && <button onClick={() => changeStatus('inactive')} className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white cursor-pointer">Discharge / inactive</button>}
          </div>
        </section>

        <div className="space-y-5">
          <section className="bg-white border border-[var(--border)] rounded-xl overflow-hidden" aria-labelledby="notes-heading">
            <h2 id="notes-heading" className="text-sm font-medium px-5 py-3.5 border-b border-[var(--border)]">Session notes ({notes.length})</h2>
            <ul>
              {notes.length === 0 && <li className="px-5 py-5 text-sm text-[var(--ink-muted)]">No notes yet.</li>}
              {notes.map(n => (
                <li key={n.id}>
                  <Link to={`/session-note-editor?noteId=${n.id}`} className="flex justify-between px-5 py-3 border-t border-[var(--border)] first:border-t-0 no-underline text-[var(--ink)] hover:bg-[var(--warm)] text-[13px]">
                    <span>Session {n.sessionNumber ?? '—'} · {new Date(n.sessionDate + 'T00:00').toLocaleDateString('en-CA', { dateStyle: 'medium' })} · {n.noteFormat.toUpperCase()}</span>
                    <span className="text-xs text-[var(--ink-muted)]">{n.isLocked ? 'Locked' : 'Draft'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-[var(--border)] rounded-xl overflow-hidden" aria-labelledby="inv-heading">
            <h2 id="inv-heading" className="text-sm font-medium px-5 py-3.5 border-b border-[var(--border)]">Invoices ({invoices.length})</h2>
            <table className="w-full text-[13px]">
              <thead className="sr-only"><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {invoices.length === 0 && <tr><td className="px-5 py-5 text-[var(--ink-muted)]">No invoices yet.</td></tr>}
                {invoices.map(i => (
                  <tr key={i.id} className="border-t border-[var(--border)] first:border-t-0">
                    <td className="px-5 py-2.5">{i.number}</td>
                    <td className="py-2.5">{i.date}</td>
                    <td className="py-2.5">{formatCad(i.amount)}</td>
                    <td className="py-2.5 pr-5 text-right capitalize">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}
