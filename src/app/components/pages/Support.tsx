import { Link } from 'react-router';
import { Mail, Shield, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { ContactForm } from '../support/ContactForm';

export function Support() {
  const { t } = useTranslation();
  const { user } = useUser();
  const card = 'flex items-start gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 no-underline text-[var(--ink-soft)] hover:bg-[var(--warm)]';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--ink)] mb-2">{t('supportPage.title')}</h1>
        <p className="text-[var(--ink-muted)] text-sm">{t('contact.replyBy')}</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <a href="mailto:support@mentalpath.ca" className={card}>
            <Mail className="w-5 h-5 mt-0.5 text-[var(--sage)]" aria-hidden="true" />
            <span><span className="block font-medium text-[var(--ink)]">{t('contact.support')}</span><span className="text-sm">support@mentalpath.ca</span></span>
          </a>
          <a href="mailto:privacy@mentalpath.ca" className={card}>
            <Shield className="w-5 h-5 mt-0.5 text-[var(--sage)]" aria-hidden="true" />
            <span><span className="block font-medium text-[var(--ink)]">{t('contact.privacy')}</span><span className="text-sm">privacy@mentalpath.ca</span></span>
          </a>
          <Link to="/dashboard/faq" className={card}>
            <HelpCircle className="w-5 h-5 mt-0.5 text-[var(--sage)]" aria-hidden="true" />
            <span><span className="block font-medium text-[var(--ink)]">{t('contact.browseFaq')}</span><span className="text-sm">{t('contact.quickAnswers')}</span></span>
          </Link>
        </div>
        <section className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6" aria-labelledby="support-form-title">
          <h2 id="support-form-title" className="text-lg font-serif text-[var(--ink)] mb-1">{t('contact.formTitle')}</h2>
          <p className="text-xs text-[var(--ink-muted)] mb-5">{t('contact.noPhi')}</p>
          <ContactForm initialName={user?.name ?? ''} initialEmail={user?.email ?? ''} defaultSubject="technical" />
        </section>
      </div>
    </div>
  );
}
