import { useState } from 'react';
import { useNavigate } from 'react-router';

type Tab = 'overview' | 'notes' | 'invoices' | 'outcomes' | 'treatment' | 'intake' | 'safety';

const NOTES = [
  { session: 'Session 15', date: 'March 16, 2026 · 50 min · Video', format: 'DAP', status: 'Draft', statusColor: 'bg-[#faeeda] text-[#633806]', borderColor: 'border-l-[#BA7517]', preview: "Client presented as engaged and reflective. Reported completing the journaling exercise between sessions, noting it helped her identify and name emotions in real time..." },
  { session: 'Session 14', date: 'March 10, 2026 · 50 min · Video', format: 'DAP', status: 'Locked', statusColor: 'bg-[#fde8e8] text-[#791F1F]', borderColor: '', preview: "Explored workplace microaggression incident using anti-racism framework. Demonstrated strong externalisation skills and showed reduced self-blame compared to early sessions..." },
  { session: 'Session 13', date: 'March 3, 2026 · 50 min · Video', format: 'DAP', status: 'Locked', statusColor: 'bg-[#fde8e8] text-[#791F1F]', borderColor: '', preview: "Session focused on somatic responses to hypervigilance at work. Introduced body scan technique. Client receptive and practiced grounding..." },
  { session: 'Session 12', date: 'Feb 24, 2026 · 50 min · Video', format: 'DAP', status: 'Locked', statusColor: 'bg-[#fde8e8] text-[#791F1F]', borderColor: '', preview: "Cultural genogram exercise initiated. Explored family-of-origin patterns and their intersection with current workplace dynamics..." },
  { session: 'Sessions 1–11', date: 'Nov 2025 – Feb 2026', format: 'DAP', status: 'All locked', statusColor: 'bg-[#fde8e8] text-[#791F1F]', borderColor: '', preview: "11 earlier session notes — all locked and archived. Click to expand..." },
];

const INVOICES = [
  { id: 'INV-0031', session: 'Session 14', date: 'Mar 10', amount: '$140.00', status: 'Paid' },
  { id: 'INV-0028', session: 'Session 13', date: 'Mar 3', amount: '$140.00', status: 'Paid' },
  { id: 'INV-0024', session: 'Session 12', date: 'Feb 24', amount: '$140.00', status: 'Paid' },
  { id: 'INV-0020', session: 'Session 11', date: 'Feb 17', amount: '$140.00', status: 'Paid' },
];

