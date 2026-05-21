import { useState, useEffect } from 'react';
import { Plus, Download, FileText, Archive } from 'lucide-react';
import { InvoiceModal } from '../modals/InvoiceModal';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '../ui/ProgressBar';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  sessions: number;
}

interface InvoiceRow {
  id: string;
  invoice_number: string;
  client_name: string;
  date: string;
  amount: number;
  status: string;
  sessions: number;
}

const MOCK_INVOICES: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-0031', clientName: 'Amara Mensah',      date: '2026-03-09', sessions: 2, amount: 280.00, status: 'paid'    },
  { id: '2', invoiceNumber: 'INV-0032', clientName: 'Jamal Lee',          date: '2026-03-09', sessions: 2, amount: 280.00, status: 'pending' },
  { id: '3', invoiceNumber: 'INV-0030', clientName: 'Sadia Mohamoud',     date: '2026-03-06', sessions: 2, amount: 140.00, status: 'paid'    },
  { id: '4', invoiceNumber: 'INV-0029', clientName: 'Priya & Chetan C.', date: '2026-03-07', sessions: 1, amount: 180.00, status: 'overdue' },
  { id: '5', invoiceNumber: 'INV-0028', clientName: 'Amara Mensah',      date: '2026-02-23', sessions: 2, amount: 280.00, status: 'paid'    },
  { id: '6', invoiceNumber: 'INV-0027', clientName: 'Riya Bhatt',        date: '2026-03-10', sessions: 1, amount: 110.00, status: 'pending' },
];

