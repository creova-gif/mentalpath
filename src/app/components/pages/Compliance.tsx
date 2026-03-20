import { useState } from 'react';
import { Shield, BookOpen, Users, Lock, FileText, AlertTriangle, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';

type ComplianceTab = 'checklist' | 'cpd' | 'supervision' | 'phipa' | 'audit' | 'breach';

const complianceItems = [
  {
    id: 1,
    status: 'compliant',
    label: 'Active college registration',
    meta: 'Registration #CRPO-004821 · Renews March 31, 2027',
    region: 'Canadian & US'
  },
  {
    id: 2,
    status: 'compliant',
    label: 'Professional liability insurance',
    meta: 'Expires December 31, 2026 · 290 days remaining',
    region: 'Canadian & US'
  },
  {
    id: 3,
    status: 'pending',
    label: 'Continuing professional development — 40 hrs / cycle',
    meta: '18 of 40 hours logged · Due March 31, 2027 · 22 hours remaining',
    action: 'Log CPD',
    region: 'Canadian & US'
  },
  {
    id: 4,
    status: 'pending',
    label: 'Clinical supervision hours',
    meta: '12.5 hours logged this year · Required hours not yet set',
    action: 'Log hours',
    region: 'Canadian & US'
  },
  {
    id: 5,
    status: 'compliant',
    label: 'Published privacy policy / PHIPA notice',
    meta: 'Client-facing PHIPA consent text live in client portal',
    region: 'Canadian only'
  },
  {
    id: 6,
    status: 'compliant',
    label: 'Signed client consent forms on file',
    meta: '23 active clients — all consent forms signed and timestamped',
    region: 'Canadian & US'
  },
  {
    id: 7,
    status: 'compliant',
    label: 'Client records retention — 10 years (PHIPA s.20)',
    meta: 'Note locking (24hr), audit log, and 10-year retention enforced automatically',
    region: 'Canadian (PHIPA)'
  },
  {
    id: 8,
    status: 'compliant',
    label: 'HIPAA compliance (US practitioners)',
    meta: 'Encryption at rest (AES-256), secure transmission (TLS 1.3), BAA available',
    region: 'US only'
  },
  {
    id: 9,
    status: 'compliant',
    label: 'College annual declaration submitted',
    meta: 'Submitted March 2026 · Next due March 2027',
    region: 'Canadian only'
  },
  {
    id: 10,
    status: 'pending',
    label: 'State board renewal (US)',
    meta: 'Renewal due September 2026 for state licensure',
    region: 'US only'
  }
];

const cpdActivities = [
  { category: 'Clinical training', hours: 8, required: 15 },
  { category: 'Ethics & supervision', hours: 6, required: 10 },
  { category: 'Cultural competency', hours: 4, required: 10 },
  { category: 'Self-care & wellness', hours: 0, required: 5 },
];

const supervisionLog = [
  { date: 'Mar 10, 2026', supervisor: 'Dr. Jennifer Wu, RP', hours: 2, notes: 'Case conceptualization — newcomer trauma presentation' },
  { date: 'Feb 24, 2026', supervisor: 'Dr. Jennifer Wu, RP', hours: 1.5, notes: 'Ethical dilemma discussion — dual relationships in small communities' },
  { date: 'Feb 10, 2026', supervisor: 'Dr. Jennifer Wu, RP', hours: 2, notes: 'Client risk assessment — safety planning for suicidal ideation' },
  { date: 'Jan 27, 2026', supervisor: 'Dr. Jennifer Wu, RP', hours: 2, notes: 'Treatment planning — culturally-adapted CBT for racialized stress' },
];

const auditLog = [
  { time: '2 hours ago', action: 'Viewed client record: Amara M.', user: 'Dr. Abena Osei' },
  { time: '3 hours ago', action: 'Created session note (SOAP format) for Jamal L.', user: 'Dr. Abena Osei' },
  { time: '5 hours ago', action: 'Generated invoice #INV-0245 for Sadia M.', user: 'Dr. Abena Osei' },
  { time: 'Yesterday', action: 'Updated client consent form for Priya & Chetan', user: 'Dr. Abena Osei' },
  { time: 'Yesterday', action: 'Exported session notes for insurance claim', user: 'Dr. Abena Osei' },
];

const PROFESSION_COLLEGE: Record<string, { abbr: string; full: string; regPrefix: string }> = {
  'Registered Psychotherapist': { abbr: 'CRPO', full: 'College of Registered Psychotherapists of Ontario', regPrefix: 'CRPO' },
  'Chiropractor': { abbr: 'CCO', full: 'College of Chiropractors of Ontario', regPrefix: 'CCO' },
  'Physiotherapist': { abbr: 'CPO', full: 'College of Physiotherapists of Ontario', regPrefix: 'CPO' },
  'Registered Massage Therapist': { abbr: 'CMTO', full: 'College of Massage Therapists of Ontario', regPrefix: 'CMTO' },
};

export function Compliance() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<ComplianceTab>('checklist');
  const [showCPDForm, setShowCPDForm] = useState(false);
  const [showSupervisionForm, setShowSupervisionForm] = useState(false);

  const college = PROFESSION_COLLEGE[user?.profession ?? ''] ?? PROFESSION_COLLEGE['Registered Psychotherapist'];
  const regNumber = user?.registrationNumber ?? 'CRPO-004821';

  const dynamicItems = complianceItems.map(item => {
    if (item.id === 1) {
      return { ...item, meta: `Registration #${regNumber} · Renews March 31, 2027` };
    }
    return item;
  });

  const compliantCount = dynamicItems.filter(item => item.status === 'compliant').length;
  const totalCount = complianceItems.length;
  const compliancePercentage = Math.round((compliantCount / totalCount) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* PHIPA/HIPAA Notice */}
      <div className="bg-[var(--sage-pale)] border border-[rgba(74,124,111,0.2)] rounded-lg p-3.5 flex gap-2.5 text-[13px] text-[var(--sage-deep)] leading-relaxed">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--sage)]" />
        <div>
          This checklist tracks your College and PHIPA/HIPAA compliance obligations. MentalPath automates what it can — encryption, record retention, consent management, audit logging. Items marked as <strong>pending</strong> require action from you. This is not legal advice — always confirm requirements with your College or State Board directly.
        </div>
      </div>

      {/* Compliance Score Hero */}
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 flex items-center gap-7">
        <div className="relative w-[88px] h-[88px] flex-shrink-0">
          <svg className="transform -rotate-90" width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke="var(--sage-pale)" strokeWidth="9"/>
            <circle 
              cx="44" 
              cy="44" 
              r="36" 
              fill="none" 
              stroke="var(--sage)" 
              strokeWidth="9"
              strokeDasharray={`${compliancePercentage * 2.26} ${226 - (compliancePercentage * 2.26)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[var(--font-display)] text-2xl text-[var(--ink)] leading-none">{compliantCount}</span>
            <span className="text-[11px] text-[var(--ink-muted)]">/ {totalCount}</span>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="font-[var(--font-display)] text-xl text-[var(--ink)] mb-1.5">
            Compliance score: {compliancePercentage >= 80 ? 'Excellent' : compliancePercentage >= 60 ? 'Good' : 'Needs attention'}
          </h2>
          <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed mb-2.5 max-w-[460px]">
            {compliantCount} of {totalCount} compliance items are current. {totalCount - compliantCount} {totalCount - compliantCount === 1 ? 'item needs' : 'items need'} attention before your College renewal.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e8f4f0] text-[var(--sage-deep)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
              {compliantCount} compliant
            </span>
            {totalCount - compliantCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fef3e2] text-[#7a4a00]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
                {totalCount - compliantCount} pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border)] -mb-5">
        {[
          { id: 'checklist', label: 'Checklist', icon: Shield },
          { id: 'cpd', label: 'CPD Hours', icon: BookOpen },
          { id: 'supervision', label: 'Supervision', icon: Users },
          { id: 'phipa', label: 'PHIPA/HIPAA', icon: Lock },
          { id: 'audit', label: 'Audit Log', icon: FileText },
          { id: 'breach', label: 'Breach Protocol', icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ComplianceTab)}
            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[var(--sage)] text-[var(--sage-deep)] font-medium'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
            <div className="w-[34px] h-[34px] rounded-lg bg-[var(--sage-pale)] text-[var(--sage)] flex items-center justify-center">
              <Shield className="w-[17px] h-[17px]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--ink)]">College & Regulatory Requirements</div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5">{college.abbr}, PHIPA (Canada) / State boards, HIPAA (US)</div>
            </div>
            <div className="ml-auto text-xs text-[var(--ink-muted)]">Updated March 16, 2026</div>
          </div>

          {dynamicItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3.5 px-5 py-4 border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--warm)]"
            >
              <div
                className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-semibold ${
                  item.status === 'compliant'
                    ? 'bg-[#e8f4f0] text-[var(--green)]'
                    : 'bg-[#fef3e2] text-[var(--amber)]'
                }`}
              >
                {item.status === 'compliant' ? '✓' : '○'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--ink)] mb-0.5">{item.label}</div>
                <div className="text-xs text-[var(--ink-muted)] leading-normal">{item.meta}</div>
                <div className="text-[11px] text-[var(--sage)] mt-1 font-medium">{item.region}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded ${
                    item.status === 'compliant'
                      ? 'bg-[#e8f4f0] text-[var(--sage-deep)]'
                      : 'bg-[#fef3e2] text-[#7a4a00]'
                  }`}
                >
                  {item.status === 'compliant' ? 'Compliant' : 'In progress'}
                </span>
                {item.action && (
                  <button className="text-xs text-[var(--sage)] font-medium bg-transparent border-none cursor-pointer px-2 py-1 rounded transition-colors hover:bg-[var(--sage-pale)]">
                    {item.action} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CPD Hours Tab */}
      {activeTab === 'cpd' && (
        <div className="space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <div className="text-sm font-medium text-[var(--ink)]">Continuing Professional Development</div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5">Track your CPD hours for college renewal</div>
            </div>

            {cpdActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-3.5 border-b border-[var(--border)] last:border-0">
                <div className="flex-1 text-sm font-medium text-[var(--ink)]">{activity.category}</div>
                <div className="flex flex-col items-end gap-1.5 min-w-[220px]">
                  <div className="text-[13px] text-[var(--ink-muted)]">
                    {activity.hours} / {activity.required} hours
                  </div>
                  <div className="w-[200px] h-1.5 bg-[var(--warm)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--sage)]"
                      style={{ width: `${Math.min((activity.hours / activity.required) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowCPDForm(!showCPDForm)}
            className="px-5 py-2.5 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer transition-colors hover:bg-[var(--sage-deep)]"
          >
            + Log CPD activity
          </button>

          {showCPDForm && (
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="text-sm font-medium text-[var(--ink)] mb-3.5">Add CPD activity</div>
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Category</label>
                  <select className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]">
                    <option>Clinical training</option>
                    <option>Ethics & supervision</option>
                    <option>Cultural competency</option>
                    <option>Self-care & wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Hours</label>
                  <input
                    type="number"
                    placeholder="2"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]"
                  />
                </div>
              </div>
              <div className="mb-3.5">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Activity description</label>
                <textarea
                  placeholder="e.g. Webinar on trauma-informed care for refugees"
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)] resize-y min-h-[60px]"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-5 py-2.5 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer transition-colors hover:bg-[var(--sage-deep)]">
                  Save activity
                </button>
                <button
                  onClick={() => setShowCPDForm(false)}
                  className="px-4 py-2.5 rounded-lg bg-transparent text-[var(--ink-soft)] text-[13px] border border-[var(--border)] cursor-pointer transition-colors hover:bg-[var(--warm)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supervision Tab */}
      {activeTab === 'supervision' && (
        <div className="space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <div className="text-sm font-medium text-[var(--ink)]">Clinical Supervision Log</div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5">12.5 hours logged this year</div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-[var(--warm)]">
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5">Date</th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5">Supervisor</th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5">Hours</th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5">Notes</th>
                </tr>
              </thead>
              <tbody>
                {supervisionLog.map((log, idx) => (
                  <tr key={idx} className="border-t border-[var(--border)] hover:bg-[var(--warm)]">
                    <td className="px-5 py-3 text-[13px] font-medium text-[var(--ink)] whitespace-nowrap">{log.date}</td>
                    <td className="px-5 py-3 text-[13px] text-[var(--ink-soft)]">{log.supervisor}</td>
                    <td className="px-5 py-3 text-[13px] text-[var(--ink-soft)]">{log.hours}</td>
                    <td className="px-5 py-3 text-[13px] text-[var(--ink-soft)]">{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setShowSupervisionForm(!showSupervisionForm)}
            className="px-5 py-2.5 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer transition-colors hover:bg-[var(--sage-deep)]"
          >
            + Log supervision session
          </button>

          {showSupervisionForm && (
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="text-sm font-medium text-[var(--ink)] mb-3.5">Add supervision session</div>
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="2"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]"
                  />
                </div>
              </div>
              <div className="mb-3.5">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Supervisor name</label>
                <input
                  type="text"
                  placeholder="Dr. Jennifer Wu, RP"
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]"
                />
              </div>
              <div className="mb-3.5">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5">Session notes</label>
                <textarea
                  placeholder="Brief summary of supervision topics discussed..."
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)] resize-y min-h-[60px]"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-5 py-2.5 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer transition-colors hover:bg-[var(--sage-deep)]">
                  Save session
                </button>
                <button
                  onClick={() => setShowSupervisionForm(false)}
                  className="px-4 py-2.5 rounded-lg bg-transparent text-[var(--ink-soft)] text-[13px] border border-[var(--border)] cursor-pointer transition-colors hover:bg-[var(--warm)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHIPA/HIPAA Tab */}
      {activeTab === 'phipa' && (
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="text-sm font-medium text-[var(--ink)]">PHIPA & HIPAA Data Governance</div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">How MentalPath protects client health information</div>
          </div>

          <div className="p-5 space-y-4 text-[13px] text-[var(--ink-soft)] leading-relaxed">
            <div>
              <div className="font-medium text-[var(--ink)] mb-2">🍁 For Canadian practitioners (PHIPA)</div>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>All data stored exclusively in Canada (AWS ca-central-1, Montreal & Toronto)</li>
                <li>Never routed through or accessible under US CLOUD Act</li>
                <li>AES-256 encryption at rest, TLS 1.3 in transit</li>
                <li>10-year record retention enforced automatically</li>
                <li>Client consent forms with timestamped e-signatures</li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-[var(--ink)] mb-2">🇺🇸 For US practitioners (HIPAA)</div>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>HIPAA-compliant data storage (US East regions)</li>
                <li>Business Associate Agreement (BAA) available upon request</li>
                <li>Encrypted PHI at rest and in transit</li>
                <li>Audit logs for all PHI access</li>
                <li>Secure messaging with automatic retention policies</li>
              </ul>
            </div>

            <div className="bg-[var(--sage-pale)] rounded-lg p-4 mt-4">
              <div className="font-medium text-[var(--sage-deep)] mb-2 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Compliance features enabled automatically
              </div>
              <ul className="text-xs text-[var(--sage-deep)] space-y-1 ml-6">
                <li>✓ Note locking after 24 hours (prevents retroactive edits)</li>
                <li>✓ Append-only audit trail for all client record access</li>
                <li>✓ Automated consent form versioning</li>
                <li>✓ Secure file storage with access controls</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="text-sm font-medium text-[var(--ink)]">Audit Log</div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">Complete record of all system activity</div>
          </div>

          {auditLog.map((log, idx) => (
            <div key={idx} className="flex gap-3 px-5 py-2.5 border-b border-[var(--border)] last:border-0 text-[13px] text-[var(--ink-soft)]">
              <div className="text-[var(--ink-muted)] text-xs min-w-[120px] flex-shrink-0">{log.time}</div>
              <div className="flex-1">{log.action}</div>
              <div className="text-xs text-[var(--sage)]">{log.user}</div>
            </div>
          ))}
        </div>
      )}

      {/* Breach Protocol Tab */}
      {activeTab === 'breach' && (
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="text-sm font-medium text-[var(--ink)]">Breach Response Protocol</div>
            <div className="text-xs text-[var(--ink-muted)] mt-0.5">What to do if you suspect a privacy breach</div>
          </div>

          <div className="p-5 space-y-4 text-[13px] text-[var(--ink-soft)] leading-relaxed">
            <div>
              <div className="font-medium text-[var(--ink)] mb-2">Immediate steps (within 24 hours)</div>
              <ol className="list-decimal list-inside space-y-1.5 ml-2">
                <li>Document the incident — what happened, when, and what data was involved</li>
                <li>Contact MentalPath support immediately to secure affected systems</li>
                <li>Notify affected clients if their PHI/health information was accessed</li>
                <li>Report to your College (CRPO/OCSWSSW/etc.) or State Board</li>
              </ol>
            </div>

            <div>
              <div className="font-medium text-[var(--ink)] mb-2">Canadian practitioners (PHIPA)</div>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Report to the Information and Privacy Commissioner of Ontario (IPC)</li>
                <li>Timeline: As soon as reasonably possible, ideally within 48 hours</li>
                <li>Contact: 1-800-387-0073 or ipc.on.ca</li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-[var(--ink)] mb-2">US practitioners (HIPAA)</div>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Report to the Office for Civil Rights (OCR) if breach affects 500+ individuals</li>
                <li>Timeline: Within 60 days of discovery</li>
                <li>Contact: hhs.gov/ocr/privacy/hipaa/administrative/breachnotificationrule</li>
              </ul>
            </div>

            <div className="bg-[#fde8e8] border border-[#f09595] rounded-lg p-4 mt-4">
              <div className="font-medium text-[var(--red)] mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Emergency Contact
              </div>
              <div className="text-xs text-[var(--ink-muted)]">
                If you believe a breach has occurred, contact MentalPath support immediately:<br />
                <strong>support@mentalpath.ca</strong> or <strong>1-888-MENTAL-PATH</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
