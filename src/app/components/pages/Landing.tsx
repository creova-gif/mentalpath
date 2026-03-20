import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { SEO, addStructuredData, mentalPathSchema } from '../../utils/seo';

const PROFESSIONS = [
  { num: '01', name: 'Therapists & Psychotherapists', path: '/for-therapists', count: '25,000', college: 'CRPO · ACPRO · OPA', tags: ['Psychotherapy notes', 'Trauma-informed templates', 'Outcome tracking', 'Secure messaging', 'AI note drafting'], accent: '#4a7c6f' },
  { num: '02', name: 'Chiropractors', path: '/for-chiropractors', count: '9,000', college: 'CCBC · CCO · NBCE', tags: ['SOAP + AMPS notes', 'DC billing codes', 'Treatment courses', 'HEP Builder', 'Radiograph notes'], accent: '#5a8a7a' },
  { num: '03', name: 'Physiotherapists', path: '/for-physiotherapists', count: '18,000', college: 'CPO · CPTA · CAPT', tags: ['ICF-aligned notes', 'HEP Builder', 'Oswestry · DASH · NPRS', 'Treatment plans', 'Direct billing'], accent: '#6a9885' },
  { num: '04', name: 'Registered Massage Therapists', path: '/for-massage-therapists', count: '15,000', college: 'CMTO · MTABC · RMTBC', tags: ['RMT SOAP notes', 'Insurance receipts', 'Consent forms', 'Outcome measures', 'Client portal'], accent: '#7aab95' },
  { num: '05', name: 'Naturopathic Doctors', path: '/for-naturopaths', count: '3,500', college: 'CONO · CNPBC · AANP', tags: ['Integrative notes', 'Supplement tracking', 'Lab result logging', 'Patient education', 'Secure messaging'], accent: '#8abda8' },
];

const TICKER = [
  'PHIPA Compliant', 'Canadian Servers Only', 'PIPEDA Certified', 'AES-256 Encrypted',
  'College-Ready Records', 'No US Routing', 'AWS ca-central-1', 'Audit Logs',
  'Therapist-Key Encryption', 'CRPO · CPO · CPSBC',
];

