import { useState } from 'react';
import { Shield, Users, FileText, Phone, AlertTriangle } from 'lucide-react';

type ToolTab = 'safety' | 'referral' | 'discharge';

export function ClinicalTools() {
  const [activeTab, setActiveTab] = useState<ToolTab>('safety');
  const [selectedClient, setSelectedClient] = useState('Amara Mensah');
  const [warningSigns, setWarningSigns] = useState([
    'Withdrawing from friends',
    'Stopping activities I enjoy',
    'Racing thoughts at night',
    'Feeling like a burden'
  ]);
  const [copingStrategies, setCopingStrategies] = useState([
    '5-4-3-2-1 grounding exercise',
    'Box breathing',
    'Go for a walk outside',
    'Journal about my feelings'
  ]);
  const [supportPeople, setSupportPeople] = useState([
    { name: 'Sister — Abena', phone: '(416) 555-0122' },
    { name: 'Friend — Yaa', phone: '(647) 555-0189' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [dischargeClient, setDischargeClient] = useState('Jamal Lee — 22 sessions');

  const clients = [
    { initials: 'AM', name: 'Amara Mensah', status: 'Active plan · v2', badge: 'Active', color: '#d4e8e4' },
    { initials: 'JL', name: 'Jamal Lee', status: 'No plan', badge: 'None', color: '#faeeda' },
    { initials: 'SM', name: 'Sadia Mohamoud', status: 'Active plan · v1', badge: 'Active', color: '#d4e8d4' },
    { initials: 'RB', name: 'Riya Bhatt', status: 'No plan', badge: 'None', color: '#d4d4e8' }
  ];

  const addWarningSign = (text: string) => {
    if (text.trim()) {
      setWarningSigns([...warningSigns, text.trim()]);
    }
  };

  const removeTag = (index: number, type: 'warning' | 'coping') => {
    if (type === 'warning') {
      setWarningSigns(warningSigns.filter((_, i) => i !== index));
    } else {
      setCopingStrategies(copingStrategies.filter((_, i) => i !== index));
    }
  };

  const generateLetter = () => {
    setAiLoading(true);
    setTimeout(() => setAiLoading(false), 2000);
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-[var(--ink)] flex gap-0 px-5">
        <TabButton active={activeTab === 'safety'} onClick={() => setActiveTab('safety')}>
          Safety plans
        </TabButton>
        <TabButton active={activeTab === 'referral'} onClick={() => setActiveTab('referral')}>
          Referral letters
        </TabButton>
        <TabButton active={activeTab === 'discharge'} onClick={() => setActiveTab('discharge')}>
          Discharge summaries
        </TabButton>
      </div>

      {/* SAFETY PLANS */}
      {activeTab === 'safety' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-[var(--font-display)] text-xl text-[var(--ink)]">Crisis safety plans</h1>
              <p className="text-[13px] text-[var(--ink-muted)] mt-1">
                Collaborative plans stored in client records and accessible via client portal
              </p>
            </div>
            <button className="btn-primary">+ New safety plan</button>
          </div>

          <div className="grid grid-cols-[240px_1fr] gap-5">
            {/* Client List */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden sticky top-4">
              <div className="px-4 py-3 border-b border-[var(--border)] font-medium text-[13px] text-[var(--ink)]">
                Clients
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
                    className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-medium"
                    style={{ background: client.color, color: 'var(--sage-deep)' }}
                  >
                    {client.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[var(--ink)]">{client.name}</div>
                    <div className="text-[11px] text-[var(--ink-muted)]">{client.status}</div>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      client.badge === 'Active' ? 'bg-[#e8f4f0] text-[var(--sage-deep)]' : 'bg-[var(--warm)] text-[var(--ink-muted)]'
                    }`}
                  >
                    {client.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Safety Plan Form */}
            <div className="flex flex-col gap-4">
              {/* Warning Signs */}
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--border)]">
                  <div className="w-[30px] h-[30px] rounded-lg bg-[#fde8e8] flex items-center justify-center">
                    <AlertTriangle className="w-[15px] h-[15px] text-[#791F1F]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--ink)]">Warning signs</div>
                    <div className="text-[11px] text-[var(--ink-muted)]">Personal cues that a crisis may be building</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 p-3 border border-[var(--bmed)] rounded-lg bg-white min-h-[44px]">
                    {warningSigns.map((sign, i) => (
                      <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--sage-pale)] rounded text-[12px] text-[var(--sage-deep)]">
                        {sign}
                        <button onClick={() => removeTag(i, 'warning')} className="text-[var(--sage)] text-[14px] leading-none">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a warning sign and press Enter"
                    className="w-full mt-2 px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addWarningSign(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Internal Coping */}
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--border)]">
                  <div className="w-[30px] h-[30px] rounded-lg bg-[var(--sage-pale)] flex items-center justify-center">
                    <Shield className="w-[15px] h-[15px] text-[var(--sage)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--ink)]">Internal coping strategies</div>
                    <div className="text-[11px] text-[var(--ink-muted)]">Things I can do on my own to reduce distress</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 p-3 border border-[var(--bmed)] rounded-lg bg-white min-h-[44px]">
                    {copingStrategies.map((strategy, i) => (
                      <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--sage-pale)] rounded text-[12px] text-[var(--sage-deep)]">
                        {strategy}
                        <button onClick={() => removeTag(i, 'coping')} className="text-[var(--sage)] text-[14px] leading-none">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a coping strategy and press Enter"
                    className="w-full mt-2 px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setCopingStrategies([...copingStrategies, e.currentTarget.value.trim()]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Support People */}
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--border)]">
                  <div className="w-[30px] h-[30px] rounded-lg bg-[#e6f1fb] flex items-center justify-center">
                    <Users className="w-[15px] h-[15px] text-[#185FA5]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--ink)]">Support people</div>
                    <div className="text-[11px] text-[var(--ink-muted)]">People I can reach out to when in distress</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    {supportPeople.map((person, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_80px] gap-2 items-center">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => {
                            const newPeople = [...supportPeople];
                            newPeople[i].name = e.target.value;
                            setSupportPeople(newPeople);
                          }}
                          className="px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                          placeholder="Name / relationship"
                        />
                        <input
                          type="text"
                          value={person.phone}
                          onChange={(e) => {
                            const newPeople = [...supportPeople];
                            newPeople[i].phone = e.target.value;
                            setSupportPeople(newPeople);
                          }}
                          className="px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                          placeholder="Phone"
                        />
                        <button className="px-2 py-2 border border-[var(--bmed)] rounded-lg text-[13px] text-[var(--red)] hover:bg-[var(--warm)]">
                          Remove
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-[var(--sage-light)] rounded-lg text-[13px] font-medium text-[var(--sage)] hover:bg-[var(--sage-pale)]">
                      + Add person
                    </button>
                  </div>
                </div>
              </div>

              {/* Crisis Lines */}
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--border)]">
                  <div className="w-[30px] h-[30px] rounded-lg bg-[#faeeda] flex items-center justify-center">
                    <Phone className="w-[15px] h-[15px] text-[#633806]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--ink)]">Crisis lines</div>
                    <div className="text-[11px] text-[var(--ink-muted)]">Pre-loaded Canadian crisis resources — always accessible to client</div>
                  </div>
                </div>
                <div className="p-4">
                  {[
                    { icon: '🆘', name: 'Crisis Services Canada', phone: '1-833-456-4566', bg: '#fde8e8' },
                    { icon: '📞', name: 'Kids Help Phone', phone: '1-800-668-6868 · Text: 686868', bg: '#e6f1fb' },
                    { icon: '🇨🇦', name: 'Distress Centres of Greater Toronto', phone: '416-408-4357', bg: '#faeeda' },
                    { icon: '🚨', name: 'Emergency services', phone: '911', bg: '#fde8e8' }
                  ].map((crisis, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-[var(--border)] last:border-b-0">
                      <div
                        className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-[13px]"
                        style={{ background: crisis.bg }}
                      >
                        {crisis.icon}
                      </div>
                      <div className="flex-1 text-[13px] font-medium text-[var(--ink)]">{crisis.name}</div>
                      <div className="text-[13px] text-[#185FA5]">{crisis.phone}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--warm)] border-t border-[var(--border)] rounded-lg">
                <div className="text-[12px] text-[var(--ink-muted)]">
                  Safety plan reviewed with client · Version 2 · March 10, 2026
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost">Send PDF to client</button>
                  <button className="btn-primary">Save plan</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REFERRAL LETTERS */}
      {activeTab === 'referral' && (
        <div className="p-6">
          <div className="mb-5">
            <h1 className="font-[var(--font-display)] text-xl text-[var(--ink)]">Referral letters</h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-1">
              AI-drafted, therapist-signed referral letters — calls the referral-letter edge function
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Form */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="text-[14px] font-medium text-[var(--ink)] mb-3.5">Letter details</div>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="referral-client" className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Client</label>
                  <select id="referral-client" className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]">
                    <option>Amara Mensah</option>
                    <option>Jamal Lee</option>
                    <option>Sadia Mohamoud</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Referring to</label>
                  <input
                    type="text"
                    defaultValue="Dr. Kwame Asante"
                    placeholder="Recipient name"
                    className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="referral-role" className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Role / title</label>
                    <input
                      id="referral-role"
                      type="text"
                      defaultValue="Psychiatrist"
                      className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="referral-clinic" className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Clinic / hospital</label>
                    <input
                      id="referral-clinic"
                      type="text"
                      defaultValue="CAMH"
                      className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="referral-reason" className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Reason for referral *</label>
                  <textarea
                    id="referral-reason"
                    defaultValue="Requesting psychiatric assessment and possible medication consultation for client presenting with moderate-severe PTSD symptoms that appear to be limiting progress in psychotherapy. Specifically seeking evaluation for pharmacological support to address hyperarousal and sleep disruption."
                    className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)] min-h-[90px] resize-vertical"
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={generateLetter} className="btn-ai">
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3l2 2" />
                    </svg>
                    Generate with AI
                  </button>
                  <button className="btn-ghost">Save draft</button>
                </div>

                {aiLoading && (
                  <div className="bg-[var(--sage-pale)] rounded-lg px-4 py-3.5 text-[13px] text-[var(--sage-deep)] leading-relaxed">
                    Calling referral-letter edge function... Pulling last 2 session notes and treatment plan. Drafting clinical letter using claude-sonnet-4-6.
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-medium text-[var(--ink)]">Preview</div>
                <div className="flex gap-1.5">
                  <button className="btn-ghost text-[12px] px-3 py-1.5">Edit</button>
                  <button className="btn-primary text-[12px] px-3 py-1.5">Download PDF</button>
                </div>
              </div>
              
              <div className="bg-white border border-[var(--bmed)] rounded-lg p-7 text-[13px] leading-relaxed text-[var(--ink-soft)] min-h-[500px]">
                <div className="border-b-2 border-[var(--ink)] pb-3.5 mb-5">
                  <div className="font-[var(--font-display)] text-[18px] text-[var(--ink)]">Osei Psychotherapy & Wellness</div>
                  <div className="text-[12px] text-[var(--ink-muted)] mt-1">
                    Dr. Abena Osei-Mensah, RP, PhD · CRPO Registration #004821<br />
                    Toronto, Ontario · abena.osei@mentalpath.ca
                  </div>
                </div>
                
                <div className="text-right text-[12px] text-[var(--ink-muted)] mb-4">March 16, 2026</div>
                
                <div className="space-y-4">
                  <p>Dear Dr. Asante,</p>
                  <p>I am writing to refer my client, A.M. (DOB: 1991-03-15), for psychiatric assessment and potential pharmacological consultation. A.M. has been engaged in weekly individual psychotherapy with me since November 2025 (14 sessions completed to date).</p>
                  <p>A.M. presented initially with race-based traumatic stress and associated PTSD symptoms following a series of workplace discriminatory incidents. Current presentation includes significant hyperarousal, intrusive recollections, and sleep disruption occurring at a frequency and severity that are limiting the client's capacity to engage fully with the trauma processing work we have begun in treatment.</p>
                  <p>PHQ-9 at intake was 10 (moderate); current score is 3 (minimal), suggesting meaningful progress on depressive symptoms. However, GAD-7 remains in the mild-to-moderate range at 4–8, and the client continues to report significant physiological arousal responses.</p>
                  <p>I am specifically requesting evaluation for pharmacological support targeting hyperarousal and sleep disruption, with the aim of augmenting the psychotherapeutic work currently underway. I would welcome a collaborative approach and am happy to share clinical notes with the client's written consent.</p>
                  <p>Please do not hesitate to contact me if you require any additional information. I am grateful for your consideration of this referral.</p>
                  <p>Yours sincerely,</p>
                  <p className="font-[var(--font-display)] text-[15px] text-[var(--ink)] mt-3">Dr. Abena Osei-Mensah, RP, PhD</p>
                  <p className="text-[12px] text-[var(--ink-muted)]">
                    Registered Psychotherapist · CRPO-004821<br />
                    Osei Psychotherapy & Wellness · Toronto, ON
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-[var(--sage-pale)] text-[var(--sage-deep)] text-[11px] font-medium px-2.5 py-1 rounded mt-5">
                  ✦ AI-drafted · Review and sign before sending
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISCHARGE SUMMARIES */}
      {activeTab === 'discharge' && (
        <div className="p-6">
          <div className="mb-5">
            <h1 className="font-[var(--font-display)] text-xl text-[var(--ink)]">Discharge summaries</h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-1">
              Formal end-of-treatment summaries — AI-generated from session notes, treatment plans and outcome measures
            </p>
          </div>

          <div className="grid grid-cols-[260px_1fr] gap-5">
            {/* Left sidebar */}
            <div>
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-4">
                <div className="px-5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                  Generate summary
                </div>
                <div className="p-5 space-y-3.5">
                  <div>
                    <label htmlFor="discharge-client" className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Client</label>
                    <select
                      id="discharge-client"
                      value={dischargeClient}
                      onChange={(e) => setDischargeClient(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                    >
                      <option>Jamal Lee — 22 sessions</option>
                      <option>Amara Mensah — 14 sessions</option>
                      <option>Sadia Mohamoud — 8 sessions</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="discharge-reason" className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Reason for discharge</label>
                    <select id="discharge-reason" className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]">
                      <option>Goals achieved — planned discharge</option>
                      <option>Client transferred to another provider</option>
                      <option>Client discontinued treatment</option>
                      <option>Treatment completed, maintenance phase</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="discharge-date" className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Discharge date</label>
                    <input
                      id="discharge-date"
                      type="date"
                      defaultValue="2026-03-16"
                      className="w-full px-3 py-2 border border-[var(--bmed)] rounded-lg text-[13px] outline-none focus:border-[var(--sage)]"
                    />
                  </div>
                  <button className="btn-ai w-full justify-center">
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3l2 2" />
                    </svg>
                    Generate discharge summary
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                  Past summaries
                </div>
                <div className="p-0">
                  <div className="flex gap-2.5 px-4 py-3 cursor-pointer hover:bg-[var(--warm)] border-b border-[var(--border)]">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#faeeda] flex items-center justify-center text-[10px] font-medium text-[#633806]">
                      JL
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-[var(--ink)]">Jamal Lee</div>
                      <div className="text-[11px] text-[var(--ink-muted)]">22 sessions · Discharged Mar 16 · Goals achieved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discharge preview */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
                <div>
                  <div className="text-[14px] font-medium text-[var(--ink)]">Jamal Lee — Discharge summary</div>
                  <div className="text-[12px] text-[var(--ink-muted)]">22 sessions · September 12, 2025 – March 16, 2026 · AI draft</div>
                </div>
                <div className="flex gap-1.5">
                  <button className="btn-ghost text-[12px] px-3 py-1.5">Edit</button>
                  <button className="btn-primary text-[12px] px-3 py-1.5">Save & lock</button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-[var(--warm)] rounded-lg p-3">
                    <div className="font-[var(--font-display)] text-[22px] text-[var(--ink)]">22</div>
                    <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">Sessions completed</div>
                  </div>
                  <div className="bg-[var(--warm)] rounded-lg p-3">
                    <div className="font-[var(--font-display)] text-[22px] text-[var(--ink)]">6 mo</div>
                    <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">Treatment duration</div>
                  </div>
                  <div className="bg-[var(--warm)] rounded-lg p-3">
                    <div className="font-[var(--font-display)] text-[22px] text-[var(--ink)]">3/3</div>
                    <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">Goals achieved</div>
                  </div>
                </div>

                <div className="space-y-4.5">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--sage)] mb-2 pb-1.5 border-b border-[var(--sage-pale)]">
                      Presenting concern at intake
                    </div>
                    <div className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                      Client J.L. presented in September 2025 with moderately severe depression (PHQ-9: 14), generalized anxiety (GAD-7: 10), and significant occupational distress related to systemic racism and repeated microaggression experiences in a professional workplace environment. Secondary presentations included sleep disturbance, hypervigilance in predominantly white spaces, and early indicators of internalized oppression affecting professional self-concept.
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--sage)] mb-2 pb-1.5 border-b border-[var(--sage-pale)]">
                      Treatment summary
                    </div>
                    <div className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                      Treatment was provided over 22 individual sessions using an anti-oppressive, culturally-affirming framework incorporating elements of the Cultural Formulation Interview (CFI), somatic grounding techniques, and narrative therapy. Sessions focused on externalizing the systemic nature of experienced racism, developing somatic regulation strategies, and rebuilding a coherent professional identity that integrates cultural heritage. Supervision was maintained throughout the treatment period with attention to countertransference dynamics. No crisis presentations occurred during treatment.
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--sage)] mb-2 pb-1.5 border-b border-[var(--sage-pale)]">
                      Progress and outcomes
                    </div>
                    <div className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                      Client demonstrated consistent and meaningful progress across all identified treatment goals. PHQ-9 scores declined from 14 (moderately severe) at intake to 4 (minimal) at discharge, representing a clinically significant 10-point reduction. GAD-7 scores declined from 10 (moderate) to 5 (mild). Client reports successful application of anti-racism framework in daily life, reduced identity-related distress, and restored sense of professional competence and belonging.
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--sage)] mb-2 pb-1.5 border-b border-[var(--sage-pale)]">
                      Discharge criteria met
                    </div>
                    <div className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                      All three treatment goals were achieved as agreed upon in the treatment plan reviewed at session 11. Client and therapist mutually agreed that discharge criteria had been met, with sustained wellbeing scores ≥7 for the final 4 consecutive sessions.
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--sage)] mb-2 pb-1.5 border-b border-[var(--sage-pale)]">
                      Recommendations post-discharge
                    </div>
                    <div className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                      Client is encouraged to continue practicing somatic grounding and self-advocacy strategies developed in treatment. Reconnection with community cultural organizations is recommended as a protective factor. Client should return to treatment should symptoms re-emerge, particularly in response to further workplace stressors. A 3-month follow-up contact has been offered and accepted.
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-[var(--sage-pale)] text-[var(--sage-deep)] text-[11px] font-medium px-2.5 py-1 rounded">
                    ✦ Generated by discharge-summary edge function · Clinician must review and sign before filing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4.5 py-3.5 text-[13px] border-none bg-transparent cursor-pointer border-b-2 transition-all ${
        active
          ? 'text-white border-b-[var(--sage-light)]'
          : 'text-white/50 border-b-transparent hover:text-white/80'
      }`}
    >
      {children}
    </button>
  );
}
