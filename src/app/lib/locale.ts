import i18n from '@/i18n/config';

/** BCP-47 locale for dates and numbers, following the UI language. */
export function uiLocale(): 'fr-CA' | 'en-CA' {
  return i18n.language?.startsWith('fr') ? 'fr-CA' : 'en-CA';
}

export function formatDate(value: string | Date, style: 'medium' | 'long' = 'medium'): string {
  const d = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return d.toLocaleDateString(uiLocale(), { dateStyle: style });
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString(uiLocale(), { dateStyle: 'medium', timeStyle: 'short' });
}
