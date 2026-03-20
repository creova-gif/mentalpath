import { useState } from 'react';
import { Users, Plus, BarChart2, Calendar, Shield, ChevronRight } from 'lucide-react';

type Tab = 'overview' | 'clinicians' | 'schedule' | 'analytics' | 'compliance';

const clinicians = [
  {
    initials: 'AO',
    avatarBg: '#e8f0ed',
    avatarColor: '#2d5049',
    name: 'Dr. Abena Osei-Mensah',
    email: 'abena.osei@mentalpath.ca',
    role: 'Owner' as const,
    clients: 23,
    thisWeek: 6,
    revenue: '$4,200',
    notesCompletion: 94,
    compliance: [
      { label: 'CRPO ✓', type: 'green' },
      { label: 'Insurance ✓', type: 'green' },
      { label: 'CPD 18/40h', type: 'amber' },
      { label: 'Compliance 7/10', type: 'amber' },
    ],
  },
  {
    initials: 'KM',
    avatarBg: '#E6F1FB',
    avatarColor: '#0C447C',
    name: 'Dr. Kofi Mensah',
    email: 'kofi.mensah@mentalpath.ca',
    role: 'Clinician' as const,
    clients: 24,
    thisWeek: 7,
    revenue: '$4,760',
    notesCompletion: 87,
    compliance: [
      { label: 'CRPO ✓', type: 'green' },
      { label: 'Insurance ✓', type: 'green' },
      { label: 'CPD 32/40h', type: 'green' },
      { label: 'Compliance 9/10', type: 'green' },
    ],
  },
  {
    initials: 'AP',
    avatarBg: '#EEEDFE',
    avatarColor: '#3C3489',
    name: 'Amara Patel, RP',
    email: 'amara.patel@mentalpath.ca',
    role: 'Intern' as const,
    clients: 14,
    thisWeek: 5,
    revenue: '$3,220',
    notesCompletion: 78,
    compliance: [
      { label: 'CRPO ✓', type: 'green' },
      { label: 'Supervision ✓', type: 'green' },
      { label: 'CPD 9/40h', type: 'red' },
      { label: 'Compliance 6/10', type: 'amber' },
    ],
  },
];

const scheduleSlots = [
  { time: '9:00 AM', abena: { client: 'Marcus L.', type: 'intake', color: '#e8f0ed', text: '#2d5049' }, kofi: { client: 'Priya S.', type: 'session', color: '#E6F1FB', text: '#0C447C' }, amara: null },
  { time: '10:00 AM', abena: null, kofi: { client: 'Chen W.', type: 'session', color: '#E6F1FB', text: '#0C447C' }, amara: { client: 'James O.', type: 'session', color: '#EEEDFE', text: '#3C3489' } },
  { time: '11:00 AM', abena: { client: 'Fatima A.', type: 'session', color: '#e8f0ed', text: '#2d5049' }, kofi: null, amara: { client: 'Nadia K.', type: 'intake', color: '#EEEDFE', text: '#3C3489' } },
  { time: '2:00 PM', abena: { client: 'Team check-in', type: 'admin', color: '#f7f4ef', text: '#7a7a72' }, kofi: { client: 'Team check-in', type: 'admin', color: '#f7f4ef', text: '#7a7a72' }, amara: { client: 'Team check-in', type: 'admin', color: '#f7f4ef', text: '#7a7a72' } },
  { time: '3:00 PM', abena: null, kofi: { client: 'Supervision', type: 'admin', color: '#f7f4ef', text: '#7a7a72' }, amara: { client: 'Amara P. — Sup.', type: 'admin', color: '#f7f4ef', text: '#7a7a72' } },
  { time: '4:00 PM', abena: { client: 'Sarah T.', type: 'session', color: '#e8f0ed', text: '#2d5049' }, kofi: null, amara: null },
];

const analyticsRows = [
  { name: 'Dr. Abena Osei-Mensah', role: 'Owner', clients: 23, sessions: 6, revenue: '$4,200', noShow: '2%', notes: '94%', compliance: '7/10', score: 'amber' },
  { name: 'Dr. Kofi Mensah', role: 'Clinician', clients: 24, sessions: 7, revenue: '$4,760', noShow: '0%', notes: '87%', compliance: '9/10', score: 'green' },
  { name: 'Amara Patel, RP', role: 'Intern', clients: 14, sessions: 5, revenue: '$3,220', noShow: '7%', notes: '78%', compliance: '6/10', score: 'red' },
  { name: 'Practice total', role: '', clients: 61, sessions: 18, revenue: '$12,180', noShow: '4%', notes: '87%', compliance: '9.2/10', score: 'green', isTotal: true },
];

