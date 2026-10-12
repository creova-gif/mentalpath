import { useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

// Shown before a clinician uses AI Note Assist for the first time. Accepting
// sets clinicians.ai_assist_enabled (timestamped server-side); it can be
// switched off again in Settings.
export function AiConsentDialog({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={e => { e.preventDefault(); onCancel(); }}
      aria-labelledby="ai-consent-title"
      className="rounded-2xl border border-[var(--border)] p-0 max-w-lg w-[calc(100%-32px)] backdrop:bg-black/40"
    >
      <div className="p-6 space-y-3 text-sm text-[var(--ink-soft)]">
        <h2 id="ai-consent-title" className="font-serif text-xl text-[var(--ink)]">{t('aiConsent.title')}</h2>
        <p><Trans i18nKey="aiConsent.intro" components={{ strong: <strong /> }} /></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><Trans i18nKey="aiConsent.identifiers" components={{ strong: <strong /> }} /></li>
          <li>{t('aiConsent.scrubbed')}</li>
          <li>{t('aiConsent.review')}</li>
          <li>{t('aiConsent.audit')}</li>
        </ul>
        <p>{t('aiConsent.college')}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer">{t('aiConsent.notNow')}</button>
          <button onClick={onAccept} className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)]">
            {t('aiConsent.turnOn')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
