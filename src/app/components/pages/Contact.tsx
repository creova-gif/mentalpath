import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Trans, useTranslation } from 'react-i18next';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const CONTACT_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d1a502d/contact`;
const SUBJECTS = ['general', 'sales', 'technical', 'billing', 'feature', 'privacy'] as const;
const EMPTY = { name: '', email: '', subject: 'general', message: '' };

export function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Public endpoint: the anon key only satisfies the Functions gateway; it
      // grants no data access (contact_messages is service-role only).
      const response = await fetch(CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...formData, subject: t(`contact.subjects.${formData.subject}`), website: honeypot }),
      });
      if (!response.ok) throw new Error('send failed');
      toast.success(t('contact.sent'));
      setFormData(EMPTY);
    } catch {
      toast.error(t('contact.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const input = 'w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--sage)]';
  const label = 'block text-sm font-medium text-[var(--ink)] mb-1.5';

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
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={honeypot} onChange={e => setHoneypot(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className={label}>{t('contact.name')} *</label>
                <input id="contact-name" required maxLength={200} autoComplete="name" value={formData.name} onChange={set('name')} className={input} />
              </div>
              <div>
                <label htmlFor="contact-email" className={label}>{t('contact.email')} *</label>
                <input id="contact-email" type="email" required maxLength={320} autoComplete="email" value={formData.email} onChange={set('email')} className={input} />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className={label}>{t('contact.subject')}</label>
              <select id="contact-subject" value={formData.subject} onChange={set('subject')} className={input}>
                {SUBJECTS.map(s => <option key={s} value={s}>{t(`contact.subjects.${s}`)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className={label}>{t('contact.message')} *</label>
              <textarea id="contact-message" required minLength={5} maxLength={5000} rows={6} value={formData.message} onChange={set('message')}
                placeholder={t('contact.messagePlaceholder')} className={`${input} resize-y`} />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[var(--sage)] text-white px-6 py-3 rounded-lg font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60">
              {isSubmitting ? t('contact.sending') : t('contact.send')}
            </button>
            <p className="text-xs text-[var(--ink-muted)]">
              <Trans i18nKey="contact.consent" components={{ privacyLink: <Link to="/privacy" className="text-[var(--sage-deep)] underline" /> }} />
            </p>
          </form>
        </section>
      </main>

      <div className="pb-12 text-center">
        <Link to="/" className="text-[var(--sage-deep)] underline">← {t('contact.home')}</Link>
      </div>
    </div>
  );
}
