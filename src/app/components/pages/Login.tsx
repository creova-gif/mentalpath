import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useUser, DEMO_ACCOUNTS } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';

const professionEmoji: Record<string, string> = {
  'Registered Psychotherapist': '🧠',
  'Chiropractor': '🦴',
  'Physiotherapist': '🏃',
  'Registered Massage Therapist': '🤲',
};

export function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result === 'ok') {
      navigate('/dashboard');
    } else {
      setError(t('login.error'));
      setLoading(false);
    }
  };

  const fillDemo = (acctEmail: string) => {
    setEmail(acctEmail);
    setPassword('demo1234');
    setError('');
  };

  const leftBadges = t('login.leftBadges', { returnObjects: true }) as string[];
  const professions = t('login.professions', { returnObjects: true }) as string[];
  const bottomBadges = t('login.bottomBadges', { returnObjects: true }) as string[];

  return (
    <div className="flex h-screen" style={{ fontFamily: 'var(--font-body)' }}>

      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col justify-between" style={{ width: '45%', background: '#1a2e28', padding: '40px 48px', flexShrink: 0 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'var(--sage)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'white', strokeWidth: 2 }}><path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/><path d="M8 11h8M8 14h5"/></svg>
          </div>
          <span style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>MentalPath</span>
        </Link>

        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>
            {t('login.tagline')}<br />
            <em style={{ color: 'var(--sage-light)' }}>{t('login.taglineEm')}</em><br />
            {t('login.taglineSub')}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>
            {t('login.subtitle')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {professions.map(p => (
              <div key={p} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>{p}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {leftBadges.map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--sage-light)' }} />
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, background: 'var(--warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }} className="p-6">
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile-only logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 md:hidden" style={{ textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'var(--sage)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'white', strokeWidth: 2 }}><path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/><path d="M8 11h8M8 14h5"/></svg>
            </div>
            <span style={{ color: 'var(--ink)', fontSize: 15, fontWeight: 500 }}>MentalPath</span>
          </Link>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', marginBottom: 6 }}>{t('login.welcome')}</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{t('login.welcomeSub')}</p>
          </div>

          {/* DEMO ACCOUNTS */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--sage-deep)', marginBottom: 8 }}>
              ✦ {t('login.demoTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO_ACCOUNTS.map(acct => {
                const initials = `${acct.firstName[0] ?? ''}${acct.lastName[0] ?? ''}`.toUpperCase();
                return (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => fillDemo(acct.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: email === acct.email ? 'var(--sage-pale)' : 'white',
                    border: `1px solid ${email === acct.email ? 'rgba(74,124,111,0.4)' : 'var(--border)'}`,
                    borderRadius: 9,
                    padding: '9px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={e => { if (email !== acct.email) e.currentTarget.style.background = 'var(--sage-pale)'; }}
                  onMouseLeave={e => { if (email !== acct.email) e.currentTarget.style.background = 'white'; }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 1 }}>{acct.firstName} {acct.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                      {professionEmoji[acct.profession] || '🏥'} {acct.profession} · {acct.city}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {acct.isTrial ? (
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#b45309', background: '#fef3c7', borderRadius: 4, padding: '2px 6px' }}>{t('login.badgeTrial')}</span>
                    ) : acct.planType === 'group' ? (
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--sage-deep)', background: 'var(--sage-pale)', borderRadius: 4, padding: '2px 6px' }}>{t('login.badgeGroup')}</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', background: 'var(--warm)', borderRadius: 4, padding: '2px 6px' }}>{t('login.badgeSolo')}</span>
                    )}
                  </div>
                </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 8, textAlign: 'center' }}>
              {t('login.demoPassword')} <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>demo1234</code>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{t('login.orEmail')}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} aria-label={t('login.welcomeSub')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 5 }}>{t('login.emailLabel')}</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!error}
                required
                style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: `1px solid ${error ? '#c0392b' : 'var(--bmed)'}`, background: 'white', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => { if (!error) e.target.style.borderColor = 'var(--sage)'; }}
                onBlur={e => { if (!error) e.target.style.borderColor = 'var(--bmed)'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{t('login.passwordLabel')}</label>
                <button type="button" aria-label={t('login.forgotPassword')} style={{ fontSize: 12, color: 'var(--sage)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{t('login.forgotPassword')}</button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!error}
                  required
                  style={{ width: '100%', padding: '10px 40px 10px 13px', borderRadius: 9, border: `1px solid ${error ? '#c0392b' : 'var(--bmed)'}`, background: 'white', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => { if (!error) e.target.style.borderColor = 'var(--sage)'; }}
                  onBlur={e => { if (!error) e.target.style.borderColor = 'var(--bmed)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  aria-pressed={showPw}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 2 }}
                >
                  {showPw ? (
                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" style={{ background: '#fde8e8', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, padding: '10px 13px', fontSize: 13, color: '#791F1F' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', background: loading ? 'var(--sage-light)' : 'var(--sage)', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: loading ? 'default' : 'pointer', transition: 'background 0.15s', marginTop: 4 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--sage-deep)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--sage)'; }}
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)' }}>
            {t('login.noAccount')}{' '}
            <a href="/onboarding" style={{ color: 'var(--sage)', fontWeight: 500, textDecoration: 'none' }}>{t('login.startTrial')}</a>
          </div>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 20 }}>
            {bottomBadges.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-muted)' }}>
                <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: 'none', stroke: 'var(--sage)', strokeWidth: 2.5 }}><polyline points="20 6 9 17 4 12"/></svg>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
