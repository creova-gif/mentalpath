import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Lock, ArrowRight } from 'lucide-react';

type Client = {
  initials: string;
  name: string;
  since: string;
  status: 'active' | 'waitlist' | 'inactive';
  nextSession: string;
  sessions: string;
  tags: string[];
  rate: string;
  color: string;
};

export function ClientDetailPanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'billing'>('info');
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[90]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-[var(--surface)] z-[100] border-l border-[var(--border)] shadow-[-4px_0_30px_rgba(0,0,0,0.1)] overflow-y-auto flex flex-col animate-[slideIn_0.25s_ease]">
        <div className="px-5 py-5 border-b border-[var(--border)] bg-[var(--warm)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-[var(--font-display)] text-[22px] text-[var(--ink)]">{client.name}</div>
              <div className="text-[13px] text-[var(--ink-muted)] mt-1">{client.since}</div>
            </div>
            <button
              onClick={onClose}
              className="bg-none border-none text-xl cursor-pointer text-[var(--ink-muted)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-0">
            <Tab active={activeTab === 'info'} onClick={() => setActiveTab('info')}>Info</Tab>
            <Tab active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>Notes</Tab>
            <Tab active={activeTab === 'billing'} onClick={() => setActiveTab('billing')}>Billing</Tab>
          </div>
        </div>

        <div className="px-5 py-5 flex-1">
          {activeTab === 'info' && (
            <>
              <Section label="Contact information">
                <InfoRow label="Email" value="amara.m@example.com" />
                <InfoRow label="Phone" value="+1 (416) 555-0123" />
                <InfoRow label="Pronouns" value="She/Her" />
                <InfoRow label="Date of birth" value="July 14, 1992" />
              </Section>

              <Section label="Session details">
                <InfoRow label="Session type" value="Individual therapy" />
                <InfoRow label="Rate" value={client.rate} />
                <InfoRow label="Next session" value={client.nextSession} />
                <InfoRow label="Total sessions" value={client.sessions} />
              </Section>

              <Section label="Cultural context">
                <div className="flex flex-wrap gap-1.5">
                  {client.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block text-[11px] px-2 py-1 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Section>

              <Section label="Intake information">
                <InfoRow label="Referral source" value="TAIBU Community Health Centre" />
                <InfoRow label="Intake template" value="Newcomer trauma-informed" />
                <InfoRow label="Consent signed" value="Jan 15, 2024" />
              </Section>

              <Section label="Emergency contact">
                <InfoRow label="Name" value="Sarah Mensah" />
                <InfoRow label="Relationship" value="Sister" />
                <InfoRow label="Phone" value="+1 (416) 555-0198" />
              </Section>
            </>
          )}

          {activeTab === 'notes' && (
            <Section label="Session history">
              <SessionHistoryItem
                date="Mar 9, 2026 — Session 13"
                preview="Client discussed recent workplace stress and coping mechanisms. Continued work on boundary-setting strategies..."
                locked
              />
              <SessionHistoryItem
                date="Mar 2, 2026 — Session 12"
                preview="Explored family dynamics and cultural identity. Client reported feeling more confident in navigating dual cultural contexts..."
                locked
              />
              <SessionHistoryItem
                date="Feb 23, 2026 — Session 11"
                preview="Reviewed progress on anxiety management techniques. Client demonstrated improved self-awareness and emotional regulation..."
                locked
              />
              <SessionHistoryItem
                date="Feb 16, 2026 — Session 10"
                preview="Focus on self-compassion and reframing negative self-talk. Client completed homework assignment on values clarification..."
                locked
              />
            </Section>
          )}

          {activeTab === 'billing' && (
            <Section label="Invoice history">
              <BillingRow date="Mar 9, 2026" amount="$280.00" status="paid" />
              <BillingRow date="Feb 23, 2026" amount="$280.00" status="paid" />
              <BillingRow date="Feb 9, 2026" amount="$280.00" status="paid" />
              <BillingRow date="Jan 26, 2026" amount="$140.00" status="paid" />
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--ink-muted)]">Total collected</span>
                  <span className="font-medium text-[var(--ink)]">$980.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--ink-muted)]">Outstanding</span>
                  <span className="font-medium text-[var(--ink)]">$0.00</span>
                </div>
              </div>
            </Section>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--warm)]">
          <button
            onClick={() => { onClose(); navigate('/dashboard/clients'); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white border border-[var(--border)] text-[13px] font-medium text-[var(--ink)] hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] transition-all cursor-pointer"
          >
            View full profile
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-center px-2 py-2 text-[13px] font-medium cursor-pointer border-b-2 transition-all duration-150 bg-none ${
        active ? 'text-[var(--sage)] border-[var(--sage)]' : 'text-[var(--ink-muted)] border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.6px] text-[var(--ink-muted)] mb-2.5">{label}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-[var(--border)] text-[13px] last:border-b-0">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="text-[var(--ink)] font-medium">{value}</span>
    </div>
  );
}

function SessionHistoryItem({ date, preview, locked }: { date: string; preview: string; locked?: boolean }) {
  return (
    <div className="py-2.5 border-b border-[var(--border)] text-[13px] last:border-b-0">
      <div className="font-medium text-[var(--ink)] mb-[3px]">{date}</div>
      <div className="text-[var(--ink-muted)] text-xs leading-[1.5]">{preview}</div>
      {locked && (
        <div className="inline-flex items-center gap-1 text-[11px] text-[var(--sage)] mt-1">
          <Lock className="w-3 h-3" />
          Locked
        </div>
      )}
    </div>
  );
}

function BillingRow({ date, amount, status }: { date: string; amount: string; status: 'paid' | 'pending' }) {
  return (
    <div className="py-2.5 border-b border-[var(--border)] flex justify-between items-center last:border-b-0">
      <div>
        <div className="text-[13px] text-[var(--ink)]">{date}</div>
        <span
          className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded mt-1 ${
            status === 'paid' ? 'bg-[#e8f4f0] text-[var(--sage-deep)]' : 'bg-[#fef3e2] text-[#7a4a00]'
          }`}
        >
          {status === 'paid' ? 'Paid' : 'Pending'}
        </span>
      </div>
      <span className="font-medium text-[var(--ink)]">{amount}</span>
    </div>
  );
}
