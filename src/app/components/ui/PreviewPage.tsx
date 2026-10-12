import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';

// Wraps screens that are UI prototypes without a backend yet. They show
// sample data and save nothing; the banner says so plainly (audit §5).
export function PreviewPage({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <>
      <div role="note" className="mb-5 flex items-start gap-3 bg-[#FFF9E6] border border-[#FFE0B2] rounded-xl px-4 py-3 text-[13px] text-[#6b4d00]">
        <strong className="font-semibold whitespace-nowrap">{t('preview.label')}</strong>
        <span>
          <Trans i18nKey="preview.body" components={{ strong: <strong /> }} />
        </span>
      </div>
      {children}
    </>
  );
}

// Client-facing prototypes (portal, booking, intake) are disabled in production
// builds so clients never submit health information into a form that goes nowhere.
export function ClientFacingUnavailable() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--warm)] p-6">
      <div className="max-w-md bg-white border border-[var(--border)] rounded-2xl p-8 text-center space-y-3">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{t('preview.unavailableTitle')}</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          {t('preview.unavailableBody')}
        </p>
        <Link to="/" className="text-sm text-[var(--sage)] underline">{t('privacyPage.home')}</Link>
      </div>
    </main>
  );
}
