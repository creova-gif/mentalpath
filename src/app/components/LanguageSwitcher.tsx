import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string>(
    i18n.language.startsWith('fr') ? 'fr' : 'en'
  );

  useEffect(() => {
    const handler = (lng: string) => {
      setCurrentLang(lng.startsWith('fr') ? 'fr' : 'en');
    };
    i18n.on('languageChanged', handler);
    return () => { i18n.off('languageChanged', handler); };
  }, [i18n]);

  const toggleLanguage = async () => {
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    localStorage.setItem('mentalpath_language', newLang);
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  const isFrench = currentLang === 'fr';

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: 600,
        color: 'rgba(245,240,232,0.75)',
        background: 'rgba(245,240,232,0.08)',
        border: '1px solid rgba(245,240,232,0.15)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        letterSpacing: '0.05em',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = '#f5f0e8';
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,240,232,0.14)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(245,240,232,0.75)';
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,240,232,0.08)';
      }}
      aria-label={isFrench ? 'Switch to English' : 'Passer en français'}
    >
      <Globe style={{ width: 14, height: 14 }} />
      <span>{isFrench ? 'EN' : 'FR'}</span>
    </button>
  );
}
