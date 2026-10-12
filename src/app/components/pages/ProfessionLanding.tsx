import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Profession landing pages. All copy lives in professionPages.* (EN/FR) and
// describes only shipped features — no testimonials, savings figures or
// compliance certifications we cannot evidence (audit §10, P0-6).
export type ProfessionKey = 'therapists' | 'chiropractors' | 'physiotherapists' | 'massage' | 'naturopaths';
type FeatureKey = 'aiNotes' | 'templates' | 'outcomes' | 'receipts' | 'billing' | 'prep' | 'security' | 'group';

const FEATURES: Record<ProfessionKey, FeatureKey[]> = {
  therapists: ['aiNotes', 'outcomes', 'templates', 'billing'],
  chiropractors: ['templates', 'receipts', 'aiNotes', 'billing'],
  physiotherapists: ['templates', 'receipts', 'prep', 'billing'],
  massage: ['receipts', 'templates', 'aiNotes', 'billing'],
  naturopaths: ['templates', 'billing', 'prep', 'group'],
};

const ICONS: Record<FeatureKey, ReactNode> = {
  aiNotes: <><path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.37 2.63L14 7l-1.5 4.5L17 10l4.37-4.37a2.12 2.12 0 10-3-3z"/></>,
  templates: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></>,
  outcomes: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  receipts: <><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .7V2l-1 .7-3-2-3 2-3-2-3 2-3-2z"/><path d="M8 8h8M8 12h8"/></>,
  billing: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
  prep: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  security: <><path d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/></>,
  group: <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3.1a4 4 0 010 7.8M21 21v-2a4 4 0 00-3-3.9"/></>,
};

const PROTECTIONS = ['residency', 'mfa', 'encryption', 'retention'] as const;
const OTHER_PAGES: { key: ProfessionKey; to: string }[] = [
  { key: 'therapists', to: '/for-therapists' },
  { key: 'chiropractors', to: '/for-chiropractors' },
  { key: 'physiotherapists', to: '/for-physiotherapists' },
  { key: 'massage', to: '/for-massage-therapists' },
  { key: 'naturopaths', to: '/for-naturopaths' },
];

const Check = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M8 1L2 4v4c0 3 2 5.5 6 6 4-.5 6-3 6-6V4L8 1z"/>
    <path d="M5.5 8l1.5 1.5 3-3"/>
  </svg>
);

