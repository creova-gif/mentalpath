import { useEffect, useRef } from 'react';

// Shown before a clinician uses AI Note Assist for the first time. Accepting
// sets clinicians.ai_assist_enabled (timestamped server-side); it can be
// switched off again in Settings.
export function AiConsentDialog({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
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
        <h2 id="ai-consent-title" className="font-serif text-xl text-[var(--ink)]">Before you turn on AI Note Assist</h2>
        <p>When you use AI Assist, <strong>the text you've written in this note is sent to Anthropic</strong> (Claude), a service hosted in the United States, to generate a draft.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Client names, contact details, dates of birth and health numbers are <strong>not</strong> sent by MentalPath — but anything you type into the note text is. Don't type identifiers into note sections before using AI Assist.</li>
          <li>Phone numbers, email addresses and 9-digit numbers are automatically removed before sending.</li>
          <li>The draft is a suggestion. You're responsible for reviewing and editing it before locking the note.</li>
          <li>Each use is recorded in your audit log. You can turn AI Assist off at any time in Settings.</li>
        </ul>
        <p>Check whether your College or your clients' consent requires you to tell clients that you use AI-assisted documentation.</p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer">Not now</button>
          <button onClick={onAccept} className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)]">
            Turn on AI Assist
          </button>
        </div>
      </div>
    </dialog>
  );
}
