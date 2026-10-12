import { Link } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';

// Plain-language summary of how MentalPath handles data today. It mirrors
// docs/privacy/privacy-impact-assessment.md; the full policy is pending legal review.
const SECTIONS = ['responsible', 'stored', 'protected', 'retention'] as const;

export function Privacy() {
  const { t } = useTranslation();
  const h2 = 'text-lg mt-8 mb-2 text-[var(--ink)]';
  const list = (key: string) => t(key, { returnObjects: true }) as string[];
  return (
    <main className="min-h-screen bg-[var(--warm)] px-6 py-12">
      <article className="max-w-3xl mx-auto bg-white border border-[var(--border)] rounded-2xl p-8 text-[15px] leading-relaxed text-[var(--ink-soft)]">
        <Link to="/" className="text-sm text-[var(--sage-deep)] underline">← {t('privacyPage.home')}</Link>
        <h1 className="text-3xl mt-4 mb-1 text-[var(--ink)]" style={{ fontFamily: 'var(--font-display)' }}>{t('privacyPage.title')}</h1>
        <p className="text-sm text-[var(--ink-muted)]">{t('privacyPage.updated')}</p>

        {SECTIONS.slice(0, 2).map(s => (
          <section key={s}>
            <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>{t(`privacyPage.${s}.title`)}</h2>
            <p>{t(`privacyPage.${s}.body`)}</p>
          </section>
        ))}

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>{t('privacyPage.leaves.title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><Trans i18nKey="privacyPage.leaves.ai" components={{ strong: <strong /> }} /></li>
          <li><Trans i18nKey="privacyPage.leaves.telemetry" components={{ strong: <strong /> }} /></li>
        </ul>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>{t('privacyPage.protected.title')}</h2>
        <ul className="list-disc pl-5 space-y-1">
          {list('privacyPage.protected.items').map(item => <li key={item}>{item}</li>)}
        </ul>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>{t('privacyPage.retention.title')}</h2>
        <p>{t('privacyPage.retention.body')}</p>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>{t('privacyPage.rights.title')}</h2>
        <p>
          <Trans i18nKey="privacyPage.rights.body"
            components={{ mail: <a className="text-[var(--sage-deep)] underline" href="mailto:privacy@mentalpath.ca" /> }} />
        </p>
      </article>
    </main>
  );
}
