import { useState } from 'react';
import { useNavigate } from 'react-router';
import { NoteModal } from '../modals/NoteModal';

export function Overview() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const sessions = [
    { time: '9:00', initials: 'SM', name: 'Sadia Mohamoud', type: 'Individual · 50 min · Session 8', status: 'done', color: 'c-av-a' },
    { time: '10:00', initials: 'AM', name: 'Amara Mensah', type: 'Individual · 50 min · Session 14', status: 'now', color: 'c-av-b' },
    { time: '11:30', initials: 'JL', name: 'Jamal Lee', type: 'Individual · 50 min · Note due', status: 'note-due', color: 'c-av-c' },
    { time: '2:00', initials: 'PC', name: 'Priya & Chetan Choudhary', type: 'Couples · 80 min · Session 3', status: 'upcoming', color: 'c-av-d' },
    { time: '3:30', initials: 'RB', name: 'Riya Bhatt', type: 'Individual · 50 min · Session 2', status: 'upcoming', color: 'c-av-e' },
    { time: '5:00', initials: 'MN', name: 'Marcus Nwosu', type: 'Individual · 50 min · Intake', status: 'upcoming', color: 'c-av-f' },
  ];

  const tasks = [
    { text: 'Send receipt to Sadia M.', done: true },
    { text: 'Complete DAP note — Jamal L.', done: false, due: 'Due tonight 11pm' },
    { text: 'Review intake form — Marcus N.', done: false, due: 'Before 5:00 pm today' },
    { text: 'Follow up — Riya B. sliding scale update', done: false },
  ];

  const [taskList, setTaskList] = useState(tasks);

  const toggleTask = (index: number) => {
    setTaskList((prev) =>
      prev.map((task, i) => (i === index ? { ...task, done: !task.done } : task))
    );
  };

  return (
    <>
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
        <StatCard label="Sessions today" value="6" delta="2 completed · 4 upcoming" />
        <StatCard label="Active clients" value="23" delta="+2 this month" />
        <StatCard label="Billed this month" value="$4,200" delta="$840 pending" />
        <StatCard label="Notes due" value="3" delta="Within 24hrs" negative />
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 sm:gap-5">
        {/* Today's Sessions */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-5 lg:mb-0">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border)]">
            <span className="text-sm font-medium text-[var(--ink)]">
              <span className="hidden sm:inline">Today's sessions — Monday March 16</span>
              <span className="sm:hidden">Today's sessions</span>
            </span>
            <button onClick={() => navigate('/dashboard/calendar')} className="text-xs text-[var(--sage)] font-medium cursor-pointer bg-none border-none px-2 py-1 rounded-[5px] transition-all duration-150 hover:bg-[var(--sage-pale)]">
              <span className="hidden sm:inline">View calendar</span>
              <span className="sm:hidden">Calendar</span>
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
                  <div className="text-xs text-[var(--ink-muted)] truncate sm:whitespace-normal">{session.type}</div>
                </div>
                {session.status === 'done' && (
                  <span className="text-[11px] bg-[#e8f4f0] text-[var(--sage-deep)] px-2 py-[3px] rounded font-medium flex-shrink-0">Done</span>
                )}
                {session.status === 'now' && (
                  <span className="bg-[var(--sage)] text-white text-[11px] px-2 py-[3px] rounded font-medium flex-shrink-0">Now</span>
                )}
                {session.status === 'note-due' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedClient(session.name); }}
                    className="px-2 sm:px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)] flex-shrink-0"
                  >
                    <span className="hidden sm:inline">Add note</span>
                    <span className="sm:hidden">Note</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Tasks and Revenue */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Tasks */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--border)]">
              <span className="text-sm font-medium text-[var(--ink)]">Tasks</span>
              <button className="text-xs text-[var(--sage)] font-medium cursor-pointer bg-none border-none px-2 py-1 rounded-[5px] transition-all duration-150 hover:bg-[var(--sage-pale)]">
                Add task
              </button>
            </div>
            <div className="p-0">
              {taskList.map((task, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 sm:px-5 py-3 border-t border-[var(--border)] first:border-t-0">
                  <div
                    onClick={() => toggleTask(i)}
                    className={`w-4 h-4 rounded border-[1.5px] border-[var(--border)] flex-shrink-0 mt-0.5 cursor-pointer ${
                      task.done ? 'bg-[var(--sage)] border-[var(--sage)]' : ''
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] text-[var(--ink-soft)] leading-[1.5] ${task.done ? 'line-through text-[var(--ink-muted)]' : ''}`}>
                      {task.text}
                    </div>
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
                  <div
                    className={`w-full rounded-t ${bar.active ? 'bg-[var(--sage)]' : 'bg-[var(--sage-pale)]'}`}
                    style={{ height: `${bar.height}px` }}
                  />
                  <span className={`text-[10px] ${bar.active ? 'text-[var(--sage-deep)] font-medium' : 'text-[var(--ink-muted)]'}`}>
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 text-xs text-[var(--ink-muted)]">
              <span className="hidden sm:inline">$4,200 collected · $840 outstanding</span>
              <span className="sm:hidden">$4.2k collected</span>
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