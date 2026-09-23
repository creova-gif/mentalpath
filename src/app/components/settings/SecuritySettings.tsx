import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useUser } from '../../context/UserContext';
import { AiConsentDialog } from '../modals/AiConsentDialog';

const MIN_LENGTH = 12;

export function SecuritySettings() {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [factorCount, setFactorCount] = useState<number | null>(null);
  const { user, setAiAssistEnabled } = useUser();
  const [showAiConsent, setShowAiConsent] = useState(false);

  const toggleAi = async (enabled: boolean) => {
    if (enabled) return setShowAiConsent(true);
    if (await setAiAssistEnabled(false)) toast.success(t('settings.security.aiOff'));
  };

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      setFactorCount(data ? data.totp.filter(f => f.status === 'verified').length : 0);
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_LENGTH) return setError(t('resetPassword.tooShort'));
    if (newPassword !== confirm) return setError(t('resetPassword.mismatch'));
    setError('');
    setSaving(true);
    // The session is already MFA-verified (AAL2); Supabase may additionally
    // require re-authentication if "secure password change" is enabled.
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (updateError) return setError(updateError.message);
    setNewPassword('');
    setConfirm('');
    toast.success(t('settings.security.passwordUpdated'));
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]';

  return (
    <div className="p-6 space-y-4">
      <form onSubmit={handleUpdatePassword}>
        <div className="text-sm font-medium text-[var(--ink)] mb-3">{t('settings.security.changePassword')}</div>
        <div className="space-y-2.5 max-w-[400px]">
          <label className="sr-only" htmlFor="settings-new-password">{t('settings.security.newPassword')}</label>
          <input id="settings-new-password" type="password" autoComplete="new-password" minLength={MIN_LENGTH} required
            placeholder={t('settings.security.newPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} />
          <label className="sr-only" htmlFor="settings-confirm-password">{t('settings.security.confirmPassword')}</label>
          <input id="settings-confirm-password" type="password" autoComplete="new-password" minLength={MIN_LENGTH} required
            placeholder={t('settings.security.confirmPassword')} value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass} />
        </div>
        {error && <p role="alert" className="text-sm text-[var(--red)] mt-2">{error}</p>}
        <button type="submit" disabled={saving}
          className="mt-3 px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60">
          {t('settings.security.updatePassword')}
        </button>
      </form>

      <div className="pt-4 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)]">
        <div className="font-medium text-[var(--ink)]">{t('settings.security.autoLock')}</div>
        <div className="text-xs text-[var(--ink-muted)] mt-1">{t('settings.security.autoLockAlwaysOn')}</div>
      </div>

      <div className="pt-3 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)] flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[var(--sage)] mt-0.5" aria-hidden="true" />
        <div>
          <div className="font-medium text-[var(--ink)]">{t('settings.security.mfaTitle')}</div>
          <div className="text-xs text-[var(--ink-muted)] mt-1">
            {factorCount === null ? '…' : t('settings.security.mfaStatus', { count: factorCount })}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--border)] text-[13px] text-[var(--ink-soft)]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!user?.aiAssistEnabled}
            onChange={e => toggleAi(e.target.checked)}
            className="w-4 h-4 accent-[var(--sage)] cursor-pointer"
          />
          <span className="font-medium text-[var(--ink)]">{t('settings.security.aiTitle')}</span>
        </label>
        <div className="text-xs text-[var(--ink-muted)] ml-6 mt-1">{t('settings.security.aiDesc')}</div>
      </div>

      {showAiConsent && (
        <AiConsentDialog
          onCancel={() => setShowAiConsent(false)}
          onAccept={async () => {
            setShowAiConsent(false);
            if (await setAiAssistEnabled(true)) toast.success(t('settings.security.aiOn'));
          }}
        />
      )}
    </div>
  );
}
