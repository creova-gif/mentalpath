import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00'];

const WEEKS = [
  { label: 'Mar 9 – Mar 13, 2026', startDate: 9 },
  { label: 'Mar 16 – Mar 20, 2026', startDate: 16 },
  { label: 'Mar 23 – Mar 27, 2026', startDate: 23 },
];

const appointmentsByWeek: Record<number, { id: number; client: string; day: number; startHour: number; duration: number; type: string }[]> = {
  0: [
    { id: 1, client: 'Jamal L.', day: 0, startHour: 2, duration: 1, type: 'blue' },
    { id: 2, client: 'Amara M.', day: 2, startHour: 1, duration: 1, type: 'green' },
    { id: 3, client: 'Sadia M.', day: 4, startHour: 3, duration: 1, type: 'amber' },
  ],
  1: [
    { id: 1, client: 'Amara M.', day: 1, startHour: 2, duration: 1, type: 'green' },
    { id: 2, client: 'Jamal L.', day: 1, startHour: 3, duration: 1, type: 'blue' },
    { id: 3, client: 'Sadia M.', day: 0, startHour: 0, duration: 1, type: 'amber' },
    { id: 4, client: 'Priya & Chetan', day: 2, startHour: 5, duration: 1.5, type: 'purple' },
    { id: 5, client: 'Marcus N.', day: 4, startHour: 1, duration: 1, type: 'green' },
  ],
  2: [
    { id: 1, client: 'Riya B.', day: 0, startHour: 1, duration: 1, type: 'purple' },
    { id: 2, client: 'Amara M.', day: 2, startHour: 2, duration: 1, type: 'green' },
    { id: 3, client: 'Jamal L.', day: 3, startHour: 3, duration: 1, type: 'blue' },
  ],
};

const upcomingToday = [
  { time: '10:00', initials: 'AM', name: 'Amara M.', type: 'Individual', color: 'bg-[#d4e8e4] text-[var(--sage-deep)]' },
  { time: '11:30', initials: 'JL', name: 'Jamal L.', type: 'Individual', color: 'bg-[#dde8f5] text-[#0C447C]' },
  { time: '2:30', initials: 'SM', name: 'Sadia M.', type: 'Individual', color: 'bg-[#faeeda] text-[#633806]' },
];

