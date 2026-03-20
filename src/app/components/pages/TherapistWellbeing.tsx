import { useState, useEffect } from 'react';
import { Shield, FileText, Eye, Lock } from 'lucide-react';

export function TherapistWellbeing() {
  const [energy, setEnergy] = useState(6);
  const [emotionalLoad, setEmotionalLoad] = useState(7);
  const [satisfaction, setSatisfaction] = useState(7);
  const [vtFlags, setVtFlags] = useState({
    intrusive: false,
    sleep: true,
    dread: false
  });

  // Intersection Observer for fade-up animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#F5F0E8] min-h-screen overflow-x-hidden">
      <style>{`
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-instrument { font-family: 'Instrument Sans', sans-serif; }
        .fade-up { 
          opacity: 0; 
          transform: translateY(24px); 
          transition: opacity 0.7s ease, transform 0.7s ease; 
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Instrument+Sans:ital,wght@0,400;0,500;1,400&display=swap');
      `}</style>

      {/* MASTHEAD */}
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left side */}
        <div className="bg-[#1C1A16] p-[60px_56px] flex flex-col justify-between relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full bg-[rgba(74,124,111,0.08)]"></div>
          <div className="absolute bottom-[-80px] left-[-80px] w-[280px] h-[280px] rounded-full bg-[rgba(74,124,111,0.05)]"></div>

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 bg-[#4A7C6F] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z" />
                <path d="M8 11h8M8 14h5" />
              </svg>
            </div>
            <span className="font-playfair text-[18px] text-white tracking-[-0.2px]">MentalPath</span>
          </div>

          {/* Hero text */}
          <div className="relative z-10">
            <span className="text-[10px] font-medium tracking-[2px] uppercase text-[#6B9E8F] mb-5 block">Introducing</span>
            <h1 className="font-playfair text-[clamp(32px,4vw,52px)] font-normal leading-[1.12] text-white mb-7">
              The feature we<br />built for <em className="italic text-[#6B9E8F]">you,</em><br />not your clients.
            </h1>
            <p className="text-[16px] leading-[1.75] text-white/55 max-w-[380px]">
              Every other feature in MentalPath is about making you more effective for the people you serve. This one is purely for you. There's no productivity angle. No compliance benefit. No insurance justification. It's just the app pausing and asking:
              <br /><br />
              <em className="text-white/70 italic">How are you doing?</em>
            </p>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap relative z-10">
            {['Private to you only', 'Never audited', 'Not exported'].map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(74,124,111,0.3)] rounded-[20px] text-[11px] font-medium text-[#6B9E8F]"
              >
                <span className="w-[5px] h-[5px] rounded-full bg-[#4A7C6F]"></span>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right side - UI Preview */}
        <div className="bg-[#EDE7D9] p-[60px_48px] flex flex-col justify-center relative hidden md:flex">
          <div className="bg-white rounded-2xl border border-[rgba(28,26,22,0.1)] overflow-hidden shadow-[0_24px_64px_rgba(28,26,22,0.12)]">
            {/* Topbar */}
            <div className="bg-[#F5F0E8] border-b border-[rgba(28,26,22,0.1)] px-4.5 py-3 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[1px] text-[#7A7570]">Week of March 16, 2026</span>
              <span className="flex items-center gap-1.5 text-[10px] text-[#4A7C6F] font-medium">
                <Lock className="w-[10px] h-[10px]" />
                Private to you only
              </span>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="font-playfair text-[17px] text-[#1C1A16] mb-4.5 leading-[1.3]">
                How are you doing<br />this week?
              </div>

              {/* Sliders */}
              {[
                { name: 'Energy', value: energy, color: '#4A7C6F', left: 'depleted', right: 'energised', setValue: setEnergy },
                { name: 'Emotional load', value: emotionalLoad, color: '#BA7517', left: 'light', right: 'very heavy', setValue: setEmotionalLoad },
                { name: 'Satisfaction', value: satisfaction, color: '#4A7C6F', left: 'going through motions', right: 'deeply purposeful', setValue: setSatisfaction }
              ].map((slider, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[12px] font-medium text-[#1C1A16]">{slider.name}</span>
                    <span className="font-playfair text-[18px]" style={{ color: slider.color }}>{slider.value}</span>
                  </div>
                  <div className="h-[3px] bg-[#EDE7D9] rounded-sm relative">
                    <div
                      className="h-full rounded-sm relative"
                      style={{ width: `${slider.value * 10 - 5}%`, background: slider.color }}
                    >
                      <div
                        className="absolute right-[-6px] top-[-5px] w-[13px] h-[13px] rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
                        style={{ background: slider.color }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-[#7A7570]">
                    <span>{slider.left}</span>
                    <span>{slider.right}</span>
                  </div>
                </div>
              ))}

              {/* Vicarious Trauma Indicators */}
              <div className="mt-4 pt-3.5 border-t border-[rgba(28,26,22,0.1)]">
                <div className="text-[10px] font-medium uppercase tracking-[1px] text-[#7A7570] mb-2.5">
                  Vicarious trauma indicators
                </div>
                {[
                  { label: 'Intrusive thoughts about client material', key: 'intrusive' },
                  { label: 'Sleep disrupted by work thoughts', key: 'sleep' },
                  { label: 'Dreading a specific session', key: 'dread' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-[12px] text-[#4A4640] border-b border-[rgba(28,26,22,0.1)] last:border-b-0">
                    <span>{item.label}</span>
                    <div
                      onClick={() => setVtFlags({ ...vtFlags, [item.key]: !vtFlags[item.key as keyof typeof vtFlags] })}
                      className={`w-7 h-4 rounded-lg relative cursor-pointer ${
                        vtFlags[item.key as keyof typeof vtFlags] ? 'bg-[#4A7C6F]' : 'bg-[#EDE7D9]'
                      }`}
                    >
                      <div
                        className={`absolute top-[2px] w-3 h-3 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all ${
                          vtFlags[item.key as keyof typeof vtFlags] ? 'left-[14px]' : 'left-[2px]'
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Response */}
              <div className="mt-3.5 bg-[#E8F0ED] rounded-lg px-3.5 py-3.5">
                <div className="text-[9px] font-medium uppercase tracking-[1.2px] text-[#4A7C6F] mb-2">A reflection back</div>
                <div className="text-[12px] leading-[1.65] text-[#2D5049] italic">
                  "You carried a lot this week. Sleep being disrupted by a session isn't just fatigue — it's a sign that something landed somewhere deeper than usual, and that's worth paying attention to."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MANIFESTO SECTION */}
      <div className="bg-[#1C1A16] py-[100px] px-20">
        <div className="max-w-[760px] mx-auto">
          <span className="text-[10px] font-medium tracking-[2px] uppercase text-[#6B9E8F] mb-6 block">Why this exists</span>

          <p className="font-playfair text-[clamp(20px,2.5vw,28px)] font-normal leading-[1.55] text-white/80 mb-7">
            Every other tool in this space is designed to make therapists <em className="italic text-white">more productive,</em> more organised, more compliant.
          </p>

          <p className="font-playfair text-[clamp(20px,2.5vw,28px)] font-normal leading-[1.55] text-white/80 mb-7">
            None of them stop and ask how the therapist is doing. And therapists — who spend their entire working lives asking other people that exact question — <strong className="text-[#6B9E8F] font-normal">almost never get asked it themselves.</strong>
          </p>

          <div className="w-12 h-[1px] bg-[#4A7C6F] my-10"></div>

          <p className="font-playfair text-[clamp(20px,2.5vw,28px)] font-normal leading-[1.55] text-white/80 mb-7">
            Compassion fatigue and vicarious trauma are occupational realities in this profession. The research is unambiguous: therapists who don't monitor their own emotional load have worse clinical outcomes, higher burnout rates, and are more likely to miss things in session.
          </p>

          <p className="font-playfair text-[clamp(20px,2.5vw,28px)] font-normal leading-[1.55] text-white/80 mb-7">
            The College of Registered Psychotherapists of Ontario actually includes self-care as an <em className="italic text-white">ethical obligation</em> in their Standards of Practice.
          </p>

          <p className="font-playfair text-[clamp(20px,2.5vw,28px)] font-normal leading-[1.55] text-white/80">
            So we built a private, weekly check-in that lives only for the therapist. <strong className="text-[#6B9E8F] font-normal">Not visible to clients. Not in the audit log. Not exportable. Never shared.</strong>
          </p>
        </div>
      </div>

      {/* FEATURES GRID */}
      <div className="py-[100px] px-20 max-w-[1200px] mx-auto">
        <div className="mb-14 fade-up opacity-0 translate-y-6">
          <span className="text-[10px] font-medium tracking-[2px] uppercase text-[#4A7C6F] mb-3 block">What it does</span>
          <h2 className="font-playfair text-[clamp(28px,3.5vw,44px)] font-normal text-[#1C1A16] leading-[1.15] max-w-[580px]">
            Everything you track for your clients. <em className="italic text-[#2D5049]">Finally for you.</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-[2px] bg-[rgba(28,26,22,0.1)] rounded-2xl overflow-hidden">
          {[
            { num: '01', title: 'Wellbeing scores', desc: 'Four sliders each week. Energy. Emotional load. Satisfaction. Boundary clarity. Plain language, not clinical scales. Just how it actually felt.' },
            { num: '02', title: 'Vicarious trauma indicators', desc: 'Six flags mapped to the validated ProQOL-5 and Figley compassion fatigue model. Toggle what you are noticing. The system escalates its language at 4 or more flags.' },
            { num: '03', title: 'Private reflection', desc: 'A textarea that explicitly tells you it is never read by anyone. No share button. No export. No audit entry. Just a place to write what is sitting with you.' },
            { num: '04', title: 'AI reflection back', desc: 'Not advice. Not a to-do list. Not cheerfulness. A trusted-supervisor voice that names what the week held, notices one thing, and offers one possibility. Tone shifts based on what you enter.' },
            { num: '05', title: 'Self-care tracking', desc: 'Did you have supervision this week? Take intentional breaks? Attend personal therapy? Six checkboxes. No judgment. Just the data so you can see your own patterns.' },
            { num: '06', title: 'Your history over time', desc: 'Are heavy weeks clustering? Does emotional load consistently outrun energy? Does supervision actually move the needle for you? For the first time, you have data about yourself.' }
          ].map((feat, i) => (
            <div key={i} className="bg-[#F5F0E8] p-[36px_32px] relative hover:bg-white transition-colors group fade-up opacity-0 translate-y-6">
              <div className="absolute top-7 right-7 w-2 h-2 rounded-full bg-[#4A7C6F] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="font-playfair text-[48px] font-normal text-[rgba(28,26,22,0.1)] leading-none mb-5 select-none">{feat.num}</div>
              <div className="font-playfair text-[19px] font-normal text-[#1C1A16] mb-2.5 leading-[1.2]">{feat.title}</div>
              <div className="text-[14px] leading-[1.7] text-[#7A7570]">{feat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRIVACY SECTION */}
      <div className="py-[100px] px-20 max-w-[1200px] mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="fade-up opacity-0 translate-y-6">
          <h2 className="font-playfair text-[clamp(28px,3.5vw,44px)] font-normal text-[#1C1A16] leading-[1.15] mb-6">
            Genuinely private.<br /><em className="italic text-[#2D5049]">Not just a promise.</em>
          </h2>
          <p className="text-[15px] leading-[1.75] text-[#4A4640] mb-3.5">
            We made architectural choices to enforce this, not just policy choices. The `therapist_checkins` table has its own RLS policy — `therapist_own_checkins_only` — that's stricter than anything else in the system.
          </p>
          <p className="text-[15px] leading-[1.75] text-[#4A4640]">
            It cannot be joined to client data. It doesn't appear in audit logs. It cannot be exported. It cannot be seen by MentalPath staff. Technically impossible, not just against the rules.
          </p>
        </div>

        <div className="bg-white border border-[rgba(28,26,22,0.1)] rounded-2xl overflow-hidden fade-up opacity-0 translate-y-6">
          {[
            { icon: Shield, title: 'Row-level security — own account only', desc: 'Database-enforced. Your check-ins are only ever returned to a query authenticated as you. No exceptions, no overrides.' },
            { icon: FileText, title: 'Not in the audit log', desc: 'PHIPA requires we log access to client health records. Your personal check-ins are not health records. They generate no audit entries.' },
            { icon: Eye, title: 'No export, no share, no supervisor view', desc: 'We deliberately did not build these. Not a settings toggle. Not a future feature. Never.' },
            { icon: Lock, title: 'Stored in Canada with everything else', desc: 'AWS ca-central-1, Montreal & Toronto. AES-256 at rest. TLS 1.3 in transit. Same infrastructure as your most sensitive clinical data.' }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3.5 p-[18px_20px] border-b border-[rgba(28,26,22,0.1)] last:border-b-0">
              <div className="w-8 h-8 rounded-lg bg-[#E8F0ED] flex items-center justify-center flex-shrink-0">
                <item.icon className="w-[14px] h-[14px] text-[#4A7C6F]" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#1C1A16] mb-1">{item.title}</div>
                <div className="text-[12px] text-[#7A7570] leading-[1.5]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUOTE SECTION */}
      <div className="bg-[#2D5049] py-[100px] px-20 text-center">
        <div className="max-w-[720px] mx-auto fade-up opacity-0 translate-y-6">
          <div className="w-10 h-[1px] bg-[#6B9E8F] mx-auto mb-5"></div>
          <div className="font-playfair text-[clamp(22px,3vw,36px)] font-normal italic text-white leading-[1.45] mb-7">
            "You cannot pour from an empty cup. Take care of yourself first."
          </div>
          <div className="text-[13px] text-white/50 tracking-[0.5px]">
            Said to every therapist in training. Rarely operationalised in any tool they use every day.
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-[#1C1A16] py-[100px] px-20 text-center">
        <div className="max-w-[600px] mx-auto fade-up opacity-0 translate-y-6">
          <h2 className="font-playfair text-[clamp(28px,4vw,48px)] font-normal text-white leading-[1.15] mb-4">
            MentalPath takes care<br />of you <em className="italic text-[#6B9E8F]">while you</em><br />take care of others.
          </h2>
          <p className="text-[16px] text-white/50 mb-9 leading-[1.6]">
            7-day free trial. Canadian servers. PHIPA-compliant from minute one. All features included.
          </p>
          <a
            href="/onboarding"
            className="inline-block px-10 py-4 bg-[#4A7C6F] text-white rounded-lg text-[15px] font-medium hover:bg-[#6B9E8F] transition-colors"
          >
            Start your free trial →
          </a>
          <div className="text-[12px] text-white/30 mt-3.5">
            $49/month after trial · No credit card required today · Cancel anytime
          </div>
        </div>
      </div>
    </div>
  );
}