export function ProfessionLanding({ profession }: { profession: ProfessionKey }) {
  const { t } = useTranslation();
  const p = (key: string, opts?: Record<string, unknown>) => t(`professionPages.${profession}.${key}`, opts);
  const c = (key: string, opts?: Record<string, unknown>) => t(`professionPages.common.${key}`, opts);
  const problems = t(`professionPages.${profession}.problems`, { returnObjects: true }) as { tag: string; title: string; desc: string }[];

  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh' }}>
      <nav style={{ background: 'rgba(250,249,246,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[5vw] h-16" aria-label={c('navLabel')}>
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <svg viewBox="0 0 16 16" className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--ink-muted)' }} aria-hidden="true">
            <path d="M10 12L4 8l6-4"/>
          </svg>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--sage)' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[1.8] [stroke-linecap:round]" aria-hidden="true">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span className="text-base tracking-[-0.3px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>MentalPath</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--ink-soft)' }}>
          <a href="#features" className="no-underline hover:text-[var(--sage)] transition-colors" style={{ color: 'var(--ink-soft)' }}>{c('nav.features')}</a>
          <a href="#protection" className="no-underline hover:text-[var(--sage)] transition-colors" style={{ color: 'var(--ink-soft)' }}>{c('nav.privacy')}</a>
          <Link to="/#pricing" className="no-underline hover:text-[var(--sage)] transition-colors" style={{ color: 'var(--ink-soft)' }}>{c('nav.pricing')}</Link>
        </div>
        <Link to="/onboarding" className="text-white text-sm font-medium px-4 py-2 rounded-lg no-underline transition-all hover:-translate-y-px" style={{ background: 'var(--sage)' }}>
          {c('startTrial')}
        </Link>
      </nav>

      <main>
        <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-[5vw] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none hidden md:block"
            style={{ background: 'radial-gradient(ellipse at 80% 30%, var(--sage-pale) 0%, transparent 65%)' }}/>
          <div className="max-w-[700px] relative z-10">
            <div className="inline-flex items-center gap-2 rounded-[20px] px-3.5 py-1.5 text-[13px] font-medium mb-6"
              style={{ background: 'var(--sage-pale)', border: '1px solid rgba(74,124,111,0.2)', color: 'var(--sage-deep)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sage)' }}/>
              {p('badge')}
            </div>
            <h1 className="text-[clamp(38px,5vw,62px)] leading-[1.08] tracking-[-1.5px] mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              {p('heroTitle')}<br/>
              <em className="italic" style={{ color: 'var(--sage)' }}>{p('heroTitleItalic')}</em>
            </h1>
            <p className="text-[17px] font-light leading-[1.65] mb-8 max-w-[520px]" style={{ color: 'var(--ink-soft)' }}>{p('heroSubtitle')}</p>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link to="/onboarding" className="text-white px-7 py-3.5 rounded-[10px] text-[15px] font-medium no-underline transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--sage)', boxShadow: '0 4px 20px rgba(74,124,111,0.25)' }}>
                {c('startTrialArrow')}
              </Link>
              <a href="#features" className="text-[15px] no-underline flex items-center gap-1.5 transition-colors hover:text-[var(--sage)]" style={{ color: 'var(--ink-soft)' }}>
                {c('seeHow')}
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </a>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: 'var(--ink-muted)' }}>
              <span>{c('noCard')}</span><span className="hidden sm:block" aria-hidden="true">·</span>
              <span>{c('canadianServers')}</span><span className="hidden sm:block" aria-hidden="true">·</span>
              <span>{c('cancelAnytime')}</span>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-8 flex-wrap py-3.5 px-[5vw]"
          style={{ background: 'var(--sage-pale)', borderTop: '1px solid rgba(74,124,111,0.12)', borderBottom: '1px solid rgba(74,124,111,0.12)' }}>
          {PROTECTIONS.map(k => (
            <div key={k} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: 'var(--sage-deep)' }}>
              <Check />{c(`strip.${k}`)}
            </div>
          ))}
        </div>

        <section className="py-14 md:py-[90px] px-[5vw]" style={{ background: 'var(--ink)' }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-xs font-medium tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>{c('problemsEyebrow')}</div>
            <h2 className="text-[clamp(28px,3.5vw,42px)] leading-[1.15] tracking-[-0.5px] mb-12" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>
              {c('problemsTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
              {problems.map(pr => (
                <div key={pr.title} className="p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="inline-block text-[13px] font-medium px-2.5 py-1 rounded mb-3" style={{ background: 'rgba(74,124,111,0.2)', color: 'var(--sage-light)' }}>{pr.tag}</div>
                  <h3 className="text-base font-medium mb-2.5" style={{ color: 'white' }}>{pr.title}</h3>
                  <p className="text-sm leading-[1.6]" style={{ color: 'rgba(255,255,255,0.7)' }}>{pr.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-14 md:py-[90px] px-[5vw]" style={{ background: 'var(--white)' }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-xs font-medium tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--sage-deep)' }}>{p('featuresEyebrow')}</div>
            <h2 className="text-[clamp(28px,3vw,40px)] leading-[1.15] tracking-[-0.5px] mb-12" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              {c('featuresTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES[profession].map(f => (
                <div key={f} className="p-6 rounded-xl" style={{ background: 'var(--warm)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--sage-pale)' }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" strokeLinecap="round" stroke="var(--sage)" strokeWidth="1.6" aria-hidden="true">{ICONS[f]}</svg>
                  </div>
                  <h3 className="text-[15px] font-medium mb-2" style={{ color: 'var(--ink)' }}>{c(`features.${f}.title`)}</h3>
                  <p className="text-sm leading-[1.6]" style={{ color: 'var(--ink-muted)' }}>{c(`features.${f}.desc`, { college: p('college') })}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="protection" className="py-14 md:py-[90px] px-[5vw]" style={{ background: 'var(--warm)' }}>
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[clamp(24px,3vw,34px)] leading-[1.2] mb-8 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{c('protectionTitle')}</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {PROTECTIONS.map(k => (
                <li key={k} className="bg-white border border-[var(--border)] rounded-xl p-5">
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>{t(`compliance.controls.${k}.title`)}</h3>
                  <p className="text-[13px]" style={{ color: 'var(--ink-soft)' }}>{t(`compliance.controls.${k}.body`)}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs mt-6 text-center" style={{ color: 'var(--ink-muted)' }}>{t('compliance.custodian')}</p>
          </div>
        </section>

        <section className="py-14 md:py-[90px] px-[5vw] text-center" style={{ background: 'var(--sage-deep)' }}>
          <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.15] text-white mb-10" style={{ fontFamily: 'var(--font-display)' }}>{c('ctaTitle')}</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/onboarding" className="font-medium px-8 py-4 rounded-xl text-base no-underline transition-all hover:-translate-y-0.5"
              style={{ background: 'white', color: 'var(--sage-deep)' }}>
              {c('startTrialArrow')}
            </Link>
            <Link to="/#pricing" className="text-sm no-underline underline-offset-2 hover:underline" style={{ color: 'white' }}>{c('viewPricing')}</Link>
          </div>
        </section>
      </main>

      <footer className="py-8 px-[5vw] flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: 'var(--ink)' }}>
        <Link to="/" className="text-sm no-underline" style={{ color: 'rgba(255,255,255,0.75)' }}>MentalPath</Link>
        <nav aria-label={c('otherProfessions')} className="flex flex-wrap gap-6 text-xs">
          {OTHER_PAGES.map(o => (
            <Link key={o.key} to={o.to} className="no-underline hover:underline" style={{ color: 'rgba(255,255,255,0.75)' }}>{t(`professionPages.${o.key}.short`)}</Link>
          ))}
        </nav>
        <Link to="/privacy" className="text-xs no-underline hover:underline" style={{ color: 'rgba(255,255,255,0.75)' }}>{c('privacy')}</Link>
      </footer>
    </div>
  );
}
