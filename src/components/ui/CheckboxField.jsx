import { useLanguage } from '../../i18n/LanguageContext';

export default function CheckboxField({ label, id, checked, onChange, description }) {
  const { isRTL } = useLanguage();

  return (
    <label htmlFor={id} className={`checkbox-field ${checked ? 'checked' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="checkbox-input"
      />
      <span className="checkbox-custom">
        {checked && (
          <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="checkbox-content">
        <span className="checkbox-label">{label}</span>
        {description && <span className="checkbox-desc">{description}</span>}
      </span>
    </label>
  );
}
