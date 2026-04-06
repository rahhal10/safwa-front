import { useLanguage } from '../i18n/LanguageContext';
import InputField from './ui/InputField';
import StepNavigation from './ui/StepNavigation';
import { fmt } from '../utils/zakatCalculator';

const MAX_FOREIGN_CURRENCIES = 3;
const GOLD_KARATS = ['24k', '21k', '18k'];
const KARAT_MULTIPLIER = { '24k': 1, '21k': 21 / 24, '18k': 18 / 24 };

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
];

const ASSET_SECTIONS = {
  cash: ['cashInHand', 'savingsBalance', 'checkingBalance'],
  gold: ['goldWeight'],
  silver: ['silverWeight'],
  investments: [],
  businessAssets: ['businessInventory', 'businessCash', 'businessReceivables'],
  moneyOwed: ['loansGiven', 'expectedPayments'],
};

const INVESTMENT_TYPES = [
  { code: 'stocks', labelKey: 'investmentTypeStocks' },
  { code: 'sukuk',  labelKey: 'investmentTypeSukuk' },
  { code: 'funds',  labelKey: 'investmentTypeFunds' },
];

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
  investments: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
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
  const fxRates = metalPrices.fxRates || null;
  const foreignCurrencies = data.foreignCurrencies || [];
  const investments = data.investments || [];

  const addInvestment = () => onChange({ ...data, investments: [...investments, { type: 'stocks', intention: 'trading', marketValue: '', profits: '', cashShare: '', receivables: '' }] });
  const removeInvestment = (idx) => onChange({ ...data, investments: investments.filter((_, i) => i !== idx) });
  const updateInvestment = (idx, field, value) => {
    const updated = investments.map((e, i) => (i === idx ? { ...e, [field]: value } : e));
    onChange({ ...data, investments: updated });
  };

  const handleChange = (field) => (e) => {
    onChange({ ...data, [field]: e.target.value });
  };

  const addForeignCurrency = () => {
    if (foreignCurrencies.length >= MAX_FOREIGN_CURRENCIES) return;
    onChange({ ...data, foreignCurrencies: [...foreignCurrencies, { currency: 'USD', cashInHand: '', savingsBalance: '', checkingBalance: '' }] });
  };

  const removeForeignCurrency = (idx) => {
    onChange({ ...data, foreignCurrencies: foreignCurrencies.filter((_, i) => i !== idx) });
  };

  const updateForeignCurrency = (idx, field, value) => {
    const updated = foreignCurrencies.map((e, i) => (i === idx ? { ...e, [field]: value } : e));
    onChange({ ...data, foreignCurrencies: updated });
  };

  const toJod = (amount, currency) => {
    if (!amount || !currency || !fxRates) return null;
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) return null;
    const jodRate = fxRates['JOD'];
    const currRate = fxRates[currency];
    if (!jodRate || !currRate) return null;
    return amt * (jodRate / currRate);
  };

  function renderInvestmentsSection() {
    return (
      <div className="inv-cards-wrap">
        <div className="fx-cards-label">
          <span className="fx-cards-label-hint">{t('assetDetails.investmentsHint')}</span>
        </div>

        {investments.map((entry, idx) => (
          <div key={idx} className="fx-card">
            <div className="fx-card-header">
              <span className="fx-card-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </span>
              <span className="fx-card-header-title">{t(`assetDetails.investmentType${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}`)}</span>
              <button type="button" className="fx-card-remove" onClick={() => removeInvestment(idx)} aria-label="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="fx-card-body">
              <div className="fx-currency-field">
                <label className="fx-currency-label" htmlFor={`inv-type-${idx}`}>{t('assetDetails.investmentType')}</label>
                <select id={`inv-type-${idx}`} className="fx-currency-select" value={entry.type} onChange={(e) => updateInvestment(idx, 'type', e.target.value)}>
                  {INVESTMENT_TYPES.map((it) => <option key={it.code} value={it.code}>{t(`assetDetails.${it.labelKey}`)}</option>)}
                </select>
              </div>
              <div className="gold-mode-toggle gold-mode-toggle--body">
                <button type="button" className={`gold-mode-btn${entry.intention === 'trading' ? ' gold-mode-btn--active' : ''}`} onClick={() => updateInvestment(idx, 'intention', 'trading')}>
                  {t('assetDetails.investmentTrading')}
                </button>
                <button type="button" className={`gold-mode-btn${entry.intention === 'longterm' ? ' gold-mode-btn--active' : ''}`} onClick={() => updateInvestment(idx, 'intention', 'longterm')}>
                  {t('assetDetails.investmentLongterm')}
                </button>
              </div>
              <div className="form-grid asset-section-body">
                {entry.intention === 'trading' ? (
                  <div className="input-with-estimate">
                    <InputField label={t('assetDetails.investmentMarketValue')} id={`inv-mv-${idx}`} type="number" value={entry.marketValue || ''} onChange={(e) => updateInvestment(idx, 'marketValue', e.target.value)} placeholder="0.00" />
                  </div>
                ) : (
                  <>
                    <div className="input-with-estimate">
                      <InputField label={t('assetDetails.investmentProfits')} id={`inv-pr-${idx}`} type="number" value={entry.profits || ''} onChange={(e) => updateInvestment(idx, 'profits', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="input-with-estimate">
                      <InputField label={t('assetDetails.investmentCashShare')} id={`inv-cs-${idx}`} type="number" value={entry.cashShare || ''} onChange={(e) => updateInvestment(idx, 'cashShare', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="input-with-estimate">
                      <InputField label={t('assetDetails.investmentReceivables')} id={`inv-rc-${idx}`} type="number" value={entry.receivables || ''} onChange={(e) => updateInvestment(idx, 'receivables', e.target.value)} placeholder="0.00" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="fx-add-card-btn" onClick={addInvestment}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('assetDetails.addInvestment')}
        </button>
      </div>
    );
  }

  function renderForeignCurrencies() {
    return (
      <div className="fx-cards-wrap">
        <div className="fx-cards-label">
          <span className="fx-cards-label-text">{t('assetDetails.foreignCurrenciesLabel')}</span>
          <span className="fx-cards-label-hint">{t('assetDetails.foreignCurrenciesHint')}</span>
        </div>

        {foreignCurrencies.map((entry, idx) => {
          return (
            <div key={idx} className="fx-card">
              <div className="fx-card-header">
                <span className="fx-card-header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <span className="fx-card-header-title">{t('assetDetails.foreignCurrenciesLabel')}</span>
                <button
                  type="button"
                  className="fx-card-remove"
                  onClick={() => removeForeignCurrency(idx)}
                  aria-label="Remove"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="fx-card-body">
                <div className="fx-currency-field">
                  <label className="fx-currency-label" htmlFor={`fx-cur-${idx}`}>
                    {t('assetDetails.foreignCurrencySelect')}
                  </label>
                  <select
                    id={`fx-cur-${idx}`}
                    className="fx-currency-select"
                    value={entry.currency}
                    onChange={(e) => updateForeignCurrency(idx, 'currency', e.target.value)}
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-grid asset-section-body">
                  {['cashInHand', 'savingsBalance', 'checkingBalance'].map((field) => {
                    const fieldVal = parseFloat(entry[field]) || 0;
                    const fieldJod = fieldVal > 0 ? toJod(fieldVal, entry.currency) : null;
                    return (
                      <div key={field} className="input-with-estimate">
                        <InputField
                          label={`${t(`assetDetails.${field}`)} (${entry.currency})`}
                          id={`fx-${idx}-${field}`}
                          type="number"
                          value={entry[field] || ''}
                          onChange={(e) => updateForeignCurrency(idx, field, e.target.value)}
                          placeholder="0.00"
                        />
                        {fieldJod !== null && fieldJod > 0 && (
                          <p className="field-estimate">
                            {t('prices.estimatedValue')}: <strong>{fmt(fieldJod)} {t('results.currency')}</strong>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!fxRates && (entry.cashInHand || entry.savingsBalance || entry.checkingBalance) && (
                  <p className="fx-card-no-rate">{t('assetDetails.foreignCurrencyRateUnavailable')}</p>
                )}
              </div>
            </div>
          );
        })}

        {foreignCurrencies.length < MAX_FOREIGN_CURRENCIES && (
          <button type="button" className="fx-add-card-btn" onClick={addForeignCurrency}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('assetDetails.addForeignCurrency')}
          </button>
        )}
      </div>
    );
  }

  function renderGoldSection() {
    const mode = data.goldInputMode || 'weight';
    const karat = data.goldKarat || '24k';
    const setMode = (m) => onChange({ ...data, goldInputMode: m });
    const setKarat = (k) => onChange({ ...data, goldKarat: k });
    return (
      <>
        <div className="gold-mode-toggle">
          <button
            type="button"
            className={`gold-mode-btn${mode === 'weight' ? ' gold-mode-btn--active' : ''}`}
            onClick={() => setMode('weight')}
          >
            {t('assetDetails.goldByWeight')}
          </button>
          <button
            type="button"
            className={`gold-mode-btn${mode === 'value' ? ' gold-mode-btn--active' : ''}`}
            onClick={() => setMode('value')}
          >
            {t('assetDetails.goldByValue')}
          </button>
        </div>
        {mode === 'weight' && (
          <div className="gold-karat-row">
            <span className="gold-karat-label">{t('assetDetails.goldKarat')}</span>
            <div className="gold-karat-pills">
              {GOLD_KARATS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`gold-karat-btn${karat === k ? ' gold-karat-btn--active' : ''}`}
                  onClick={() => setKarat(k)}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="form-grid asset-section-body">
          {mode === 'weight' ? (
            <div className="input-with-estimate">
              <InputField
                label={t('assetDetails.goldWeight')}
                id="goldWeight"
                type="number"
                value={data.goldWeight || ''}
                onChange={handleChange('goldWeight')}
                placeholder="0.00"
              />
              {renderEstimatedValue('gold', 'goldWeight')}
            </div>
          ) : (
            <div className="input-with-estimate">
              <InputField
                label={t('assetDetails.goldTotalValue')}
                id="goldValue"
                type="number"
                value={data.goldValue || ''}
                onChange={handleChange('goldValue')}
                placeholder="0.00"
              />
            </div>
          )}
        </div>
      </>
    );
  }

  function renderSilverSection() {
    const mode = data.silverInputMode || 'weight';
    const setMode = (m) => onChange({ ...data, silverInputMode: m });
    return (
      <>
        <div className="gold-mode-toggle">
          <button
            type="button"
            className={`gold-mode-btn${mode === 'weight' ? ' gold-mode-btn--active' : ''}`}
            onClick={() => setMode('weight')}
          >
            {t('assetDetails.silverByWeight')}
          </button>
          <button
            type="button"
            className={`gold-mode-btn${mode === 'value' ? ' gold-mode-btn--active' : ''}`}
            onClick={() => setMode('value')}
          >
            {t('assetDetails.silverByValue')}
          </button>
        </div>
        <div className="form-grid asset-section-body">
          {mode === 'weight' ? (
            <div className="input-with-estimate">
              <InputField
                label={t('assetDetails.silverWeight')}
                id="silverWeight"
                type="number"
                value={data.silverWeight || ''}
                onChange={handleChange('silverWeight')}
                placeholder="0.00"
              />
              {renderEstimatedValue('silver', 'silverWeight')}
            </div>
          ) : (
            <div className="input-with-estimate">
              <InputField
                label={t('assetDetails.silverTotalValue')}
                id="silverValue"
                type="number"
                value={data.silverValue || ''}
                onChange={handleChange('silverValue')}
                placeholder="0.00"
              />
            </div>
          )}
        </div>
      </>
    );
  }

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
      const karatMult = KARAT_MULTIPLIER[data.goldKarat || '24k'] || 1;
      const val = (parseFloat(data[field]) || 0) * metalPrices.goldJodPerGram * karatMult;
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
            {assetKey === 'gold' ? renderGoldSection()
              : assetKey === 'silver' ? renderSilverSection()
              : assetKey === 'investments' ? renderInvestmentsSection()
              : (
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
            )}
            {assetKey === 'cash' && renderForeignCurrencies()}
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
