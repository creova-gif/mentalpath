import { useState } from 'react';
import { Download, Mail, Save } from 'lucide-react';

const clients = [
  { name: 'Jane Smith', email: 'jane.smith@email.com' },
  { name: 'Marcus Lee', email: 'marcus.lee@email.com' },
  { name: 'Priya Sharma', email: 'priya.sharma@email.com' },
];

const insurers = ['Blue Cross', 'Sun Life', 'Manulife', 'Green Shield', 'Canada Life'];

type ServiceCode = { code: string; desc: string; fullDesc: string; rate: number };

const serviceCodes: ServiceCode[] = [
  { code: '43.1A', desc: 'Psychotherapy — initial assessment', fullDesc: 'Psychotherapy — initial assessment (50 min)', rate: 155 },
  { code: '43.1B', desc: 'Psychotherapy — subsequent session', fullDesc: 'Psychotherapy — individual session (50 min)', rate: 140 },
  { code: '43.1C', desc: 'Psychological assessment', fullDesc: 'Psychological assessment report', rate: 220 },
  { code: '43.1G', desc: 'Group therapy session', fullDesc: 'Group psychotherapy (90 min)', rate: 75 },
];

function receiptNum() {
  return Math.floor(4800 + Math.random() * 200).toString();
}

export function InsuranceReceipts() {
  const [selectedClient, setSelectedClient] = useState(0);
  const [serviceDate, setServiceDate] = useState('2026-03-16');
  const [selectedInsurer, setSelectedInsurer] = useState('Blue Cross');
  const [memberID, setMemberID] = useState('MBR-4821-002');
  const [groupNum, setGroupNum] = useState('GRP-00447');
  const [selectedCode, setSelectedCode] = useState(serviceCodes[1]);
  const [rate, setRate] = useState(140);
  const [diagCode, setDiagCode] = useState('F41.1');
  const [generated, setGenerated] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Generated' | 'Sent'>('Draft');

  const hst = +(rate * 0).toFixed(2);
  const total = rate + hst;
  const rNum = '4821';

  const client = clients[selectedClient];
  const dateFormatted = new Date(serviceDate + 'T12:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  function handleGenerate() {
    setGenerated(true);
    setStatus('Generated');
  }

  return (
    <div className="flex gap-0 -m-4 sm:-m-6 md:-m-7 min-h-[calc(100vh-120px)]" style={{ height: 'calc(100vh - 120px)' }}>

      {/* FORM PANEL */}
      <div className="w-[300px] lg:w-[340px] flex-shrink-0 bg-white border-r border-[rgba(0,0,0,0.08)] p-5 overflow-y-auto">
        <div className="font-[var(--font-display)] text-[18px] text-[var(--ink)] mb-1">Generate insurance receipt</div>
        <div className="text-[12px] text-[var(--ink-muted)] mb-5 leading-relaxed">
          Extended health benefit receipts for Blue Cross, Sun Life, Manulife, Green Shield, Canada Life
        </div>

        <div className="text-[10px] font-medium uppercase tracking-[0.7px] text-[var(--ink-muted)] mb-2.5">Session details</div>

        <div className="mb-3">
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1">Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(+e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] text-[var(--ink)] outline-none focus:border-[var(--sage)]"
          >
            {clients.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1">Service date</label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] text-[var(--ink)] outline-none focus:border-[var(--sage)]"
          />
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] my-4" />
        <div className="text-[10px] font-medium uppercase tracking-[0.7px] text-[var(--ink-muted)] mb-2.5">Insurer</div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {insurers.map((ins) => (
            <button
              key={ins}
              onClick={() => setSelectedInsurer(ins)}
              className={`px-3 py-1.5 rounded-md border-[1.5px] text-[12px] font-medium transition-all ${
                selectedInsurer === ins
                  ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
                  : 'bg-white border-[rgba(0,0,0,0.08)] text-[var(--ink-muted)] hover:border-[var(--sage-light)]'
              }`}
            >
              {ins}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1">Plan member ID</label>
          <input
            type="text"
            value={memberID}
            onChange={(e) => setMemberID(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1">Certificate / group number</label>
          <input
            type="text"
            value={groupNum}
            onChange={(e) => setGroupNum(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]"
          />
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] my-4" />
        <div className="text-[10px] font-medium uppercase tracking-[0.7px] text-[var(--ink-muted)] mb-2.5">Service code</div>

        <div className="flex flex-col gap-1.5 mb-4">
          {serviceCodes.map((sc) => (
            <button
              key={sc.code}
              onClick={() => { setSelectedCode(sc); setRate(sc.rate); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                selectedCode.code === sc.code
                  ? 'border-[var(--sage)] bg-[var(--sage-pale)]'
                  : 'border-[rgba(0,0,0,0.08)] bg-white hover:border-[var(--sage-light)]'
              }`}
            >
              <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#E6F1FB] text-[#0C447C] flex-shrink-0">{sc.code}</span>
              <span className="text-[12px] text-[var(--ink-soft)]">{sc.desc}</span>
            </button>
          ))}
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] my-4" />

        <div className="mb-3">
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1">Session rate ($CAD)</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]"
          />
        </div>

        <div className="mb-3">
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1">Diagnosis code (optional)</label>
          <input
            type="text"
            value={diagCode}
            onChange={(e) => setDiagCode(e.target.value)}
            placeholder="ICD-10 e.g. F41.1"
            className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]"
          />
        </div>

        <div className="mb-5">
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1">Provider number</label>
          <input
            type="text"
            defaultValue="CRPO-004821"
            className="w-full px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.13)] bg-white text-[13px] outline-none focus:border-[var(--sage)]"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-[var(--sage)] text-white rounded-xl text-[14px] font-medium hover:bg-[var(--sage-deep)] transition-colors"
        >
          Generate receipt →
        </button>
      </div>

      {/* PREVIEW PANEL */}
      <div className="flex-1 p-5 overflow-y-auto bg-[var(--warm)]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="font-[var(--font-display)] text-[18px] text-[var(--ink)]">Receipt preview</div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-2 border border-[rgba(0,0,0,0.13)] rounded-lg bg-white text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--warm)] transition-colors">
              <Save className="w-3.5 h-3.5" />
              Save draft
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 border border-[rgba(0,0,0,0.13)] rounded-lg bg-white text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--warm)] transition-colors">
              <Mail className="w-3.5 h-3.5" />
              Email to client
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--sage)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--sage-deep)] transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div className="flex flex-wrap gap-2.5 mb-4">
          {[
            { dot: status === 'Draft' ? '#BA7517' : '#1D9E75', label: 'Status', val: status },
            { dot: 'var(--sage)', label: 'Insurer', val: selectedInsurer },
            { dot: '#185FA5', label: 'Code', val: selectedCode.code },
            { dot: 'var(--sage)', label: 'Amount', val: `$${total.toFixed(2)}` },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-3 py-2 text-[12px]">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
              <span className="text-[var(--ink-muted)]">{s.label}</span>
              <span className="font-medium text-[var(--ink)]">{s.val}</span>
            </div>
          ))}
        </div>

        {/* Receipt */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[13px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="px-8 py-7 text-[13px] text-[var(--ink-soft)] leading-[1.65]">

            {/* Header */}
            <div className="flex justify-between items-start pb-5 mb-5 border-b-2 border-[var(--ink)]">
              <div>
                <div className="font-[var(--font-display)] text-[20px] text-[var(--ink)] mb-1">Northside Therapy Practice</div>
                <div className="text-[12px] text-[var(--ink-muted)]">Dr. Abena Osei-Mensah, RP · CRPO Registration #CRPO-004821</div>
                <div className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)]">CRPO Registered</div>
              </div>
              <div className="text-right">
                <div className="text-[16px] font-medium text-[var(--ink)]">{selectedInsurer}</div>
                <div className="text-[12px] text-[var(--ink-muted)]">Extended Health Benefit Receipt</div>
                <div className="text-[11px] text-[var(--ink-muted)] mt-1">Receipt #RCT-2026-{rNum}</div>
              </div>
            </div>

            {/* Bill to */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] mb-1">Bill to (patient)</div>
                <div className="text-[13px] text-[var(--ink)]">
                  {client.name}<br />
                  <span className="text-[12px] text-[var(--ink-muted)]">{client.email}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] mb-1">Insurance details</div>
                <div className="text-[12px] text-[var(--ink)]">
                  Plan member ID: <span className="font-medium">{memberID}</span><br />
                  Group/Certificate: <span className="font-medium">{groupNum}</span>
                </div>
              </div>
            </div>

            {/* Service table */}
            <table className="w-full border-collapse mb-5">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.08)]">
                  {['Date', 'Service', 'Code', 'Diag.', 'Units', 'Rate', 'Amount'].map((h, i) => (
                    <th key={i} className={`text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] pb-2 ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <td className="py-3 text-[13px] text-[var(--ink-soft)]">{dateFormatted}</td>
                  <td className="py-3 text-[13px] text-[var(--ink-soft)] text-right max-w-[140px]">{selectedCode.fullDesc}</td>
                  <td className="py-3 text-right font-mono text-[11px] font-semibold text-[#0C447C]">{selectedCode.code}</td>
                  <td className="py-3 text-right text-[12px] text-[var(--ink-muted)]">{diagCode || '—'}</td>
                  <td className="py-3 text-right text-[13px] text-[var(--ink-soft)]">1</td>
                  <td className="py-3 text-right text-[13px] text-[var(--ink-soft)]">${rate.toFixed(2)}</td>
                  <td className="py-3 text-right text-[13px] font-medium text-[var(--ink)]">${rate.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-5">
              <div className="w-[240px]">
                <div className="flex justify-between py-1.5 text-[13px] border-b border-[rgba(0,0,0,0.07)]">
                  <span className="text-[var(--ink-muted)]">Subtotal</span>
                  <span className="text-[var(--ink-soft)]">${rate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-[13px] border-b border-[rgba(0,0,0,0.07)]">
                  <span className="text-[var(--ink-muted)]">HST (exempt — psychotherapy)</span>
                  <span className="text-[var(--ink-soft)]">$0.00</span>
                </div>
                <div className="flex justify-between py-2.5 text-[15px] font-medium text-[var(--ink)] border-t-2 border-[var(--ink)] mt-1">
                  <span>Total (CAD)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[rgba(0,0,0,0.07)] text-[11px] text-[var(--ink-muted)] leading-[1.6]">
              This receipt is issued for extended health benefit claim purposes. Services provided by a Registered Psychotherapist (RP) are eligible for reimbursement under most Canadian extended health benefit plans. Please retain this receipt and submit it to your insurer for reimbursement. HST-exempt per the Excise Tax Act (Ontario psychotherapy services).
            </div>
          </div>

          {/* Watermark */}
          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-[rgba(0,0,0,0.07)] bg-[var(--warm)] text-[11px] text-[var(--ink-muted)]">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-2 [stroke-linecap:round]">
              <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
            </svg>
            Generated by MentalPath · PHIPA-compliant · Canadian servers
          </div>
        </div>
      </div>
    </div>
  );
}
