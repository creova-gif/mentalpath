import { track } from '@/app/lib/telemetry';
import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useUser } from '@/app/context/UserContext';
import { fireSuccessConfetti } from '../ui/SuccessAnimation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { startCheckout } from '../../services/billing';

// Stored values stay in English (they are identifiers); labels are translated.
const intakeTemplates = [
  'Standard intake',
  'Newcomer trauma-informed',
  'Racialized stress & identity',
  'LGBTQ2S+ affirming',
  'Couples therapy',
  'Family systems',
  'Grief & loss',
];
const PRONOUNS = ['They/Them', 'She/Her', 'He/Him', 'Other'];
const SESSION_TYPES = ['Individual', 'Couples', 'Family', 'Group'];

export interface NewClientPrefill {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function NewClientModal({ onClose, onClientAdded, initial }: { onClose: () => void, onClientAdded?: () => void, initial?: NewClientPrefill }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: initial?.firstName ?? '',
    lastName: initial?.lastName ?? '',
    email: initial?.email ?? '',
    phone: '',
    dob: '',
    pronouns: 'They/Them',
    sessionType: 'Individual',
    rate: '',
    slidingScale: false,
    intakeTemplate: 'Standard intake',
    culturalTags: '',
    referralSource: '',
    intakeNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.firstName || !formData.lastName) {
      toast.error(t('newClient.namesRequired'));
      return;
    }

    setIsSubmitting(true);
    
    const tagsArray = formData.culturalTags.split(',').map(tag => tag.trim()).filter(Boolean);

    // Check if this is the first client before inserting
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('clinician_id', user.id);

    const isFirstClient = count === 0;

    const { error } = await supabase.from('clients').insert([{
      clinician_id: user.id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email || null,
      phone: formData.phone || null,
      date_of_birth: formData.dob || null,
      pronouns: formData.pronouns,
      session_type: formData.sessionType,
      rate: formData.rate ? parseFloat(formData.rate) : null,
      is_sliding_scale: formData.slidingScale,
      intake_template: formData.intakeTemplate,
      cultural_tags: tagsArray,
      referral_source: formData.referralSource || null,
      notes: formData.intakeNotes || null,
      status: 'active'
    }]);

    setIsSubmitting(false);

    if (error) {
      setIsSubmitting(false);
      if (error.hint === 'PLAN_LIMIT') {
        toast.error(error.message, {
          action: { label: t('newClient.upgrade'), onClick: () => { startCheckout().catch(e => toast.error(e.message)); } },
        });
      } else {
        toast.error(t('newClient.failed'));
      }
      return;
    }

    track('client_created', { is_first_client: isFirstClient });
    if (isFirstClient) {
      fireSuccessConfetti();
    }

    if (onClientAdded) onClientAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5" onClick={onClose}>
      <div
        className="bg-[var(--surface)] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.2)] w-full max-w-[700px] max-h-[90vh] overflow-y-auto animate-[fadeUp_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 pb-4 border-b border-[var(--border)] flex justify-between items-start">
          <div>
            <div className="font-[var(--font-display)] text-xl text-[var(--ink)]">{t('newClient.title')}</div>
            <div className="text-[13px] text-[var(--ink-muted)] mt-1">
              {t('newClient.subtitle')}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('newClient.close')}
            className="bg-none border-none text-xl cursor-pointer text-[var(--ink-muted)] px-2 py-1 rounded-md transition-all duration-150 hover:bg-[var(--warm)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-first" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.firstName')} *</label>
              <input
                type="text"
                id="client-first"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('newClient.firstName')}
                required
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-last" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.lastName')} *</label>
              <input
                type="text"
                id="client-last"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('newClient.lastName')}
                required
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-email" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.email')}</label>
              <input
                id="client-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="client@example.com"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-phone" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.phone')}</label>
              <input
                id="client-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-dob" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.dob')}</label>
              <input
                id="client-dob"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-pronouns" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.pronouns')}</label>
              <select 
                id="client-pronouns" 
                name="pronouns"
                value={formData.pronouns}
                onChange={handleChange}
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              >
                {PRONOUNS.map(p => <option key={p} value={p}>{t(`newClient.pronounOptions.${p}`)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-session-type" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.sessionType')}</label>
              <select 
                id="client-session-type" 
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              >
                {SESSION_TYPES.map(s => <option key={s} value={s}>{t(`calendar.types.${s.toLowerCase()}`)}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-rate" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.rate')}</label>
              <input
                id="client-rate"
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="140"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
              <div className="text-[11px] text-[var(--ink-muted)]">{t('newClient.rateHelp', { rate: user?.sessionRate || 140 })}</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <span className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.sliding')}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="slidingScale"
                checked={formData.slidingScale}
                onChange={handleChange}
                className="w-4 h-4 cursor-pointer" 
              />
              <span className="text-sm text-[var(--ink-soft)]">{t('newClient.slidingHelp')}</span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="intake-template" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.template')}</label>
            <select
              id="intake-template"
              name="intakeTemplate"
              value={formData.intakeTemplate}
              onChange={handleChange}
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
            >
              {intakeTemplates.map((template) => (
                <option key={template} value={template}>{t(`newClient.templates.${template}`)}</option>
              ))}
            </select>
            <div className="text-[11px] text-[var(--ink-muted)]">
              {t('newClient.templateHelp')}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="client-tags" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.tags')}</label>
            <input
              type="text"
              id="client-tags"
              name="culturalTags"
              value={formData.culturalTags}
              onChange={handleChange}
              placeholder={t('newClient.tagsPlaceholder')}
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
            />
            <div className="text-[11px] text-[var(--ink-muted)]">{t('newClient.tagsHelp')}</div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="client-referral" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.referral')}</label>
            <input
              type="text"
              id="client-referral"
              name="referralSource"
              value={formData.referralSource}
              onChange={handleChange}
              placeholder={t('newClient.referralPlaceholder')}
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <label htmlFor="client-notes" className="text-[13px] font-medium text-[var(--ink-soft)]">{t('newClient.notes')}</label>
            <textarea
              id="client-notes"
              name="intakeNotes"
              value={formData.intakeNotes}
              onChange={handleChange}
              placeholder={t('newClient.notesPlaceholder')}
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)] resize-vertical min-h-[100px] leading-[1.6]"
            />
          </div>

          <div className="px-6 py-4 mt-6 -mx-6 -mb-6 border-t border-[var(--border)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-[9px] text-sm font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--warm)] disabled:opacity-50"
            >
              {t('newClient.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-[9px] text-sm font-medium cursor-pointer transition-all duration-150 bg-[var(--sage)] text-white border-none hover:bg-[var(--sage-deep)] disabled:opacity-50"
            >
              {isSubmitting ? t('newClient.adding') : t('newClient.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
