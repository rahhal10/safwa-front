import { useLanguage } from '../i18n/LanguageContext';
import StepNavigation from './ui/StepNavigation';

const ASSET_KEYS = [
  'cash', 'gold', 'silver', 'stocks', 'investmentFunds', 'businessAssets', 'moneyOwed',
];

export default function StepAssetSelection({ selected, onChange, onBack, onNext, errors = {} }) {
  const { t } = useLanguage();

  const toggle = (key) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">{t('assetSelection.title')}</h2>
        <p className="step-subtitle">{t('assetSelection.subtitle')}</p>
      </div>

      <div className="asset-list">
        {ASSET_KEYS.map((key) => {
          const isSelected = selected.includes(key);
          return (
            <label
              key={key}
              className={`asset-option ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(key)}
                className="asset-option-input"
              />
              <span className="asset-option-box">
                {isSelected && (
                  <svg viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="asset-option-label">{t(`assetSelection.${key}`)}</span>
            </label>
          );
        })}
      </div>

      {errors.selection && (
        <div className="selection-error">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{t(errors.selection)}</span>
        </div>
      )}

      <StepNavigation
        currentStep={2}
        totalSteps={5}
        onBack={onBack}
        onNext={onNext}
        isLastStep={false}
      />
    </div>
  );
}
