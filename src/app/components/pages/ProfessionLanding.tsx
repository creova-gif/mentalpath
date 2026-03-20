import { Link } from 'react-router';
import type { ReactNode } from 'react';

export interface ProfessionConfig {
  name: string;
  namePlural: string;
  regBody: string;
  badge: string;
  heroTitle: string;
  heroTitleItalic: string;
  heroSubtitle: string;
  problems: Array<{ tag: string; title: string; desc: string }>;
  features: Array<{ title: string; desc: string; icon: ReactNode }>;
  testimonial: { quote: string; name: string; title: string };
  college: string;
  collegeStandard: string;
  accentStat: { number: string; label: string };
}

export function ProfessionLanding({ config }: { config: ProfessionConfig }) {
  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(250,249,246,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[5vw] h-16">
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <svg viewBox="0 0 16 16" className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--ink-muted)' }}>
            <path d="M10 12L4 8l6-4"/>
          </svg>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--sage)' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[1.8] [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
              <path d="M8 11h8M8 14h5"/>
            </svg>
          </div>
          <span className="text-base tracking-[-0.3px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>MentalPath</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--ink-soft)' }}>
          <a href="#features" className="no-underline hover:text-[var(--sage)] transition-colors" style={{ color: 'var(--ink-soft)' }}>Features</a>
          <a href="#compliance" className="no-underline hover:text-[var(--sage)] transition-colors" style={{ color: 'var(--ink-soft)' }}>Compliance</a>
          <Link to="/#pricing" className="no-underline hover:text-[var(--sage)] transition-colors" style={{ color: 'var(--ink-soft)' }}>Pricing</Link>
        </div>
        <Link to="/onboarding"
          className="text-white text-sm font-medium px-4 py-2 rounded-lg no-underline transition-all hover:-translate-y-px"
          style={{ background: 'var(--sage)' }}>
          Start free trial
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-[5vw] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none hidden md:block"
          style={{ background: 'radial-gradient(ellipse at 80% 30%, var(--sage-pale) 0%, transparent 65%)' }}/>
        <div className="max-w-[700px] relative z-10">
          <div className="inline-flex items-center gap-2 rounded-[20px] px-3.5 py-1.5 text-[13px] font-medium mb-6"
            style={{ background: 'var(--sage-pale)', border: '1px solid rgba(74,124,111,0.2)', color: 'var(--sage-deep)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sage)' }}/>
            {config.badge}
          </div>
          <h1 className="text-[clamp(38px,5vw,62px)] leading-[1.08] tracking-[-1.5px] mb-6"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            {config.heroTitle}<br/>
            <em className="italic" style={{ color: 'var(--sage)' }}>{config.heroTitleItalic}</em>
          </h1>
          <p className="text-[17px] font-light leading-[1.65] mb-8 max-w-[520px]" style={{ color: 'var(--ink-soft)' }}>
            {config.heroSubtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link to="/onboarding"
              className="text-white px-7 py-3.5 rounded-[10px] text-[15px] font-medium no-underline transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--sage)', boxShadow: '0 4px 20px rgba(74,124,111,0.25)' }}>
              Start your free trial →
            </Link>
            <a href="#features" className="text-[15px] no-underline flex items-center gap-1.5 transition-colors hover:text-[var(--sage)]" style={{ color: 'var(--ink-soft)' }}>
              See how it works
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </a>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: 'var(--ink-muted)' }}>
            <span>No credit card required</span>
            <span className="hidden sm:block">·</span>
            <span>Canadian servers (PHIPA)</span>
            <span className="hidden sm:block">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* Stat card */}
        <div className="absolute right-[8vw] top-[40%] hidden lg:flex flex-col items-center justify-center w-[160px] h-[160px] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]"
          style={{ background: 'white' }}>
          <div className="text-[42px] font-light tracking-[-2px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--sage)' }}>
            {config.accentStat.number}
          </div>
          <div className="text-[11px] text-center leading-[1.4] mt-1 px-3" style={{ color: 'var(--ink-muted)' }}>
            {config.accentStat.label}
          </div>
        </div>
      </section>

      {/* Compliance strip */}
      <div className="flex items-center justify-center gap-8 flex-wrap py-3.5 px-[5vw]"
        style={{ background: 'var(--sage-pale)', borderTop: '1px solid rgba(74,124,111,0.12)', borderBottom: '1px solid rgba(74,124,111,0.12)' }}>
        {[
          { label: 'PHIPA Compliant' },
          { label: 'PIPEDA Compliant' },
          { label: 'Canadian servers' },
          { label: config.collegeStandard },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: 'var(--sage-deep)' }}>
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 1L2 4v4c0 3 2 5.5 6 6 4-.5 6-3 6-6V4L8 1z"/>
              <path d="M5.5 8l1.5 1.5 3-3"/>
            </svg>
            {item.label}
          </div>
        ))}
      </div>

      {/* Problems */}
      <section className="py-14 md:py-[90px] px-[5vw]" style={{ background: 'var(--ink)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-medium tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>The real problem</div>
          <h2 className="text-[clamp(28px,3.5vw,42px)] leading-[1.15] tracking-[-0.5px] mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'white' }}>
            Your current tools<br/>are <em className="italic" style={{ color: 'var(--sage-light)' }}>working against you</em>
          </h2>
          <p className="text-base font-light leading-[1.65] mb-12 max-w-[520px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Practice management software built for US providers doesn't understand Canadian regulations, your College's standards, or your billing reality.
          </p>
          <div className="grid md:grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
            {config.problems.map((p) => (
              <div key={p.title} className="p-8 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                <div className="inline-block text-[13px] font-medium px-2.5 py-1 rounded mb-3"
                  style={{ background: 'rgba(74,124,111,0.2)', color: 'var(--sage-light)' }}>
                  {p.tag}
                </div>
                <div className="text-base font-medium mb-2.5" style={{ color: 'white' }}>{p.title}</div>
                <div className="text-sm leading-[1.6]" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14 md:py-[90px] px-[5vw]" style={{ background: 'var(--white)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-medium tracking-[1.2px] uppercase mb-3" style={{ color: 'var(--sage)' }}>What MentalPath does for {config.namePlural}</div>
          <h2 className="text-[clamp(28px,3vw,40px)] leading-[1.15] tracking-[-0.5px] mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Everything you need.<br/><em className="italic" style={{ color: 'var(--sage)' }}>Nothing you don't.</em>
          </h2>
          <p className="text-base font-light leading-[1.65] mb-12 max-w-[500px]" style={{ color: 'var(--ink-soft)' }}>
            Built to the standards of {config.regBody} — so your records are always inspection-ready.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl"
                style={{ background: 'var(--warm)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'var(--sage-pale)' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" strokeLinecap="round"
                    stroke="var(--sage)" strokeWidth="1.6">
                    {f.icon}
                  </svg>
                </div>
                <div className="text-[15px] font-medium mb-2" style={{ color: 'var(--ink)' }}>{f.title}</div>
                <div className="text-sm leading-[1.6]" style={{ color: 'var(--ink-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section id="compliance" className="py-14 md:py-[90px] px-[5vw]" style={{ background: 'var(--warm)' }}>
        <div className="max-w-[700px] mx-auto text-center">
          <div className="text-[13px] font-medium mb-6" style={{ color: 'var(--sage)' }}>From a {config.name}</div>
          <blockquote className="text-[clamp(20px,2.5vw,28px)] font-light leading-[1.5] tracking-[-0.3px] mb-8"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontStyle: 'italic' }}>
            "{config.testimonial.quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ background: 'var(--sage-pale)', color: 'var(--sage-deep)' }}>
              {config.testimonial.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{config.testimonial.name}</div>
              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{config.testimonial.title}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-14 md:py-[90px] px-[5vw] text-center" style={{ background: 'var(--sage-deep)' }}>
        <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.15] text-white mb-4"
          style={{ fontFamily: 'var(--font-display)' }}>
          Ready to focus on <em className="italic" style={{ color: 'var(--sage-light)' }}>your clients,</em><br/>not the admin?
        </h2>
        <p className="text-base leading-[1.65] mb-10 max-w-[480px] mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Join Canadian {config.namePlural} using MentalPath to stay PHIPA-compliant, bill faster, and spend more time in the room.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link to="/onboarding"
            className="text-white font-medium px-8 py-4 rounded-xl text-base no-underline transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--sage)', boxShadow: '0 4px 24px rgba(74,124,111,0.4)' }}>
            Start your free trial →
          </Link>
          <Link to="/#pricing" className="text-sm no-underline transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
            View pricing
          </Link>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          No credit card · Canadian servers · {config.regBody}
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 px-[5vw] flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--sage)' }}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-white stroke-[1.8] [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
            </svg>
          </div>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>MentalPath</span>
        </Link>
        <div className="flex gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <Link to="/for-therapists" className="no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Therapists</Link>
          <Link to="/for-chiropractors" className="no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Chiropractors</Link>
          <Link to="/for-physiotherapists" className="no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Physiotherapists</Link>
          <Link to="/for-massage-therapists" className="no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>RMTs</Link>
          <Link to="/for-naturopaths" className="no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Naturopaths</Link>
        </div>
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>PHIPA · PIPEDA · Canadian servers</div>
      </footer>
    </div>
  );
}
