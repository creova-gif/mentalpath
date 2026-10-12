import { Link } from 'react-router';
import { Mail, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ContactForm } from '../support/ContactForm';

export function Contact() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[var(--warm)]">
      <header className="bg-[var(--sage-deep)] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-[var(--font-display)] text-4xl md:text-5xl mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-white/90">{t('contact.subtitle')}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-5">
            <a href="mailto:support@mentalpath.ca" className="flex items-start gap-3 text-[var(--ink-soft)] no-underline hover:text-[var(--sage-deep)]">
              <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-sm font-medium text-[var(--ink)]">{t('contact.support')}</span>
                <span className="text-sm">support@mentalpath.ca</span>
              </span>
            </a>
            <a href="mailto:privacy@mentalpath.ca" className="flex items-start gap-3 text-[var(--ink-soft)] no-underline hover:text-[var(--sage-deep)]">
              <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-sm font-medium text-[var(--ink)]">{t('contact.privacy')}</span>
                <span className="text-sm">privacy@mentalpath.ca</span>
              </span>
            </a>
            <p className="text-xs text-[var(--ink-muted)]">{t('contact.replyBy')}</p>
          </div>
          <Link to="/faq" className="block bg-white rounded-xl border border-[var(--border)] p-4 text-center no-underline hover:bg-[var(--sage-pale)]">
            <span className="block text-sm text-[var(--ink-soft)] mb-1">{t('contact.quickAnswers')}</span>
            <span className="text-[var(--sage-deep)] font-medium">{t('contact.browseFaq')} →</span>
          </Link>
        </aside>

        <section className="lg:col-span-2 bg-white rounded-xl border border-[var(--border)] p-8" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="font-[var(--font-display)] text-2xl text-[var(--ink)] mb-2">{t('contact.formTitle')}</h2>
          <p className="text-xs text-[var(--ink-muted)] mb-6">{t('contact.noPhi')}</p>
          <ContactForm />
        </section>
      </main>

      <div className="pb-12 text-center">
        <Link to="/" className="text-[var(--sage-deep)] underline">← {t('contact.home')}</Link>
      </div>
    </div>
  );
}
