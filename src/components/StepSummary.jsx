import { useLanguage } from '../i18n/LanguageContext';
import StepNavigation from './ui/StepNavigation';
import { fmt } from '../utils/zakatCalculator';

function ResultRow({ label, value, currency, highlight, dim }) {
  return (
    <div className={`summary-row${highlight ? ' summary-row--net' : ''}${dim ? ' summary-row--dim' : ''}`}>
      <span className="summary-label">{label}</span>
      <span className={`summary-value${!value && value !== 0 ? ' placeholder' : ''}`}>
        {value !== null && value !== undefined ? fmt(value) : '---'}
        {(value !== null && value !== undefined) && (
          <span className="summary-currency"> {currency}</span>
        )}
      </span>
    </div>
  );
}

export default function StepSummary({ onBack, onCalculate, result, metalPrices = {}, saveStatus = null, saveMessage = '' }) {
  const { t } = useLanguage();
  const cur = t('results.currency');
  const hasResult = result !== null && result !== undefined;

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">{t('summary.title')}</h2>
        <p className="step-subtitle">{t('summary.subtitle')}</p>
      </div>

      {/* ── Nisab Standard (Gold) ── */}
      <div className="nisab-info-banner">
        <div className="nisab-info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5c0 1.5-1.5 2-2 3" />
            <circle cx="12" cy="16.5" r=".5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div className="nisab-info-content">
          <span className="nisab-info-label">{t('nisabSelector.title')}</span>
          <span className="nisab-info-desc">{t('nisabSelector.description')}</span>
        </div>
        <span className="nisab-info-badge">{t('nisabSelector.goldLabel')}</span>
      </div>

      {!hasResult && (
        <div className="no-result-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{t('results.noResult')}</span>
        </div>
      )}

      <div className="summary-body">
        <div className="summary-card">
          <h3 className="summary-card-title">{t('summary.summarySection')}</h3>
          <div className="summary-rows">
            <ResultRow label={t('results.totalAssets')}      value={hasResult ? result.totalAssets : null}      currency={cur} />
            <ResultRow label={t('results.totalLiabilities')} value={hasResult ? result.totalLiabilities : null} currency={cur} dim />
            <ResultRow label={t('results.netWealth')}        value={hasResult ? result.netWealth : null}        currency={cur} highlight />
          </div>
        </div>

        <div className="summary-card nisab-card">
          <h3 className="summary-card-title">{t('summary.nisabSection')}</h3>
          <div className="summary-rows">
            <div className="summary-row">
              <span className="summary-label">{t('results.nisabStandard')}</span>
              <span className="nisab-standard-badge nisab-standard-badge--active">
                {t('nisabSelector.selectedGold')}
              </span>
            </div>
            <ResultRow label={t('results.nisabThreshold')} value={hasResult ? result.nisabValue : null} currency={cur} />
          </div>
          {hasResult && (
            <div className={`nisab-verdict ${result.zakatRequired ? 'nisab-verdict--met' : 'nisab-verdict--not-met'}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                {result.zakatRequired
                  ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                }
              </svg>
              <span>{result.zakatRequired ? t('results.zakatRequired') : t('results.zakatNotRequired')}</span>
            </div>
          )}
        </div>

        <div className="summary-card zakat-card">
          <h3 className="summary-card-title">{t('summary.zakatSection')}</h3>
          <div className="zakat-amount-display">
            <span className="zakat-label">{t('results.zakatDue')}</span>
            <span className="zakat-amount">
              {hasResult ? (
                <>
                  <span className={`zakat-figure ${result.zakatRequired ? 'zakat-figure--due' : 'zakat-figure--zero'}`}>
                    {fmt(result.zakatDue)}
                  </span>
                  <span className="zakat-currency">{cur}</span>
                </>
              ) : (
                <span className="zakat-placeholder">---</span>
              )}
            </span>
          </div>

          {hasResult && metalPrices.goldJodPerGram && (
            <div className="price-used-row">
              <span className="price-used-item">
                {t('results.goldPriceUsed')}: <strong>{fmt(metalPrices.goldJodPerGram)}</strong> {t('prices.perGram')}
              </span>
            </div>
          )}
        </div>
      </div>

      <StepNavigation
        currentStep={5}
        totalSteps={5}
        onBack={onBack}
        onNext={onCalculate}
        isLastStep={true}
      />
    </div>
  );
}
