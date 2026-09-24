import { useEffect, useMemo, useState } from 'react';
import { listAuditLog, type AuditEntry } from '../../services/practice';

type Tab = 'audit' | 'controls' | 'breach';

const ACTION_LABELS: Record<string, string> = {
  INSERT: 'Created',
  UPDATE: 'Edited',
  DELETE: 'Deleted',
  NOTE_ACCESSED: 'Note opened',
  NOTE_LOCKED: 'Note locked',
  AI_ASSIST_USED: 'AI Assist used',
  DATA_EXPORTED: 'Data exported',
  ACCOUNT_CLOSED: 'Account closed',
  BILLING_UPDATED: 'Billing updated',
  BILLING_PAYMENT_SUCCEEDED: 'Payment succeeded',
  BILLING_PAYMENT_FAILED: 'Payment failed',
};

const TABLE_LABELS: Record<string, string> = {
  clients: 'Client record',
  session_notes: 'Session note',
  session_note_amendments: 'Note amendment',
  invoices: 'Invoice',
  appointments: 'Appointment',
  intake_forms: 'Intake form',
  clinicians: 'Account',
};

// Controls actually implemented in this codebase (see docs/audits and docs/adr).
const CONTROLS = [
  { title: 'Canadian data residency', body: 'Your records are stored in Supabase (AWS ca-central-1, Montréal). AI Assist, when you turn it on, sends note text to Anthropic in the United States.' },
  { title: 'Two-factor authentication required', body: 'Client records can only be read or changed from a session that has passed a TOTP challenge. This is enforced by the database, not just the app.' },
  { title: 'Only you can see your records', body: 'Row-level security scopes every client, note, invoice and appointment to your account. MentalPath staff access requires service credentials and is not part of normal operation.' },
  { title: 'Locked notes are permanent', body: 'Once locked, a note cannot be edited or deleted — corrections are added as dated amendments, as College record-keeping standards expect.' },
  { title: 'Every change and note view is logged', body: 'The audit log below is written by the database itself. You cannot edit or delete it, and neither can the app.' },
  { title: 'Automatic sign-out', body: 'You are signed out after 15 minutes of inactivity. Note drafts are never stored in your browser.' },
  { title: 'Encryption', body: 'Data is encrypted in transit (TLS) and at rest by the hosting provider. Application-level encryption with managed keys is planned (ADR 0001).' },
];

export function Compliance() {
  const [tab, setTab] = useState<Tab>('audit');
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (tab === 'audit' && entries === null) listAuditLog(500).then(setEntries).catch(() => { setError(true); setEntries([]); });
  }, [tab, entries]);

  const filtered = useMemo(
    () => (entries ?? []).filter(e => filter === 'all' || e.action === filter),
    [entries, filter],
  );
  const actions = useMemo(() => Array.from(new Set((entries ?? []).map(e => e.action))).sort(), [entries]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'audit', label: 'Audit log' },
    { id: 'controls', label: 'How your data is protected' },
    { id: 'breach', label: 'If a privacy breach happens' },
  ];

  return (
    <>
      <div role="tablist" aria-label="Privacy and compliance" className="flex gap-1 mb-5 border-b border-[var(--border)]">
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 text-[13px] border-none bg-transparent cursor-pointer -mb-px border-b-2 ${tab === t.id ? 'border-[var(--sage)] text-[var(--sage-deep)] font-medium' : 'border-transparent text-[var(--ink-soft)]'}`}
            style={{ borderBottomStyle: 'solid' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'audit' && (
        <section role="tabpanel" aria-label="Audit log">
          <div className="flex items-center justify-between mb-3 gap-3">
            <p className="text-xs text-[var(--ink-muted)]">Most recent 500 events. Record contents are never stored in the log — only what happened, when, and which fields changed.</p>
            <label className="text-xs flex items-center gap-2">Show
              <select value={filter} onChange={e => setFilter(e.target.value)} className="px-2 py-1 rounded-md border border-[var(--border)] text-xs">
                <option value="all">All events</option>
                {actions.map(a => <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>)}
              </select>
            </label>
          </div>
          {error && <p role="alert" className="text-sm text-[var(--red)] mb-3">Couldn't load the audit log.</p>}
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-x-auto">
            <table className="w-full text-[13px]">
              <caption className="sr-only">Audit log events</caption>
              <thead>
                <tr className="text-left text-xs text-[var(--ink-muted)] border-b border-[var(--border)]">
                  <th scope="col" className="px-4 py-2.5 font-medium">When</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Event</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Record</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Details</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {entries === null && <tr><td colSpan={5} className="px-4 py-5 text-[var(--ink-muted)]">Loading…</td></tr>}
                {entries !== null && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-5 text-[var(--ink-muted)]">No events.</td></tr>}
                {filtered.map(e => {
                  const changed = (e.details?.changed_columns as string[] | undefined)?.join(', ');
                  return (
                    <tr key={e.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(e.createdAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="px-4 py-2">{ACTION_LABELS[e.action] ?? e.action}</td>
                      <td className="px-4 py-2">{TABLE_LABELS[e.tableName] ?? e.tableName}</td>
                      <td className="px-4 py-2 text-[var(--ink-muted)]">{changed ? `Fields: ${changed}` : ''}</td>
                      <td className="px-4 py-2 text-[var(--ink-muted)]">{e.ipAddress || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'controls' && (
        <section role="tabpanel" aria-label="Controls" className="grid gap-3 md:grid-cols-2">
          {CONTROLS.map(c => (
            <div key={c.title} className="bg-white border border-[var(--border)] rounded-xl p-4">
              <h2 className="text-sm font-medium mb-1">{c.title}</h2>
              <p className="text-[13px] text-[var(--ink-soft)]">{c.body}</p>
            </div>
          ))}
          <p className="md:col-span-2 text-xs text-[var(--ink-muted)]">
            You remain the health information custodian for your clients' records. MentalPath acts as your agent/service provider and does not certify your compliance with PHIPA, PIPEDA or your College's standards.
          </p>
        </section>
      )}

      {tab === 'breach' && (
        <section role="tabpanel" aria-label="Privacy breach" className="bg-white border border-[var(--border)] rounded-xl p-5 text-[13px] text-[var(--ink-soft)] space-y-3 max-w-3xl">
          <h2 className="text-sm font-medium text-[var(--ink)]">If you suspect a privacy breach</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Contain it.</strong> Change your password, sign out other sessions (Settings → Security), and remove any shared access.</li>
            <li><strong>Tell us</strong> at privacy@mentalpath.ca if it may involve MentalPath systems. We will notify you without delay if we detect a breach affecting your records.</li>
            <li><strong>Assess and notify.</strong> As custodian, Ontario's PHIPA (s. 12) requires you to notify affected individuals at the first reasonable opportunity and, in prescribed cases, the Information and Privacy Commissioner of Ontario. Other provinces and PIPEDA have their own rules.</li>
            <li><strong>Record it.</strong> Keep a record of what happened, who was affected and the steps you took. Your College may also need to be informed.</li>
          </ol>
          <p className="text-xs text-[var(--ink-muted)]">This is general information, not legal advice. Check the current requirements with your College or the IPC.</p>
        </section>
      )}
    </>
  );
}
