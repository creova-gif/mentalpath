import { Link } from 'react-router';

// Plain-language summary of how MentalPath handles data today. It mirrors
// docs/privacy/privacy-impact-assessment.md; the full policy is pending legal review.
export function Privacy() {
  const h2 = 'text-lg mt-8 mb-2 text-[var(--ink)]';
  return (
    <main className="min-h-screen bg-[var(--warm)] px-6 py-12">
      <article className="max-w-3xl mx-auto bg-white border border-[var(--border)] rounded-2xl p-8 text-[15px] leading-relaxed text-[var(--ink-soft)]">
        <Link to="/" className="text-sm text-[var(--sage)] underline">← MentalPath home</Link>
        <h1 className="text-3xl mt-4 mb-1 text-[var(--ink)]" style={{ fontFamily: 'var(--font-display)' }}>How MentalPath handles your data</h1>
        <p className="text-sm text-[var(--ink-muted)]">Last updated September 24, 2026 · Summary pending legal review</p>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>Who is responsible</h2>
        <p>Clinicians who use MentalPath are the custodians of their clients' health information. MentalPath stores and processes that information on their behalf, only to provide the service.</p>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>Where data is stored</h2>
        <p>Client records, session notes, appointments and invoices are stored in Canada (Supabase on AWS, Montréal region). Card payments are handled by Stripe; MentalPath never sees full card numbers.</p>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>Data that can leave Canada</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>AI Note Assist</strong> is off by default. If a clinician turns it on, the note text they choose to draft from is sent to Anthropic in the United States. Phone numbers, emails, health card numbers, SINs, postal codes and dated birthdates are removed first.</li>
          <li><strong>Error monitoring and product analytics</strong>, when enabled, receive technical events only — never client information, note text or page contents.</li>
        </ul>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>How records are protected</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Each clinician can only access their own records, enforced by the database.</li>
          <li>Two-factor authentication is required to access client records.</li>
          <li>Locked notes can't be edited or deleted; corrections are added as dated amendments.</li>
          <li>Every change and every note view is recorded in an audit log the clinician can review.</li>
          <li>Data is encrypted in transit and at rest by our hosting provider.</li>
        </ul>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>Keeping and deleting records</h2>
        <p>Clinicians can download all of their data at any time. When an account is closed, sign-in is blocked immediately, and clinical records are kept for the retention period required by Ontario's regulatory Colleges (10 years after the last contact, or 10 years after the client turns 18, whichever is later) and are then destroyed automatically.</p>

        <h2 className={h2} style={{ fontFamily: 'var(--font-display)' }}>Your rights</h2>
        <p>If you are a client, contact your clinician to access or correct your records. Clinicians and anyone else can reach our privacy contact at <a className="text-[var(--sage)] underline" href="mailto:privacy@mentalpath.ca">privacy@mentalpath.ca</a>. You can also contact the Information and Privacy Commissioner of Ontario or the Office of the Privacy Commissioner of Canada.</p>
      </article>
    </main>
  );
}
