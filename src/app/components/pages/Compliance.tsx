import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { listAuditLog, type AuditEntry } from '../../services/practice';
import { formatDateTime } from '@/app/lib/locale';

type Tab = 'audit' | 'controls' | 'breach';

// Controls actually implemented in this codebase (see docs/audits and docs/adr).
const CONTROL_KEYS = ['residency', 'mfa', 'isolation', 'locked', 'audit', 'signout', 'encryption', 'retention'] as const;

export function Compliance() {
  const { t } = useTranslation();
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
  const actionLabel = (a: string) => t(`compliance.actions.${a}`, { defaultValue: a });
  const tableLabel = (name: string) => t(`compliance.tables.${name}`, { defaultValue: name });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'audit', label: t('compliance.tabs.audit') },
    { id: 'controls', label: t('compliance.tabs.controls') },
    { id: 'breach', label: t('compliance.tabs.breach') },
  ];

  return (
    <>
      <div role="tablist" aria-label={t('compliance.tablist')} className="flex gap-1 mb-5 border-b border-[var(--border)]">
        {tabs.map(tb => (
          <button key={tb.id} role="tab" aria-selected={tab === tb.id} onClick={() => setTab(tb.id)}
            className={`px-3.5 py-2 text-[13px] border-none bg-transparent cursor-pointer -mb-px border-b-2 ${tab === tb.id ? 'border-[var(--sage)] text-[var(--sage-deep)] font-medium' : 'border-transparent text-[var(--ink-soft)]'}`}
            style={{ borderBottomStyle: 'solid' }}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'audit' && (
        <section role="tabpanel" aria-label={t('compliance.tabs.audit')}>
          <div className="flex items-center justify-between mb-3 gap-3">
            <p className="text-xs text-[var(--ink-muted)]">{t('compliance.auditIntro')}</p>
            <label className="text-xs flex items-center gap-2">{t('compliance.show')}
              <select value={filter} onChange={e => setFilter(e.target.value)} className="px-2 py-1 rounded-md border border-[var(--border)] text-xs">
                <option value="all">{t('compliance.allEvents')}</option>
                {actions.map(a => <option key={a} value={a}>{actionLabel(a)}</option>)}
              </select>
            </label>
          </div>
          {error && <p role="alert" className="text-sm text-[var(--red)] mb-3">{t('compliance.loadFailed')}</p>}
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-x-auto">
            <table className="w-full text-[13px]">
              <caption className="sr-only">{t('compliance.caption')}</caption>
              <thead>
                <tr className="text-left text-xs text-[var(--ink-muted)] border-b border-[var(--border)]">
                  <th scope="col" className="px-4 py-2.5 font-medium">{t('compliance.cols.when')}</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">{t('compliance.cols.event')}</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">{t('compliance.cols.record')}</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">{t('compliance.cols.details')}</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">{t('compliance.cols.ip')}</th>
                </tr>
              </thead>
              <tbody>
                {entries === null && <tr><td colSpan={5} className="px-4 py-5 text-[var(--ink-muted)]">{t('compliance.loading')}</td></tr>}
                {entries !== null && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-5 text-[var(--ink-muted)]">{t('compliance.noEvents')}</td></tr>}
                {filtered.map(e => {
                  const changed = (e.details?.changed_columns as string[] | undefined)?.join(', ');
                  return (
                    <tr key={e.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-2 whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                      <td className="px-4 py-2">{actionLabel(e.action)}</td>
                      <td className="px-4 py-2">{tableLabel(e.tableName)}</td>
                      <td className="px-4 py-2 text-[var(--ink-muted)]">{changed ? t('compliance.fields', { fields: changed }) : ''}</td>
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
        <section role="tabpanel" aria-label={t('compliance.tabs.controls')} className="grid gap-3 md:grid-cols-2">
          {CONTROL_KEYS.map(k => (
            <div key={k} className="bg-white border border-[var(--border)] rounded-xl p-4">
              <h2 className="text-sm font-medium mb-1">{t(`compliance.controls.${k}.title`)}</h2>
              <p className="text-[13px] text-[var(--ink-soft)]">{t(`compliance.controls.${k}.body`)}</p>
            </div>
          ))}
          <p className="md:col-span-2 text-xs text-[var(--ink-muted)]">{t('compliance.custodian')}</p>
        </section>
      )}

      {tab === 'breach' && (
        <section role="tabpanel" aria-label={t('compliance.tabs.breach')} className="bg-white border border-[var(--border)] rounded-xl p-5 text-[13px] text-[var(--ink-soft)] space-y-3 max-w-3xl">
          <h2 className="text-sm font-medium text-[var(--ink)]">{t('compliance.breach.title')}</h2>
          <ol className="list-decimal pl-5 space-y-2">
            {(['contain', 'tell', 'assess', 'record'] as const).map(k => (
              <li key={k}><Trans i18nKey={`compliance.breach.${k}`} components={{ strong: <strong /> }} /></li>
            ))}
          </ol>
          <p className="text-xs text-[var(--ink-muted)]">{t('compliance.breach.disclaimer')}</p>
        </section>
      )}
    </>
  );
}
