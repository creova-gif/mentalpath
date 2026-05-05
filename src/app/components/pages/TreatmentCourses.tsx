import { useState } from 'react';
import { AlertCircle, FileText, Dumbbell, Receipt, Phone } from 'lucide-react';

type Tab = 'courses' | 'eod' | 'reviews';
type CourseStatus = 'active' | 'review' | 'overdue' | 'discharge';

interface Outcome { label: string; before?: string; after: string; afterColor: string; }

interface Course {
  initials: string; avatarBg: string; avatarColor: string;
  name: string; diag: string; status: CourseStatus;
  session: number; totalSessions: number;
  progressColor: string; milestoneLabel: string;
  outcomes: Outcome[];
}

const COURSES: Course[] = [
  {
    initials: 'MS', avatarBg: '#FAECE7', avatarColor: '#8B2E12',
    name: 'Marcus Silva', diag: 'M54.5 — Lumbar disc herniation · L4-L5',
    status: 'review', session: 8, totalSessions: 12, progressColor: '#BA7517', milestoneLabel: '↑ reassess · session 8',
    outcomes: [
      { label: 'Oswestry', before: '46%', after: '28%', afterColor: '#BA7517' },
      { label: 'NPRS', before: '7/10', after: '4/10', afterColor: '#BA7517' },
      { label: 'PSFS', before: '3.5', after: '6.0', afterColor: 'var(--sage)' },
    ],
  },
  {
    initials: 'PK', avatarBg: '#E6F1FB', avatarColor: '#0C447C',
    name: 'Priya Kapoor', diag: 'M75.1 — Rotator cuff syndrome · Right shoulder',
    status: 'active', session: 4, totalSessions: 8, progressColor: 'var(--sage)', milestoneLabel: 'Midpoint',
    outcomes: [
      { label: 'DASH', before: '54', after: '31', afterColor: '#1D9E75' },
      { label: 'NPRS', before: '8/10', after: '3/10', afterColor: 'var(--sage)' },
      { label: 'ROM', after: '↑ 40°', afterColor: 'var(--sage)' },
    ],
  },
  {
    initials: 'TN', avatarBg: '#fde8e8', avatarColor: '#791F1F',
    name: 'Thomas Nguyen', diag: 'M23.2 — Medial meniscus tear · Right knee',
    status: 'overdue', session: 6, totalSessions: 10, progressColor: '#c0392b', milestoneLabel: '⚠ 2 missed',
    outcomes: [
      { label: 'NPRS', before: '6/10', after: '4/10', afterColor: '#BA7517' },
      { label: 'Berg Balance', before: '38', after: '44', afterColor: '#BA7517' },
      { label: 'Last seen', after: '18 days ago', afterColor: '#c0392b' },
    ],
  },
  {
    initials: 'AB', avatarBg: '#EEEDFE', avatarColor: '#3C3489',
    name: 'Aisha Boateng', diag: 'G54.2 — Cervical radiculopathy · C6',
    status: 'active', session: 2, totalSessions: 8, progressColor: 'var(--sage)', milestoneLabel: 'Midpoint',
    outcomes: [
      { label: 'NPRS', before: '8/10', after: '6/10', afterColor: '#BA7517' },
      { label: 'PSFS', before: '2.5', after: '4.0', afterColor: '#BA7517' },
      { label: 'Next', after: 'Mar 18', afterColor: 'var(--ink-muted)' },
    ],
  },
  {
    initials: 'JL', avatarBg: '#e8f0ed', avatarColor: '#2d5049',
    name: 'James Liu', diag: 'S83.5 — Lateral ankle sprain · Left ankle',
    status: 'discharge', session: 6, totalSessions: 6, progressColor: '#1D9E75', milestoneLabel: 'All goals met ✓',
    outcomes: [
      { label: 'NPRS', before: '7/10', after: '1/10', afterColor: '#1D9E75' },
      { label: 'Berg', before: '41', after: '54', afterColor: '#1D9E75' },
      { label: 'Return to sport', after: '✓ Cleared', afterColor: '#1D9E75' },
    ],
  },
];

const EOD_CLIENTS = [
  { initials: 'MS', avatarBg: '#FAECE7', avatarColor: '#8B2E12', name: 'Marcus Silva', detail: '9:00am · 50 min · Session 8 of 12 · Lumbar', amount: 120 },
  { initials: 'PK', avatarBg: '#E6F1FB', avatarColor: '#0C447C', name: 'Priya Kapoor', detail: '10:00am · 50 min · Session 4 of 8 · Shoulder', amount: 120 },
  { initials: 'AB', avatarBg: '#EEEDFE', avatarColor: '#3C3489', name: 'Aisha Boateng', detail: '1:00pm · 50 min · Session 2 of 8 · Cervical', amount: 120 },
  { initials: 'JL', avatarBg: '#e8f0ed', avatarColor: '#2d5049', name: 'James Liu', detail: '2:00pm · 50 min · Session 6 of 6 · Ankle (final)', amount: 120 },
  { initials: 'RN', avatarBg: '#faeeda', avatarColor: '#633806', name: 'Riya Nair', detail: '3:00pm · 50 min · Intake assessment · Knee', amount: 120 },
];

