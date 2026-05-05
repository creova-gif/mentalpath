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

export default i18n;
