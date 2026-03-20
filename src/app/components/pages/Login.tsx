import { useState } from 'react';
import { useNavigate } from 'react-router';

const DEMO_EMAIL = 'dr.osei@mentalpath.ca';
const DEMO_PASSWORD = 'demo1234';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Use the demo credentials below.');
        setLoading(false);
      }
    }, 700);
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* LEFT PANEL */}
      <div style={{ width: '45%', background: '#1a2e28', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--sage)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'white', strokeWidth: 2 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <span style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>MentalPath</span>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'white', lineHeight: 1.2, marginBottom: 24 }}>
            Less admin.<br /><em style={{ color: 'var(--sage-light)' }}>More presence</em><br />with your clients.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
              "Switched from TherapyNotes in an afternoon. The culturally-adapted intake templates alone saved me two weeks of work — and I'm finally PHIPA-compliant."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white' }}>AO</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>Dr. Abena Osei-Mensah, RP</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Registered Psychotherapist · Toronto, ON</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {['PHIPA compliant', 'Canadian servers', '7-day free trial'].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--sage-light)' }} />
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, background: 'var(--warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Sign in to your MentalPath account</p>
          </div>

          {/* DEMO CREDENTIALS CARD */}
          <div
            onClick={fillDemo}
            style={{ background: 'var(--sage-pale)', border: '1px solid rgba(74,124,111,0.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 24, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#daeae5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--sage-pale)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--sage-deep)' }}>✦ Demo account — click to fill</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--sage-deep)', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--ink-muted)', minWidth: 68 }}>Email</span><span style={{ fontWeight: 500 }}>{DEMO_EMAIL}</span></div>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--ink-muted)', minWidth: 68 }}>Password</span><span style={{ fontWeight: 500 }}>{DEMO_PASSWORD}</span></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}><span style={{ color: 'var(--ink-muted)', minWidth: 68 }}>Account</span><span style={{ fontWeight: 500 }}>Dr. Abena Osei-Mensah, RP · CRPO #004821</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>Work email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@practice.ca"
                autoComplete="email"
                required
                style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: `1px solid ${error ? '#c0392b' : 'var(--bmed)'}`, background: 'white', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                onFocus={e => { if (!error) e.target.style.borderColor = 'var(--sage)'; }}
                onBlur={e => { if (!error) e.target.style.borderColor = 'var(--bmed)'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Password</label>
                <button type="button" style={{ fontSize: 12, color: 'var(--sage)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ width: '100%', padding: '10px 40px 10px 13px', borderRadius: 9, border: `1px solid ${error ? '#c0392b' : 'var(--bmed)'}`, background: 'white', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                  onFocus={e => { if (!error) e.target.style.borderColor = 'var(--sage)'; }}
                  onBlur={e => { if (!error) e.target.style.borderColor = 'var(--bmed)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
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
              <div style={{ background: '#fde8e8', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, padding: '10px 13px', fontSize: 13, color: '#791F1F' }}>
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
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)' }}>
            Don't have an account?{' '}
            <a href="/onboarding" style={{ color: 'var(--sage)', fontWeight: 500, textDecoration: 'none' }}>Start free trial</a>
          </div>

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 20 }}>
            {['PHIPA compliant', 'Canadian servers', 'Encrypted at rest'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-muted)' }}>
                <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: 'none', stroke: 'var(--sage)', strokeWidth: 2.5 }}><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
