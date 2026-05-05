import { useState } from 'react';
import { Send } from 'lucide-react';

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead or of hurting yourself in some way'
];

const OPTIONS = ['Not at all', 'Several days', 'More than half', 'Nearly every day'];

export function OutcomeMeasures() {
  const [selectedClient, setSelectedClient] = useState('Amara Mensah');
  const [showAdminister, setShowAdminister] = useState(false);
  const [phqScores, setPhqScores] = useState<number[]>(new Array(9).fill(0));

  const clients = [
    { initials: 'AM', name: 'Amara Mensah', last: 'Last: Mar 10 · Session 14', badge: 'Improving', badgeClass: 'bg-[#e8f4f0] text-[var(--sage-deep)]', color: '#d4e8e4' },
    { initials: 'JL', name: 'Jamal Lee', last: 'Last: Feb 28 · Session 22', badge: 'Stable', badgeClass: 'bg-[#faeeda] text-[#633806]', color: '#faeeda' },
    { initials: 'SM', name: 'Sadia Mohamoud', last: 'Last: Feb 12 · Session 8', badge: 'Moderate', badgeClass: 'bg-[#faeeda] text-[#633806]', color: '#d4e8d4' },
    { initials: 'RB', name: 'Riya Bhatt', last: 'No measures yet', badge: 'None', badgeClass: 'bg-[var(--warm)] text-[var(--ink-muted)]', color: '#d4d4e8' }
  ];

  const setScore = (questionIndex: number, score: number) => {
    const newScores = [...phqScores];
    newScores[questionIndex] = score;
    setPhqScores(newScores);
  };

  const totalScore = phqScores.reduce((a, b) => a + b, 0);
  const severity = totalScore <= 4 ? 'Minimal' : totalScore <= 9 ? 'Mild' : totalScore <= 14 ? 'Moderate' : totalScore <= 19 ? 'Moderately severe' : 'Severe';
  const severityColor = totalScore <= 4 ? '#1D9E75' : totalScore <= 9 ? '#BA7517' : '#c0392b';

  const [savedBanner, setSavedBanner] = useState(false);

  const saveScores = () => {
    setShowAdminister(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  return (
    <div className="min-h-screen bg-[var(--warm)]">
      {/* Topbar */}
      <div className="bg-white border-b border-[var(--border)] px-7 h-[54px] flex items-center justify-between sticky top-0 z-40">
        <div className="font-[var(--font-display)] text-xl text-[var(--ink)]">Outcome measures</div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdminister(true)} className="btn-ghost">
            Administer measure
          </button>
          <button className="btn-primary">
            Send to client portal →
          </button>
        </div>
      </div>

      {/* Save success banner */}
      {savedBanner && (
        <div className="bg-[#e8f4f0] border-b border-[#b8ddd4] px-7 py-3 flex items-center gap-2 text-[13px] text-[var(--sage-deep)] font-medium">
          <span>✓</span> PHQ-9 scores saved successfully.
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-[280px_1fr] gap-5">
          {/* Client List */}
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden sticky top-[70px]">
            <div className="px-4 py-3 border-b border-[var(--border)] text-[13px] font-medium text-[var(--ink)]">
              Clients with measures
            </div>
            {clients.map((client, i) => (
              <div
                key={i}
                onClick={() => setSelectedClient(client.name)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[var(--border)] last:border-b-0 cursor-pointer transition-colors ${
                  selectedClient === client.name ? 'bg-[var(--sage-pale)]' : 'hover:bg-[var(--warm)]'
                }`}
              >
                <div
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-medium"
                  style={{ background: client.color, color: 'var(--sage-deep)' }}
                >
                  {client.initials}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-[var(--ink)]">{client.name}</div>
                  <div className="text-[11px] text-[var(--ink-muted)]">{client.last}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${client.badgeClass}`}>
                  {client.badge}
                </span>
              </div>
            ))}
          </div>

          {/* Outcome Detail */}
          <div className="flex flex-col gap-4">
            {/* Main Card */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
                <div>
                  <div className="text-[14px] font-medium text-[var(--ink)]">Amara Mensah — Outcome tracking</div>
                  <div className="text-[12px] text-[var(--ink-muted)]">PHQ-9 (depression) · GAD-7 (anxiety) · Session 1 to Session 14</div>
                </div>
                <button className="flex items-center gap-1.5 px-3.5 py-2 border border-[var(--bmed)] rounded-lg bg-white text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]">
                  <Send className="w-[13px] h-[13px]" />
                  Assign measure
                </button>
              </div>

              <div className="p-5">
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-3.5 mb-5">
                  {/* PHQ-9 */}
                  <div className="border border-[var(--border)] rounded-lg p-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--ink-muted)] mb-2">PHQ-9 · Depression</div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-[var(--font-display)] text-[28px] text-[var(--ink)]">3</span>
                      <span className="text-[13px] text-[var(--ink-muted)]">/ 27</span>
                      <span className="text-[13px] font-medium text-[var(--green)]">Minimal</span>
                    </div>
                    <div className="text-[12px] text-[var(--green)] mt-1">↓ 7 points since intake (score was 10)</div>
                    
                    {/* Trend Chart */}
                    <div className="h-[120px] mt-2">
                      <svg className="w-full h-full" viewBox="0 0 260 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="phqGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4a7c6f" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#4a7c6f" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width="260" height="18" fill="#fde8e8" fillOpacity="0.3" />
                        <rect x="0" y="18" width="260" height="18" fill="#FAECE7" fillOpacity="0.3" />
                        <rect x="0" y="36" width="260" height="18" fill="#faeeda" fillOpacity="0.3" />
                        <rect x="0" y="54" width="260" height="26" fill="#e8f4f0" fillOpacity="0.3" />
                        <polyline points="0,63 120,74 260,89" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" />
                        <polygon points="0,63 120,74 260,89 260,100 0,100" fill="url(#phqGrad)" />
                        <circle cx="0" cy="63" r="4" fill="#4a7c6f" />
                        <circle cx="120" cy="74" r="4" fill="#4a7c6f" />
                        <circle cx="260" cy="89" r="5" fill="#4a7c6f" stroke="white" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="flex justify-between px-1 mt-1">
                      <span className="text-[11px] text-[var(--ink-muted)]">S1</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">S5</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">S14</span>
                    </div>
                  </div>

                  {/* GAD-7 */}
                  <div className="border border-[var(--border)] rounded-lg p-3.5">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--ink-muted)] mb-2">GAD-7 · Anxiety</div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-[var(--font-display)] text-[28px] text-[var(--ink)]">4</span>
                      <span className="text-[13px] text-[var(--ink-muted)]">/ 21</span>
                      <span className="text-[13px] font-medium text-[var(--amber)]">Mild</span>
                    </div>
                    <div className="text-[12px] text-[var(--green)] mt-1">↓ 4 points since intake (score was 8)</div>
                    
                    {/* Trend Chart */}
                    <div className="h-[120px] mt-2">
                      <svg className="w-full h-full" viewBox="0 0 260 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gadGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#BA7517" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#BA7517" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width="260" height="20" fill="#fde8e8" fillOpacity="0.3" />
                        <rect x="0" y="20" width="260" height="20" fill="#FAECE7" fillOpacity="0.3" />
                        <rect x="0" y="40" width="260" height="22" fill="#faeeda" fillOpacity="0.3" />
                        <rect x="0" y="62" width="260" height="38" fill="#e8f4f0" fillOpacity="0.3" />
                        <polyline points="0,62 120,72 260,81" fill="none" stroke="#BA7517" strokeWidth="2" strokeLinecap="round" />
                        <polygon points="0,62 120,72 260,81 260,100 0,100" fill="url(#gadGrad)" />
                        <circle cx="0" cy="62" r="4" fill="#BA7517" />
                        <circle cx="120" cy="72" r="4" fill="#BA7517" />
                        <circle cx="260" cy="81" r="5" fill="#BA7517" stroke="white" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="flex justify-between px-1 mt-1">
                      <span className="text-[11px] text-[var(--ink-muted)]">S1</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">S5</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">S14</span>
                    </div>
                  </div>
                </div>

                {/* Severity Scale */}
                <div className="mb-4">
                  <div className="text-[13px] font-medium text-[var(--ink)] mb-2">PHQ-9 severity scale</div>
                  <div className="flex gap-0 rounded-lg overflow-hidden">
                    <div className="flex-1 bg-[#e8f4f0] text-[var(--sage-deep)] px-2 py-1.5 text-center text-[11px] font-medium outline outline-2 outline-[var(--ink)] outline-offset-[-2px]">
                      Minimal<br /><span className="text-[10px] opacity-70">0–4</span>
                    </div>
                    <div className="flex-1 bg-[#faeeda] text-[#633806] px-2 py-1.5 text-center text-[11px] font-medium">
                      Mild<br /><span className="text-[10px] opacity-70">5–9</span>
                    </div>
                    <div className="flex-1 bg-[#FFF0C0] text-[#7A5900] px-2 py-1.5 text-center text-[11px] font-medium">
                      Moderate<br /><span className="text-[10px] opacity-70">10–14</span>
                    </div>
                    <div className="flex-1 bg-[#FAECE7] text-[#712B13] px-2 py-1.5 text-center text-[11px] font-medium">
                      Mod-severe<br /><span className="text-[10px] opacity-70">15–19</span>
                    </div>
                    <div className="flex-1 bg-[#fde8e8] text-[#791F1F] px-2 py-1.5 text-center text-[11px] font-medium">
                      Severe<br /><span className="text-[10px] opacity-70">20–27</span>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                <table className="w-full">
                  <thead>
                    <tr className="text-[11px] font-medium uppercase tracking-wider text-[var(--ink-muted)] border-b border-[var(--border)]">
                      <th className="text-left py-2.5">Measure</th>
                      <th className="text-left py-2.5">Session</th>
                      <th className="text-left py-2.5">Date</th>
                      <th className="text-left py-2.5">Score</th>
                      <th className="text-left py-2.5">Severity</th>
                      <th className="text-left py-2.5">Change</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {[
                      { measure: 'PHQ-9', session: 'Session 14', date: 'Mar 10, 2026', score: '3', severity: 'Minimal', severityClass: 'bg-[#e8f4f0] text-[var(--sage-deep)]', change: '↓ 4 from S5', scoreColor: 'text-[var(--green)]', changeColor: 'text-[var(--green)]' },
                      { measure: 'GAD-7', session: 'Session 14', date: 'Mar 10, 2026', score: '4', severity: 'Mild', severityClass: 'bg-[#faeeda] text-[#633806]', change: '↓ 3 from S5', scoreColor: 'text-[var(--amber)]', changeColor: 'text-[var(--green)]' },
                      { measure: 'PHQ-9', session: 'Session 5', date: 'Jan 20, 2026', score: '7', severity: 'Mild', severityClass: 'bg-[#faeeda] text-[#633806]', change: '↓ 3 from S1', scoreColor: '', changeColor: 'text-[var(--green)]' },
                      { measure: 'GAD-7', session: 'Session 5', date: 'Jan 20, 2026', score: '7', severity: 'Mild', severityClass: 'bg-[#faeeda] text-[#633806]', change: '↓ 1 from S1', scoreColor: '', changeColor: 'text-[var(--green)]' },
                      { measure: 'PHQ-9', session: 'Session 1 (intake)', date: 'Nov 15, 2025', score: '10', severity: 'Moderate', severityClass: 'bg-[#FFF0C0] text-[#7A5900]', change: 'Baseline', scoreColor: 'text-[var(--amber)]', changeColor: 'text-[var(--ink-muted)]' },
                      { measure: 'GAD-7', session: 'Session 1 (intake)', date: 'Nov 15, 2025', score: '8', severity: 'Moderate', severityClass: 'bg-[#faeeda] text-[#633806]', change: 'Baseline', scoreColor: 'text-[var(--amber)]', changeColor: 'text-[var(--ink-muted)]' }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-b-0">
                        <td className="py-2.5 font-medium text-[var(--ink)]">{row.measure}</td>
                        <td className="py-2.5 text-[var(--ink-soft)]">{row.session}</td>
                        <td className="py-2.5 text-[var(--ink-soft)]">{row.date}</td>
                        <td className={`py-2.5 font-medium ${row.scoreColor}`}>{row.score}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${row.severityClass}`}>{row.severity}</span>
                        </td>
                        <td className={`py-2.5 ${row.changeColor}`}>{row.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 px-5 py-3.5 border-t border-[var(--border)]">
                <button onClick={() => setShowAdminister(true)} className="btn-primary">
                  Record scores now
                </button>
                <button className="btn-ghost">Send PHQ-9 to client portal</button>
                <button className="btn-ghost">Export PDF report</button>
              </div>
            </div>

            {/* Administer Card */}
            {showAdminister && (
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
                  <div>
                    <div className="text-[14px] font-medium text-[var(--ink)]">Administer PHQ-9</div>
                    <div className="text-[12px] text-[var(--ink-muted)]">
                      Complete in session or send to client portal — responses saved to outcome_measures table
                    </div>
                  </div>
                  <button onClick={() => setShowAdminister(false)} className="text-[var(--ink-muted)] text-[20px] hover:text-[var(--ink)] leading-none">
                    ×
                  </button>
                </div>

                <div className="p-5">
                  <div className="text-[13px] text-[var(--ink-soft)] mb-4 leading-relaxed">
                    Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the following problems?<br />
                    <span className="text-[12px] text-[var(--ink-muted)]">
                      0 = Not at all · 1 = Several days · 2 = More than half the days · 3 = Nearly every day
                    </span>
                  </div>

                  {PHQ9_QUESTIONS.map((question, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-b-0">
                      <div className="text-[13px] text-[var(--ink-soft)] mb-2">
                        <strong>{i + 1}.</strong> {question}
                        {i === 8 && <span className="text-[var(--red)] ml-1.5">⚠</span>}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {OPTIONS.map((option, j) => (
                          <button
                            key={j}
                            onClick={() => setScore(i, j)}
                            className={`px-3 py-1.5 border-[1.5px] rounded-[20px] text-[12px] transition-all ${
                              phqScores[i] === j
                                ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                                : 'border-[var(--bmed)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
                            }`}
                          >
                            {option} ({j})
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[var(--border)]">
                    <div>
                      <span className="text-[15px] font-medium text-[var(--ink)]">
                        Total score: <span className="text-[var(--sage)]">{totalScore}</span> / 27
                      </span>
                      <span className="ml-3 text-[13px] font-medium" style={{ color: severityColor }}>
                        {severity}
                      </span>
                    </div>
                    <button onClick={saveScores} className="btn-primary">
                      Save scores
                    </button>
                  </div>

                  <div className="bg-[var(--sage-pale)] rounded-lg px-3.5 py-2.5 text-[12px] text-[var(--sage-deep)] leading-relaxed mt-3.5">
                    ⚠ Question 9 (thoughts of self-harm) scoring: if a client scores 1 or higher on question 9, conduct a full suicide risk
                    assessment before ending the session. Document the assessment in the session note.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