function BadgePill({ label, type }: { label: string; type: string }) {
  const styles: Record<string, string> = {
    green: 'bg-[#e8f4f0] text-[#2d5049]',
    amber: 'bg-[#faeeda] text-[#633806]',
    red: 'bg-[#fde8e8] text-[#791F1F]',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${styles[type] || styles.green}`}>
      {label}
    </span>
  );
}

function RolePill({ role }: { role: 'Owner' | 'Clinician' | 'Intern' }) {
  const styles = {
    Owner: 'bg-[#e8f0ed] text-[#2d5049]',
    Clinician: 'bg-[#f7f4ef] text-[#7a7a72]',
    Intern: 'bg-[#EEEDFE] text-[#3C3489]',
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${styles[role]}`}>
      {role}
    </span>
  );
}

function ClinicianCard({ c }: { c: typeof clinicians[0] }) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[13px] overflow-hidden">
      <div className="p-4 border-b border-[rgba(0,0,0,0.08)] flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
          style={{ background: c.avatarBg, color: c.avatarColor }}
        >
          {c.initials}
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-medium text-[var(--ink)]">{c.name}</div>
          <div className="text-[11px] text-[var(--ink-muted)]">{c.email}</div>
        </div>
        <div className="ml-auto"><RolePill role={c.role} /></div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { n: c.clients, l: 'Clients' },
            { n: c.thisWeek, l: 'This week' },
            { n: c.revenue, l: 'Mar revenue' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-[var(--font-display)] text-[20px] text-[var(--ink)]">{s.n}</div>
              <div className="text-[11px] text-[var(--ink-muted)]">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-[var(--ink-muted)] mb-1">
            <span>Notes completion</span><span>{c.notesCompletion}%</span>
          </div>
          <div className="h-[4px] bg-[var(--warm)] rounded-sm overflow-hidden">
            <div className="h-full bg-[var(--sage)] rounded-sm" style={{ width: `${c.notesCompletion}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.compliance.map((b, i) => <BadgePill key={i} label={b.label} type={b.type} />)}
        </div>
      </div>
      <div className="flex border-t border-[rgba(0,0,0,0.08)]">
        {['View profile', 'Clients', 'Notes'].map((lbl, i) => (
          <button
            key={i}
            className="flex-1 py-2 text-[12px] font-medium text-[var(--ink-soft)] border-r last:border-r-0 border-[rgba(0,0,0,0.08)] bg-white hover:bg-[var(--sage-pale)] hover:text-[var(--sage-deep)] transition-colors"
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GroupPractice() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'clinicians', label: 'Clinicians (3)' },
    { id: 'schedule', label: 'Shared schedule' },
    { id: 'analytics', label: 'Practice analytics' },
    { id: 'compliance', label: 'Compliance snapshot' },
  ];

  const stats = [
    { n: '3', l: 'Active clinicians', d: '+1 pending invite', dc: 'var(--sage)' },
    { n: '61', l: 'Total clients', d: '↑ 8 this month', dc: 'var(--sage)' },
    { n: '$12,180', l: 'Practice revenue (Mar)', d: '↑ 14%', dc: '#1D9E75' },
    { n: '4%', l: 'Practice no-show rate', d: '↓ from 16%', dc: '#1D9E75' },
    { n: '$237', l: 'Monthly MentalPath cost', d: '3 × $79/seat', dc: 'var(--ink-muted)' },
    { n: '9.2/10', l: 'Compliance score (avg)', d: '↑ from 8.1', dc: 'var(--sage)' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-[var(--font-display)] text-[22px] text-[var(--ink)]">Group Practice</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">Northside Wellness Collective · 3 clinicians</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="flex items-center gap-1.5 px-4 py-2 border border-[rgba(0,0,0,0.13)] rounded-lg text-[13px] font-medium text-[var(--ink-soft)] bg-white hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            Invite clinician
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--sage)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--sage-deep)] transition-colors">
            Practice settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(0,0,0,0.08)] mb-5 -mx-7 px-7 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] whitespace-nowrap border-b-2 transition-all mr-1 ${
              activeTab === tab.id
                ? 'border-[var(--sage)] text-[var(--sage-deep)] font-medium'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div className="bg-[var(--warm)] border border-[rgba(0,0,0,0.08)] rounded-xl p-4 mb-5">
          <div className="text-[13px] font-medium text-[var(--ink)] mb-3">Invite a clinician</div>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Full name"
              className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]"
            />
            <input
              type="email"
              placeholder="Work email"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]"
            />
            <select className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]">
              <option>Clinician</option>
              <option>Owner</option>
              <option>Intern / supervised</option>
            </select>
            <button className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--sage-deep)] transition-colors">
              Send invite
            </button>
            <button
              onClick={() => setShowInviteForm(false)}
              className="px-3 py-2 border border-[rgba(0,0,0,0.13)] rounded-lg text-[13px] text-[var(--ink-muted)] hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {stats.map((s, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[11px] p-3.5">
                <div className="font-[var(--font-display)] text-[24px] text-[var(--ink)]">{s.n}</div>
                <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">{s.l}</div>
                <div className="text-[11px] font-medium mt-0.5" style={{ color: s.dc }}>{s.d}</div>
              </div>
            ))}
          </div>

          {/* Pending invite banner */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[14px] font-medium text-[var(--ink)]">Pending invite — Dr. Kwame Asante</div>
              <div className="text-[13px] text-[var(--ink-muted)] mt-0.5">kwame.asante@gmail.com · Invited March 14 · Role: Clinician · Expires in 3 days</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="px-3.5 py-1.5 border border-[rgba(0,0,0,0.13)] rounded-lg text-[12px] font-medium text-[var(--ink-soft)] bg-white hover:bg-[var(--warm)] transition-colors">
                Resend
              </button>
              <button className="px-3.5 py-1.5 border border-[#f09595] rounded-lg text-[12px] font-medium text-[#c0392b] bg-white hover:bg-[#fde8e8] transition-colors">
                Cancel
              </button>
            </div>
          </div>

          {/* Clinician cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {clinicians.map((c, i) => <ClinicianCard key={i} c={c} />)}
          </div>
        </div>
      )}

      {/* CLINICIANS TAB */}
      {activeTab === 'clinicians' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] text-[var(--ink-muted)]">3 active clinicians · 1 pending invite</div>
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="flex items-center gap-1 text-[13px] text-[var(--sage)] font-medium hover:text-[var(--sage-deep)]"
            >
              <Plus className="w-3.5 h-3.5" /> Add clinician
            </button>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {clinicians.map((c, i) => <ClinicianCard key={i} c={c} />)}
          </div>
        </div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[14px] font-medium text-[var(--ink)]">Thursday, March 19, 2026</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-[rgba(0,0,0,0.13)] rounded-lg text-[12px] text-[var(--ink-muted)] hover:bg-white transition-colors">← Prev</button>
              <button className="px-3 py-1.5 border border-[rgba(0,0,0,0.13)] rounded-lg text-[12px] text-[var(--ink-muted)] hover:bg-white transition-colors">Next →</button>
            </div>
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
            <div className="grid" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr' }}>
              {['', 'Dr. Abena Osei-Mensah', 'Dr. Kofi Mensah', 'Amara Patel, RP'].map((h, i) => (
                <div key={i} className="px-3 py-2.5 text-[12px] font-medium text-[var(--ink)] bg-[var(--warm)] border-b border-[rgba(0,0,0,0.08)] border-r last:border-r-0 text-center">
                  {h}
                </div>
              ))}
              {scheduleSlots.map((slot, rowIdx) => (
                <>
                  <div key={`t${rowIdx}`} className="px-2 py-2.5 text-[11px] text-[var(--ink-muted)] border-b border-r border-[rgba(0,0,0,0.06)] text-right flex items-start justify-end pt-3">
                    {slot.time}
                  </div>
                  {[slot.abena, slot.kofi, slot.amara].map((appt, colIdx) => (
                    <div key={`c${rowIdx}-${colIdx}`} className="p-1.5 border-b border-r last:border-r-0 border-[rgba(0,0,0,0.06)] min-h-[52px]">
                      {appt && (
                        <div
                          className="rounded px-2 py-1.5 text-[11px] font-medium"
                          style={{ background: appt.color, color: appt.text }}
                        >
                          <div>{appt.client}</div>
                          <div className="text-[10px] opacity-70 capitalize">{appt.type}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div>
          <div className="text-[13px] text-[var(--ink-muted)] mb-4">Practice performance · March 2026</div>
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--warm)]">
                  {['Clinician', 'Role', 'Clients', 'Sessions/wk', 'Revenue (Mar)', 'No-show', 'Notes %', 'Compliance'].map((h, i) => (
                    <th key={i} className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-4 py-2.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analyticsRows.map((row, i) => (
                  <tr key={i} className={`border-t border-[rgba(0,0,0,0.06)] hover:bg-[var(--warm)] transition-colors ${row.isTotal ? 'font-medium' : ''}`}>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--ink)]">{row.name}</td>
                    <td className="px-4 py-3 text-[12px] text-[var(--ink-muted)]">{row.role}</td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink-soft)]">{row.clients}</td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink-soft)]">{row.sessions}</td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink-soft)]">{row.revenue}</td>
                    <td className="px-4 py-3 text-[13px]" style={{ color: parseFloat(row.noShow) > 5 ? '#c0392b' : '#1D9E75' }}>{row.noShow}</td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink-soft)]">{row.notes}</td>
                    <td className="px-4 py-3">
                      <BadgePill label={row.compliance} type={row.score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-3 gap-3.5 mt-5">
            {[
              { label: 'Revenue trend', value: '↑ 14%', sub: 'vs. February 2026', color: '#1D9E75' },
              { label: 'Avg no-show rate', value: '4%', sub: '↓ from 16% last quarter', color: '#1D9E75' },
              { label: 'Notes overdue', value: '8', sub: 'Across all clinicians', color: '#BA7517' },
            ].map((m, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-4">
                <div className="text-[12px] text-[var(--ink-muted)] mb-1">{m.label}</div>
                <div className="font-[var(--font-display)] text-[28px]" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLIANCE TAB */}
      {activeTab === 'compliance' && (
        <div>
          <div className="text-[13px] text-[var(--ink-muted)] mb-4">Regulatory compliance snapshot · March 2026</div>

          <div className="grid sm:grid-cols-2 gap-3.5 mb-5">
            {clinicians.map((c, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: c.avatarBg, color: c.avatarColor }}>
                    {c.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--ink)]">{c.name}</div>
                    <RolePill role={c.role} />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Registration verified', ok: true },
                    { label: 'Professional insurance', ok: true },
                    { label: `CPD hours (${c.role === 'Intern' ? '9' : c.role === 'Owner' ? '18' : '32'}/40h)`, ok: c.role === 'Clinician' },
                    { label: 'Notes completion ≥ 90%', ok: c.notesCompletion >= 90 },
                    { label: 'Supervision logs current', ok: c.role !== 'Intern' },
                  ].map((item, j) => (
                    <div key={j} className="flex items-center gap-2 text-[12px]">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-[#e8f4f0]' : 'bg-[#fde8e8]'}`}>
                        <span style={{ color: item.ok ? '#2d5049' : '#c0392b', fontSize: 9, fontWeight: 700 }}>{item.ok ? '✓' : '!'}</span>
                      </div>
                      <span className={item.ok ? 'text-[var(--ink-soft)]' : 'text-[#c0392b]'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[var(--sage)]" />
                <div className="text-[13px] font-medium text-[var(--ink)]">Practice-wide alerts</div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'CPD hours low — Amara Patel (9/40h)', severity: 'red' },
                  { label: 'Notes overdue — 3 clients (Dr. Abena)', severity: 'amber' },
                  { label: 'CPD reminder — Dr. Abena Osei (18/40h)', severity: 'amber' },
                ].map((alert, j) => (
                  <div key={j} className={`rounded-lg px-3 py-2.5 text-[12px] flex items-center justify-between gap-2 ${alert.severity === 'red' ? 'bg-[#fde8e8] text-[#791F1F]' : 'bg-[#faeeda] text-[#633806]'}`}>
                    <span>{alert.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                  </div>
                ))}
                <div className="rounded-lg px-3 py-2.5 text-[12px] bg-[#e8f4f0] text-[#2d5049] flex items-center justify-between gap-2">
                  <span>Dr. Kofi Mensah — fully compliant</span>
                  <span className="text-[10px] font-medium">9/10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--sage-pale)] border border-[rgba(74,124,111,0.2)] rounded-xl px-5 py-4 text-[13px] text-[var(--sage-deep)] leading-relaxed">
            <strong className="font-medium">CRPO Standards of Practice reminder:</strong> All registered psychotherapists must maintain a minimum of 40 hours of CPD activity per two-year registration period. Supervision logs for interns must be submitted quarterly.
          </div>
        </div>
      )}
    </div>
  );
}
