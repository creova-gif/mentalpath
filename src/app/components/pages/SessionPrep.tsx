import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { loadSessionPrep, type PrepCard } from '../../services/sessionPrep';
import { formatCad } from '../../services/practice';
import { INSTRUMENTS } from '@/app/lib/instruments';

const link = 'text-xs text-[var(--sage-deep)] underline';

export function SessionPrep() {
  const { t, i18n } = useTranslation();
  const [cards, setCards] = useState<PrepCard[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessionPrep().then(setCards).catch(err => { setError(err instanceof Error ? err.message : String(err)); setCards([]); });
  }, []);

  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-CA';
  const when = (iso: string) => new Date(iso).toLocaleString(locale, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <main className="p-6 space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{t('sessionPrep.title')}</h1>
        <p className="text-[13px] text-[var(--ink-soft)] mt-1">{t('sessionPrep.intro')}</p>
      </div>
      {error && <p role="alert" className="text-[13px] text-red-800">{error}</p>}
      {cards === null && <p role="status" className="text-[13px] text-[var(--ink-muted)]">{t('sessionPrep.loading')}</p>}
      {cards?.length === 0 && !error && (
        <p className="text-[13px] text-[var(--ink-muted)]">
          {t('sessionPrep.empty')} <Link to="/dashboard/calendar" className={link}>{t('sessionPrep.openCalendar')}</Link>
        </p>
      )}
      <ul className="space-y-3">
        {cards?.map(c => (
          <li key={c.appointment.id} className="bg-white border border-[var(--border)] rounded-xl p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h2 className="text-sm font-medium">
                <Link to={`/dashboard/clients/${c.appointment.clientId}`} className="text-[var(--ink)] no-underline hover:underline">{c.appointment.clientName}</Link>
                <span className="ml-2 text-xs font-normal text-[var(--ink-muted)]">{when(c.appointment.scheduledAt)} · {c.appointment.sessionType}</span>
              </h2>
              <span className="text-xs text-[var(--ink-muted)]">{t('sessionPrep.sessionNumber', { n: c.sessionNumber })}</span>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{t('sessionPrep.lastSession')}</dt>
                <dd>{c.lastSession
                  ? <>{c.lastSession.sessionDate} · <Link to={`/session-note-editor?noteId=${c.lastSession.id}`} className={link}>{t('sessionPrep.openNote')}</Link></>
                  : t('sessionPrep.firstSession')}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{t('sessionPrep.unsigned')}</dt>
                <dd className={c.unsignedNotes > 0 ? 'text-amber-800' : ''}>{c.unsignedNotes}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{t('sessionPrep.measures')}</dt>
                <dd>
                  {c.latest.length === 0 ? (
                    <Link to={`/dashboard/outcome-measures?clientId=${c.appointment.clientId}`} className={link}>{t('sessionPrep.recordMeasure')}</Link>
                  ) : c.latest.map(({ measure, change, delta }) => (
                    <div key={measure.id}>
                      {measure.instrument} {measure.total}/{INSTRUMENTS[measure.instrument].max} ({t(`outcomes.severity.${measure.severity}`)}, {measure.administeredOn})
                      {change && <span className="text-xs text-[var(--ink-muted)]"> · {delta! > 0 ? '+' : ''}{delta} {t(`outcomes.changeLabel.${change}`)}</span>}
                      {measure.riskFlag && <span className="ml-1 text-xs text-red-800">· {t('outcomes.item9')}</span>}
                    </div>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{t('sessionPrep.outstanding')}</dt>
                <dd>{c.outstanding.count === 0 ? t('sessionPrep.nothingOwing') : t('sessionPrep.owing', { count: c.outstanding.count, amount: formatCad(c.outstanding.amount) })}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <Link to={`/session-note-editor?clientId=${c.appointment.clientId}`}
                className="inline-block px-3.5 py-[7px] rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium no-underline">
                {t('sessionPrep.startNote')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
