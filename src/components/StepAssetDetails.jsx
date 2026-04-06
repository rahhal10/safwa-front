import { useLanguage } from '../i18n/LanguageContext';
import InputField from './ui/InputField';
import StepNavigation from './ui/StepNavigation';
import { fmt } from '../utils/zakatCalculator';

const ASSET_SECTIONS = {
  cash: ['cashInHand', 'savingsBalance', 'checkingBalance'],
  gold: ['goldWeight'],
  silver: ['silverWeight'],
  stocks: ['stocksValue'],
  investmentFunds: ['fundsValue'],
  businessAssets: ['businessInventory', 'businessCash'],
  moneyOwed: ['amountOwed'],
};

const SECTION_ICONS = {
  cash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" />
      <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" />
    </svg>
  ),
  gold: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" strokeLinecap="round" />
      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  silver: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" strokeLinecap="round" />
      <path d="M9 12h6M12 9v6" strokeLinecap="round" />
    </svg>
  ),
  stocks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  investmentFunds: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  businessAssets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" />
    </svg>
  ),
  moneyOwed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" strokeLinecap="round" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function StepAssetDetails({ selected, data, onChange, onBack, onNext, metalPrices = {} }) {
  const { t } = useLanguage();

  const handleChange = (field) => (e) => {
    onChange({ ...data, [field]: e.target.value });
  };

  function renderPriceBar(assetKey) {
    if (assetKey !== 'gold' && assetKey !== 'silver') return null;
    const isGold = assetKey === 'gold';
    const price = isGold ? metalPrices.goldJodPerGram : metalPrices.silverJodPerGram;
    const label = t(isGold ? 'prices.goldLabel' : 'prices.silverLabel');

    if (metalPrices.loading) {
      return (
        <div className="price-bar price-bar--loading">
          <span className="price-bar-spinner" />
          <span>{t('prices.loading')}</span>
        </div>
      );
    }
    if (metalPrices.error && !price) {
      return <div className="price-bar price-bar--error">{t('prices.error')}</div>;
    }
    if (!price) return null;

    const date = metalPrices.lastUpdated
      ? new Date(metalPrices.lastUpdated).toLocaleDateString()
      : '';

    return (
      <div className="price-bar">
        {(metalPrices.usingCache || metalPrices.usingFallbackRate) && (
          <span className="price-bar-notice">
            {metalPrices.usingCache ? t('prices.usingCache') : t('prices.usingFallbackRate')}
          </span>
        )}
        <span className="price-bar-item">
          <span className="price-bar-label">{label}:</span>
          <strong className="price-bar-value">{fmt(price)}</strong>
          <span className="price-bar-unit">{t('prices.perGram')}</span>
        </span>
        {date && (
          <span className="price-bar-date">{t('prices.lastUpdated')}: {date}</span>
        )}
      </div>
    );
  }

  function renderEstimatedValue(assetKey, field) {
    if (assetKey === 'gold' && field === 'goldWeight' && metalPrices.goldJodPerGram) {
      const val = (parseFloat(data[field]) || 0) * metalPrices.goldJodPerGram;
      if (val > 0) return (
        <p className="field-estimate">
          {t('prices.estimatedValue')}: <strong>{fmt(val)} {t('results.currency')}</strong>
        </p>
      );
    }
    if (assetKey === 'silver' && field === 'silverWeight' && metalPrices.silverJodPerGram) {
      const val = (parseFloat(data[field]) || 0) * metalPrices.silverJodPerGram;
      if (val > 0) return (
        <p className="field-estimate">
          {t('prices.estimatedValue')}: <strong>{fmt(val)} {t('results.currency')}</strong>
        </p>
      );
    }
    return null;
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">{t('assetDetails.title')}</h2>
        <p className="step-subtitle">{t('assetDetails.subtitle')}</p>
      </div>

      <div className="sections-list">
        {selected.map((assetKey) => (
          <div key={assetKey} className="asset-section-card">
            <div className="asset-section-header">
              <span className="asset-section-icon">{SECTION_ICONS[assetKey]}</span>
              <h3 className="asset-section-title">{t(`assetDetails.${assetKey}Section`)}</h3>
            </div>
            {renderPriceBar(assetKey)}
            <div className="form-grid asset-section-body">
              {ASSET_SECTIONS[assetKey].map((field) => (
                <div key={field} className="input-with-estimate">
                  <InputField
                    label={t(`assetDetails.${field}`)}
                    id={field}
                    type="number"
                    value={data[field] || ''}
                    onChange={handleChange(field)}
                    placeholder="0.00"
                  />
                  {renderEstimatedValue(assetKey, field)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <StepNavigation
        currentStep={3}
        totalSteps={5}
        onBack={onBack}
        onNext={onNext}
        isLastStep={false}
      />
    </div>
  );
}
