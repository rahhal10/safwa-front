import { useLanguage } from '../../i18n/LanguageContext';

export default function InputField({ label, id, type = 'text', value, onChange, placeholder, error }) {
  const { isRTL } = useLanguage();

  return (
    <div className="input-field">
      <label htmlFor={id} className="input-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ''}
        className={`input-control${error ? ' input-control--error' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
        autoComplete="off"
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
