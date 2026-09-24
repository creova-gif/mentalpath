import type { ReactNode } from 'react';
import { Link } from 'react-router';

// Wraps screens that are UI prototypes without a backend yet. They show
// sample data and save nothing; the banner says so plainly (audit §5).
export function PreviewPage({ children }: { children: ReactNode }) {
  return (
    <>
      <div role="note" className="mb-5 flex items-start gap-3 bg-[#FFF9E6] border border-[#FFE0B2] rounded-xl px-4 py-3 text-[13px] text-[#6b4d00]">
        <strong className="font-semibold whitespace-nowrap">Preview</strong>
        <span>
          This feature is in development. It shows <strong>sample data</strong>, isn't connected to your records, and
          <strong> nothing you enter here is saved</strong>. Don't enter client information on this screen.
        </span>
      </div>
      {children}
    </>
  );
}

// Client-facing prototypes (portal, booking, intake) are disabled in production
// builds so clients never submit health information into a form that goes nowhere.
export function ClientFacingUnavailable() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--warm)] p-6">
      <div className="max-w-md bg-white border border-[var(--border)] rounded-2xl p-8 text-center space-y-3">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>Not available yet</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          Online booking and the client portal are coming soon. Please contact your practitioner directly to book or share information.
        </p>
        <Link to="/" className="text-sm text-[var(--sage)] underline">MentalPath home</Link>
      </div>
    </main>
  );
}