function ProfessionShowcase() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section style={{ background: '#0a1510', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="py-16 md:py-24 px-[5vw]">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, color: '#4a7c6f', marginBottom: 12 }}>
              Who it&apos;s built for
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.8vw,50px)', lineHeight: 1.08, letterSpacing: '-1.5px', color: '#f5f0e8' }}>
              Every regulated Canadian<br className="hidden sm:block" /> health practitioner
            </h2>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280, color: 'rgba(245,240,232,0.38)' }}>
            College-compliant tools, billing codes, and clinical templates — built for your specific profession.
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {PROFESSIONS.map((p) => {
            const isActive = active === p.num;
            return (
              <div key={p.num} onMouseEnter={() => setActive(p.num)} onMouseLeave={() => setActive(null)} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link to={p.path} className="no-underline block">
                  <div className="flex items-center gap-4 md:gap-8 py-5 md:py-6 transition-all duration-200">
                    <span style={{ fontSize: 11, fontFamily: 'monospace', flexShrink: 0, width: 24, color: isActive ? '#4a7c6f' : 'rgba(255,255,255,0.12)' }}>
                      {p.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,2.3vw,30px)', lineHeight: 1.15, letterSpacing: '-0.3px', color: isActive ? '#f5f0e8' : 'rgba(245,240,232,0.5)', transition: 'color 0.2s' }}>
                        {p.name}
                      </div>
                      <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: isActive ? '64px' : '0px', opacity: isActive ? 1 : 0 }}>
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {p.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 500, background: 'rgba(74,124,111,0.14)', color: '#8abda8', border: '1px solid rgba(74,124,111,0.18)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                      <div style={{ fontSize: 11, color: isActive ? 'rgba(245,240,232,0.32)' : 'rgba(255,255,255,0.1)', transition: 'color 0.2s' }}>{p.college}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: isActive ? 'rgba(245,240,232,0.6)' : 'rgba(255,255,255,0.18)', transition: 'color 0.2s' }}>~{p.count} in Canada</div>
                    </div>
                    <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: `1px solid ${isActive ? 'rgba(74,124,111,0.45)' : 'rgba(255,255,255,0.07)'}`, background: isActive ? 'rgba(74,124,111,0.12)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                      <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, transform: isActive ? 'translateX(1px)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke={isActive ? '#8abda8' : 'rgba(255,255,255,0.18)'} strokeWidth="1.5">
                        <path d="M3 8h10M9 4l4 4-4 4"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.22)' }}>
            OTs, Dietitians, Speech-Language Pathologists, and more — coming soon.
          </p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, padding: '10px 18px', borderRadius: 8, background: 'rgba(74,124,111,0.16)', color: '#8abda8', border: '1px solid rgba(74,124,111,0.22)', textDecoration: 'none', transition: 'all 0.15s' }}>
            Start your free trial
            <svg viewBox="0 0 16 16" style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const cleanup = addStructuredData(mentalPathSchema);
    return cleanup;
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#060d09' }}>
      <SEO />
      <style>{`
        @keyframes mp-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .mp-ticker-track { animation: mp-ticker 50s linear infinite; display: flex; width: max-content; }
        .mp-ticker-track:hover { animation-play-state: paused; }
        @keyframes mp-float { 0%, 100% { transform: translateY(0) rotate(1.5deg); } 50% { transform: translateY(-14px) rotate(1.5deg); } }
        .mp-float { animation: mp-float 9s ease-in-out infinite; }
        @keyframes mp-float2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .mp-float2 { animation: mp-float2 7s ease-in-out 1s infinite; }
        @keyframes mp-pulse-glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.85; } }
        .mp-glow { animation: mp-pulse-glow 4s ease-in-out infinite; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5vw', height: 64,
        background: scrolled ? 'rgba(6,13,9,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.4s ease',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: '#4a7c6f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'white', strokeWidth: 1.8, strokeLinecap: 'round' }}>
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#f5f0e8', letterSpacing: '-0.3px' }}>MentalPath</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: t('nav.features'), href: '#features', anchor: true },
            { label: t('nav.compliance'), href: '#compliance', anchor: true },
            { label: t('nav.pricing'), href: '/subscribe', anchor: false },
            { label: t('nav.clientPortal'), href: '/client-portal', anchor: false },
          ].map(item => item.anchor ? (
            <a key={item.href} href={item.href} style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f5f0e8')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.5)')}
            >{item.label}</a>
          ) : (
            <Link key={item.href} to={item.href} style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', textDecoration: 'none' }}>{item.label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login" style={{ fontSize: 14, color: 'rgba(245,240,232,0.45)', textDecoration: 'none', padding: '8px 14px' }}>
            Sign in
          </Link>
          <Link to="/onboarding" style={{ fontSize: 14, fontWeight: 500, background: '#4a7c6f', color: 'white', textDecoration: 'none', padding: '9px 20px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#3d6b5e')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#4a7c6f')}
          >
            {t('nav.signUpFree')}
          </Link>
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ color: '#f5f0e8', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden flex flex-col" style={{ background: '#060d09' }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(74,124,111,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 64, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#4a7c6f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'white', strokeWidth: 1.8, strokeLinecap: 'round' }}>
                  <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
                  <path d="M8 11h8M8 14h5"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#f5f0e8' }}>MentalPath</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.5)', padding: 8 }}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px', gap: 0 }}>
            {[
              { label: t('nav.features'), href: '#features', anchor: true },
              { label: t('nav.compliance'), href: '#compliance', anchor: true },
              { label: t('nav.pricing'), href: '/subscribe', anchor: false },
              { label: t('nav.clientPortal'), href: '/client-portal', anchor: false },
              { label: t('nav.dashboard'), href: '/login', anchor: false },
            ].map((item, i) => item.anchor ? (
              <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, width: 20, color: '#4a7c6f' }}>0{i + 1}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.5px', color: 'rgba(245,240,232,0.85)' }}>{item.label}</span>
              </a>
            ) : (
              <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, width: 20, color: '#4a7c6f' }}>0{i + 1}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.5px', color: 'rgba(245,240,232,0.85)' }}>{item.label}</span>
              </Link>
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 10, padding: '24px 32px 40px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ marginBottom: 16 }}>
              <LanguageSwitcher />
            </div>
            <Link to="/onboarding" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '16px 0', borderRadius: 12, background: '#4a7c6f', color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              {t('nav.signUpFree')}
              <svg viewBox="0 0 16 16" style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </Link>
            <p style={{ textAlign: 'center', fontSize: 12, marginTop: 12, color: 'rgba(245,240,232,0.28)' }}>PHIPA-compliant · Canadian servers</p>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(160deg, #050c08 0%, #091410 55%, #060e0a 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64, paddingLeft: '5vw', paddingRight: '5vw', position: 'relative', overflow: 'hidden' }}>
        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(74,124,111,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,111,0.035) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        {/* Glow orbs */}
        <div className="mp-glow" style={{ position: 'absolute', top: '15%', right: '-8%', width: '50%', height: '65%', background: 'radial-gradient(ellipse at center, rgba(74,124,111,0.16) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '30%', width: '35%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(74,124,111,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', paddingTop: 56, paddingBottom: 96, position: 'relative', zIndex: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,124,111,0.12)', border: '1px solid rgba(74,124,111,0.22)', borderRadius: 24, padding: '7px 16px', fontSize: 12, color: '#8abda8', fontWeight: 500, marginBottom: 36, letterSpacing: '0.3px' }}>
              <span style={{ width: 6, height: 6, background: '#4a7c6f', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
              Made for Canadian practitioners · PHIPA-first
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(46px,6vw,80px)', lineHeight: 1.02, letterSpacing: '-2.5px', color: '#f5f0e8', marginBottom: 28 }}>
              Less admin.<br />
              More time with<br />
              <em style={{ fontStyle: 'italic', color: '#6aab95', letterSpacing: '-2px' }}>your clients.</em>
            </h1>

            <p style={{ fontSize: 17, fontWeight: 300, color: 'rgba(245,240,232,0.5)', lineHeight: 1.7, maxWidth: 460, marginBottom: 44 }}>
              Practice management built for Canadian regulated health practitioners — therapists, chiropractors, physiotherapists, RMTs, and more. PHIPA-compliant and priced for solo practice.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
              <Link to="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4a7c6f', color: 'white', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 500, boxShadow: '0 8px 40px rgba(74,124,111,0.32)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#3d6b5e'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#4a7c6f'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                {t('hero.cta')}
                <svg viewBox="0 0 16 16" style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </Link>
              <a href="#features" style={{ color: 'rgba(245,240,232,0.42)', fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.75)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.42)')}
              >
                {t('hero.seeHow')}
                <svg viewBox="0 0 16 16" style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 22px', fontSize: 12, color: 'rgba(245,240,232,0.28)' }}>
              {[t('hero.footer.noCreditCard'), t('hero.footer.canadianServers'), t('hero.footer.cancelAnytime')].map((label, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 3, height: 3, background: '#4a7c6f', borderRadius: '50%', display: 'inline-block' }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: floating dashboard */}
          <div className="hidden md:block" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(ellipse at 60% 40%, rgba(74,124,111,0.22) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Main dashboard card */}
            <div className="mp-float" style={{ position: 'relative', zIndex: 1, background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, overflow: 'hidden', backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}>
              {/* Titlebar */}
              <div style={{ height: 38, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginLeft: 10 }} />
              </div>

              <div style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: '#f5f0e8' }}>Good morning, Dr. Osei</span>
                  <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>Mon, Mar 16</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
                  {[{ v: '6', l: 'Sessions today' }, { v: '$840', l: 'Billed this week' }, { v: '23', l: 'Active clients' }].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(74,124,111,0.14)', border: '1px solid rgba(74,124,111,0.18)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: '#8abda8', fontWeight: 500, lineHeight: 1 }}>{s.v}</div>
                      <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.38)', marginTop: 4 }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.28)', marginBottom: 8 }}>Today&apos;s sessions</div>

                {[
                  { init: 'AM', initBg: 'rgba(74,124,111,0.28)', initColor: '#8abda8', name: 'Amara M.', time: '10:00 AM · 50 min · Individual', badge: 'Now', badgeBg: 'rgba(74,124,111,0.22)', badgeColor: '#8abda8' },
                  { init: 'JL', initBg: 'rgba(180,100,60,0.18)', initColor: '#c4845a', name: 'Jamal L.', time: '11:30 AM · 50 min · Individual', badge: 'Note due', badgeBg: 'rgba(200,140,30,0.15)', badgeColor: '#b8960a' },
                  { init: 'PK', initBg: 'rgba(80,120,180,0.18)', initColor: '#8ab0d8', name: 'Priya K.', time: '2:00 PM · 50 min · Couples', badge: 'Upcoming', badgeBg: 'rgba(255,255,255,0.06)', badgeColor: 'rgba(245,240,232,0.4)' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.initBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: s.initColor, flexShrink: 0 }}>{s.init}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#f5f0e8' }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)' }}>{s.time}</div>
                    </div>
                    <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: s.badgeBg, color: s.badgeColor, fontWeight: 600, letterSpacing: '0.3px' }}>{s.badge}</span>
                  </div>
                ))}

                <div style={{ marginTop: 14, background: 'rgba(74,124,111,0.1)', border: '1px solid rgba(74,124,111,0.18)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#6aab95', fontWeight: 500 }}>
                  <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z"/>
                    <path d="M5.5 8l1.5 1.5 3-3"/>
                  </svg>
                  Data stored in Canada · PHIPA compliant · Encrypted at rest
                </div>
              </div>
            </div>

            {/* Floating AI pill */}
            <div className="mp-float2" style={{ position: 'absolute', bottom: -28, right: -20, background: 'rgba(6,13,9,0.92)', border: '1px solid rgba(74,124,111,0.3)', borderRadius: 14, padding: '12px 18px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.55)', zIndex: 2 }}>
              <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.38)', marginBottom: 4 }}>AI note drafted</div>
              <div style={{ fontSize: 13, color: '#8abda8', fontWeight: 600 }}>Session with Amara M. →</div>
              <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.28)', marginTop: 3 }}>SOAP · Locks in 22h · PHIPA</div>
            </div>

            {/* Floating PHIPA pill */}
            <div style={{ position: 'absolute', top: -18, left: -18, background: 'rgba(74,124,111,0.18)', border: '1px solid rgba(74,124,111,0.28)', borderRadius: 12, padding: '8px 14px', backdropFilter: 'blur(16px)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, background: '#4a7c6f', borderRadius: '50%' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#8abda8', letterSpacing: '0.3px' }}>PHIPA · AWS ca-central-1</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(245,240,232,0.18)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', zIndex: 1 }}>
          <span>Scroll</span>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(74,124,111,0.5), transparent)' }} />
        </div>
      </section>

      {/* ── COMPLIANCE TICKER ── */}
      <div style={{ background: '#091410', borderTop: '1px solid rgba(74,124,111,0.12)', borderBottom: '1px solid rgba(74,124,111,0.12)', padding: '14px 0', overflow: 'hidden' }}>
        <div className="mp-ticker-track">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, padding: '0 28px', fontSize: 12, fontWeight: 500, letterSpacing: '0.5px', color: 'rgba(245,240,232,0.35)', whiteSpace: 'nowrap' }}>
              <span style={{ width: 4, height: 4, background: '#4a7c6f', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#0d1c16', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="grid grid-cols-1 sm:grid-cols-3">
          {[
            { stat: '25,000+', label: 'Regulated Canadian practitioners', sub: 'Therapists · DCs · PTs · RMTs · NDs' },
            { stat: '$49/mo', label: 'Solo practitioner plan', sub: 'Less than Jane App · More for Canada' },
            { stat: '7 days', label: 'Free trial, no card required', sub: 'Full feature access from day one' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '44px 40px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', borderRight: i < 2 ? 'none' : 'none', textAlign: 'center' }} className="border-b sm:border-b-0">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: 1, letterSpacing: '-2px', color: '#f5f0e8', marginBottom: 8 }}>{s.stat}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#6aab95', marginBottom: 5 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.28)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROFESSION SHOWCASE ── */}
      <ProfessionShowcase />

      {/* ── PROBLEM ── */}
      <section style={{ background: '#08100d', padding: '88px 5vw 108px' }} id="problem">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, color: '#4a7c6f', marginBottom: 20 }}>The real problem</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,3.8vw,50px)', lineHeight: 1.08, letterSpacing: '-1.5px', color: '#f5f0e8', marginBottom: 24 }}>
                Your US practice software<br />is <em style={{ fontStyle: 'italic', color: '#8abda8' }}>putting you at risk.</em>
              </h2>
              <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(245,240,232,0.48)', lineHeight: 1.75, marginBottom: 40 }}>
                TherapyNotes, TheraNest, SimplePractice — built for American practitioners, storing your clients&apos; most sensitive data on US servers. Your College doesn&apos;t accept that.
              </p>
              <Link to="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4a7c6f', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#3d6b5e')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#4a7c6f')}
              >
                Switch in one afternoon →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { badge: 'Privacy risk', title: 'US cloud violates PHIPA', desc: 'Ontario\'s PHIPA requires health data in Canada. Most US tools fail this test — leaving you exposed.' },
                { badge: '$400–1,200/yr', title: 'Enterprise pricing for solo work', desc: 'Jane App starts at $54/mo. Owl Practice at $89/mo. Built for 10-clinician groups, not solo practitioners.' },
                { badge: 'Missing context', title: 'Generic intake forms', desc: 'Newcomer trauma, racialized stress, cultural identity frameworks — not in any US intake library.' },
                { badge: '2–3 hrs/week', title: 'Fragmented tools', desc: 'Notes, billing, scheduling, portal — cobbled from 4 different vendors. MentalPath replaces all four.' },
              ].map((card, i) => (
                <div key={i} style={{ background: 'rgba(245,240,232,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#4a7c6f', background: 'rgba(74,124,111,0.14)', display: 'inline-block', padding: '3px 9px', borderRadius: 4, marginBottom: 10 }}>{card.badge}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f5f0e8', marginBottom: 8, lineHeight: 1.4 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.38)', lineHeight: 1.65 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section style={{ background: '#f2ede3', padding: '88px 5vw 108px' }} id="features">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, color: '#4a7c6f', marginBottom: 20 }}>What MentalPath does</div>
          <div className="flex justify-between items-end flex-wrap gap-6" style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,3.8vw,50px)', lineHeight: 1.08, letterSpacing: '-1.5px', color: '#1a1a18' }}>
              Everything you need.<br /><em style={{ fontStyle: 'italic', color: '#4a7c6f' }}>Nothing you don&apos;t.</em>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(26,26,24,0.52)', maxWidth: 340, lineHeight: 1.7 }}>
              Built for solo and small-group Canadian practitioners — not a port of a US product.
            </p>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {/* AI Notes — spans 2 */}
            <div style={{ gridColumn: 'span 2', background: '#172a22', borderRadius: 18, padding: 36, position: 'relative', overflow: 'hidden' }} className="md:col-span-2">
              <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, background: 'radial-gradient(ellipse, rgba(74,124,111,0.28), transparent)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#6aab95', marginBottom: 14 }}>AI Note Drafting</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, lineHeight: 1.3, color: '#f5f0e8', marginBottom: 12 }}>SOAP, DAP, BIRP notes drafted from your session notes — entirely on Canadian servers.</h3>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.65, marginBottom: 22 }}>Draft, review, sign. Notes locked after 24hrs and searchable across all clients.</p>
              <div style={{ background: 'rgba(245,240,232,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6aab95', marginBottom: 10 }}>Session Note — Amara M. · March 16</div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', lineHeight: 1.8, fontFamily: 'monospace' }}>
                  <span style={{ color: '#4a7c6f', fontWeight: 700 }}>S:</span> Client reports reduced sleep, 5–6hrs/night. Anxiety around job stability...<br />
                  <span style={{ color: '#4a7c6f', fontWeight: 700 }}>O:</span> Alert, appropriately groomed. Affect: anxious, labile...<br />
                  <span style={{ color: '#4a7c6f', fontWeight: 700, opacity: 0.4 }}>A: P: </span>
                  <span style={{ color: 'rgba(106,171,149,0.45)', fontStyle: 'italic' }}>AI drafting from your notes...</span>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div style={{ background: '#eee8db', border: '1px solid rgba(74,124,111,0.1)', borderRadius: 18, padding: 30 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#4a7c6f', marginBottom: 14 }}>Billing & Receipts</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, lineHeight: 1.35, color: '#1a1a18', marginBottom: 14 }}>Official insurance receipts, sliding scale, Stripe, T2125 export.</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['CAD billing', 'Sliding scale', 'Stripe', 'Tax export'].map(tag => (
                  <span key={tag} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, background: 'rgba(74,124,111,0.12)', color: '#2a5448', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {/* Scheduling */}
            <div style={{ background: '#0d1c16', border: '1px solid rgba(74,124,111,0.14)', borderRadius: 18, padding: 30 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#8abda8', marginBottom: 14 }}>Online Scheduling</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, lineHeight: 1.35, color: '#f5f0e8', marginBottom: 12 }}>Public booking link. SMS + email reminders. Google Calendar sync.</h3>
              <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.35)', lineHeight: 1.65 }}>Reduce no-shows by up to 40% with automated reminders sent 24hrs and 1hr before each session.</p>
            </div>

            {/* Client Portal */}
            <div style={{ background: '#4a7c6f', borderRadius: 18, padding: 30 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>Client Portal</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, lineHeight: 1.35, color: 'white', marginBottom: 12 }}>Secure portal for booking, intake forms, invoices, and encrypted messaging.</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>No app download required. Works on any device. PHIPA-compliant end-to-end.</p>
            </div>

            {/* Group Practice */}
            <div style={{ background: '#f5f0e8', border: '1px solid rgba(74,124,111,0.1)', borderRadius: 18, padding: 30 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#4a7c6f', marginBottom: 14 }}>Group Practice</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, lineHeight: 1.35, color: '#1a1a18', marginBottom: 12 }}>Multi-clinician calendars, owner dashboard, role-based access, payout reporting.</h3>
              <p style={{ fontSize: 12, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>Built for practices with 2–20 clinicians who need shared scheduling and separate billing.</p>
            </div>
          </div>

          {/* Row 3 — wide */}
          <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 18, padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#4a7c6f', marginBottom: 14 }}>Client Management</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, lineHeight: 1.3, color: '#1a1a18', marginBottom: 12 }}>Culturally-adapted intake forms. Full records. Consent management built-in.</h3>
                <p style={{ fontSize: 13, color: 'rgba(26,26,24,0.52)', lineHeight: 1.65 }}>Pre-built templates for newcomer trauma, BIPOC mental health, and intersectional frameworks — ready to use, fully customizable.</p>
              </div>
              <div style={{ flex: '1 1 240px', background: '#f2ede3', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#4a7c6f', marginBottom: 14 }}>Intake Templates</div>
                {['General Adult Intake', 'Newcomer Trauma Screen', 'BIPOC Mental Health', 'Culturally-adapted PHQ-9', 'Intersectional Stress Scale'].map((t, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(74,124,111,0.1)' : 'none' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#2a5448' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE ── */}
      <section style={{ background: '#060d09', padding: '88px 5vw 108px' }} id="compliance">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, color: '#4a7c6f', marginBottom: 28 }}>Built for Canada</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
              <div style={{ width: 76, height: 76, background: 'rgba(74,124,111,0.12)', border: '1px solid rgba(74,124,111,0.22)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 32 32" style={{ width: 42, height: 42 }} fill="none" stroke="#4a7c6f" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M16 2L4 8v8c0 6.6 4.8 12.8 12 14.4C23.2 28.8 28 22.6 28 16V8L16 2z"/>
                  <path d="M11 16l3 3 7-7"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5.5vw,68px)', lineHeight: 1.02, letterSpacing: '-2.5px', color: '#f5f0e8', maxWidth: 820, margin: '0 auto 24px' }}>
              Compliance isn&apos;t a feature.<br /><em style={{ fontStyle: 'italic', color: '#6aab95' }}>It&apos;s the foundation.</em>
            </h2>
            <p style={{ fontSize: 16, fontWeight: 300, color: 'rgba(245,240,232,0.42)', maxWidth: 520, margin: '0 auto' }}>
              Every architectural decision was made with PHIPA, PIPEDA, and College requirements in mind — not retrofitted, built-in from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { badge: 'PHIPA', icon: <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"/>, title: 'All data stored in Canada (AWS ca-central-1)', desc: 'Client records, session notes, billing — hosted exclusively in Montreal and Toronto data centres. Never routed through or accessible under US CLOUD Act.' },
              { badge: 'Encryption', icon: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>, title: 'AES-256 at rest · TLS 1.3 in transit', desc: 'Session notes encrypted with therapist-specific keys — even MentalPath staff cannot read your clinical notes.' },
              { badge: 'College standards', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></>, title: 'College-ready records and documentation', desc: 'Note formats, consent forms, and retention periods aligned with CRPO, OCSWSSW, CPO, and CPSBC requirements. Audit logs for every record access.' },
              { badge: 'Consent', icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>, title: 'Client consent management built-in', desc: 'Digital consent with timestamped e-signatures. Consent versioning — clients re-consent when your policy changes. Withdrawal recorded and respected automatically.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(245,240,232,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 16, padding: '30px 32px', display: 'flex', gap: 22, alignItems: 'flex-start' }}>
                <div style={{ width: 46, height: 46, background: 'rgba(74,124,111,0.14)', border: '1px solid rgba(74,124,111,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none" stroke="#8abda8" strokeWidth="1.5" strokeLinecap="round">
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#4a7c6f', background: 'rgba(74,124,111,0.14)', padding: '3px 9px', borderRadius: 4, display: 'inline-block', marginBottom: 10, letterSpacing: '0.3px' }}>{item.badge}</span>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#f5f0e8', marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.42)', lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: '#ffffff', padding: '88px 5vw 108px' }} id="pricing">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, color: '#4a7c6f', marginBottom: 20 }}>Simple pricing</div>
          <div className="flex justify-between items-end flex-wrap gap-6" style={{ marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,3.8vw,50px)', lineHeight: 1.08, letterSpacing: '-1.5px', color: '#1a1a18' }}>
              Pay less than Jane App.<br /><em style={{ fontStyle: 'italic', color: '#4a7c6f' }}>Get more for Canada.</em>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(26,26,24,0.52)', maxWidth: 320, lineHeight: 1.7 }}>
              No unit minimums. No surprise fees. Cancel any month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter */}
            <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '36px 32px', background: 'white', transition: 'transform 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'none')}
            >
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#4a7c6f', marginBottom: 16 }}>Starter</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: '#1a1a18', lineHeight: 1, marginBottom: 6 }}>Free</div>
              <div style={{ fontSize: 13, color: 'rgba(26,26,24,0.45)', marginBottom: 20 }}>forever · 1 active client</div>
              <div style={{ fontSize: 13, color: 'rgba(26,26,24,0.55)', lineHeight: 1.65, marginBottom: 28 }}>Try MentalPath with a real client before committing. Full feature access, single client limit.</div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', marginBottom: 24 }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['1 active client', 'All note templates', 'Canadian server storage', 'Basic scheduling'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(26,26,24,0.7)' }}>
                    <svg viewBox="0 0 16 16" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="8" cy="8" r="7.5" fill="#e8f5f1" stroke="#4a7c6f" strokeWidth="1"/><path d="M5 8l2 2 4-4" fill="none" stroke="#4a7c6f" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" style={{ display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 10, fontSize: 15, fontWeight: 500, border: '1.5px solid #4a7c6f', color: '#4a7c6f', textDecoration: 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(74,124,111,0.06)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                Get started free
              </Link>
            </div>

            {/* Solo — featured */}
            <div style={{ border: '2px solid #4a7c6f', borderRadius: 20, padding: '36px 32px', background: '#4a7c6f', position: 'relative', transform: 'scale(1.04)', boxShadow: '0 24px 64px rgba(74,124,111,0.3)', transition: 'transform 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.04) translateY(-4px)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.04)')}
            >
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#d4891a', color: 'white', fontSize: 11, fontWeight: 700, padding: '5px 16px', borderRadius: 20, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(212,137,26,0.4)' }}>Most popular</div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>Solo Practitioner</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: 'white', lineHeight: 1, marginBottom: 6 }}>$49</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>/month · unlimited clients</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 28 }}>Everything a solo Canadian practitioner needs. PHIPA-compliant from day one.</div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.18)', marginBottom: 24 }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Unlimited clients', 'SOAP / DAP / BIRP notes', 'AI session note assist', 'Online booking + reminders', 'Client portal + messaging', 'Billing + insurance receipts', 'Culturally-adapted intakes', 'T2125 tax export'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.88)' }}>
                    <svg viewBox="0 0 16 16" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="8" cy="8" r="7.5" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/><path d="M5 8l2 2 4-4" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" style={{ display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 10, fontSize: 15, fontWeight: 600, background: 'white', color: '#2a5448', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'background 0.2s' }}>
                Start 7-day free trial
              </Link>
            </div>

            {/* Group */}
            <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '36px 32px', background: 'white', transition: 'transform 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'none')}
            >
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#4a7c6f', marginBottom: 16 }}>Group Practice</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: '#1a1a18', lineHeight: 1, marginBottom: 6 }}>$79</div>
              <div style={{ fontSize: 13, color: 'rgba(26,26,24,0.45)', marginBottom: 20 }}>/month per clinician · 2+ clinicians</div>
              <div style={{ fontSize: 13, color: 'rgba(26,26,24,0.55)', lineHeight: 1.65, marginBottom: 28 }}>Multi-clinician scheduling, owner dashboard, separate billing, shared client management.</div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', marginBottom: 24 }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Everything in Solo', 'Multi-clinician calendar', 'Owner analytics dashboard', 'Role-based access control', 'Clinician payout reporting', 'Priority support'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(26,26,24,0.7)' }}>
                    <svg viewBox="0 0 16 16" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="8" cy="8" r="7.5" fill="#e8f5f1" stroke="#4a7c6f" strokeWidth="1"/><path d="M5 8l2 2 4-4" fill="none" stroke="#4a7c6f" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" style={{ display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 10, fontSize: 15, fontWeight: 500, background: '#1a1a18', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#2a5448')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#1a1a18')}
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#f2ede3', padding: '88px 5vw 108px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, color: '#4a7c6f', marginBottom: 20 }}>From practitioners</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,3.8vw,50px)', lineHeight: 1.08, letterSpacing: '-1.5px', color: '#1a1a18', marginBottom: 60 }}>
            Therapists who <em style={{ fontStyle: 'italic', color: '#4a7c6f' }}>switched.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'I was on TherapyNotes for 3 years until my College supervisor flagged the US storage issue. Switched to MentalPath in an afternoon. The culturally-adapted intake templates alone saved me two weeks of work.', name: 'Dr. Abena Osei-Mensah', role: 'Registered Psychotherapist · Toronto, ON', avatar: 'AO', avatarBg: '#d4e8e4', avatarColor: '#2a5448' },
              { quote: 'The sliding scale billing is exactly what I needed. Most of my clients are newcomers navigating their first year in Canada — being able to set rates per client without awkward workarounds changed how I run my practice.', name: 'Maya Rodriguez, MSW, RSW', role: 'Social Worker · Vancouver, BC', avatar: 'MR', avatarBg: '#e4d8d4', avatarColor: '#543028' },
              { quote: 'Switched from Jane App. $65/mo cheaper and the DAP note templates are actually better. My notes are compliant with my College\'s requirements right out of the box — I didn\'t configure a thing.', name: 'Dr. Kenji Nakamura', role: 'Clinical Psychologist · Calgary, AB', avatar: 'KN', avatarBg: '#d4d8e8', avatarColor: '#283054' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 18, padding: 32, boxShadow: '0 2px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ color: '#d4891a', fontSize: 14, letterSpacing: '3px', marginBottom: 18 }}>★★★★★</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#1a1a18', lineHeight: 1.55, fontStyle: 'italic', marginBottom: 24 }}>
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: t.avatarColor, flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a18' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(26,26,24,0.48)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: '#2a4f42', padding: '88px 5vw 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '160%', background: 'radial-gradient(ellipse at center, rgba(74,124,111,0.35) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(245,240,232,0.45)', marginBottom: 28 }}>Ready to start</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,5vw,60px)', lineHeight: 1.05, letterSpacing: '-2px', color: '#f5f0e8', marginBottom: 20 }}>
            Ready to focus on therapy,<br /><em style={{ fontStyle: 'italic', color: '#8abda8' }}>not admin?</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(245,240,232,0.52)', maxWidth: 480, margin: '0 auto 48px', fontWeight: 300, lineHeight: 1.7 }}>
            Start your free 7-day trial. No credit card required. Cancel anytime.
          </p>
          <div style={{ display: 'flex', gap: 10, maxWidth: 480, margin: '0 auto 20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input type="email" placeholder="your.email@practice.ca" style={{ flex: '1 1 240px', padding: '14px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.07)', color: '#f5f0e8', fontSize: 15, outline: 'none' }} />
            <Link to="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: '#2a5448', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
              Start trial →
            </Link>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)' }}>7-day free trial · No credit card required · PHIPA compliant</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060d09', padding: '52px 5vw 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: '#4a7c6f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'white', strokeWidth: 1.8, strokeLinecap: 'round' }}>
                    <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
                    <path d="M8 11h8M8 14h5"/>
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#f5f0e8' }}>MentalPath</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.28)', maxWidth: 260, lineHeight: 1.65 }}>
                Practice management built for Canadian regulated health practitioners. PHIPA & PIPEDA compliant.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', marginBottom: 16 }}>Product</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[{ label: 'Features', href: '#features', anchor: true }, { label: 'Pricing', href: '/subscribe', anchor: false }, { label: 'Client Portal', href: '/client-portal', anchor: false }].map(item => item.anchor ? (
                    <a key={item.href} href={item.href} style={{ fontSize: 14, color: 'rgba(245,240,232,0.42)', textDecoration: 'none', transition: 'color 0.2s' }}>{item.label}</a>
                  ) : (
                    <Link key={item.href} to={item.href} style={{ fontSize: 14, color: 'rgba(245,240,232,0.42)', textDecoration: 'none' }}>{item.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', marginBottom: 16 }}>Compliance</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['PHIPA', 'PIPEDA', 'College standards'].map(item => (
                    <a key={item} href="#compliance" style={{ fontSize: 14, color: 'rgba(245,240,232,0.42)', textDecoration: 'none' }}>{item}</a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', marginBottom: 16 }}>Company</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Privacy', 'Terms', 'Support'].map(item => (
                    <a key={item} href="#" style={{ fontSize: 14, color: 'rgba(245,240,232,0.42)', textDecoration: 'none' }}>{item}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.22)' }}>© 2026 MentalPath. Made in Canada. PHIPA & PIPEDA compliant.</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {['PHIPA', 'PIPEDA', 'ca-central-1'].map(badge => (
                <span key={badge} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'rgba(74,124,111,0.12)', color: '#6aab95', fontWeight: 500 }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
