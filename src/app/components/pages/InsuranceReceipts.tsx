import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';
import { useUser } from '../../context/UserContext';
import { formatCad } from '../../services/practice';
import { renderReceiptHtml, type ReceiptLabels } from '@/app/lib/receipt';

interface PaidInvoice {
  id: string; number: string; clientName: string; date: string; sessions: number; amount: number; paidAt: string | null; notes: string | null;
}

export function InsuranceReceipts() {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [invoices, setInvoices] = useState<PaidInvoice[] | null>(null);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase.from('invoices')
      .select('id, invoice_number, client_name, date, sessions, amount, paid_at, notes')
      .eq('status', 'paid')
      .gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); setInvoices([]); return; }
        setInvoices((data ?? []).map(r => ({
          id: r.id, number: r.invoice_number, clientName: r.client_name, date: r.date, sessions: r.sessions ?? 1,
          amount: Number(r.amount), paidAt: r.paid_at, notes: r.notes,
        })));
      });
  }, [year]);

  const shown = useMemo(
    () => (invoices ?? []).filter(i => i.clientName.toLowerCase().includes(query.trim().toLowerCase())),
    [invoices, query],
  );
  const years = Array.from({ length: 6 }, (_, k) => String(new Date().getFullYear() - k));
  const missingRegistration = user && !user.registrationNumber;

  const openReceipt = (inv: PaidInvoice) => {
    if (!user) return;
    const labels = t('receipts.labels', { returnObjects: true }) as ReceiptLabels;
    const html = renderReceiptHtml({
      invoiceNumber: inv.number, clientName: inv.clientName, serviceDate: inv.date, sessions: inv.sessions,
      amount: inv.amount, paidAt: inv.paidAt, description: null,
      provider: {
        name: user.name, profession: user.profession, college: user.collegeAbbr || user.college,
        registrationNumber: user.registrationNumber, city: user.city, hstExempt: user.hstExempt,
      },
    }, labels, i18n.language === 'fr' ? 'fr-CA' : 'en-CA');
    const w = window.open('', '_blank');
    if (!w) { toast.error(t('receipts.popupBlocked')); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <main className="p-6 space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{t('receipts.title')}</h1>
        <p className="text-[13px] text-[var(--ink-soft)] mt-1">{t('receipts.intro')}</p>
      </div>
      {missingRegistration && (
        <p role="alert" className="text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {t('receipts.missingRegistration')} <Link to="/dashboard/settings?tab=profile" className="underline">{t('receipts.openSettings')}</Link>
        </p>
      )}
      <section className="bg-white border border-[var(--border)] rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <label className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
            {t('receipts.year')}
            <select className="px-3 py-2 rounded-lg border border-[var(--border)] text-[13px] bg-white" value={year} onChange={e => setYear(e.target.value)}>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
            {t('receipts.search')}
            <input className="px-3 py-2 rounded-lg border border-[var(--border)] text-[13px]" value={query} onChange={e => setQuery(e.target.value)} />
          </label>
        </div>
        {invoices === null ? <p role="status" className="text-[13px] text-[var(--ink-muted)]">{t('receipts.loading')}</p>
          : shown.length === 0 ? <p className="text-[13px] text-[var(--ink-muted)]">{t('receipts.empty')} <Link to="/dashboard/billing" className="underline">{t('receipts.openBilling')}</Link></p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-xs text-[var(--ink-muted)]">
                      <th className="py-2 font-normal">{t('receipts.number')}</th>
                      <th className="py-2 font-normal">{t('receipts.client')}</th>
                      <th className="py-2 font-normal">{t('receipts.serviceDate')}</th>
                      <th className="py-2 font-normal">{t('receipts.amount')}</th>
                      <th className="py-2 font-normal"><span className="sr-only">{t('receipts.actions')}</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map(inv => (
                      <tr key={inv.id} className="border-t border-[var(--border)]">
                        <td className="py-2">{inv.number}</td>
                        <td className="py-2">{inv.clientName}</td>
                        <td className="py-2">{inv.date}</td>
                        <td className="py-2">{formatCad(inv.amount)}</td>
                        <td className="py-2 text-right">
                          <button onClick={() => openReceipt(inv)} className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-xs cursor-pointer hover:bg-[var(--warm)]"
                            aria-label={t('receipts.printFor', { number: inv.number })}>
                            {t('receipts.print')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </section>
    </main>
  );
}
