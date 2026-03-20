import { useState } from 'react';
import { useNavigate } from 'react-router';
import { NoteModal } from '../modals/NoteModal';
import { useUser } from '../../context/UserContext';

const PROFESSION_SESSIONS: Record<string, Array<{ time: string; initials: string; name: string; type: string; status: string; color: string }>> = {
  'Chiropractor': [
    { time: '8:30', initials: 'LK', name: 'Lena Kim', type: 'Adjustment · 30 min · Follow-up', status: 'done', color: 'c-av-a' },
    { time: '9:00', initials: 'TW', name: 'Tom Walsh', type: 'Initial assessment · 45 min', status: 'done', color: 'c-av-b' },
    { time: '10:00', initials: 'MD', name: 'Maria Diaz', type: 'Adjustment · 30 min · Session 4', status: 'now', color: 'c-av-c' },
    { time: '11:30', initials: 'JP', name: 'James Park', type: 'Adjustment · 30 min · Note due', status: 'note-due', color: 'c-av-d' },
    { time: '2:00', initials: 'BN', name: 'Beth Norton', type: 'Follow-up · 45 min · Session 7', status: 'upcoming', color: 'c-av-e' },
    { time: '3:30', initials: 'RS', name: 'Raj Singh', type: 'Adjustment · 30 min · New patient', status: 'upcoming', color: 'c-av-f' },
  ],
  'Physiotherapist': [
    { time: '8:00', initials: 'AM', name: 'Aisha Mohammed', type: 'Assessment · 60 min · Initial', status: 'done', color: 'c-av-a' },
    { time: '9:30', initials: 'CH', name: 'Connor Huang', type: 'Rehab · 45 min · Session 6', status: 'done', color: 'c-av-b' },
    { time: '11:00', initials: 'FL', name: 'Fatima Leblanc', type: 'Manual therapy · 45 min', status: 'now', color: 'c-av-c' },
    { time: '1:00', initials: 'DO', name: "Declan O'Brien", type: 'Rehab · 45 min · Note due', status: 'note-due', color: 'c-av-d' },
    { time: '2:30', initials: 'YS', name: 'Yuki Suzuki', type: 'Post-surgical · 60 min · Session 12', status: 'upcoming', color: 'c-av-e' },
    { time: '4:00', initials: 'PG', name: 'Priya Gill', type: 'Discharge assessment · 45 min', status: 'upcoming', color: 'c-av-f' },
  ],
  'Registered Massage Therapist': [
    { time: '9:00', initials: 'SK', name: 'Sara Kowalski', type: 'Deep tissue · 60 min · Session 3', status: 'done', color: 'c-av-a' },
    { time: '10:30', initials: 'MT', name: 'Marcus Thompson', type: 'Swedish · 90 min · Relaxation', status: 'done', color: 'c-av-b' },
    { time: '12:00', initials: 'LB', name: 'Laura Berg', type: 'Sports massage · 60 min', status: 'now', color: 'c-av-c' },
    { time: '2:00', initials: 'KN', name: 'Kevin Nkrumah', type: 'Hot stone · 75 min · Note due', status: 'note-due', color: 'c-av-d' },
    { time: '3:30', initials: 'PV', name: 'Priya Verma', type: 'Prenatal · 60 min · Session 5', status: 'upcoming', color: 'c-av-e' },
    { time: '5:00', initials: 'AD', name: 'Alex Dubois', type: 'Deep tissue · 60 min · New client', status: 'upcoming', color: 'c-av-f' },
  ],
};

const DEFAULT_SESSIONS = [
  { time: '9:00', initials: 'SM', name: 'Sadia Mohamoud', type: 'Individual · 50 min · Session 8', status: 'done', color: 'c-av-a' },
  { time: '10:00', initials: 'AM', name: 'Amara Mensah', type: 'Individual · 50 min · Session 14', status: 'now', color: 'c-av-b' },
  { time: '11:30', initials: 'JL', name: 'Jamal Lee', type: 'Individual · 50 min · Note due', status: 'note-due', color: 'c-av-c' },
  { time: '2:00', initials: 'PC', name: 'Priya & Chetan Choudhary', type: 'Couples · 80 min · Session 3', status: 'upcoming', color: 'c-av-d' },
  { time: '3:30', initials: 'RB', name: 'Riya Bhatt', type: 'Individual · 50 min · Session 2', status: 'upcoming', color: 'c-av-e' },
  { time: '5:00', initials: 'MN', name: 'Marcus Nwosu', type: 'Individual · 50 min · Intake', status: 'upcoming', color: 'c-av-f' },
];