export function Billing() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [progressT2125, setProgressT2125] = useState(0);
  const [progressReceipts, setProgressReceipts] = useState(0);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        setInvoices(
          (data as InvoiceRow[]).map(row => ({
            id: row.id,
            invoiceNumber: row.invoice_number,
            clientName: row.client_name,
            date: row.date,
            amount: Number(row.amount),
            status: row.status as Invoice['status'],
            sessions: row.sessions,
          }))
        );
        return;
      }
    } catch {
      // fall through to mock
    }
    // Fallback: mock data until DB tables are seeded
    setInvoices(MOCK_INVOICES);
    setLoading(false);
  };

  // Called by InvoiceModal when a new invoice is saved
  const handleInvoiceSaved = async (newInvoice: {
    clientName: string;
    clientId?: string;
    date: string;
    sessions: number;
    amount: number;
  }) => {
    const maxNum = invoices.reduce((max, inv) => {
      const n = parseInt(inv.invoiceNumber.replace('INV-', ''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 30);
    const invoiceNumber = `INV-${String(maxNum + 1).padStart(4, '0')}`;

    const { data: sessionData } = await supabase.auth.getSession();
    const clinicianId = sessionData?.session?.user?.id;

    if (clinicianId) {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          clinician_id: clinicianId,
          client_id: newInvoice.clientId ?? null,
          invoice_number: invoiceNumber,
          client_name: newInvoice.clientName,
          date: newInvoice.date,
          sessions: newInvoice.sessions,
          amount: newInvoice.amount,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        const row = data as InvoiceRow;
        setInvoices(prev => [{
          id: row.id,
          invoiceNumber: row.invoice_number,
          clientName: row.client_name,
          date: row.date,
          amount: Number(row.amount),
          status: row.status as Invoice['status'],
          sessions: row.sessions,
        }, ...prev]);
        return;
      }
    }

    // Optimistic local update (demo/no DB yet)
    setInvoices(prev => [{
      id: String(Date.now()),
      invoiceNumber,
      clientName: newInvoice.clientName,
      date: newInvoice.date,
      sessions: newInvoice.sessions,
      amount: newInvoice.amount,
      status: 'pending',
    }, ...prev]);
  };


  const handleExportT2125 = async () => {
    setExporting(true);
    setProgressT2125(5);
    const interval = setInterval(() => {
      setProgressT2125((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);

    try {
      const year = '2025'; // Current tax year
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-4d1a502d/tax-export/t2125/${year}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate T2125 export');
      }

      const data = await response.json();
      
      clearInterval(interval);
      setProgressT2125(100);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Download CSV file
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName || `MentalPath_T2125_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert(t('billing.alerts.t2125Success', { year }));
    } catch (error) {
      console.error('T2125 export error:', error);
      alert(t('billing.alerts.t2125Fail'));
    } finally {
      clearInterval(interval);
      setProgressT2125(0);
      setExporting(false);
    }
  };

  const handleExportReceiptsZip = async () => {
    setExportingZip(true);
    setProgressReceipts(10);
    try {
      // Build a CSV of all paid invoices as a receipt summary
      // In production this would call an edge function to generate real PDFs.
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      if (paidInvoices.length === 0) {
        alert(t('billing.alerts.noInvoices'));
        setProgressReceipts(0);
        setExportingZip(false);
        return;
      }

      // Simulated progress steps over 1.5 seconds
      for (let p = 20; p <= 100; p += 10) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        setProgressReceipts(p);
      }
      await new Promise((resolve) => setTimeout(resolve, 200));

      const header = 'Invoice #,Client,Date,Sessions,Amount ($),Status';
      const rows = paidInvoices.map(inv =>
        `${inv.invoiceNumber},"${inv.clientName}",${inv.date},${inv.sessions},${inv.amount.toFixed(2)},${inv.status}`
      );
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MentalPath_Receipts.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Receipt export error:', err);
      alert(t('billing.alerts.receiptExportFail'));
    } finally {
      setProgressReceipts(0);
      setExportingZip(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });

  // Calculate summary stats
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const monthRevenue = invoices
    .filter(inv => {
      const invDate = new Date(inv.date);
      const now = new Date();
      return invDate.getMonth() === now.getMonth() && 
             invDate.getFullYear() === now.getFullYear() &&
             inv.status === 'paid';
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstanding = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const ytdRevenue = invoices
    .filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getFullYear() === new Date().getFullYear() && inv.status === 'paid';
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <SummaryBox label={t('billing.summary.collected', { month: currentMonth })} value={`$${monthRevenue.toFixed(0)}`} highlight />
        <SummaryBox label={t('billing.summary.outstanding')} value={`$${outstanding.toFixed(0)}`} />
        <SummaryBox label={t('billing.summary.ytd')} value={`$${ytdRevenue.toFixed(0)}`} />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border)]">
          <span className="text-sm font-medium text-[var(--ink)]">{t('billing.invoices.title')}</span>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1.5 overflow-x-auto">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>{t('billing.invoices.filters.all')}</FilterButton>
              <FilterButton active={filter === 'paid'} onClick={() => setFilter('paid')}>{t('billing.invoices.filters.paid')}</FilterButton>
              <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>{t('billing.invoices.filters.pending')}</FilterButton>
              <FilterButton active={filter === 'overdue'} onClick={() => setFilter('overdue')}>{t('billing.invoices.filters.overdue')}</FilterButton>
            </div>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-[7px] px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)] flex-shrink-0"
            >
              <Plus className="w-[13px] h-[13px]" strokeWidth={2} />
              <span className="hidden sm:inline">{t('billing.invoices.new')}</span>
              <span className="sm:hidden">{t('billing.invoices.newMobile')}</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[540px]">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('billing.invoices.columns.invoiceNum')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('billing.invoices.columns.client')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('billing.invoices.columns.date')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('billing.invoices.columns.sessions')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('billing.invoices.columns.amount')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('billing.invoices.columns.status')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]"></th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice, i) => (
              <tr key={i} className="cursor-pointer transition-all duration-100 hover:[&>td]:bg-[var(--warm)]">
                <td className="px-5 py-3.5 border-t border-[var(--border)] font-medium text-[var(--ink)] text-[13px] align-middle">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] align-middle">
                  {invoice.clientName}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] align-middle">
                  {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] align-middle">
                  {t('billing.invoices.sessionsCount', { count: invoice.sessions })}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] font-medium text-[var(--ink)] text-sm align-middle">
                  ${invoice.amount.toFixed(2)}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] align-middle">
                  <InvoiceStatus status={invoice.status} />
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] align-middle">
                  <button className="px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]">
                    {invoice.status === 'paid' ? t('billing.invoices.actionReceipt') : t('billing.invoices.actionReminder')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>{/* end overflow-x-auto */}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[13px] font-medium text-[var(--ink)] mb-3">{t('billing.taxPrep.title')}</div>
        <div className="text-[13px] text-[var(--ink-muted)] mb-4 leading-[1.6]">
          {t('billing.taxPrep.description')}
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handleExportT2125}
            className="flex items-center gap-[7px] px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border border-[var(--border)] bg-transparent text-[var(--ink-soft)] hover:bg-[var(--warm)] hover:text-[var(--ink)]"
          >
            {exporting ? (
              <Download className="w-[13px] h-[13px] animate-spin" strokeWidth={2} />
            ) : (
              <FileText className="w-[13px] h-[13px]" strokeWidth={2} />
            )}
            {t('billing.taxPrep.exportT2125', { year: '2025' })}
          </button>
          <button
            onClick={handleExportReceiptsZip}
            disabled={exportingZip}
            className="flex items-center gap-[7px] px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border border-[var(--border)] bg-transparent text-[var(--ink-soft)] hover:bg-[var(--warm)] hover:text-[var(--ink)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingZip ? (
              <Download className="w-[13px] h-[13px] animate-spin" strokeWidth={2} />
            ) : (
              <Archive className="w-[13px] h-[13px]" strokeWidth={2} />
            )}
            {exportingZip ? t('billing.taxPrep.exporting') : t('billing.taxPrep.downloadReceipts')}
          </button>
        </div>

        {(progressT2125 > 0 || progressReceipts > 0) && (
          <div className="mt-4 space-y-3 pt-3 border-t border-[var(--border)] animate-[fadeIn_0.2s_ease]">
            {progressT2125 > 0 && (
              <ProgressBar
                value={progressT2125}
                label={t('billing.taxPrep.generatingT2125')}
                showPercentage={true}
              />
            )}
            {progressReceipts > 0 && (
              <ProgressBar
                value={progressReceipts}
                label={t('billing.taxPrep.preparingReceipts')}
                showPercentage={true}
              />
            )}
          </div>
        )}
      </div>

      {showInvoiceModal && <InvoiceModal onClose={() => setShowInvoiceModal(false)} />}
    </>
  );
}

function SummaryBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`border rounded-[10px] p-4 ${
        highlight ? 'border-[var(--sage)] bg-[var(--sage-pale)]' : 'bg-[var(--surface)] border-[var(--border)]'
      }`}
    >
      <div className="text-[11px] text-[var(--ink-muted)] font-medium uppercase tracking-[0.4px] mb-1.5">{label}</div>
      <div className={`font-[var(--font-display)] text-2xl ${highlight ? 'text-[var(--sage-deep)]' : 'text-[var(--ink)]'}`}>
        {value}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-[20px] text-xs font-medium border border-[var(--border)] cursor-pointer transition-all duration-150 ${
        active
          ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
          : 'bg-transparent text-[var(--ink-muted)] hover:bg-[var(--warm)]'
      }`}
    >
      {children}
    </button>
  );
}

function InvoiceStatus({ status }: { status: 'paid' | 'pending' | 'overdue' }) {
  const { t } = useTranslation();
  const styles = {
    paid: 'bg-[#e8f4f0] text-[var(--sage-deep)]',
    pending: 'bg-[#fef3e2] text-[#7a4a00]',
    overdue: 'bg-[#fde8e8] text-[#7a1a1a]',
  };

  return (
    <span className={`inline-block text-[11px] font-medium px-[9px] py-[3px] rounded ${styles[status]}`}>
      {t(`billing.invoices.filters.${status}`)}
    </span>
  );
}