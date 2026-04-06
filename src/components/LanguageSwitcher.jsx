import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        type="button"
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="lang-divider" aria-hidden="true" />
      <button
        className={`lang-btn ${language === 'ar' ? 'active' : ''}`}
        onClick={() => setLanguage('ar')}
        type="button"
        aria-label="التبديل إلى العربية"
      >
        عر
      </button>
    </div>
  );
}