export function ClientProfile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-[18px] py-3 text-[13px] border-none bg-transparent cursor-pointer border-b-2 transition-all duration-150 whitespace-nowrap ${tab === id ? 'text-[var(--sage-deep)] border-b-[var(--sage)] font-medium' : 'text-[var(--ink-muted)] border-b-transparent hover:text-[var(--ink-soft)]'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--warm)] font-sans">

      {/* Client Header */}
      <div className="bg-white border-b border-[var(--border)] px-7 py-5">
        <button
          onClick={() => navigate('/dashboard/clients')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--ink-muted)] cursor-pointer border-none bg-none p-0 mb-4 hover:text-[var(--ink)]"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          All clients
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--sage-pale)] flex items-center justify-center font-serif text-lg text-[var(--sage-deep)] flex-shrink-0">AM</div>
            <div>
              <div className="font-serif text-2xl text-[var(--ink)] mb-1">Amara Mensah</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)]">Active client</span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[var(--warm)] text-[var(--ink-muted)]">15 sessions</span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[var(--warm)] text-[var(--ink-muted)]">Since Nov 2025</span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[#faeeda] text-[#633806]">$140 / session</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink-soft)] hover:bg-[var(--warm)]">
              <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg>
              Open portal
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink-soft)] hover:bg-[var(--warm)]">
              <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              New invoice
            </button>
            <button
              onClick={() => navigate('/session-note-editor')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]"
            >
              <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              New session note
            </button>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="bg-white border-b border-[var(--border)] flex overflow-x-auto">
        {[
          { n: '15', label: 'Sessions', sub: '↑ 5 this month', subColor: 'text-[var(--sage)]' },
          { n: '$2,100', label: 'Total billed', sub: '$2,100 paid', subColor: 'text-[#1D9E75]' },
          { n: '3', label: 'PHQ-9 score', sub: '↓ from 10 at intake', subColor: 'text-[#1D9E75]' },
          { n: '7/10', label: 'Last wellbeing', sub: '↑ +2 this week', subColor: 'text-[#1D9E75]' },
          { n: '0', label: 'No-shows', sub: 'Perfect attendance', subColor: 'text-[var(--sage)]' },
          { n: 'Mar 31', label: 'Next session', sub: 'Session 16 · Video', subColor: 'text-[var(--ink-muted)]' },
        ].map(s => (
          <div key={s.label} className="px-6 py-3.5 border-r border-[var(--border)] last:border-r-0 flex flex-col flex-shrink-0">
            <div className="font-serif text-2xl text-[var(--ink)] leading-none">{s.n}</div>
            <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">{s.label}</div>
            <div className={`text-[11px] font-medium mt-0.5 ${s.subColor}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[var(--border)] px-7 flex overflow-x-auto">
        <TabBtn id="overview" label="Overview" />
        <TabBtn id="notes" label="Session notes (15)" />
        <TabBtn id="invoices" label="Invoices (15)" />
        <TabBtn id="outcomes" label="Outcome measures" />
        <TabBtn id="treatment" label="Treatment plan" />
        <TabBtn id="intake" label="Intake form" />
        <TabBtn id="safety" label="Safety plan" />
      </div>

      {/* Content */}
      <div className="px-7 py-6 max-w-[1200px]">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Profile */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--ink)]">Profile</span>
                <button className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-[9px] text-xs font-medium cursor-pointer border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink-soft)] hover:bg-[var(--warm)]">Edit</button>
              </div>
              <div className="px-4 py-3.5">
                {[['Full name','Amara Mensah'],['Date of birth','March 15, 1991 (35)'],['Email','amara.m@email.com'],['Phone','(416) 555-0142'],['Pronouns','She / her'],['Emergency contact','Kwame M. (brother)'],['Sliding scale','No — full rate'],['Consent signed','✓ Nov 15, 2025']].map(([l,v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-[var(--border)/50] last:border-b-0 text-[13px]">
                    <span className="text-[var(--ink-muted)]">{l}</span>
                    <span className={`font-medium text-right ${l === 'Consent signed' ? 'text-[#1D9E75]' : l === 'Email' ? 'text-xs text-[var(--ink)]' : 'text-[var(--ink)]'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural context */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[var(--border)]"><span className="text-[13px] font-medium text-[var(--ink)]">Cultural context</span></div>
              <div className="px-4 py-3.5">
                {[['Background','Ghanaian-Canadian'],['Languages','English, Twi'],['Religion / spirituality','Christian (active)'],['Immigration status','Canadian citizen']].map(([l,v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-[var(--border)/50] last:border-b-0 text-[13px]">
                    <span className="text-[var(--ink-muted)]">{l}</span><span className="font-medium text-[var(--ink)] text-right">{v}</span>
                  </div>
                ))}
                <div className="mt-2.5">
                  <div className="text-[var(--ink-muted)] text-[13px] mb-1.5">Context tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)]">Racialized stress</span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[#E6F1FB] text-[#0C447C]">Newcomer (2nd gen)</span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[#faeeda] text-[#633806]">Workplace trauma</span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)]">Anti-racism framework</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Outcome snapshot */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--ink)]">Outcome snapshot</span>
                <button className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-[9px] text-xs font-medium cursor-pointer border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink-soft)] hover:bg-[var(--warm)]">View all</button>
              </div>
              <div className="px-4 py-3.5 flex flex-col gap-2.5">
                {[{label:'PHQ-9',pct:'11%',score:'3/27',trend:'↓ 70%'},{label:'GAD-7',pct:'19%',score:'4/21',trend:'↓ 50%'},{label:'Wellbeing',pct:'70%',score:'7/10',trend:'↑ +2'}].map(r => (
                  <div key={r.label} className="flex items-center gap-2.5">
                    <span className="text-xs text-[var(--ink-muted)] min-w-[60px]">{r.label}</span>
                    <div className="flex-1 h-1.5 bg-[var(--warm)] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[var(--sage)]" style={{width:r.pct}} /></div>
                    <span className="text-xs font-medium text-[var(--ink)] min-w-[40px] text-right">{r.score}</span>
                    <span className="text-[11px] font-medium text-[#1D9E75] min-w-[36px]">{r.trend}</span>
                  </div>
                ))}
                <div className="mt-3.5 pt-3 border-t border-[var(--border)]">
                  <div className="text-xs font-medium text-[var(--sage-deep)] mb-1">Overall trajectory</div>
                  <div className="text-xs text-[var(--ink-muted)] leading-relaxed">Strong improvement across all measures since intake. PHQ-9 moved from Moderate (10) to Minimal (3) — clinically significant change.</div>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--ink)]">Upcoming appointments</span>
                <button className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-[9px] text-xs font-medium cursor-pointer border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink-soft)] hover:bg-[var(--warm)]">+ New</button>
              </div>
              <div className="px-4 py-3.5">
                <div className="flex justify-between py-1.5 border-b border-[var(--border)/50] text-[13px]"><span className="text-[var(--ink-muted)]">Session 16</span><span className="font-medium text-[var(--ink)]">Mar 31 · 10:00am · Video</span></div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border)/50] text-[13px]"><span className="text-[var(--ink-muted)]">Session 17 (poss.)</span><span className="font-medium text-[var(--ink)]">Apr 14 · Discharge TBC</span></div>
                <div className="mt-2.5 p-2.5 bg-[var(--sage-pale)] rounded-lg text-xs text-[var(--sage-deep)] leading-relaxed">
                  Treatment plan review complete. Discharge criteria substantially met. Discuss final session at Session 16.
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[var(--border)]"><span className="text-[13px] font-medium text-[var(--ink)]">Recent activity</span></div>
              <div className="px-4 py-3.5">
                {[['Mar 16 · Session 15','Note saved (draft)','text-[var(--sage)]'],['Mar 16 · Check-in','Wellbeing: 7/10','text-[var(--ink)]'],['Mar 10 · INV-0031','Paid $140','text-[#1D9E75]'],['Mar 10 · PHQ-9','Score: 3 (Minimal)','text-[var(--ink)]'],['Mar 10 · Session 14','Note locked','text-[var(--ink)]']].map(([l,v,vc]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-[var(--border)/50] last:border-b-0">
                    <span className="text-xs text-[var(--ink-muted)]">{l}</span>
                    <span className={`text-xs font-medium ${vc}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment goals */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--ink)]">Treatment goals</span>
                <button className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-[9px] text-xs font-medium cursor-pointer border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink-soft)] hover:bg-[var(--warm)]">View plan</button>
              </div>
              <div className="px-4 py-3.5 flex flex-col gap-2.5">
                {[{label:'Grounding techniques',pct:'100%',status:'✓ Met',statusColor:'text-[#1D9E75]',barColor:'bg-[#1D9E75]'},{label:'Externalise racism — reduce self-blame',pct:'90%',status:'90%',statusColor:'text-[var(--sage)]',barColor:'bg-[var(--sage)]'},{label:'Rebuild professional identity',pct:'80%',status:'80%',statusColor:'text-[var(--sage)]',barColor:'bg-[var(--sage)]'}].map(g => (
                  <div key={g.label}>
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium text-[var(--ink)]">{g.label}</span><span className={`font-medium ${g.statusColor}`}>{g.status}</span></div>
                    <div className="h-1 bg-[var(--warm)] rounded-full overflow-hidden"><div className={`h-full rounded-full ${g.barColor}`} style={{width:g.pct}} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {tab === 'notes' && (
          <div>
            <div className="flex justify-end mb-3.5">
              <button onClick={() => navigate('/session-note-editor')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]">
                <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                New session note
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {NOTES.map((n, i) => (
                <div key={i} className={`bg-white border border-[var(--border)] rounded-[10px] px-4 py-3.5 cursor-pointer transition-all duration-150 hover:border-[var(--sage-light)] hover:bg-[var(--sage-pale)] ${n.borderColor ? 'border-l-[3px] ' + n.borderColor : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div><span className="text-[13px] font-medium text-[var(--ink)]">{n.session}</span><span className="text-xs text-[var(--ink-muted)] ml-1.5">· {n.date}</span></div>
                    <div className="flex gap-1.5">
                      <span className="text-[10px] font-semibold px-[7px] py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)]">{n.format}</span>
                      <span className={`text-[10px] px-[7px] py-0.5 rounded ${n.statusColor}`}>{n.status}</span>
                    </div>
                  </div>
                  <div className="text-[13px] text-[var(--ink-muted)] leading-relaxed line-clamp-2">{n.preview}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INVOICES ── */}
        {tab === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-3.5">
              <div className="text-[13px] text-[var(--ink-muted)]">$2,100 invoiced · $2,100 paid · $0 outstanding</div>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer border-none bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]">+ New invoice</button>
            </div>
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--warm)]">
                    {['Invoice','Session','Date','Amount','Status','Actions'].map(h => (
                      <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map(inv => (
                    <tr key={inv.id} className="hover:bg-[var(--warm)]">
                      <td className="px-4 py-3 border-t border-[var(--border)/50] text-[13px] text-[var(--ink-soft)]">{inv.id}</td>
                      <td className="px-4 py-3 border-t border-[var(--border)/50] text-[13px] text-[var(--ink-soft)]">{inv.session}</td>
                      <td className="px-4 py-3 border-t border-[var(--border)/50] text-[13px] text-[var(--ink-soft)]">{inv.date}</td>
                      <td className="px-4 py-3 border-t border-[var(--border)/50] text-[13px] font-medium text-[var(--ink-soft)]">{inv.amount}</td>
                      <td className="px-4 py-3 border-t border-[var(--border)/50]"><span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#e8f4f0] text-[var(--sage-deep)]">{inv.status}</span></td>
                      <td className="px-4 py-3 border-t border-[var(--border)/50]">
                        <button className="text-[var(--sage)] text-xs font-medium bg-none border-none cursor-pointer p-0 hover:underline">PDF</button>
                        <span className="text-[var(--ink-muted)] mx-1">·</span>
                        <button className="text-[var(--sage)] text-xs font-medium bg-none border-none cursor-pointer p-0 hover:underline">Email</button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={6} className="text-center text-[var(--ink-muted)] text-xs px-4 py-3 border-t border-[var(--border)/50]">+ 11 earlier invoices · All paid · $1,540 total</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── OUTCOMES ── */}
        {tab === 'outcomes' && (
          <div className="bg-white border border-[var(--border)] rounded-xl p-[18px]">
            <div className="text-[13px] font-medium text-[var(--ink)] mb-3.5">PHQ-9 & GAD-7 over time — Sessions 1 to 14</div>
            <div className="flex gap-3.5 mb-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]"><div className="w-2 h-2 rounded-full bg-[var(--sage)]" />PHQ-9 (depression)</div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]"><div className="w-2 h-2 rounded-full bg-[#BA7517]" />GAD-7 (anxiety)</div>
            </div>
            <div className="h-[100px] bg-white border border-[var(--border)] rounded-lg p-3 flex items-flex-end">
              <svg width="100%" height="76" viewBox="0 0 600 76" preserveAspectRatio="none">
                <line x1="0" y1="0" x2="600" y2="0" stroke="var(--border)" strokeWidth="0.5"/>
                <line x1="0" y1="25" x2="600" y2="25" stroke="var(--border)" strokeWidth="0.5"/>
                <line x1="0" y1="50" x2="600" y2="50" stroke="var(--border)" strokeWidth="0.5"/>
                <line x1="0" y1="76" x2="600" y2="76" stroke="var(--border)" strokeWidth="0.5"/>
                <polyline points="0,48 160,62 600,69" fill="none" stroke="#4a7c6f" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="0" cy="48" r="4" fill="#4a7c6f"/><circle cx="160" cy="62" r="4" fill="#4a7c6f"/>
                <circle cx="600" cy="69" r="5" fill="#4a7c6f" stroke="white" strokeWidth="2"/>
                <polyline points="0,55 160,58 600,65" fill="none" stroke="#BA7517" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="0" cy="55" r="4" fill="#BA7517"/><circle cx="160" cy="58" r="4" fill="#BA7517"/>
                <circle cx="600" cy="65" r="5" fill="#BA7517" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-[var(--ink-muted)]">
              <span>Session 1 (intake)</span><span>Session 5</span><span>Session 14 (latest)</span>
            </div>
          </div>
        )}

        {/* ── TREATMENT ── */}
        {tab === 'treatment' && (
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden max-w-[700px]">
            <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[var(--ink)]">Treatment plan — Active</div>
                <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">Created Jan 15, 2026 · Version 1 · Review due Jun 16</div>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-xs font-medium cursor-pointer border border-[rgba(0,0,0,0.13)] bg-white text-[var(--ink-soft)] hover:bg-[var(--warm)]">Edit plan</button>
            </div>
            <div className="px-4 py-3.5 flex flex-col gap-4">
              {[
                {label:'Presenting problem', content:'Client presents with race-based traumatic stress symptoms related to repeated workplace microaggressions and systemic racism in a professional context. Experiences somatic responses, intrusive memories of specific incidents, and progressive avoidance of workplace interactions.', type:'text'},
                {label:'Interventions', content:null, tags:['Cultural Formulation Interview','Anti-oppressive practice','Somatic grounding','Narrative therapy']},
                {label:'Discharge criteria', content:'Client achieves sustained wellbeing scores ≥7 for 4+ consecutive sessions, reports successful application of anti-racism framework in daily life, demonstrates stable professional identity, and both client and therapist agree treatment goals have been met.', type:'text'},
              ].map(s => (
                <div key={s.label}>
                  <div className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--sage)] mb-1.5">{s.label}</div>
                  {s.content && <div className="text-[13px] text-[var(--ink-soft)] leading-relaxed">{s.content}</div>}
                  {s.tags && <div className="flex flex-wrap gap-1.5">{s.tags.map(t => <span key={t} className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)]">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INTAKE ── */}
        {tab === 'intake' && (
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden max-w-[700px]">
            <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="text-[13px] font-medium text-[var(--ink)]">Intake form — Racialized stress template</div>
              <div className="text-[11px] text-[var(--ink-muted)]">Completed Nov 15, 2025 · e-signed · IP logged</div>
            </div>
            <div className="px-4 py-3.5">
              {[['Racial identity','Ghanaian-Canadian, Black'],['Racism experienced','Workplace microaggressions, hiring discrimination, institutional racism'],['PHQ-9 at intake','10 (Moderate)'],['GAD-7 at intake','8 (Moderate)'],['Therapy goals (self-reported)','Process workplace racism, reduce anxiety, rebuild confidence'],['Consent: general','✓ Signed Nov 15, 2025'],['Consent: PHIPA disclosure','✓ Signed'],['Consent: telehealth','✓ Signed']].map(([l,v]) => (
                <div key={l} className={`flex justify-between py-1.5 border-b border-[var(--border)/50] last:border-b-0 text-[13px]`}>
                  <span className="text-[var(--ink-muted)]">{l}</span>
                  <span className={`font-medium text-right max-w-[260px] ${String(v).startsWith('✓') ? 'text-[#1D9E75]' : 'text-[var(--ink)]'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SAFETY ── */}
        {tab === 'safety' && (
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden max-w-[700px]">
            <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="text-[13px] font-medium text-[var(--ink)]">Crisis safety plan — Active · Version 2</div>
              <div className="text-[11px] text-[var(--ink-muted)]">Reviewed with client Mar 10, 2026</div>
            </div>
            <div className="px-4 py-3.5 flex flex-col gap-4">
              {[
                {label:'Warning signs',content:'Withdrawing from friends · Stopping enjoyable activities · Racing thoughts at night · Feeling like a burden'},
                {label:'Internal coping strategies',content:'5-4-3-2-1 grounding · Box breathing · Walk outside · Journaling'},
                {label:'Support people',content:'Sister — Abena (416-555-0122) · Friend — Yaa (647-555-0189)'},
                {label:'Crisis lines',content:'Crisis Services Canada: 1-833-456-4566 · Kids Help Phone: 1-800-668-6868 · 911'},
              ].map(s => (
                <div key={s.label}>
                  <div className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--sage)] mb-1.5">{s.label}</div>
                  <div className="text-[13px] text-[var(--ink-soft)] leading-relaxed">{s.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
