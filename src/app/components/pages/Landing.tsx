import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { SEO, addStructuredData, mentalPathSchema } from '../../utils/seo';

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Add structured data for SEO
    const cleanup = addStructuredData(mentalPathSchema);
    return cleanup;
  }, []);

  return (
    <div className="bg-[var(--white)] min-h-screen">
      <SEO />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[5vw] h-16 bg-[var(--white)]/92 backdrop-blur-[12px] border-b border-[var(--border)]">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-[var(--sage)] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-white stroke-[1.8] [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span className="font-[var(--font-display)] text-lg text-[var(--ink)] tracking-[-0.3px]">MentalPath</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors">{t('nav.features')}</a>
          <a href="#compliance" className="text-sm text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors">{t('nav.compliance')}</a>
          <a href="#pricing" className="text-sm text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors">{t('nav.pricing')}</a>
          <Link to="/client-portal" className="text-sm text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors">{t('nav.clientPortal')}</Link>
          <Link to="/login" className="text-sm text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors">{t('nav.dashboard')}</Link>
          <LanguageSwitcher />
          <Link to="/onboarding" className="bg-[var(--sage)] text-white px-5 py-2.5 rounded-lg text-sm font-medium no-underline hover:bg-[var(--sage-deep)] transition-all hover:-translate-y-px">
            {t('nav.signUpFree')}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[var(--ink-soft)] hover:text-[var(--sage)] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[var(--white)] border-b border-[var(--border)] shadow-lg md:hidden">
            <div className="flex flex-col py-4 px-[5vw] gap-4">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors py-2"
              >
                {t('nav.features')}
              </a>
              <a 
                href="#compliance" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors py-2"
              >
                {t('nav.compliance')}
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors py-2"
              >
                {t('nav.pricing')}
              </a>
              <Link 
                to="/client-portal" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors py-2"
              >
                {t('nav.clientPortal')}
              </Link>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base text-[var(--ink-soft)] no-underline hover:text-[var(--sage)] transition-colors py-2"
              >
                {t('nav.dashboard')}
              </Link>
              <div className="border-t border-[var(--border)] pt-4 -mx-[5vw] px-[5vw]">
                <LanguageSwitcher />
              </div>
              <Link 
                to="/onboarding" 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[var(--sage)] text-white px-5 py-3 rounded-lg text-base font-medium no-underline hover:bg-[var(--sage-deep)] transition-all text-center mt-2"
              >
                {t('nav.signUpFree')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="md:min-h-screen grid md:grid-cols-2 items-center pt-16 md:pt-20 pb-10 md:pb-[60px] px-[5vw] gap-8 md:gap-[60px] relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[55%] h-[90%] bg-[radial-gradient(ellipse_at_center,var(--sage-pale)_0%,transparent_70%)] pointer-events-none hidden md:block"/>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[var(--sage-pale)] border border-[rgba(74,124,111,0.2)] rounded-[20px] px-3.5 py-1.5 text-[13px] font-medium text-[var(--sage-deep)] mb-6">
            <span className="w-1.5 h-1.5 bg-[var(--sage)] rounded-full"/>
            {t('hero.badge')}
          </div>
          
          <h1 className="font-[var(--font-display)] text-[clamp(38px,4.5vw,58px)] leading-[1.1] text-[var(--ink)] tracking-[-1px] mb-5">
            {t('hero.title.line1')}<br/>
            {t('hero.title.line2')} <em className="italic text-[var(--sage)]">{t('hero.title.line2Italic')}</em><br/>
            {t('hero.title.line3')}
          </h1>
          
          <p className="text-[17px] font-light text-[var(--ink-soft)] leading-[1.65] max-w-[460px] mb-9">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mb-8 md:mb-10">
            <Link to="/onboarding" className="bg-[var(--sage)] text-white px-7 py-3.5 rounded-[10px] text-[15px] font-medium no-underline hover:bg-[var(--sage-deep)] transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(74,124,111,0.25)]">
              {t('hero.cta')}
            </Link>
            <a href="#features" className="text-[var(--ink-soft)] text-[15px] no-underline flex items-center gap-1.5 hover:text-[var(--sage)] transition-colors">
              {t('hero.seeHow')}
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </a>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--ink-muted)]">
            <span>{t('hero.footer.noCreditCard')}</span>
            <span className="w-1 h-1 bg-[var(--ink-muted)] rounded-full hidden sm:block"/>
            <span>{t('hero.footer.canadianServers')}</span>
            <span className="w-1 h-1 bg-[var(--ink-muted)] rounded-full hidden sm:block"/>
            <span>{t('hero.footer.cancelAnytime')}</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative hidden md:block">
          <div className="bg-white rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-[var(--ink)] h-9 flex items-center px-3.5 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"/>
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"/>
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"/>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="font-[var(--font-display)] text-base text-[var(--ink)]">Good morning, Dr. Osei</div>
                <div className="text-[11px] text-[var(--ink-muted)]">Monday, March 16</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-[var(--sage-pale)] rounded-lg p-2.5">
                  <div className="text-lg font-medium text-[var(--sage-deep)] font-[var(--font-display)]">6</div>
                  <div className="text-[10px] text-[var(--sage)] mt-0.5">Sessions today</div>
                </div>
                <div className="bg-[var(--sage-pale)] rounded-lg p-2.5">
                  <div className="text-lg font-medium text-[var(--sage-deep)] font-[var(--font-display)]">$840</div>
                  <div className="text-[10px] text-[var(--sage)] mt-0.5">Billed this week</div>
                </div>
                <div className="bg-[var(--sage-pale)] rounded-lg p-2.5">
                  <div className="text-lg font-medium text-[var(--sage-deep)] font-[var(--font-display)]">23</div>
                  <div className="text-[10px] text-[var(--sage)] mt-0.5">Active clients</div>
                </div>
              </div>
              <div className="text-[10px] font-medium tracking-[0.8px] uppercase text-[var(--ink-muted)] mb-2">Today's sessions</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--warm)]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium bg-[#d4e8e4] text-[var(--sage-deep)]">AM</div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[var(--ink)]">Amara M.</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">10:00 AM · 50 min · Individual</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#e8f4f0] text-[var(--sage-deep)] font-medium">Now</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--warm)]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium bg-[#e8d4d4] text-[#7a3030]">JL</div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[var(--ink)]">Jamal L.</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">11:30 AM · 50 min · Individual</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#fef3e2] text-[#8a5a00] font-medium">Note due</span>
                </div>
              </div>
              <div className="mt-3 bg-[var(--sage-pale)] rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] text-[var(--sage-deep)] font-medium">
                <svg viewBox="0 0 16 16" className="w-3 h-3 flex-shrink-0 fill-none stroke-current stroke-[1.5]">
                  <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z"/>
                  <path d="M5.5 8l1.5 1.5 3-3"/>
                </svg>
                Data stored in Canada · PHIPA compliant · Encrypted at rest
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Strip */}
      <div className="bg-[var(--sage-pale)] py-3.5 px-[5vw] flex items-center justify-center gap-10 flex-wrap border-t border-b border-[rgba(74,124,111,0.12)]">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--sage-deep)]">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          PHIPA Compliant
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--sage-deep)]">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          PIPEDA Compliant
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--sage-deep)]">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
          Canadian servers (ca-central-1)
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--sage-deep)]">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
          College-ready records
        </div>
      </div>

      {/* Problem Section */}
      <section className="bg-[var(--ink)] text-white py-14 md:py-[100px] px-[5vw]" id="problem">
        <div className="text-xs font-medium tracking-[1.2px] uppercase text-[var(--sage-light)] mb-3">The real problem</div>
        <h2 className="font-[var(--font-display)] text-[clamp(30px,3.5vw,44px)] leading-[1.15] tracking-[-0.5px] mb-4">
          Your US therapy software<br/>is <em className="italic text-[var(--sage-light)]">putting you at risk</em>
        </h2>
        <p className="text-base font-light text-white/60 max-w-[520px] leading-[1.65] mb-[60px]">
          TherapyNotes, TheraNest, SimplePractice — built for American practitioners, storing your clients' most sensitive data on US servers. Your College doesn't accept that.
        </p>

        <div className="grid md:grid-cols-2 gap-0.5 rounded-xl overflow-hidden">
          <div className="bg-white/[0.04] p-9 border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
            <div className="inline-block bg-[rgba(74,124,111,0.2)] text-[var(--sage-light)] text-[13px] font-medium px-2.5 py-1 rounded mb-2.5">Privacy breach risk</div>
            <div className="text-base font-medium text-white mb-2.5">US cloud storage violates PHIPA</div>
            <div className="text-sm text-white/50 leading-[1.6]">Ontario's Personal Health Information Protection Act requires health data to be stored in Canada or encrypted in a way that prevents US law enforcement access. Most US tools fail this test.</div>
          </div>
          <div className="bg-white/[0.04] p-9 border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
            <div className="inline-block bg-[rgba(74,124,111,0.2)] text-[var(--sage-light)] text-[13px] font-medium px-2.5 py-1 rounded mb-2.5">$400–1,200/yr wasted</div>
            <div className="text-base font-medium text-white mb-2.5">Enterprise pricing for solo work</div>
            <div className="text-sm text-white/50 leading-[1.6]">Jane App starts at $54/mo and climbs fast. Owl Practice at $89/mo. You're paying for features built for 10-clinician group practices. 70% of Canadian therapists work solo or in pairs.</div>
          </div>
          <div className="bg-white/[0.04] p-9 border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
            <div className="inline-block bg-[rgba(74,124,111,0.2)] text-[var(--sage-light)] text-[13px] font-medium px-2.5 py-1 rounded mb-2.5">Missing: cultural context</div>
            <div className="text-base font-medium text-white mb-2.5">Generic intake forms miss your clients</div>
            <div className="text-sm text-white/50 leading-[1.6]">Newcomer trauma, racialized stress, cultural identity, and community-specific mental health frameworks aren't in any standard intake library. You're building these from scratch every time.</div>
          </div>
          <div className="bg-white/[0.04] p-9 border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
            <div className="inline-block bg-[rgba(74,124,111,0.2)] text-[var(--sage-light)] text-[13px] font-medium px-2.5 py-1 rounded mb-2.5">2–3 hrs/week on admin</div>
            <div className="text-base font-medium text-white mb-2.5">Notes, billing, scheduling — all fragmented</div>
            <div className="text-sm text-white/50 leading-[1.6]">Most practitioners cobble together a scheduling tool, a notes app, a payment processor, and a client portal from separate vendors. MentalPath replaces all four for less than you're spending on one.</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--white)] py-14 md:py-[100px] px-[5vw]" id="features">
        <div className="max-w-[1200px]">
          <div className="text-xs font-medium tracking-[1.2px] uppercase text-[var(--sage)] mb-3">What MentalPath does</div>
          <h2 className="font-[var(--font-display)] text-[clamp(30px,3.5vw,44px)] leading-[1.15] tracking-[-0.5px] mb-4">
            Everything you need.<br/><em className="italic text-[var(--sage)]">Nothing you don't.</em>
          </h2>
          <p className="text-base font-light text-[var(--ink-soft)] max-w-[520px] leading-[1.65] mb-[80px]">
            Built for the solo or small-group Canadian practitioner. Not a port of a US product — purpose-built for how you work.
          </p>

          <div className="space-y-0">
            {[
              {
                num: '01',
                title: 'Client management + culturally-adapted profiles',
                desc: 'Full client records with intake forms, session history, consent management, and document storage. Pre-built intake templates for newcomer trauma, BIPOC mental health, and intersectional stress frameworks — ready to customize.',
                tags: ['Cultural formulation', 'Consent e-sign', 'Document storage', 'Sliding scale']
              },
              {
                num: '02',
                title: 'Session notes + AI-assisted documentation',
                desc: 'SOAP, DAP, BIRP, and progress note templates. Optional AI session summary draft (stays on Canadian servers, never sent to US). Note history, searchable, linked to each client. Notes locked after 24hrs to prevent accidental edits.',
                tags: ['SOAP / DAP / BIRP', 'AI draft assist', '24hr lock', 'Searchable']
              },
              {
                num: '03',
                title: 'Billing, invoicing + sliding scale management',
                desc: 'Generate official receipts for client insurance claims, track payments, send outstanding invoice reminders. Sliding scale rate management per client. Stripe integration for card payments. Export T2200 / self-employment income summaries at tax time.',
                tags: ['Stripe payments', 'Sliding scale', 'Insurance receipts', 'Tax export']
              },
              {
                num: '04',
                title: 'Client portal + secure messaging',
                desc: 'Clients access their own portal to book appointments, complete intake forms, view invoices, and message you securely — all PHIPA-compliant. No app download required. Works on any device.',
                tags: ['Self-booking', 'Secure messaging', 'No app needed']
              },
              {
                num: '05',
                title: 'Online scheduling + automated reminders',
                desc: 'Share your booking link. Clients pick from your available slots. Automated SMS + email reminders reduce no-shows by 40%. Google Calendar sync. Session types: individual, couples, family, group.',
                tags: ['Booking link', 'SMS reminders', 'Google Calendar']
              }
            ].map((feature, i) => (
              <div key={i} className="flex gap-5 py-7 border-b border-[var(--border)] first:border-t hover:bg-[var(--warm)]/30 px-3 -mx-3 rounded-lg transition-colors">
                <div className="font-[var(--font-display)] text-[13px] text-[var(--ink-muted)] min-w-[28px] pt-0.5">{feature.num}</div>
                <div className="flex-1">
                  <div className="text-base font-medium text-[var(--ink)] mb-1.5">{feature.title}</div>
                  <div className="text-sm text-[var(--ink-muted)] leading-[1.6] mb-2.5">{feature.desc}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.tags.map((tag, j) => (
                      <span key={j} className="text-[11px] px-2.5 py-1 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)]">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="bg-[var(--warm)] py-14 md:py-[100px] px-[5vw]" id="compliance">
        <div className="text-xs font-medium tracking-[1.2px] uppercase text-[var(--sage)] mb-3">Built for Canada</div>
        <h2 className="font-[var(--font-display)] text-[clamp(30px,3.5vw,44px)] leading-[1.15] tracking-[-0.5px] mb-4">
          Compliance isn't a feature.<br/><em className="italic text-[var(--sage)]">It's the foundation.</em>
        </h2>
        <p className="text-base font-light text-[var(--ink-soft)] max-w-[520px] leading-[1.65] mb-[60px]">
          Every architectural decision was made with PHIPA, PIPEDA, and College requirements in mind. Not retrofitted — built-in from day one.
        </p>

        <div className="grid md:grid-cols-2 gap-10 md:gap-[60px] items-center">
          <div className="space-y-5">
            {[
              {
                icon: <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"/>,
                title: 'All data stored in Canada (AWS ca-central-1)',
                desc: 'Client records, session notes, billing data — hosted exclusively in Montreal and Toronto data centres. Never routed through or accessible under US CLOUD Act.'
              },
              {
                icon: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
                title: 'End-to-end encryption at rest + in transit',
                desc: 'AES-256 encryption for stored data, TLS 1.3 for all connections. Session notes encrypted with therapist-specific keys — even MentalPath staff cannot read your clinical notes.'
              },
              {
                icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
                title: 'College-ready records and documentation',
                desc: 'Note formats, consent forms, and retention periods aligned with CRPO, OCSWSSW, CPO, and CPSBC requirements. Audit logs for every record access.'
              },
              {
                icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
                title: 'Client consent management built-in',
                desc: 'Digital consent forms with timestamped e-signatures. Consent versioning — clients re-consent when your privacy policy changes. Consent withdrawal recorded and respected automatically.'
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-11 h-11 flex-shrink-0 bg-white rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] stroke-[var(--sage)] stroke-[1.5] fill-none [stroke-linecap:round]">
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mb-1">{item.title}</div>
                  <div className="text-sm text-[var(--ink-muted)] leading-[1.6]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🛡️', name: 'PHIPA', desc: 'Ontario\'s Personal Health Information Protection Act - fully compliant' },
              { icon: '🔒', name: 'PIPEDA', desc: 'Federal privacy law - all personal data handled per PIPEDA requirements' },
              { icon: '🍁', name: 'Canada-only hosting', desc: 'AWS ca-central-1 - Montreal + Toronto - No US routing' },
              { icon: '📋', name: 'College standards', desc: 'CRPO, OCSWSSW, CPO, CPSBC record requirements met' }
            ].map((badge, i) => (
              <div key={i} className="bg-white rounded-xl p-5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-[var(--border)]">
                <div className="text-[28px] mb-2">{badge.icon}</div>
                <div className="text-sm font-medium text-[var(--ink)] mb-1">{badge.name}</div>
                <div className="text-xs text-[var(--ink-muted)] leading-[1.4]">{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[var(--white)] py-14 md:py-[100px] px-[5vw]" id="pricing">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-medium tracking-[1.2px] uppercase text-[var(--sage)] mb-3">Simple pricing</div>
          <h2 className="font-[var(--font-display)] text-[clamp(30px,3.5vw,44px)] leading-[1.15] tracking-[-0.5px] mb-4">
            Pay less than Jane App.<br/><em className="italic text-[var(--sage)]">Get more for Canada.</em>
          </h2>
          <p className="text-base font-light text-[var(--ink-soft)] max-w-[520px] leading-[1.65] mb-[60px]">
            No unit minimums. No surprise fees. Cancel any month. Built so solo practitioners can actually afford to run a compliant practice.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-[1100px] mx-auto px-6">
            <div className="border border-[var(--border)] rounded-2xl p-8 hover:-translate-y-1 transition-transform bg-white">
              <div className="text-center">
                <div className="text-xs font-medium tracking-[0.8px] uppercase text-[var(--sage)] mb-3">Starter</div>
                <div className="font-[var(--font-display)] text-[48px] text-[var(--ink)] leading-none mb-1">Free</div>
                <div className="text-sm text-[var(--ink-muted)] mb-4">forever · 1 active client</div>
              </div>
              <div className="text-sm text-[var(--ink-soft)] mb-6 leading-[1.6] text-center">Try MentalPath with a real client before committing. Full feature access, single client limit.</div>
              <hr className="border-t border-[var(--border)] mb-6"/>
              <ul className="space-y-3 mb-8 list-none">
                {['1 active client', 'All note templates', 'Canadian server storage', 'Basic scheduling'].map((f, i) => (
                  <li key={i} className="text-sm text-[var(--ink-soft)] flex items-start gap-3">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="7.5" fill="var(--sage-pale)" stroke="var(--sage)" strokeWidth="1"/>
                      <path d="M5 8l2 2 4-4" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className="block w-full py-3.5 rounded-[10px] text-[15px] font-medium text-center bg-transparent border-[1.5px] border-[var(--sage)] text-[var(--sage)] no-underline hover:bg-[var(--sage-pale)] transition-colors">
                Get started free
              </Link>
            </div>

            <div className="border-2 border-[var(--sage)] rounded-2xl p-8 bg-[var(--sage)] text-white relative hover:-translate-y-2 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.12)] scale-105">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-white text-[11px] font-semibold px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">Most popular</div>
              <div className="text-center">
                <div className="text-xs font-medium tracking-[0.8px] uppercase text-white/70 mb-3">Solo Practitioner</div>
                <div className="font-[var(--font-display)] text-[48px] leading-none mb-1">$49</div>
                <div className="text-sm text-white/60 mb-4">/month · unlimited clients</div>
              </div>
              <div className="text-sm text-white/75 mb-6 leading-[1.6] text-center">Everything a solo therapist, social worker, or psychotherapist needs. PHIPA-compliant from day one.</div>
              <hr className="border-t border-white/20 mb-6"/>
              <ul className="space-y-3 mb-8 list-none">
                {['Unlimited clients', 'All note formats (SOAP, DAP, BIRP)', 'AI session note assist', 'Online booking + reminders', 'Client portal + secure messaging', 'Billing + invoice + receipts', 'Culturally-adapted intake forms', 'Tax export (T2125 prep)'].map((f, i) => (
                  <li key={i} className="text-sm text-white/90 flex items-start gap-3">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="7.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                      <path d="M5 8l2 2 4-4" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className="block w-full py-3.5 rounded-[10px] text-[15px] font-semibold text-center bg-white text-[var(--sage-deep)] no-underline hover:bg-[var(--sage-pale)] transition-colors shadow-sm">
                Start 7-day free trial
              </Link>
            </div>

            <div className="border border-[var(--border)] rounded-2xl p-8 hover:-translate-y-1 transition-transform bg-white">
              <div className="text-center">
                <div className="text-xs font-medium tracking-[0.8px] uppercase text-[var(--sage)] mb-3">Group Practice</div>
                <div className="font-[var(--font-display)] text-[48px] text-[var(--ink)] leading-none mb-1">$79</div>
                <div className="text-sm text-[var(--ink-muted)] mb-4">/month per clinician · 2+ clinicians</div>
              </div>
              <div className="text-sm text-[var(--ink-soft)] mb-6 leading-[1.6] text-center">Multi-clinician scheduling, owner dashboard, separate billing per clinician, shared client base management.</div>
              <hr className="border-t border-[var(--border)] mb-6"/>
              <ul className="space-y-3 mb-8 list-none">
                {['Everything in Solo', 'Multi-clinician calendar', 'Owner analytics dashboard', 'Role-based access control', 'Clinician payout reporting', 'Priority support'].map((f, i) => (
                  <li key={i} className="text-sm text-[var(--ink-soft)] flex items-start gap-3">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="7.5" fill="var(--sage-pale)" stroke="var(--sage)" strokeWidth="1"/>
                      <path d="M5 8l2 2 4-4" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className="block w-full py-3.5 rounded-[10px] text-[15px] font-medium text-center bg-[var(--ink)] text-white no-underline hover:bg-[var(--sage-deep)] transition-colors">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[var(--sage-pale)] py-14 md:py-[100px] px-[5vw]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-medium tracking-[1.2px] uppercase text-[var(--sage)] mb-3">From practitioners</div>
          <h2 className="font-[var(--font-display)] text-[clamp(30px,3.5vw,44px)] leading-[1.15] tracking-[-0.5px] mb-4">
            Therapists who <em className="italic text-[var(--sage)]">switched</em>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-5 mt-[50px]">
            {[
              {
                quote: "I was on TherapyNotes for 3 years until my College supervisor flagged the US storage issue. Switched to MentalPath in an afternoon. The culturally-adapted intake templates alone saved me two weeks of work.",
                name: "Dr. Abena Osei-Mensah",
                role: "Registered Psychotherapist · Toronto, ON",
                avatar: "AO"
              },
              {
                quote: "The sliding scale billing feature is exactly what I needed. Most of my clients are newcomers navigating their first year in Canada - being able to set rates per client without awkward workarounds changed how I run my practice.",
                name: "Maya Rodriguez, MSW, RSW",
                role: "Social Worker · Vancouver, BC",
                avatar: "MR"
              },
              {
                quote: "Switched from Jane App. It's $65/mo cheaper and the DAP note templates are actually better. My notes are compliant with my College's requirements right out of the box - I didn't have to configure anything.",
                name: "Dr. Kenji Nakamura",
                role: "Clinical Psychologist · Calgary, AB",
                avatar: "KN"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="text-[var(--gold)] text-sm mb-3.5 tracking-[2px]">★★★★★</div>
                <div className="font-[var(--font-display)] text-[17px] text-[var(--ink)] leading-[1.5] italic mb-5">
                  "{testimonial.quote}"
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--sage-pale)] flex items-center justify-center text-sm font-medium text-[var(--sage-deep)] flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--ink)]">{testimonial.name}</div>
                    <div className="text-xs text-[var(--ink-muted)]">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--sage-deep)] text-center py-14 md:py-[100px] px-[5vw]">
        <h2 className="font-[var(--font-display)] text-[clamp(32px,4vw,48px)] leading-[1.15] text-white mb-4">
          Ready to focus on <em className="italic text-[var(--sage-light)]">therapy,</em><br/>not admin?
        </h2>
        <p className="text-base text-white/60 max-w-[520px] mx-auto mb-10 leading-[1.65]">
          Start your free 7-day trial. No credit card required. Cancel anytime.
        </p>
        <div className="flex gap-2.5 max-w-[460px] mx-auto mb-4">
          <input 
            type="email" 
            placeholder="your.email@example.com" 
            className="flex-1 px-4 py-3 rounded-[9px] border border-white/20 bg-white/[0.08] text-white text-[15px] outline-none focus:border-[var(--sage-light)] transition-colors placeholder:text-white/40"
          />
          <Link to="/onboarding" className="bg-white text-[var(--sage-deep)] px-7 py-3 rounded-[9px] text-[15px] font-medium no-underline hover:bg-[var(--sage-pale)] transition-colors whitespace-nowrap">
            Start trial →
          </Link>
        </div>
        <div className="text-xs text-white/40">7-day free trial · No credit card required · PHIPA compliant</div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--ink)] text-white/40 py-12 px-[5vw]">
        <div className="flex justify-between items-center flex-wrap gap-5 mb-6">
          <div className="font-[var(--font-display)] text-xl text-white">MentalPath</div>
          <div className="flex gap-7">
            <a href="#features" className="text-[13px] no-underline hover:text-white/80 transition-colors">Features</a>
            <a href="#compliance" className="text-[13px] no-underline hover:text-white/80 transition-colors">Compliance</a>
            <a href="#pricing" className="text-[13px] no-underline hover:text-white/80 transition-colors">Pricing</a>
            <a href="#" className="text-[13px] no-underline hover:text-white/80 transition-colors">Privacy</a>
            <a href="#" className="text-[13px] no-underline hover:text-white/80 transition-colors">Terms</a>
          </div>
        </div>
        <div className="border-t border-white/[0.08] pt-6 text-xs">
          © 2026 MentalPath. Made in Canada. PHIPA & PIPEDA compliant. For Canadian mental health practitioners.
        </div>
      </footer>
    </div>
  );
}