const STATUS_CONFIG: Record<CourseStatus, { label: string; bg: string; color: string }> = {
  active: { label: 'Active', bg: 'var(--sage-pale)', color: 'var(--sage-deep)' },
  review: { label: 'Review due', bg: '#faeeda', color: '#633806' },
  overdue: { label: 'Overdue — missed 2', bg: '#fde8e8', color: '#791F1F' },
  discharge: { label: 'Discharge ready', bg: '#d4e8d4', color: '#1a5a1a' },
};

function StatusBadge({ status }: { status: CourseStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="text-[11px] font-medium px-2.5 py-[3px] rounded" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function CourseCard({ course }: { course: Course }) {
  const pct = Math.round((course.session / course.totalSessions) * 100);
  const borderStyle = course.status === 'overdue'
    ? { borderColor: 'rgba(192,57,43,0.25)' }
    : course.status === 'discharge'
    ? { borderColor: 'rgba(74,124,111,0.3)' }
    : {};

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[13px] overflow-hidden hover:shadow-lg transition-shadow duration-150" style={borderStyle}>
      {/* Top */}
      <div className="p-[15px_17px] border-b border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0" style={{ background: course.avatarBg, color: course.avatarColor }}>
            {course.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-[var(--ink)]">{course.name}</div>
            <div className="text-[12px] text-[var(--ink-muted)] truncate">{course.diag}</div>
          </div>
          <StatusBadge status={course.status} />
        </div>
      </div>

      {/* Progress */}
      <div className="p-[14px_17px] border-b border-[rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[12px] font-medium text-[var(--ink)]">Session progress</span>
          <span className="text-[13px] font-medium text-[var(--ink)]">{course.session} of {course.totalSessions}</span>
        </div>
        <div className="h-[6px] bg-[var(--warm)] rounded-full overflow-hidden mb-1.5">
          <div className="h-full rounded-full transition-all duration-400" style={{ width: `${pct}%`, background: course.progressColor }} />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--ink-muted)]">
          <span>Start</span>
          <span>{course.milestoneLabel}</span>
          <span>{course.totalSessions}{course.status === 'discharge' ? ' ✓' : ''}</span>
        </div>
      </div>

      {/* Outcomes */}
      <div className="flex gap-3 px-[17px] py-[10px] bg-[var(--warm)] border-b border-[rgba(0,0,0,0.05)] items-center flex-wrap">
        {course.outcomes.map((o, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[var(--ink-muted)]">{o.label}</span>
            {o.before && <><span className="text-[var(--ink-muted)] font-medium">{o.before}</span><span className="text-[var(--ink-muted)]">→</span></>}
            <span className="font-medium" style={{ color: o.afterColor }}>{o.after}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 px-[17px] py-[10px] flex-wrap">
        {course.status === 'review' && (
          <button className="flex items-center gap-1 px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border cursor-pointer transition-all duration-150 bg-[#fde8e8] border-[#f09595] text-[#791F1F] hover:bg-[#f9d0d0]">
            <AlertCircle className="w-3 h-3" />Reassess now
          </button>
        )}
        {course.status === 'overdue' && (
          <button className="flex items-center gap-1 px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border cursor-pointer transition-all duration-150 bg-[#fde8e8] border-[#f09595] text-[#791F1F] hover:bg-[#f9d0d0]">
            <Phone className="w-3 h-3" />Contact client
          </button>
        )}
        {course.status === 'discharge' && (
          <button className="flex items-center gap-1 px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border cursor-pointer bg-[var(--sage-pale)] border-[var(--sage-light)] text-[var(--sage-deep)]">
            Write discharge summary
          </button>
        )}
        <button className="flex items-center gap-1 px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border border-[rgba(0,0,0,0.08)] bg-white text-[var(--ink-soft)] cursor-pointer hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] transition-all duration-150">
          <FileText className="w-3 h-3" />Write note
        </button>
        {(course.status === 'active' || course.status === 'review') && (
          <button className="flex items-center gap-1 px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border border-[rgba(0,0,0,0.08)] bg-white text-[var(--ink-soft)] cursor-pointer hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] transition-all duration-150">
            <Dumbbell className="w-3 h-3" />Issue HEP
          </button>
        )}
        {course.status !== 'discharge' && (
          <button className="flex items-center gap-1 px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border border-[rgba(0,0,0,0.08)] bg-white text-[var(--ink-soft)] cursor-pointer hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] transition-all duration-150">
            <Receipt className="w-3 h-3" />Receipt
          </button>
        )}
      </div>
    </div>
  );
}

export function TreatmentCourses() {
  const [tab, setTab] = useState<Tab>('courses');
  const [sentInvoices, setSentInvoices] = useState<Set<number>>(new Set());
  const [allSent, setAllSent] = useState(false);

  const reviewDue = COURSES.filter(c => c.status === 'review').length;
  const activeCount = COURSES.filter(c => c.status === 'active' || c.status === 'discharge').length;
  const onTrack = COURSES.filter(c => c.status === 'active').length;
  const totalRevenue = EOD_CLIENTS.reduce((s, c) => s + c.amount, 0);

  function markSent(idx: number) {
    setSentInvoices(prev => new Set([...prev, idx]));
  }

  function invoiceAll() {
    setSentInvoices(new Set(EOD_CLIENTS.map((_, i) => i)));
    setAllSent(true);
  }

  return (
    <div className="-m-4 sm:-m-6 md:-m-7 flex flex-col min-h-[calc(100vh-64px)]">
      {/* Alert strip */}
      {reviewDue > 0 && (
        <div className="flex items-center gap-2.5 px-6 py-2.5 bg-[#FFF8E8] border-b border-[rgba(186,117,23,0.2)] text-[13px] text-[#633806]">
          <AlertCircle className="w-[15px] h-[15px] stroke-[#BA7517] flex-shrink-0" />
          <span>{reviewDue} clients are due for treatment plan reassessment this week.</span>
          <button onClick={() => setTab('reviews')} className="text-[#BA7517] font-medium underline cursor-pointer">Review now →</button>
        </div>
      )}

      {/* Stat strip */}
      <div className="flex gap-3 px-6 py-4 bg-white border-b border-[rgba(0,0,0,0.08)] overflow-x-auto">
        {[
          { n: COURSES.length, l: 'Active courses' },
          { n: reviewDue, l: 'Review due', sub: 'This week', color: '#BA7517' },
          { n: onTrack, l: 'On track', sub: '↑ all improving', subColor: '#1D9E75' },
          { n: 62, l: 'Sessions this month' },
          { n: '$7,440', l: 'Revenue (Mar)' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--warm)] rounded-[10px] px-4 py-3 flex flex-col min-w-[110px]">
            <div className="font-[var(--font-display)] text-[22px] leading-none" style={{ color: s.color || 'var(--ink)' }}>{s.n}</div>
            <div className="text-[11px] text-[var(--ink-muted)] mt-1">{s.l}</div>
            {s.sub && <div className="text-[10px] font-medium mt-0.5" style={{ color: s.subColor || s.color || 'inherit' }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-between bg-white border-b border-[rgba(0,0,0,0.08)] px-6">
        <div className="flex">
          {([['courses', `Treatment courses (${COURSES.length})`], ['eod', 'End-of-day billing'], ['reviews', `Reviews due (${reviewDue})`]] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3.5 text-[13px] border-b-2 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                tab === t
                  ? 'text-[var(--sage-deep)] border-[var(--sage)] font-medium'
                  : 'text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 py-2">
          <select className="px-3 py-[7px] border border-[rgba(0,0,0,0.08)] rounded-[7px] bg-white text-[12px] text-[var(--ink-soft)] cursor-pointer outline-none">
            <option>All statuses</option>
            <option>Active</option>
            <option>Review due</option>
            <option>Overdue</option>
            <option>Completed</option>
          </select>
          <select className="px-3 py-[7px] border border-[rgba(0,0,0,0.08)] rounded-[7px] bg-white text-[12px] text-[var(--ink-soft)] cursor-pointer outline-none">
            <option>All areas</option>
            <option>Cervical</option>
            <option>Lumbar</option>
            <option>Shoulder</option>
            <option>Knee</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6">

        {/* COURSES TAB */}
        {tab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {COURSES.map((c, i) => <CourseCard key={i} course={c} />)}
            {/* New course CTA */}
            <div
              className="bg-white rounded-[13px] flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[200px] transition-colors duration-150 hover:bg-[var(--sage-pale)]"
              style={{ border: '1.5px dashed var(--sage-light)' }}
            >
              <div className="text-[28px] mb-2.5">+</div>
              <div className="text-[14px] font-medium text-[var(--ink)] mb-1">Start a new treatment course</div>
              <div className="text-[12px] text-[var(--ink-muted)]">Set diagnosis, goals, session count, and outcome measures in 60 seconds</div>
            </div>
          </div>
        )}

        {/* EOD BILLING TAB */}
        {tab === 'eod' && (
          <div>
            <div className="font-[var(--font-display)] text-[22px] text-[var(--ink)] mb-1">End-of-day billing</div>
            <div className="text-[13px] text-[var(--ink-muted)] mb-5">Monday, March 16 · {EOD_CLIENTS.length} sessions completed · ${totalRevenue} to invoice · Takes 30 seconds</div>
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[13px] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.08)]">
                <div className="font-[var(--font-display)] text-[18px] text-[var(--ink)]">Today's sessions</div>
                <div className="text-[14px] font-medium text-[var(--sage-deep)]">${totalRevenue}.00 pending</div>
              </div>
              {EOD_CLIENTS.map((client, i) => {
                const isSent = sentInvoices.has(i);
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-[rgba(0,0,0,0.05)] last:border-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0" style={{ background: client.avatarBg, color: client.avatarColor }}>
                      {client.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[var(--ink)]">{client.name}</div>
                      <div className="text-[12px] text-[var(--ink-muted)] truncate">{client.detail}</div>
                    </div>
                    <div className="text-[15px] font-medium text-[var(--ink)] mr-2">${client.amount}</div>
                    <button
                      onClick={() => markSent(i)}
                      disabled={isSent}
                      className={`px-3.5 py-[7px] border rounded-[7px] text-[12px] font-medium cursor-pointer transition-all duration-150 whitespace-nowrap ${
                        isSent
                          ? 'bg-[#e8f4f0] border-[var(--sage-light)] text-[var(--sage-deep)]'
                          : 'bg-white border-[rgba(0,0,0,0.13)] text-[var(--ink-soft)] hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]'
                      }`}
                    >
                      {isSent ? '✓ Sent' : 'Generate + send →'}
                    </button>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--warm)]">
                <div className="text-[13px] text-[var(--ink-muted)]">
                  {sentInvoices.size} of {EOD_CLIENTS.length} invoices sent
                </div>
                <button
                  onClick={invoiceAll}
                  disabled={allSent}
                  className={`px-6 py-2.5 rounded-[9px] text-[14px] font-medium cursor-pointer transition-colors duration-150 ${
                    allSent ? 'bg-[#1D9E75] text-white' : 'bg-[var(--sage)] text-white hover:bg-[var(--sage-deep)]'
                  }`}
                >
                  {allSent ? `All done — $${totalRevenue} invoiced ✓` : `Send all ${EOD_CLIENTS.length} invoices at once →`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS DUE TAB */}
        {tab === 'reviews' && (
          <div>
            <div className="bg-[var(--sage)] rounded-[10px] p-4 mb-5 flex items-center gap-3">
              <AlertCircle className="w-[22px] h-[22px] stroke-white flex-shrink-0" />
              <div className="flex-1">
                <div className="text-[14px] font-medium text-white mb-0.5">{reviewDue} clients are due for formal treatment plan reassessment</div>
                <div className="text-[12px] text-white/70">College standards require documentation when extending, modifying or closing a course of treatment.</div>
              </div>
              <button className="px-4 py-2 bg-white text-[var(--sage-deep)] rounded-[7px] text-[13px] font-medium cursor-pointer flex-shrink-0">
                Review all {reviewDue} →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {COURSES.filter(c => c.status === 'review').map((c, i) => (
                <div key={i} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[13px] overflow-hidden">
                  <div className="p-[15px_17px] border-b border-[rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0" style={{ background: c.avatarBg, color: c.avatarColor }}>
                        {c.initials}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-[var(--ink)]">{c.name}</div>
                        <div className="text-[12px] text-[var(--ink-muted)]">Session {c.session} of {c.totalSessions} · Reassessment overdue</div>
                      </div>
                      <span className="ml-auto text-[11px] font-medium px-2.5 py-[3px] rounded bg-[#fde8e8] text-[#791F1F]">Act now</span>
                    </div>
                  </div>
                  <div className="px-[17px] py-[14px] border-b border-[rgba(0,0,0,0.08)]">
                    <p className="text-[13px] text-[var(--ink-soft)] leading-[1.6]">
                      Original goals: Return to running 5km, reduce Oswestry to under 20%. Current: 28% (from 46%). Recommend: <strong>extend 4 sessions</strong> to consolidate gains and complete strength program.
                    </p>
                  </div>
                  <div className="flex gap-1.5 px-[17px] py-[10px] flex-wrap">
                    <button className="px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border cursor-pointer bg-[#fde8e8] border-[#f09595] text-[#791F1F]">
                      Extend course (+4 sessions)
                    </button>
                    <button className="px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border border-[rgba(0,0,0,0.08)] bg-white text-[var(--ink-soft)] cursor-pointer hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] transition-all">
                      Discharge
                    </button>
                    <button className="px-[11px] py-1.5 rounded-[7px] text-[12px] font-medium border border-[rgba(0,0,0,0.08)] bg-white text-[var(--ink-soft)] cursor-pointer hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] transition-all">
                      Refer onward
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
