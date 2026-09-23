import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/utils/supabase/client';
import { useUser } from '../../context/UserContext';

// Clinical data is protected by RLS policies that require an AAL2 (MFA-verified)
// session — see migration 20260924000100. This gate gives users the matching UI:
// enrol a TOTP authenticator the first time, then complete a challenge on each
// new sign-in. It is a UX layer; the database is the enforcement point.
//
// Local development only: VITE_MFA_OPTIONAL=true skips the gate. It must be paired
// with private.app_settings(mfa_optional=true) in that dev database.
const MFA_OPTIONAL = import.meta.env.DEV && import.meta.env.VITE_MFA_OPTIONAL === 'true';

type GateState =
  | { kind: 'checking' }
  | { kind: 'ok' }
  | { kind: 'challenge'; factorId: string }
  | { kind: 'enrol'; factorId: string; qrCode: string; secret: string }
  | { kind: 'error'; message: string };

export function MfaGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { logout } = useUser();
  const [state, setState] = useState<GateState>({ kind: MFA_OPTIONAL ? 'ok' : 'checking' });
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState('');

  const evaluate = useCallback(async () => {
    const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return setState({ kind: 'error', message: error.message });
    if (aal.currentLevel === 'aal2') return setState({ kind: 'ok' });

    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) return setState({ kind: 'error', message: listError.message });

    const verified = factors.totp.find(f => f.status === 'verified');
    if (verified) return setState({ kind: 'challenge', factorId: verified.id });

    // Clear abandoned enrolments before starting a new one.
    for (const f of factors.all.filter(f => f.status !== 'verified')) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data: enrol, error: enrolError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `MentalPath ${new Date().toISOString().slice(0, 10)}`,
    });
    if (enrolError) return setState({ kind: 'error', message: enrolError.message });
    setState({ kind: 'enrol', factorId: enrol.id, qrCode: enrol.totp.qr_code, secret: enrol.totp.secret });
  }, []);

  useEffect(() => {
    if (!MFA_OPTIONAL) evaluate();
  }, [evaluate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== 'challenge' && state.kind !== 'enrol') return;
    setVerifying(true);
    setCodeError('');
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: state.factorId,
      code: code.replace(/\s+/g, ''),
    });
    setVerifying(false);
    if (error) {
      setCodeError(t('mfa.invalidCode'));
      return;
    }
    setCode('');
    await evaluate();
  };

  if (state.kind === 'ok') return <>{children}</>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--warm)] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[var(--border)] p-8">
        {state.kind === 'checking' && <p role="status" className="text-sm text-[var(--ink-muted)]">{t('mfa.checking')}</p>}

        {state.kind === 'error' && (
          <>
            <h1 className="font-serif text-2xl text-[var(--ink)] mb-2">{t('mfa.errorTitle')}</h1>
            <p role="alert" className="text-sm text-[var(--ink-soft)] mb-4">{state.message}</p>
            <button onClick={evaluate} className="text-sm text-[var(--sage)] underline bg-transparent border-none cursor-pointer">{t('mfa.retry')}</button>
          </>
        )}

        {(state.kind === 'enrol' || state.kind === 'challenge') && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <h1 className="font-serif text-2xl text-[var(--ink)]">
              {state.kind === 'enrol' ? t('mfa.enrolTitle') : t('mfa.challengeTitle')}
            </h1>
            <p className="text-sm text-[var(--ink-soft)]">
              {state.kind === 'enrol' ? t('mfa.enrolBody') : t('mfa.challengeBody')}
            </p>
            {state.kind === 'enrol' && (
              <div className="flex flex-col items-center gap-2">
                <img src={state.qrCode} alt={t('mfa.qrAlt')} width={180} height={180} />
                <p className="text-xs text-[var(--ink-muted)]">{t('mfa.manualKey')}</p>
                <code className="text-xs break-all bg-[var(--surface)] px-2 py-1 rounded">{state.secret}</code>
              </div>
            )}
            <div>
              <label htmlFor="mfa-code" className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">{t('mfa.codeLabel')}</label>
              <input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                required
                autoFocus
                value={code}
                onChange={e => setCode(e.target.value)}
                aria-invalid={!!codeError}
                aria-describedby={codeError ? 'mfa-code-error' : undefined}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-lg tracking-[0.3em] text-center outline-none focus:border-[var(--sage)]"
              />
              {codeError && <p id="mfa-code-error" role="alert" className="text-sm text-[var(--red)] mt-1.5">{codeError}</p>}
            </div>
            <button type="submit" disabled={verifying}
              className="w-full py-3 rounded-[10px] bg-[var(--sage)] text-white text-sm font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60">
              {t('mfa.verify')}
            </button>
            <button type="button" onClick={() => logout()}
              className="text-sm text-[var(--ink-muted)] bg-transparent border-none cursor-pointer underline">
              {t('mfa.signOut')}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