const PROFESSION_TASKS: Record<string, Array<{ text: string; done: boolean; due?: string }>> = {
  'Chiropractor': [
    { text: 'Send OHIP receipt to Tom W.', done: true },
    { text: 'Complete SOAP note — James P.', done: false, due: 'Due tonight 11pm' },
    { text: 'Review X-ray report — Maria D.', done: false, due: 'Before 5:00 pm today' },
    { text: 'Follow up — Raj S. extended health authorization', done: false },
  ],
  'Physiotherapist': [
    { text: 'Send treatment summary to Aisha M.', done: true },
    { text: "Complete SOAP note — Declan O'Brien", done: false, due: 'Due tonight 11pm' },
    { text: 'Review intake form — Priya G.', done: false, due: 'Before 4:00 pm today' },
    { text: 'Follow up — Yuki S. WSIB authorization', done: false },
  ],
  'Registered Massage Therapist': [
    { text: 'Send receipt to Sara K.', done: true },
    { text: 'Complete SOAP note — Kevin N.', done: false, due: 'Due tonight 11pm' },
    { text: 'Review intake form — Alex D.', done: false, due: 'Before 5:00 pm today' },
    { text: 'Follow up — Priya V. extended health claim', done: false },
  ],
};

const DEFAULT_TASKS = [
  { text: 'Send receipt to Sadia M.', done: true },
  { text: 'Complete DAP note — Jamal L.', done: false, due: 'Due tonight 11pm' },
  { text: 'Review intake form — Marcus N.', done: false, due: 'Before 5:00 pm today' },
  { text: 'Follow up — Riya B. sliding scale update', done: false },
];

const PROFESSION_STATS: Record<string, { sessions: string; clients: string; billed: string; notes: string }> = {
  'Chiropractor': { sessions: '8', clients: '31', billed: '$2,040', notes: '2' },
  'Physiotherapist': { sessions: '6', clients: '28', billed: '$3,480', notes: '1' },
  'Registered Massage Therapist': { sessions: '5', clients: '18', billed: '$1,425', notes: '1' },
};

const DEFAULT_STATS = { sessions: '6', clients: '23', billed: '$4,200', notes: '3' };

