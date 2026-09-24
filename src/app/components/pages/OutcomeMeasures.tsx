import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { listClientOptions, type ClientOption } from '../../services/sessionNotes';
import { deleteMeasure, listMeasures, recordMeasure, type OutcomeMeasure } from '../../services/outcomes';
import { INSTRUMENTS, describeChange, scoreInstrument, type Instrument } from '@/app/lib/instruments';

const card = 'bg-white border border-[var(--border)] rounded-xl p-5';
const today = () => new Date().toISOString().slice(0, 10);

export function OutcomeMeasures() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const clientId = params.get('clientId') ?? '';
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [history, setHistory] = useState<OutcomeMeasure[]>([]);
  const [instrument, setInstrument] = useState<Instrument>('PHQ-9');
  const [answers, setAnswers] = useState<(number | null)[]>(Array(9).fill(null));
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);

  useEffect(() => { listClientOptions().then(setClients).catch(() => setClients([])); }, []);
  useEffect(() => {
    if (!clientId) { setHistory([]); return; }
    listMeasures(clientId).then(setHistory).catch(err => toast.error(err.message));
  }, [clientId]);

  const def = INSTRUMENTS[instrument];
  const chooseInstrument = (i: Instrument) => { setInstrument(i); setAnswers(Array(INSTRUMENTS[i].items).fill(null)); };
  const complete = answers.every(a => a !== null);
  const preview = scoreInstrument(instrument, answers.map(a => a ?? 0));
  const items = t(`outcomes.${def.key}.items`, { returnObjects: true }) as string[];
  const options = t('outcomes.options', { returnObjects: true }) as string[];

  const save = async () => {
    if (!clientId || !complete) return;
    setBusy(true);
    try {
      const m = await recordMeasure({ clientId, instrument, administeredOn: date, itemScores: answers as number[] });
      setHistory(h => [m, ...h]);
      setAnswers(Array(def.items).fill(null));
      toast.success(t('outcomes.saved', { total: m.total, max: def.max, severity: t(`outcomes.severity.${m.severity}`) }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m: OutcomeMeasure) => {
    if (!window.confirm(t('outcomes.deleteConfirm'))) return;
    try {
      await deleteMeasure(m.id);
      setHistory(h => h.filter(x => x.id !== m.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  // Previous score of the same instrument, for the change column (history is newest first)
  const withChange = useMemo(() => history.map((m, i) => {
    const prev = history.slice(i + 1).find(x => x.instrument === m.instrument);
    return { m, change: describeChange(m.total, prev?.total), delta: prev ? m.total - prev.total : null };
  }), [history]);

  return (
    <main className="p-6 space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{t('outcomes.title')}</h1>
        <p className="text-[13px] text-[var(--ink-soft)] mt-1">{t('outcomes.intro')}</p>
      </div>

      <section className={`${card} flex flex-wrap gap-4 items-end`}>
        <label className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
          {t('outcomes.client')}
          <select className="px-3 py-2 rounded-lg border border-[var(--border)] text-[13px] bg-white min-w-56" value={clientId}
            onChange={e => setParams(e.target.value ? { clientId: e.target.value } : {})}>
            <option value="">{t('outcomes.chooseClient')}</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        {clientId && <Link to={`/dashboard/clients/${clientId}`} className="text-xs text-[var(--sage-deep)] underline">{t('outcomes.openProfile')}</Link>}
      </section>

      {clientId && (
        <section className={card} aria-labelledby="new-measure">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 id="new-measure" className="text-sm font-medium">{t('outcomes.record')}</h2>
            <div role="radiogroup" aria-label={t('outcomes.instrument')} className="flex gap-1">
              {(Object.keys(INSTRUMENTS) as Instrument[]).map(i => (
                <button key={i} role="radio" aria-checked={instrument === i} onClick={() => chooseInstrument(i)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer ${instrument === i ? 'bg-[var(--sage)] text-white border-[var(--sage)]' : 'bg-white border-[var(--border)]'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[13px] text-[var(--ink-soft)] mb-3">{t('outcomes.stem')}</p>
          <ol className="space-y-3">
            {items.map((text, idx) => (
              <li key={`${instrument}-${idx}`}>
                <fieldset>
                  <legend className="text-[13px] mb-1">{idx + 1}. {text}</legend>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {options.map((label, score) => (
                      <label key={score} className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name={`${instrument}-item-${idx}`} checked={answers[idx] === score}
                          onChange={() => setAnswers(a => a.map((v, j) => (j === idx ? score : v)))} />
                        {label} ({score})
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          {instrument === 'PHQ-9' && (answers[8] ?? 0) > 0 && (
            <p role="alert" className="mt-3 text-[13px] text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">{t('outcomes.riskWarning')}</p>
          )}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
              {t('outcomes.date')}
              <input type="date" className="px-3 py-2 rounded-lg border border-[var(--border)] text-[13px]" value={date} max={today()} onChange={e => setDate(e.target.value)} />
            </label>
            <span className="text-[13px]" aria-live="polite">
              {complete
                ? t('outcomes.preview', { total: preview.total, max: def.max, severity: t(`outcomes.severity.${preview.severity}`) })
                : t('outcomes.answered', { count: answers.filter(a => a !== null).length, total: def.items })}
            </span>
            <button onClick={save} disabled={!complete || busy}
              className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-60">
              {t('outcomes.save')}
            </button>
          </div>
        </section>
      )}

      {clientId && (
        <section className={card} aria-labelledby="history">
          <h2 id="history" className="text-sm font-medium mb-2">{t('outcomes.history')}</h2>
          {history.length === 0 ? <p className="text-[13px] text-[var(--ink-muted)]">{t('outcomes.empty')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-xs text-[var(--ink-muted)]">
                    <th className="py-2 font-normal">{t('outcomes.date')}</th>
                    <th className="py-2 font-normal">{t('outcomes.instrument')}</th>
                    <th className="py-2 font-normal">{t('outcomes.score')}</th>
                    <th className="py-2 font-normal">{t('outcomes.severityLabel')}</th>
                    <th className="py-2 font-normal">{t('outcomes.change')}</th>
                    <th className="py-2 font-normal"><span className="sr-only">{t('outcomes.actions')}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {withChange.map(({ m, change, delta }) => (
                    <tr key={m.id} className="border-t border-[var(--border)]">
                      <td className="py-2">{m.administeredOn}</td>
                      <td className="py-2">{m.instrument}</td>
                      <td className="py-2">{m.total}/{INSTRUMENTS[m.instrument].max}{m.riskFlag && <span className="ml-2 text-xs text-red-800">{t('outcomes.item9')}</span>}</td>
                      <td className="py-2">{t(`outcomes.severity.${m.severity}`)}</td>
                      <td className="py-2">{change ? `${delta! > 0 ? '+' : ''}${delta} · ${t(`outcomes.changeLabel.${change}`)}` : '—'}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => remove(m)} className="text-xs underline text-[var(--ink-muted)] bg-transparent border-none cursor-pointer">{t('outcomes.delete')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
