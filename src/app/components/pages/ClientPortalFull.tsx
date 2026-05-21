import { useState } from 'react';
import { Check, Send, FileText, Phone, Download, Trash2, ShieldAlert, RefreshCw, FileDown, Lock } from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'home' | 'checkin' | 'invoices' | 'messages' | 'safety' | 'privacy';

export function ClientPortalFull() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [wellbeing, setWellbeing] = useState(7);
  const [anxiety, setAnxiety] = useState(4);
  const [sleep, setSleep] = useState(6);
  const [moods, setMoods] = useState(['Hopeful']);
  const [checkinSubmitted, setCheckinSubmitted] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Privacy and Consent States
  const [consentStatus, setConsentStatus] = useState<'active' | 'withdrawing' | 'withdrawn'>('active');
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawTimestamp, setWithdrawTimestamp] = useState<string | null>(null);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const moodOptions = [
    'Hopeful', 'Anxious', 'Tired', 'Calm', 'Overwhelmed',
    'Motivated', 'Sad', 'Grateful', 'Frustrated', 'Disconnected'
  ];

  const toggleMood = (mood: string) => {
    setMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const submitCheckin = () => {
    setCheckinSubmitted(true);
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      // In production: call API to send message
      setMessageText('');
    }
  };

  const handleExportJson = () => {
    setIsExportingJson(true);
    setTimeout(() => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        regulationScope: 'PHIPA (Ontario s.20) / PIPEDA Compliant Data Subject Portability Export',
        clientProfile: {
          name: 'Amara Mensah',
          dateOfBirth: '1995-08-24',
          healthCardNumber: 'XXXX-XXX-124-AM',
          address: '720 Spadina Ave, Toronto, ON, M5S 2T9',
          email: 'amara.mensah@email.com',
          phone: '(416) 555-0199',
          preferredLanguage: 'English',
          emergencyContact: {
            name: 'Abena Mensah',
            relationship: 'Sister',
            phone: '(416) 555-0122'
          }
        },
        clinicalCareDetails: {
          primaryTherapist: 'Dr. Abena Osei-Mensah, RP',
          collegeRegistration: 'CRPO-004821',
          diagnoses: ['F43.10 PTSD'],
          currentWellnessMetric: {
            phq9DepressionScoreHistory: [
              { session: 1, date: '2026-01-05', score: 10, severity: 'Moderate' },
              { session: 5, date: '2026-02-09', score: 7, severity: 'Mild-Moderate' },
              { session: 14, date: '2026-03-10', score: 3, severity: 'Minimal' }
            ]
          }
        },
        safetyPlan: {
          lastReviewed: '2026-03-10',
          warningSigns: [
            'Withdrawing from friends and family',
            'Stopping activities I enjoy',
            'Racing thoughts at night that won\'t stop',
            'Feeling like a burden to the people I love'
          ],
          copingStrategies: [
            '5-4-3-2-1 grounding exercise',
            'Box breathing — breathe in 4, hold 4, out 4, hold 4',
            'Go for a walk outside, even just 10 minutes',
            'Write in my journal — just start with "right now I feel..."'
          ],
          personalContacts: [
            { name: 'Abena (Sister)', phone: '(416) 555-0122' },
            { name: 'Yaa (Friend)', phone: '(647) 555-0189' }
          ],
          professionalResources: [
            { name: 'Crisis Services Canada', contact: '1-833-456-4566' },
            { name: 'Kids Help Phone', contact: '1-800-668-6868' }
          ]
        },
        billingHistory: [
          { invoiceNumber: 'INV-0031', date: '2026-03-10', amount: '$140.00', status: 'Paid' },
          { invoiceNumber: 'INV-0028', date: '2026-03-03', amount: '$140.00', status: 'Paid' },
          { invoiceNumber: 'INV-0024', date: '2026-02-24', amount: '$140.00', status: 'Paid' }
        ]
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mentalpath_clinical_export_amara_mensah_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setIsExportingJson(false);
      toast.success('Clinical data exported in JSON format');
    }, 1000);
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>MentalPath — PHIPA-Compliant Clinical Summary</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #2D3748; line-height: 1.6; }
                h1 { font-family: "Georgia", serif; color: #2D5049; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { color: #2D5049; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #EDF2F7; padding-bottom: 5px; }
                .meta-table, .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
                .meta-table td { padding: 6px 12px; border: none; font-size: 14px; }
                .meta-table td.label { font-weight: bold; width: 25%; color: #4A5568; }
                .data-table th, .data-table td { border: 1px solid #E2E8F0; padding: 10px 12px; text-align: left; font-size: 14px; }
                .data-table th { background-color: #F7FAFC; font-weight: bold; color: #4A5568; }
                .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #E8F4F0; color: #2d5049; }
                .confidential-watermark { position: fixed; bottom: 20px; right: 20px; font-size: 12px; color: #A0AEC0; font-weight: bold; letter-spacing: 1px; }
              </style>
            </head>
            <body>
              <h1 style="display:flex; justify-content:space-between; align-items:center; font-weight: normal;">
                <span>MentalPath Clinical Record Summary</span>
                <span style="font-size:12px; font-weight:normal; font-family:sans-serif; color:#718096; border:1px solid #E2E8F0; padding:4px 8px; border-radius:4px;">PHIPA SECURE</span>
              </h1>
              <p style="font-size:13px; color:#718096; margin-top:-15px;">Generated on: ${new Date().toLocaleString()} · Registered under Ontario Health Information Protection Act (PHIPA)</p>

              <h2>1. Demographics & Context</h2>
              <table class="meta-table">
                <tr>
                  <td class="label">Patient Name:</td><td>Amara Mensah</td>
                  <td class="label">Date of Birth:</td><td>August 24, 1995</td>
                </tr>
                <tr>
                  <td class="label">Address:</td><td>720 Spadina Ave, Toronto, ON, M5S 2T9</td>
                  <td class="label">Health Card:</td><td>XXXX-XXX-124-AM (Masked)</td>
                </tr>
                <tr>
                  <td class="label">Primary Clinician:</td><td>Dr. Abena Osei-Mensah, RP (CRPO-004821)</td>
                  <td class="label">Primary Diagnosis:</td><td>F43.10 Post-Traumatic Stress Disorder</td>
                </tr>
              </table>

              <h2>2. Active Safety & Support Plan</h2>
              <table class="data-table">
                <tr>
                  <th style="width:30%;">Section</th>
                  <th>Details & Strategies</th>
                </tr>
                <tr>
                  <td><strong>Warning Signs</strong></td>
                  <td>Withdrawing from friends and family · Stopping activities I enjoy · Racing thoughts at night · Feeling like a burden</td>
                </tr>
                <tr>
                  <td><strong>Coping Strategies</strong></td>
                  <td>5-4-3-2-1 grounding exercise · Box breathing (4-4-4-4) · Outdoor walk (10 min) · Reflective journaling exercise</td>
                </tr>
                <tr>
                  <td><strong>Personal Contacts</strong></td>
                  <td>Sister: Abena Mensah ((416) 555-0122) · Friend: Yaa ((647) 555-0189)</td>
                </tr>
                <tr>
                  <td><strong>Professional Crisis Lines</strong></td>
                  <td>Crisis Services Canada (1-833-456-4566) · Kids Help Phone (1-800-668-6868)</td>
                </tr>
              </table>

              <h2>3. Clinical Wellness Assessment (PHQ-9 Depression Trajectory)</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Care Interval</th>
                    <th>Assessment Tool</th>
                    <th>Measured Score</th>
                    <th>Clinical Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Session 1 (Intake)</td>
                    <td>Patient Health Questionnaire (PHQ-9)</td>
                    <td>10 / 27</td>
                    <td>Moderate Depression Severity</td>
                  </tr>
                  <tr>
                    <td>Session 5 (Mid-Treatment)</td>
                    <td>Patient Health Questionnaire (PHQ-9)</td>
                    <td>7 / 27</td>
                    <td>Mild Depression Severity</td>
                  </tr>
                  <tr>
                    <td>Session 14 (Current)</td>
                    <td>Patient Health Questionnaire (PHQ-9)</td>
                    <td>3 / 27</td>
                    <td>Minimal Depression / Sub-clinical Range</td>
                  </tr>
                </tbody>
              </table>

              <h2>4. Financial Billing & Invoicing History</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date of Service</th>
                    <th>Provider Info</th>
                    <th>Amount Paid</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>INV-0031</td>
                    <td>March 10, 2026</td>
                    <td>Dr. Abena Osei-Mensah, RP (CRPO-004821)</td>
                    <td>$140.00 CAD</td>
                    <td><span class="badge">Paid</span></td>
                  </tr>
                  <tr>
                    <td>INV-0028</td>
                    <td>March 3, 2026</td>
                    <td>Dr. Abena Osei-Mensah, RP (CRPO-004821)</td>
                    <td>$140.00 CAD</td>
                    <td><span class="badge">Paid</span></td>
                  </tr>
                  <tr>
                    <td>INV-0024</td>
                    <td>February 24, 2026</td>
                    <td>Dr. Abena Osei-Mensah, RP (CRPO-004821)</td>
                    <td>$140.00 CAD</td>
                    <td><span class="badge">Paid</span></td>
                  </tr>
                </tbody>
              </table>

              <div style="margin-top:40px; border-top:1px solid #E2E8F0; padding-top:15px; font-size:12px; color:#A0AEC0; text-align:center;">
                CONFIDENTIAL MEDICAL RECORD · EXCLUSIVELY FOR PATIENT USE AND INSURANCE REIMBURSEMENT PURPOSES.
                <br/>MentalPath securely stores all health information in ISO 27001 SOC2 certified systems inside Canada.
              </div>
              <div class="confidential-watermark">CONFIDENTIAL RECORD</div>
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      setIsExportingPdf(false);
      toast.success('Clinical statement loaded for printing');
    }, 1000);
  };

  const handleWithdrawConsent = () => {
    setConsentStatus('withdrawing');
    setWithdrawTimestamp(new Date().toLocaleString());
    setShowWithdrawConfirm(false);
    toast.warning('Consent withdrawn. 30-day graceful deletion countdown active.');
  };

  const handleRestoreConsent = () => {
    setConsentStatus('active');
    setWithdrawTimestamp(null);
    toast.success('Active consent successfully restored. Account connection reactivated.');
  };

  return (
    <div className="min-h-screen bg-[var(--warm)]">
      {/* Header */}
      <div className="bg-[var(--sage-deep)] text-white">
        <div className="flex items-center justify-between px-7 pt-5 pb-5">
          <div className="font-[var(--font-display)] text-[18px] opacity-90">MentalPath</div>
          <div className="text-[13px] text-white/60">Amara Mensah · Dr. Osei-Mensah</div>
        </div>
        <div className="flex gap-0 px-5 overflow-x-auto scrollbar-none">
          {[
            { id: 'home', label: 'Home' },
            { id: 'checkin', label: 'Check-in' },
            { id: 'invoices', label: 'Receipts' },
            { id: 'messages', label: 'Messages' },
            { id: 'safety', label: 'Safety plan' },
            { id: 'privacy', label: 'Privacy & Data' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4.5 py-2.5 text-[13px] border-none bg-transparent cursor-pointer border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white border-b-[var(--sage-light)]'
                  : 'text-white/50 border-b-transparent hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-[700px] mx-auto">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* Next Appointment */}
            <div className="bg-[var(--sage-deep)] rounded-xl p-5 mb-4 text-white">
              <div className="text-[11px] font-medium uppercase tracking-wider text-white/60 mb-1.5">Next session</div>
              <div className="font-[var(--font-display)] text-[22px] mb-1">Monday, March 16 at 10:00 AM</div>
              <div className="text-[13px] text-white/70">
                Individual session · 50 minutes · Video (online) · Dr. Abena Osei-Mensah, RP
              </div>
              <div className="flex gap-2 mt-3.5">
                <button className="px-4 py-2 border border-white/25 rounded-lg text-[13px] font-medium bg-white/15 hover:bg-white/20 transition-colors">
                  Join video session
                </button>
                <button className="px-4 py-2 border border-white/25 rounded-lg text-[13px] font-medium bg-transparent hover:bg-white/10 transition-colors">
                  Reschedule
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-4">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                Quick actions
              </div>
              <div className="p-4.5 flex flex-col gap-2.5">
                <button
                  onClick={() => setActiveTab('checkin')}
                  className="flex items-center justify-between px-4 py-3.5 bg-[var(--warm)] border border-[var(--border)] rounded-lg text-[14px] font-medium text-[var(--ink)] hover:border-[var(--sage-light)] transition-colors"
                >
                  <span>How are you feeling this week? →</span>
                  <span className="text-[12px] text-[var(--ink-muted)]">Takes 2 minutes</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="flex items-center justify-between px-4 py-3.5 bg-[var(--warm)] border border-[var(--border)] rounded-lg text-[14px] font-medium text-[var(--ink)] hover:border-[var(--sage-light)] transition-colors"
                >
                  <span>Send Dr. Osei a message →</span>
                  <span className="text-[11px] bg-[var(--sage)] text-white px-2 py-0.5 rounded-lg">1 unread</span>
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="flex items-center justify-between px-4 py-3.5 bg-[var(--warm)] border border-[var(--border)] rounded-lg text-[14px] font-medium text-[var(--ink)] hover:border-[var(--sage-light)] transition-colors"
                >
                  <span>Download receipts for insurance →</span>
                  <span className="text-[12px] text-[var(--ink-muted)]">14 receipts</span>
                </button>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                Your progress (PHQ-9 — Depression scores)
              </div>
              <div className="p-4.5">
                <div className="flex items-end gap-2.5 h-[80px] mb-2">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[11px] font-medium text-[var(--ink-muted)]">10</div>
                    <div className="flex-1 w-full bg-[#FFF0C0] rounded-t" style={{ height: '70%' }}></div>
                    <div className="text-[10px] text-[var(--ink-muted)]">Session 1</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[11px] font-medium text-[var(--ink-muted)]">7</div>
                    <div className="flex-1 w-full bg-[var(--sage-pale)] rounded-t" style={{ height: '49%' }}></div>
                    <div className="text-[10px] text-[var(--ink-muted)]">Session 5</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[11px] font-medium text-[var(--sage-deep)]">3</div>
                    <div className="flex-1 w-full bg-[var(--sage)] rounded-t" style={{ height: '21%' }}></div>
                    <div className="text-[10px] text-[var(--ink-muted)]">Session 14</div>
                  </div>
                </div>
                <div className="text-[13px] text-[var(--sage-deep)] font-medium">
                  Score dropped from 10 (Moderate) → 3 (Minimal) ↓ 70% improvement
                </div>
              </div>
            </div>
          </>
        )}

        {/* CHECKIN TAB */}
        {activeTab === 'checkin' && (
          <>
            <div className="text-[14px] text-[var(--ink-soft)] leading-relaxed mb-5">
              A quick check-in between sessions. Your therapist can see your responses before your next appointment — it helps them understand how you've been doing since you last met.
            </div>

            {!checkinSubmitted ? (
              <>
                {/* Wellbeing Scale */}
                <div className="mb-5">
                  <div className="text-[14px] font-medium text-[var(--ink)] mb-1">Overall wellbeing this week</div>
                  <div className="text-[12px] text-[var(--ink-muted)] mb-2.5">1 = really struggling · 10 = doing well</div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setWellbeing(n)}
                        className={`w-9 h-9 rounded-lg border-[1.5px] text-[13px] font-medium transition-all ${
                          wellbeing === n
                            ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                            : 'border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anxiety Scale */}
                <div className="mb-5">
                  <div className="text-[14px] font-medium text-[var(--ink)] mb-1">Anxiety level</div>
                  <div className="text-[12px] text-[var(--ink-muted)] mb-2.5">1 = very calm · 10 = very anxious</div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setAnxiety(n)}
                        className={`w-9 h-9 rounded-lg border-[1.5px] text-[13px] font-medium transition-all ${
                          anxiety === n
                            ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                            : 'border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep Scale */}
                <div className="mb-5">
                  <div className="text-[14px] font-medium text-[var(--ink)] mb-1">Sleep quality</div>
                  <div className="text-[12px] text-[var(--ink-muted)] mb-2.5">1 = very poor · 10 = great sleep</div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setSleep(n)}
                        className={`w-9 h-9 rounded-lg border-[1.5px] text-[13px] font-medium transition-all ${
                          sleep === n
                            ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                            : 'border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Tags */}
                <div className="mb-5">
                  <div className="text-[14px] font-medium text-[var(--ink)] mb-2.5">How are you feeling today? (pick any that apply)</div>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map(mood => (
                      <button
                        key={mood}
                        onClick={() => toggleMood(mood)}
                        className={`px-3.5 py-2 border-[1.5px] rounded-[20px] text-[13px] transition-all ${
                          moods.includes(mood)
                            ? 'bg-[var(--sage-pale)] border-[var(--sage)] text-[var(--sage-deep)]'
                            : 'border-[var(--border)] text-[var(--ink-soft)] hover:border-[var(--sage-light)]'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <div className="text-[14px] font-medium text-[var(--ink)] mb-1">
                    Anything you'd like your therapist to know before your next session?
                  </div>
                  <div className="text-[12px] text-[var(--ink-muted)] mb-2.5">
                    Optional — you can be as brief or as detailed as you like
                  </div>
                  <textarea
                    defaultValue="Used the journaling exercise after our last session and it actually helped a lot. I noticed I was able to name what I was feeling instead of just feeling it. I have some questions about the workplace rights resources you mentioned too."
                    className="w-full px-3 py-3 border border-[var(--bmed)] rounded-lg text-[14px] text-[var(--ink)] leading-relaxed resize-vertical min-h-[90px] outline-none focus:border-[var(--sage)]"
                  />
                </div>

                <button onClick={submitCheckin} className="submit-btn">
                  Send to Dr. Osei
                </button>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="w-[52px] h-[52px] bg-[var(--sage-pale)] rounded-full flex items-center justify-center mx-auto mb-3.5">
                  <Check className="w-[22px] h-[22px] text-[var(--sage)]" strokeWidth={2} />
                </div>
                <div className="font-[var(--font-display)] text-xl text-[var(--ink)] mb-1.5">Sent to Dr. Osei</div>
                <div className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
                  Your therapist will review this before your Monday session. Thank you for checking in — it really helps them prepare for you.
                </div>
              </div>
            )}
          </>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <>
            <div className="text-[13px] text-[var(--ink-muted)] mb-4 leading-relaxed">
              Download official receipts for insurance reimbursement. Each receipt includes your therapist's College registration number and can be submitted directly to your insurer.
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-[var(--border)]">
                <div className="text-[14px] font-medium text-[var(--ink)]">Receipts — 2026</div>
                <button className="text-[12px] px-3 py-1.5 border border-[var(--bmed)] rounded-lg bg-white text-[var(--ink-soft)] hover:bg-[var(--sage-pale)]">
                  Download all 2026
                </button>
              </div>
              <div className="px-4">
                {[
                  { num: 'INV-0031', session: 14, date: 'March 10, 2026', amount: '$140.00' },
                  { num: 'INV-0028', session: 13, date: 'March 3, 2026', amount: '$140.00' },
                  { num: 'INV-0024', session: 12, date: 'Feb 24, 2026', amount: '$140.00' }
                ].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-b-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#e8f4f0] flex items-center justify-center text-[var(--sage-deep)]">
                        <FileText className="w-[15px] h-[15px]" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[var(--ink)]">{inv.num} · Session {inv.session}</div>
                        <div className="text-[12px] text-[var(--ink-muted)]">{inv.date} · {inv.amount}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-[#e8f4f0] text-[var(--sage-deep)] rounded">Paid</span>
                      <button className="px-3 py-1.5 border border-[var(--bmed)] rounded-lg text-[12px] text-[var(--ink-soft)] hover:bg-[var(--sage-pale)]">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--sage-pale)] rounded-lg px-4 py-3.5 text-[13px] text-[var(--sage-deep)] leading-relaxed">
              Receipts include your therapist's College registration number (CRPO-004821) and can be submitted to most Canadian insurers for reimbursement. Keep copies for your tax records — you may be able to claim therapy as a medical expense.
            </div>
          </>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="bg-[var(--sage-pale)] px-4 py-2 flex items-center gap-2 text-[11px] text-[var(--sage-deep)]">
              <svg className="w-[11px] h-[11px]" viewBox="0 0 16 16" fill="none" stroke="var(--sage)" strokeWidth="1.5">
                <rect x="2" y="5" width="12" height="9" rx="1" />
                <path d="M5 5V4a3 3 0 016 0v1" />
              </svg>
              End-to-end encrypted · Stored on Canadian servers · Not SMS
            </div>
            <div className="p-4 flex flex-col gap-2.5 max-h-[340px] overflow-y-auto">
              <div className="bg-[var(--sage)] text-white px-3.5 py-2.5 rounded-xl rounded-bl-sm max-w-[80%] text-[14px] leading-relaxed">
                Hi Amara — just a reminder that we'll be continuing with the Cultural Formulation Interview on Monday. If you get a chance before our session, try the journaling exercise we discussed. See you at 10am.
                <div className="text-[11px] opacity-65 mt-1">Thu Mar 12 · 2:30 PM</div>
              </div>
              <div className="bg-white border border-[var(--border)] text-[var(--ink)] px-3.5 py-2.5 rounded-xl rounded-br-sm max-w-[80%] ml-auto text-[14px] leading-relaxed">
                Hi Dr. Osei, I did the journaling exercise and it was really helpful. I noticed a few things I want to share in today's session. I also wanted to ask — is there a resource you'd recommend for what we talked about regarding workplace rights?
                <div className="text-[11px] opacity-65 mt-1">Today 9:47 AM</div>
              </div>
              <div className="bg-white border border-[var(--border)] text-[var(--ink)] px-3.5 py-2.5 rounded-xl rounded-br-sm max-w-[80%] ml-auto text-[14px] leading-relaxed">
                Also confirming I'll be there at 10 for our session today. Thank you!
                <div className="text-[11px] opacity-65 mt-1">Today 9:48 AM</div>
              </div>
            </div>
            <div className="flex gap-2 px-3.5 py-3.5 border-t border-[var(--border)] items-end">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write a secure message to Dr. Osei..."
                className="flex-1 px-3 py-2.5 border border-[var(--bmed)] rounded-lg text-[14px] outline-none focus:border-[var(--sage)] resize-none min-h-[44px]"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2.5 bg-[var(--sage)] text-white rounded-lg text-[13px] font-medium h-[44px] flex items-center gap-1.5 hover:bg-[var(--sage-deep)]"
              >
                <Send className="w-[13px] h-[13px]" />
                Send
              </button>
            </div>
          </div>
        )}

        {/* SAFETY PLAN TAB */}
        {activeTab === 'safety' && (
          <>
            <div className="bg-[#fde8e8] border border-[#f09595] rounded-lg px-4 py-3.5 text-[14px] text-[#791F1F] font-medium mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
              If you are in immediate danger, call 911 now.
            </div>

            <div className="text-[13px] text-[var(--ink-muted)] mb-4">
              Your safety plan was created with Dr. Osei on March 10, 2026. Keep this page bookmarked — it's always available when you need it.
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-4">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                My warning signs
              </div>
              <div className="p-4.5">
                {[
                  'Withdrawing from friends and family',
                  'Stopping activities I enjoy',
                  'Racing thoughts at night that won\'t stop',
                  'Feeling like a burden to the people I love'
                ].map((sign, i) => (
                  <div key={i} className="py-3 border-b border-[var(--border)] last:border-b-0">
                    <div className="text-[14px] text-[var(--ink-soft)] leading-relaxed">{sign}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-4">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                Things I can do on my own
              </div>
              <div className="p-4.5">
                {[
                  '5-4-3-2-1 grounding exercise (5 things I see, 4 I hear...)',
                  'Box breathing — breathe in 4, hold 4, out 4, hold 4',
                  'Go for a walk outside, even just 10 minutes',
                  'Write in my journal — just start with "right now I feel..."'
                ].map((strategy, i) => (
                  <div key={i} className="py-3 border-b border-[var(--border)] last:border-b-0">
                    <div className="text-[14px] text-[var(--ink-soft)] leading-relaxed">{strategy}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-4">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                People I can reach out to
              </div>
              <div className="p-4.5">
                <div className="py-3 border-b border-[var(--border)]">
                  <div className="text-[14px] text-[var(--ink-soft)]">
                    <strong>Sister — Abena</strong> · (416) 555-0122
                  </div>
                </div>
                <div className="py-3">
                  <div className="text-[14px] text-[var(--ink-soft)]">
                    <strong>Friend — Yaa</strong> · (647) 555-0189
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--ink)]">
                Crisis lines — available 24/7
              </div>
              <div className="p-2.5">
                {[
                  { name: 'Crisis Services Canada', phone: '1-833-456-4566', tel: '18334564566' },
                  { name: 'Kids Help Phone', phone: '1-800-668-6868 · Text: 686868', tel: '18006686868' },
                  { name: 'Emergency services', phone: '911', tel: '911' }
                ].map((crisis, i) => (
                  <a
                    key={i}
                    href={`tel:${crisis.tel}`}
                    className="flex items-center gap-2.5 w-full px-3.5 py-3 border border-[var(--bmed)] rounded-lg mb-2 last:mb-0 bg-white hover:bg-[var(--warm)] transition-colors"
                  >
                    <Phone className="w-[18px] h-[18px] text-[var(--red)]" />
                    <div>
                      <div className="text-[14px] font-medium text-[var(--ink)]">{crisis.name}</div>
                      <div className="text-[13px] text-[#185FA5]">{crisis.phone}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PRIVACY & DATA TAB */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Header Description */}
            <div className="text-[14px] text-[var(--ink-soft)] leading-relaxed">
              Manage your personal information, request secure physical or digital copies of your complete therapy records, and control your consent options under Canadian health regulations (PHIPA).
            </div>

            {/* SECTION 1: DATA EXPORT */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-[var(--sage-deep)]" />
                  <span className="text-[14px] font-medium text-[var(--ink)]">Client Data Portability (s.20 PHIPA)</span>
                </div>
                <span className="text-[11px] font-semibold bg-[var(--sage-pale)] text-[var(--sage-deep)] px-2 py-0.5 rounded">Secure</span>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                  You have the right to request and receive your personal health information in structured, transparent, and machine-readable formats. Choose an export mechanism below:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* JSON Card */}
                  <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--warm)] flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[var(--ink)] mb-1">Structured JSON Data</div>
                      <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed mb-4">
                        Download your demographic profiles, safety strategies, check-in history, and billing records in a machine-readable JSON format.
                      </p>
                    </div>
                    <button
                      onClick={handleExportJson}
                      disabled={isExportingJson}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--sage)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--sage-deep)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isExportingJson ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Printable PDF Statement Card */}
                  <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--warm)] flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[var(--ink)] mb-1">Printable Clinical Record</div>
                      <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed mb-4">
                        Generate a secure, beautifully formatted medical statement of your intake profile, PHQ-9 progress, and invoices for legal or insurance reimbursement.
                      </p>
                    </div>
                    <button
                      onClick={handleExportPdf}
                      disabled={isExportingPdf}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-transparent border border-[var(--sage)] text-[var(--sage-deep)] rounded-lg text-[13px] font-medium hover:bg-[var(--sage-pale)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isExportingPdf ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Preparing Statement...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Export PDF Statement</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: CONSENT WITHDRAWAL */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="px-4.5 py-3.5 border-b border-[var(--border)] bg-gray-50 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span className="text-[14px] font-medium text-[var(--ink)]">Consent Withdrawal & Right to be Forgotten</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Active Status */}
                {consentStatus === 'active' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold mt-0.5 flex-shrink-0">✓</div>
                      <div>
                        <div className="text-sm font-semibold text-green-900">Current Consent Status: Active</div>
                        <p className="text-xs text-green-800 leading-relaxed mt-1">
                          You have granted active consent for continuous therapeutic treatment, encrypted secure messaging with Dr. Abena Osei-Mensah, and secure temporary AI session note compilation.
                        </p>
                      </div>
                    </div>

                    <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                      You have the right to withdraw your consent to therapeutic care and personal records storage at any point. By choosing to withdraw consent, your secure portal connection will be terminated.
                    </p>

                    {!showWithdrawConfirm ? (
                      <button
                        onClick={() => setShowWithdrawConfirm(true)}
                        className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Withdraw Consent & Request Account Deletion
                      </button>
                    ) : (
                      <div className="border border-red-200 bg-red-50/50 rounded-xl p-4.5 space-y-3.5 animate-fadeIn">
                        <div className="font-semibold text-red-900 text-sm flex items-center gap-2">
                          <span>⚠️</span>
                          <span>Important: Legal and Regulatory Notice</span>
                        </div>
                        
                        <div className="text-xs text-red-800 space-y-2.5 leading-relaxed">
                          <p>
                            <strong>1. Mandatory 10-Year Clinical Lock (Ontario PHIPA Regulation)</strong>
                            <br />
                            Under Section 20 of the Ontario Personal Health Information Protection Act (PHIPA), a regulated clinician is legally required to retain all core session clinical notes, initial intake forms, and formal diagnoses for a <strong>statutory period of 10 years</strong> following the last record entry. <em>Therefore, your core clinical record will be safely archived and locked; it cannot be immediately deleted from storage.</em>
                          </p>
                          <p>
                            <strong>2. 30-Day Cool-off / Portal Purge Timeline</strong>
                            <br />
                            Your portal credential, secure messaging chat logs, wellness scores, and active contact with Dr. Osei-Mensah will enter a <strong>30-day graceful cooling-off period</strong>. During these 30 days, you can log in to cancel the request. After 30 days, your portal account and its non-mandatory logs will be permanently deleted and cannot be restored.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                          <button
                            onClick={handleWithdrawConsent}
                            className="px-4.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[12px] font-bold transition-colors"
                          >
                            Yes, I Understand. Withdraw Consent
                          </button>
                          <button
                            onClick={() => setShowWithdrawConfirm(false)}
                            className="px-4.5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-[12px] font-semibold transition-colors"
                          >
                            Keep Consent Active
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Withdrawing (Countdown State) */}
                {consentStatus === 'withdrawing' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4.5 space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-[11px] font-bold mt-0.5 flex-shrink-0 animate-pulse">!</div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-amber-900">Consent Withdrawn — Account Scheduled for Inactivation</div>
                          <p className="text-[11px] text-amber-800 mt-1">
                            Action recorded: <strong>{withdrawTimestamp}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Visual Countdown Progress */}
                      <div className="border border-amber-200 bg-white rounded-lg p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-amber-900">Inactivation Countdown:</span>
                          <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">29 days, 23 hours remaining</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '97%' }}></div>
                        </div>
                        <p className="text-[10px] text-[var(--ink-muted)] leading-relaxed">
                          Your therapist connection has been suspended. During this 30-day grace period, all non-mandatory data remains locked. At the end of this countdown, all portal data is purged, and core clinical files enter a secure 10-year PHIPA-compliant archive.
                        </p>
                      </div>

                      <div className="pt-1 flex gap-2">
                        <button
                          onClick={handleRestoreConsent}
                          className="px-4 py-2 bg-[var(--sage)] hover:bg-[var(--sage-deep)] text-white rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Cancel Request & Restore Consent</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECURITY/REGULATION FOOTER */}
            <div className="bg-gray-100 border border-[var(--border)] rounded-lg p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Regulatory Compliance</strong>
                <br />
                MentalPath complies with the Ontario Personal Health Information Protection Act (PHIPA) and federal Personal Information Protection and Electronic Documents Act (PIPEDA). All data is encrypted at rest and in transit using AES-256 standard protocols on secure servers hosted in Montreal and Toronto, Canada.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