export function Overview() {
  const navigate = useNavigate();
  const { user, subscription } = useUser();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const profession = user?.profession ?? '';
  const sessions = PROFESSION_SESSIONS[profession] ?? DEFAULT_SESSIONS;
  const tasks0 = PROFESSION_TASKS[profession] ?? DEFAULT_TASKS;
  const stats = PROFESSION_STATS[profession] ?? DEFAULT_STATS;
  const notesLabel = user?.notesLabel ?? 'Session Notes';

  const [taskList, setTaskList] = useState(tasks0);

  const toggleTask = (index: number) => {
    setTaskList(prev => prev.map((task, i) => (i === index ? { ...task, done: !task.done } : task)));
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.firstName ?? 'Doctor';

  return (
    <>
      {/* Welcome bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-[var(--font-display)] text-xl text-[var(--ink)]">{greeting}, {firstName}</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Monday March 16, 2026 · {user?.profession}{user?.registrationNumber ? ` · ${user.registrationNumber}` : ''}
          </p>
        </div>
        {subscription?.isTrial && (
          <div className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            {subscription.trialDaysRemaining} days left in trial — <button onClick={() => navigate('/dashboard/settings')} className="underline bg-transparent border-none cursor-pointer text-amber-700 text-xs font-medium p-0">Upgrade</button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
        <StatCard label="Sessions today" value={stats.sessions} delta="2 completed · upcoming" />
        <StatCard label="Active clients" value={stats.clients} delta="+2 this month" />
        <StatCard label="Billed this month" value={stats.billed} delta="Outstanding pending" />
        <StatCard label="Notes due" value={stats.notes} delta="Within 24hrs" negative />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 sm:gap-5">
        {/* Today's Sessions */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-5 lg:mb-0">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border)]">
            <span className="text-sm font-medium text-[var(--ink)]">
              <span className="hidden sm:inline">Today's appointments — Monday March 16</span>
              <span className="sm:hidden">Today's appointments</span>
            </span>
            <button onClick={() => navigate('/dashboard/calendar')} className="text-xs text-[var(--sage)] font-medium cursor-pointer bg-transparent border-none px-2 py-1 rounded hover:bg-[var(--sage-pale)]">
              View calendar
            </button>
          </div>
          <div className="flex flex-col gap-0">
            {sessions.map((session, i) => (
              <div
                key={i}
                onClick={() => navigate('/dashboard/clients')}
                className={`flex items-center gap-2 sm:gap-3.5 px-3 sm:px-5 py-3 sm:py-3.5 border-t border-[var(--border)] cursor-pointer transition-all duration-100 hover:bg-[var(--warm)] ${
                  i === 0 ? 'border-t-0' : ''
                } ${session.status === 'now' ? 'bg-[var(--sage)]/[0.04]' : ''}`}
              >
                <div className="text-xs text-[var(--ink-muted)] min-w-[40px] sm:min-w-[48px]">{session.time}</div>
                <div className={`w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(session.color)}`}>
                  {session.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--ink)] truncate">{session.name}</div>
                  <div className="text-xs text-[var(--ink-muted)] truncate">{session.type}</div>
                </div>
                {session.status === 'done' && (
                  <span className="text-[11px] bg-[#e8f4f0] text-[var(--sage-deep)] px-2 py-[3px] rounded font-medium flex-shrink-0">Done</span>
                )}
                {session.status === 'now' && (
                  <span className="bg-[var(--sage)] text-white text-[11px] px-2 py-[3px] rounded font-medium flex-shrink-0">Now</span>
                )}
                {session.status === 'note-due' && (
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedClient(session.name); }}
                    className="px-2 sm:px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] flex-shrink-0"
                  >
                    Add note
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Tasks */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border)]">
              <span className="text-sm font-medium text-[var(--ink)]">Tasks</span>
              <button className="text-xs text-[var(--sage)] font-medium cursor-pointer bg-transparent border-none px-2 py-1 rounded hover:bg-[var(--sage-pale)]">Add task</button>
            </div>
            <div>
              {taskList.map((task, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 sm:px-5 py-3 border-t border-[var(--border)] first:border-t-0">
                  <div
                    onClick={() => toggleTask(i)}
                    className={`w-4 h-4 rounded border-[1.5px] flex-shrink-0 mt-0.5 cursor-pointer ${
                      task.done ? 'bg-[var(--sage)] border-[var(--sage)]' : 'border-[var(--border)]'
                    }`}
                  />
                  <div className="flex-1">
                    <div className={`text-[13px] text-[var(--ink-soft)] leading-[1.5] ${task.done ? 'line-through text-[var(--ink-muted)]' : ''}`}>{task.text}</div>
                    {task.due && !task.done && <div className="text-[11px] text-[var(--gold)] font-medium">{task.due}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 pb-5">
            <div className="text-sm font-medium text-[var(--ink)] mb-3">Monthly revenue</div>
            <div className="h-20 flex items-end gap-2">
              {[
                { month: 'Nov', height: 45 },
                { month: 'Dec', height: 52 },
                { month: 'Jan', height: 38 },
                { month: 'Feb', height: 60 },
                { month: 'Mar', height: 70, active: true },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-t ${bar.active ? 'bg-[var(--sage)]' : 'bg-[var(--sage-pale)]'}`} style={{ height: `${bar.height}px` }} />
                  <span className={`text-[10px] ${bar.active ? 'text-[var(--sage-deep)] font-medium' : 'text-[var(--ink-muted)]'}`}>{bar.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 text-xs text-[var(--ink-muted)]">
              {stats.billed} collected · Outstanding pending
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <span className="text-sm font-medium text-[var(--ink)]">Quick actions</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)]">
              {[
                { label: `New ${notesLabel.split(' ')[0]} note`, icon: '📝', path: '/session-note-editor' },
                { label: 'New invoice', icon: '💳', path: '/dashboard/billing' },
                { label: 'Insurance receipt', icon: '🧾', path: '/dashboard/insurance-receipts' },
                { label: 'Add client', icon: '👤', path: '/dashboard/clients' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 px-4 py-3 bg-transparent border-none cursor-pointer text-left hover:bg-[var(--warm)] transition-colors"
                >
                  <span className="text-sm">{action.icon}</span>
                  <span className="text-[12px] text-[var(--ink-soft)] font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedClient && <NoteModal clientName={selectedClient} onClose={() => setSelectedClient(null)} />}
    </>
  );
}

function StatCard({ label, value, delta, negative }: { label: string; value: string; delta: string; negative?: boolean }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 sm:p-5">
      <div className="text-[10px] sm:text-xs text-[var(--ink-muted)] font-medium uppercase tracking-[0.5px] mb-1 sm:mb-2">{label}</div>
      <div className="font-[var(--font-display)] text-[20px] sm:text-[28px] text-[var(--ink)] mb-0.5 sm:mb-1">{value}</div>
      <div className={`text-[10px] sm:text-xs ${negative ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{delta}</div>
    </div>
  );
}

function getAvatarColor(color: string) {
  const colors: Record<string, string> = {
    'c-av-a': 'bg-[#d4e8e4] text-[var(--sage-deep)]',
    'c-av-b': 'bg-[#e8d4d4] text-[#7a3030]',
    'c-av-c': 'bg-[#d4d4e8] text-[#303070]',
    'c-av-d': 'bg-[#e8e4d4] text-[#5a4a10]',
    'c-av-e': 'bg-[#e4d4e8] text-[#5a1a6a]',
    'c-av-f': 'bg-[#d4e8d4] text-[#1a5a1a]',
  };
  return colors[color] || colors['c-av-a'];
}
