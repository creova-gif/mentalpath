import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Trans, useTranslation } from 'react-i18next';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const CONTACT_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d1a502d/contact`;
const SUBJECTS = ['general', 'sales', 'technical', 'billing', 'feature', 'privacy'] as const;

/** Sends to the contact Edge Function (stored in contact_messages, service role only). */
export function ContactForm({ initialName = '', initialEmail = '', defaultSubject = 'general' }: {
  initialName?: string; initialEmail?: string; defaultSubject?: (typeof SUBJECTS)[number];
}) {
  const { t } = useTranslation();
  const empty = { name: initialName, email: initialEmail, subject: defaultSubject as string, message: '' };
  const [formData, setFormData] = useState(empty);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
      setFormData(empty);
    } catch {
      toast.error(t('contact.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const input = 'w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--sage)]';
  const label = 'block text-sm font-medium text-[var(--ink)] mb-1.5';

  return (
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
  );
}
