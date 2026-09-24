import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useUser } from '../../context/UserContext';
import { closeAccount, downloadAccountExport } from '../../services/billing';

export function DangerZone() {
  const { logout } = useUser();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [closing, setClosing] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadAccountExport();
      toast.success('Export downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setClosing(true);
    try {
      await closeAccount();
      await logout();
      navigate('/', { replace: true });
      toast.success('Your account has been closed.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not close the account');
      setClosing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <section className="bg-white border border-[var(--border)] rounded-xl p-6" aria-labelledby="export-heading">
        <h2 id="export-heading" className="text-sm font-medium text-[var(--ink)] mb-1">Export your data</h2>
        <p className="text-[13px] text-[var(--ink-soft)] mb-3">
          Download everything stored in your account — profile, clients, session notes and amendments, invoices, appointments and your audit log — as a JSON file. The export is recorded in your audit log.
        </p>
        <button onClick={handleExport} disabled={exporting}
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer hover:bg-[var(--warm)] disabled:opacity-60">
          {exporting ? 'Preparing export…' : 'Download my data'}
        </button>
      </section>

      <section className="bg-white border border-[#f09595] rounded-xl p-6" aria-labelledby="close-heading">
        <h2 id="close-heading" className="text-sm font-semibold text-[var(--red)] mb-1">Close account</h2>
        <p className="text-[13px] text-[var(--ink-soft)] mb-2">
          Closing your account signs you out everywhere and blocks sign-in. Cancel any subscription in the billing portal first.
        </p>
        <p className="text-[13px] text-[var(--ink-soft)] mb-3">
          Clinical records are <strong>not deleted immediately</strong>: your College requires them to be kept for a set period after your last contact with each client. They are purged when that period ends. Download your data first if you are transferring your practice.
        </p>
        <form onSubmit={handleClose} className="flex flex-wrap items-center gap-2">
          <label htmlFor="close-confirm" className="text-xs text-[var(--ink-muted)]">Type DELETE to confirm</label>
          <input id="close-confirm" value={confirmText} onChange={e => setConfirmText(e.target.value)} autoComplete="off"
            className="px-3 py-2 rounded-lg border border-[var(--border)] text-[13px] w-32" />
          <button type="submit" disabled={confirmText !== 'DELETE' || closing}
            className="px-4 py-2 rounded-lg bg-[var(--red)] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-50">
            {closing ? 'Closing…' : 'Close my account'}
          </button>
        </form>
      </section>
    </div>
  );
}
