import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/app/lib/locale';
import {
  formatCad, getClient, getRetentionDate, listInvoicesForClient, setClientStatus,
  type ClientRecord, type ClientStatus, type InvoiceSummary,
} from '../../services/practice';
import { listNotes, type NoteSummary } from '../../services/sessionNotes';

export function ClientProfile() {
  const { t } = useTranslation();
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
      toast.success(t('clientProfile.marked', { status: t(`common.clientStatus.${status}`) }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('clientProfile.statusFailed'));
    }
  };

  if (client === undefined) return <div role="status" className="p-8 text-sm text-[var(--ink-muted)]">{t('clientProfile.loading')}</div>;
  if (client === null) {
    return (
      <main className="p-8 text-sm space-y-3">
        <p role="alert">{t('clientProfile.notFound')}</p>
        <Link to="/dashboard/clients" className="text-[var(--sage)] underline">{t('clientProfile.backToClients')}</Link>
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
        <Link to="/dashboard/clients" className="text-[13px] text-[var(--ink-muted)] no-underline">← {t('sidebar.items.clients')}</Link>
        <div className="w-px h-5 bg-[var(--border)]" />
        <h1 className="text-[15px] font-medium">{client.name}</h1>
        <span className="text-xs text-[var(--ink-muted)]">{t(`common.clientStatus.${client.status}`, { defaultValue: client.status })}</span>
        <div className="flex-1" />
        <button onClick={() => navigate(`/session-note-editor?clientId=${client.id}`)} disabled={client.status !== 'active'}
          className="px-3.5 py-[7px] rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-50">
          {t('clientProfile.newNote')}
        </button>
      </header>

      <main className="p-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="bg-white border border-[var(--border)] rounded-xl p-5" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-sm font-medium mb-2">{t('clientProfile.details')}</h2>
          <dl>
            {row(t('clientProfile.fields.email'), client.email)}
            {row(t('clientProfile.fields.phone'), client.phone)}
            {row(t('clientProfile.fields.dob'), client.dateOfBirth)}
            {row(t('clientProfile.fields.pronouns'), client.pronouns)}
            {row(t('clientProfile.fields.sessionType'), client.sessionType)}
            {row(t('clientProfile.fields.rate'), client.rate != null ? formatCad(client.rate) : null)}
            {row(t('clientProfile.fields.referral'), client.referralSource)}
            {row(t('clientProfile.fields.cultural'), client.culturalTags.join(', '))}
            {row(t('clientProfile.fields.since'), formatDate(client.createdAt))}
            {row(t('clientProfile.fields.retainUntil'), retainUntil
              ? <span title={t('clientProfile.retentionHelp')}>
                  {formatDate(retainUntil)}
                </span>
              : null)}
          </dl>
          {client.notes && <p className="mt-3 text-[13px] text-[var(--ink-soft)] whitespace-pre-wrap">{client.notes}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {client.status !== 'active' && <button onClick={() => changeStatus('active')} className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white cursor-pointer">{t('clientProfile.markActive')}</button>}
            {client.status !== 'inactive' && <button onClick={() => changeStatus('inactive')} className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white cursor-pointer">{t('clientProfile.discharge')}</button>}
          </div>
        </section>

        <div className="space-y-5">
          <section className="bg-white border border-[var(--border)] rounded-xl overflow-hidden" aria-labelledby="notes-heading">
            <h2 id="notes-heading" className="text-sm font-medium px-5 py-3.5 border-b border-[var(--border)]">{t('clientProfile.notes', { count: notes.length })}</h2>
            <ul>
              {notes.length === 0 && <li className="px-5 py-5 text-sm text-[var(--ink-muted)]">{t('clientProfile.noNotes')}</li>}
              {notes.map(n => (
                <li key={n.id}>
                  <Link to={`/session-note-editor?noteId=${n.id}`} className="flex justify-between px-5 py-3 border-t border-[var(--border)] first:border-t-0 no-underline text-[var(--ink)] hover:bg-[var(--warm)] text-[13px]">
                    <span>{t('common.session', { n: n.sessionNumber ?? '—' })} · {formatDate(n.sessionDate)} · {(n.noteFormat ?? '').toUpperCase()}</span>
                    <span className="text-xs text-[var(--ink-muted)]">{n.isLocked ? t('common.locked') : t('common.draft')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-[var(--border)] rounded-xl overflow-hidden" aria-labelledby="inv-heading">
            <h2 id="inv-heading" className="text-sm font-medium px-5 py-3.5 border-b border-[var(--border)]">{t('clientProfile.invoices', { count: invoices.length })}</h2>
            <table className="w-full text-[13px]">
              <thead className="sr-only"><tr><th scope="col">{t('clientProfile.cols.invoice')}</th><th scope="col">{t('clientProfile.cols.date')}</th><th scope="col">{t('clientProfile.cols.amount')}</th><th scope="col">{t('clientProfile.cols.status')}</th></tr></thead>
              <tbody>
                {invoices.length === 0 && <tr><td className="px-5 py-5 text-[var(--ink-muted)]">{t('clientProfile.noInvoices')}</td></tr>}
                {invoices.map(i => (
                  <tr key={i.id} className="border-t border-[var(--border)] first:border-t-0">
                    <td className="px-5 py-2.5">{i.number}</td>
                    <td className="py-2.5">{i.date}</td>
                    <td className="py-2.5">{formatCad(i.amount)}</td>
                    <td className="py-2.5 pr-5 text-right">{t(`common.invoiceStatus.${i.status}`, { defaultValue: i.status })}</td>
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
