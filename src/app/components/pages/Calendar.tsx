import { useTranslation } from 'react-i18next';

export function Calendar() {
  const { t } = useTranslation();

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-[60px] text-center">
      <div className="font-[var(--font-display)] text-[22px] text-[var(--ink)] mb-2">{t('calendar.title')}</div>
      <div className="text-sm text-[var(--ink-muted)]">
        {t('calendar.comingSoon')}
      </div>
    </div>
  );
}
