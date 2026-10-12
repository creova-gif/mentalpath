import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

function getSavedLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('mentalpath_language');
    return saved === 'fr' ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fr: { translation: frTranslations }
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })
  .catch((error) => {
    console.error('Failed to initialize i18n:', error);
  });

// Persist the choice and keep <html lang> in sync (screen readers and
// browser translation depend on it — WCAG 3.1.1).
function syncLanguage(lng: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = lng.startsWith('fr') ? 'fr-CA' : 'en-CA';
  try { localStorage.setItem('mentalpath_language', lng.startsWith('fr') ? 'fr' : 'en'); } catch { /* storage unavailable */ }
}
syncLanguage(i18n.language ?? getSavedLanguage());
i18n.on('languageChanged', syncLanguage);

export default i18n;