export function CalendarView() {
  const navigate = useNavigate();
  const [weekIdx, setWeekIdx] = useState(1);

  const week = WEEKS[weekIdx];
  const appointments = appointmentsByWeek[weekIdx] || [];

  const prevWeek = () => setWeekIdx(i => Math.max(0, i - 1));
  const nextWeek = () => setWeekIdx(i => Math.min(WEEKS.length - 1, i + 1));

  return (
    <div>
      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* Main Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-display)] text-xl text-[var(--ink)]">{week.label}</h2>
            <div className="flex gap-2 items-center">
              <button
                onClick={prevWeek}
                disabled={weekIdx === 0}
                className="px-3.5 py-1.75 border border-[var(--border)] rounded-lg bg-white cursor-pointer text-[13px] text-[var(--ink-soft)] transition-all hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekIdx(1)}
                className="px-3.5 py-1.75 border border-[var(--border)] rounded-lg bg-white cursor-pointer text-[13px] text-[var(--ink-soft)] transition-all hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)]"
              >
                Today
              </button>
              <button
                onClick={nextWeek}
                disabled={weekIdx === WEEKS.length - 1}
                className="px-3.5 py-1.75 border border-[var(--border)] rounded-lg bg-white cursor-pointer text-[13px] text-[var(--ink-soft)] transition-all hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] bg-[var(--warm)] border-b border-[var(--border)]">
              <div className="p-2.5" />
              {weekDays.map((day, idx) => (
                <div
                  key={day}
                  className={`p-2.5 text-center text-xs font-medium uppercase tracking-[0.5px] ${
                    weekIdx === 1 && idx === 0 ? 'text-[var(--sage-deep)]' : 'text-[var(--ink-muted)]'
                  }`}
                >
                  {day}
                  <div className="text-base font-medium mt-0.5">{week.startDate + idx}</div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] relative">
              {timeSlots.map((time, timeIdx) => (
                <div key={time} className="contents">
                  <div className="border-r border-[var(--border)] text-right pr-2.5 pt-2 text-[11px] text-[var(--ink-muted)] relative -top-1.5">
                    {time}
                  </div>
                  {weekDays.map((_, dayIdx) => (
                    <div
                      key={`${dayIdx}-${timeIdx}`}
                      onClick={() => navigate('/book')}
                      className="border-r border-b border-[var(--border)] min-h-[40px] relative cursor-pointer transition-colors hover:bg-[rgba(74,124,111,0.05)]"
                      title="Click to book appointment"
                    >
                      {/* Render appointments */}
                      {appointments
                        .filter(apt => apt.day === dayIdx && apt.startHour === timeIdx)
                        .map(apt => (
                          <div
                            key={apt.id}
                            onClick={(e) => { e.stopPropagation(); navigate('/dashboard/clients'); }}
                            className={`absolute left-0.5 right-0.5 rounded-md p-1.5 cursor-pointer transition-opacity hover:opacity-85 z-10 ${
                              apt.type === 'green' ? 'bg-[#d4e8e4] border-l-[3px] border-[var(--sage)]' :
                              apt.type === 'blue' ? 'bg-[#dde8f5] border-l-[3px] border-[#378ADD]' :
                              apt.type === 'amber' ? 'bg-[#faeeda] border-l-[3px] border-[#BA7517]' :
                              'bg-[#EEEDFE] border-l-[3px] border-[#534AB7]'
                            }`}
                            style={{
                              top: '2px',
                              height: `calc(${apt.duration * 40}px - 4px)`
                            }}
                          >
                            <div className={`text-xs font-medium overflow-hidden whitespace-nowrap text-ellipsis ${
                              apt.type === 'green' ? 'text-[var(--sage-deep)]' :
                              apt.type === 'blue' ? 'text-[#0C447C]' :
                              apt.type === 'amber' ? 'text-[#633806]' :
                              'text-[#26215C]'
                            }`}>
                              {apt.client}
                            </div>
                            <div className={`text-[11px] opacity-80 ${
                              apt.type === 'green' ? 'text-[var(--sage-deep)]' :
                              apt.type === 'blue' ? 'text-[#0C447C]' :
                              apt.type === 'amber' ? 'text-[#633806]' :
                              'text-[#26215C]'
                            }`}>
                              {time}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="text-[13px] font-medium text-[var(--ink)] mb-2.5">Today's schedule</div>
            <div className="space-y-2">
              {upcomingToday.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/dashboard/clients')}
                  className="flex gap-2.5 py-2 border-b border-[var(--border)] text-[13px] last:border-0 cursor-pointer hover:bg-[var(--warm)] rounded-lg px-1.5 -mx-1.5 transition-colors"
                >
                  <div className="text-[var(--ink-muted)] min-w-[45px] text-xs">{item.time}</div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium flex-shrink-0 ${item.color}`}>
                    {item.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[var(--ink)] font-medium">{item.name}</div>
                    <div className="text-[var(--ink-muted)] text-[11px]">{item.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="text-[13px] font-medium text-[var(--ink)] mb-2.5">Quick stats</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">This week</span>
                <span className="font-medium text-[var(--ink)]">12 sessions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">Next week</span>
                <span className="font-medium text-[var(--ink)]">14 sessions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">Available slots</span>
                <span className="font-medium text-[var(--sage)]">8 open</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/book')}
            className="w-full py-2.5 rounded-lg bg-[var(--sage)] text-white border-none text-[13px] font-medium cursor-pointer transition-colors hover:bg-[var(--sage-deep)] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New appointment
          </button>
        </div>
      </div>
    </div>
  );
}
