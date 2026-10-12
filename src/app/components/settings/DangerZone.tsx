import { useState } from 'react';
import { toast } from 'sonner';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useUser } from '../../context/UserContext';
import { closeAccount, downloadAccountExport } from '../../services/billing';

export function DangerZone() {
  const { t } = useTranslation();
  const { logout } = useUser();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [closing, setClosing] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadAccountExport();
      toast.success(t('dangerZone.exported'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dangerZone.exportFailed'));
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
      toast.success(t('dangerZone.closed'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dangerZone.closeFailed'));
      setClosing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <section className="bg-white border border-[var(--border)] rounded-xl p-6" aria-labelledby="export-heading">
        <h2 id="export-heading" className="text-sm font-medium text-[var(--ink)] mb-1">{t('dangerZone.exportTitle')}</h2>
        <p className="text-[13px] text-[var(--ink-soft)] mb-3">
          {t('dangerZone.exportBody')}
        </p>
        <button onClick={handleExport} disabled={exporting}
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer hover:bg-[var(--warm)] disabled:opacity-60">
          {exporting ? t('dangerZone.preparing') : t('dangerZone.download')}
        </button>
      </section>

      <section className="bg-white border border-[#f09595] rounded-xl p-6" aria-labelledby="close-heading">
        <h2 id="close-heading" className="text-sm font-semibold text-[var(--red)] mb-1">{t('dangerZone.closeTitle')}</h2>
        <p className="text-[13px] text-[var(--ink-soft)] mb-2">
          {t('dangerZone.closeBody')}
        </p>
        <p className="text-[13px] text-[var(--ink-soft)] mb-3">
          <Trans i18nKey="dangerZone.retention" components={{ strong: <strong /> }} />
        </p>
        <form onSubmit={handleClose} className="flex flex-wrap items-center gap-2">
          <label htmlFor="close-confirm" className="text-xs text-[var(--ink-muted)]">{t('dangerZone.typeDelete')}</label>
          <input id="close-confirm" value={confirmText} onChange={e => setConfirmText(e.target.value)} autoComplete="off"
            className="px-3 py-2 rounded-lg border border-[var(--border)] text-[13px] w-32" />
          <button type="submit" disabled={confirmText !== 'DELETE' || closing}
            className="px-4 py-2 rounded-lg bg-[var(--red)] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-50">
            {closing ? t('dangerZone.closing') : t('dangerZone.closeButton')}
          </button>
        </form>
      </section>
    </div>
  );
}
