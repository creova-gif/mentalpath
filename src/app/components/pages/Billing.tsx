import { useState, useEffect } from 'react';
import { Plus, Download, FileText } from 'lucide-react';
import { InvoiceModal } from '../modals/InvoiceModal';
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

export function Billing() {
  const [filter, setFilter] = useState('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      // For demo purposes, use mock data. In production, fetch from backend
      // const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-4d1a502d/invoices`, {
      //   headers: { Authorization: `Bearer ${publicAnonKey}` }
      // });
      // const data = await response.json();
      // setInvoices(data.invoices);
      
      // Mock data for now
      setInvoices([
        {
          id: '1',
          invoiceNumber: 'INV-0031',
          clientName: 'Amara Mensah',
          date: '2026-03-09',
          sessions: 2,
          amount: 280.00,
          status: 'paid' as const,
        },
        {
          id: '2',
          invoiceNumber: 'INV-0032',
          clientName: 'Jamal Lee',
          date: '2026-03-09',
          sessions: 2,
          amount: 280.00,
          status: 'pending' as const,
        },
        {
          id: '3',
          invoiceNumber: 'INV-0030',
          clientName: 'Sadia Mohamoud',
          date: '2026-03-06',
          sessions: 2,
          amount: 140.00,
          status: 'paid' as const,
        },
        {
          id: '4',
          invoiceNumber: 'INV-0029',
          clientName: 'Priya & Chetan C.',
          date: '2026-03-07',
          sessions: 1,
          amount: 180.00,
          status: 'overdue' as const,
        },
        {
          id: '5',
          invoiceNumber: 'INV-0028',
          clientName: 'Amara Mensah',
          date: '2026-02-23',
          sessions: 2,
          amount: 280.00,
          status: 'paid' as const,
        },
        {
          id: '6',
          invoiceNumber: 'INV-0027',
          clientName: 'Riya Bhatt',
          date: '2026-03-10',
          sessions: 1,
          amount: 110.00,
          status: 'pending' as const,
        },
      ]);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportT2125 = async () => {
    setExporting(true);
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

      alert(`T2125 summary for ${year} downloaded successfully!`);
    } catch (error) {
      console.error('T2125 export error:', error);
      alert('Failed to export T2125 summary. Please try again.');
    } finally {
      setExporting(false);
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
        <SummaryBox label={`Collected — ${currentMonth}`} value={`$${monthRevenue.toFixed(0)}`} highlight />
        <SummaryBox label="Outstanding" value={`$${outstanding.toFixed(0)}`} />
        <SummaryBox label="YTD collected" value={`$${ytdRevenue.toFixed(0)}`} />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border)]">
          <span className="text-sm font-medium text-[var(--ink)]">Invoices</span>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1.5 overflow-x-auto">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
              <FilterButton active={filter === 'paid'} onClick={() => setFilter('paid')}>Paid</FilterButton>
              <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</FilterButton>
              <FilterButton active={filter === 'overdue'} onClick={() => setFilter('overdue')}>Overdue</FilterButton>
            </div>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-[7px] px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)] flex-shrink-0"
            >
              <Plus className="w-[13px] h-[13px]" strokeWidth={2} />
              <span className="hidden sm:inline">New invoice</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[540px]">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                Invoice #
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                Client
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                Date
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                Sessions
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                Amount
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                Status
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
                  {invoice.sessions} session(s)
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] font-medium text-[var(--ink)] text-sm align-middle">
                  ${invoice.amount.toFixed(2)}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] align-middle">
                  <InvoiceStatus status={invoice.status} />
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] align-middle">
                  <button className="px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]">
                    {invoice.status === 'paid' ? 'Receipt' : 'Send reminder'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>{/* end overflow-x-auto */}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[13px] font-medium text-[var(--ink)] mb-3">Tax prep — T2125 self-employment summary</div>
        <div className="text-[13px] text-[var(--ink-muted)] mb-4 leading-[1.6]">
          MentalPath generates a year-end income summary formatted for Schedule T2125 (Statement of Business Activities).
          Download at tax time — no accountant needed for the basics.
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
            Export 2025 T2125 summary
          </button>
          <button className="flex items-center gap-[7px] px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border border-[var(--border)] bg-transparent text-[var(--ink-soft)] hover:bg-[var(--warm)] hover:text-[var(--ink)]">
            Download all receipts (ZIP)
          </button>
        </div>
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
  const styles = {
    paid: 'bg-[#e8f4f0] text-[var(--sage-deep)]',
    pending: 'bg-[#fef3e2] text-[#7a4a00]',
    overdue: 'bg-[#fde8e8] text-[#7a1a1a]',
  };

  return (
    <span className={`inline-block text-[11px] font-medium px-[9px] py-[3px] rounded ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}