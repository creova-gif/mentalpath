import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';

const MIN_LENGTH = 12;

// Landing page for the password-recovery email link. Supabase exchanges the
// token in the URL for a short-lived recovery session (detectSessionInUrl).
export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ready, setReady] = useState<'checking' | 'ok' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady('ok');
    });
    // If the recovery event already fired before mount, a session exists.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(prev => (prev === 'checking' ? (session ? 'ok' : 'invalid') : prev));
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_LENGTH) return setError(t('resetPassword.tooShort'));
    if (password !== confirm) return setError(t('resetPassword.mismatch'));
    setError('');
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }
    // End the recovery session everywhere so the new password is required.
    await supabase.auth.signOut({ scope: 'global' });
    toast.success(t('resetPassword.success'));
    navigate('/login', { replace: true });
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.09)]';

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--warm)] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[var(--border)] p-8">
        <h1 className="font-serif text-2xl text-[var(--ink)] mb-2">{t('resetPassword.title')}</h1>
        {ready === 'invalid' ? (
          <>
            <p role="alert" className="text-sm text-[var(--ink-soft)] mb-6">{t('resetPassword.invalidLink')}</p>
            <Link to="/login" className="text-sm text-[var(--sage)] underline">{t('resetPassword.backToLogin')}</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={ready === 'checking' || saving}>
            <p className="text-sm text-[var(--ink-muted)]">{t('resetPassword.subtitle')}</p>
            <div>
              <label htmlFor="new-password" className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">{t('resetPassword.newPassword')}</label>
              <input id="new-password" type="password" autoComplete="new-password" required minLength={MIN_LENGTH}
                value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">{t('resetPassword.confirm')}</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required minLength={MIN_LENGTH}
                value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass} />
            </div>
            {error && <p role="alert" className="text-sm text-[var(--red)]">{error}</p>}
            <button type="submit" disabled={ready !== 'ok' || saving}
              className="w-full py-3 rounded-[10px] bg-[var(--sage)] text-white text-sm font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60">
              {t('resetPassword.submit')}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
