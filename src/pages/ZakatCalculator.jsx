import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StepPersonalInfo from '../components/StepPersonalInfo';
import StepAssetSelection from '../components/StepAssetSelection';
import StepAssetDetails from '../components/StepAssetDetails';
import StepLiabilities from '../components/StepLiabilities';
import StepSummary from '../components/StepSummary';
import logoSrc from '../assets/logo.png';
import { useMetalPrices } from '../hooks/useMetalPrices';
import { validatePersonalInfo, validateAssetSelection, hasErrors } from '../utils/validation';
import { calcZakat } from '../utils/zakatCalculator';

const TOTAL_STEPS = 5;

export default function ZakatCalculator() {
  const { t, isRTL } = useLanguage();
  const metalPrices = useMetalPrices();

  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({});
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assetDetails, setAssetDetails] = useState({});
  const [liabilities, setLiabilities] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [calcResult, setCalcResult] = useState(null);

  const goBack = () => {
    setValidationErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const goNext = () => {
    if (currentStep === 1) {
      const errors = validatePersonalInfo(personalInfo);
      if (hasErrors(errors)) { setValidationErrors(errors); return; }
    }
    if (currentStep === 2) {
      const errors = validateAssetSelection(selectedAssets);
      if (hasErrors(errors)) { setValidationErrors(errors); return; }
    }
    setValidationErrors({});
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleCalculate = async () => {
    const result = calcZakat({
      assetValues: assetDetails,
      liabilities,
      goldPricePerGram: metalPrices.goldJodPerGram || 0,
      silverPricePerGram: metalPrices.silverJodPerGram || 0,
      fxRates: metalPrices.fxRates || null,
    });
    setCalcResult(result);

    try {
      const payload = buildPayload({ personalInfo, selectedAssets, assetDetails, liabilities, metalPrices, result });
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Save failed:', err.message);
    }
  };

  const STEP_LABELS = [
    t('steps.step1'),
    t('steps.step2'),
    t('steps.step3'),
    t('steps.step4'),
    t('steps.step5'),
  ];

  return (
    <div className="zakat-page" dir={isRTL ? 'rtl' : 'ltr'}>

      <header className="zakat-header">
        <div className="header-inner">
          <div className="header-brand">
            <img src={logoSrc} alt={t('bankName')} className="logo-img" />
            <div className="header-brand-sep" />
            <span className="header-service-label">{t('appTitle')}</span>
          </div>
          <nav className="header-nav">
            <a
              href="https://www.safwabank.com/ar/"
              className="btn-back-bank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{t('backToBank')}</span>
            </a>
            <div className="header-nav-sep" />
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="zakat-main">
        <div className="page-banner">
          <span className="page-banner-eyebrow">{t('bankName')}</span>
          <h1 className="page-banner-title">{t('appTitle')}</h1>
          <p className="page-banner-desc">
            {isRTL
              ? 'أدِّ فريضة الزكاة بدقة واطمئنان — احسب زكاة أموالك وفق أحكام الشريعة الإسلامية في خطوات بسيطة'
              : 'Fulfil your Zakat obligation with confidence — calculate your due amount in a few guided steps'}
          </p>
        </div>

        <div className="stepper-wrapper">
          <div className="stepper">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              return (
                <div key={stepNum} className={`stepper-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="stepper-circle">
                    {isDone ? (
                      <svg viewBox="0 0 12 10" fill="none">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span>{stepNum}</span>
                    )}
                  </div>
                  <span className="stepper-label">{label}</span>
                  {stepNum < TOTAL_STEPS && <div className="stepper-connector" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-card">
          {currentStep === 1 && (
            <StepPersonalInfo
              data={personalInfo}
              onChange={setPersonalInfo}
              onNext={goNext}
              errors={validationErrors}
            />
          )}
          {currentStep === 2 && (
            <StepAssetSelection
              selected={selectedAssets}
              onChange={setSelectedAssets}
              onBack={goBack}
              onNext={goNext}
              errors={validationErrors}
            />
          )}
          {currentStep === 3 && (
            <StepAssetDetails
              selected={selectedAssets}
              data={assetDetails}
              onChange={setAssetDetails}
              onBack={goBack}
              onNext={goNext}
              metalPrices={metalPrices}
            />
          )}
          {currentStep === 4 && (
            <StepLiabilities
              data={liabilities}
              onChange={setLiabilities}
              onBack={goBack}
              onNext={goNext}
            />
          )}
          {currentStep === 5 && (
            <StepSummary
              onBack={goBack}
              onCalculate={handleCalculate}
              result={calcResult}
              metalPrices={metalPrices}
            />
          )}
        </div>
      </main>

      <footer className="zakat-footer">
        <p>© {new Date().getFullYear()} {t('bankName')} — {isRTL ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}</p>
      </footer>
    </div>
  );
}

function buildPayload({ personalInfo, selectedAssets, assetDetails, liabilities, metalPrices, result }) {
  const payload = {
    phone_number:      (personalInfo.phoneNumber   || '').trim(),
    account_number:    (personalInfo.accountNumber || '').trim() || null,
    gold_price_jod:    metalPrices.goldJodPerGram   || 0,
    silver_price_jod:  metalPrices.silverJodPerGram || 0,
    usd_to_jod:        metalPrices.usdToJod         || 0,
    total_assets:      result.totalAssets,
    total_liabilities: result.totalLiabilities,
    net_wealth:        result.netWealth,
    nisab_value:       result.nisabValue,
    zakat_required:    result.zakatRequired,
    zakat_due:         result.zakatDue,
  };

  if (selectedAssets.includes('cash')) {
    payload.cash = {
      cash_in_hand:     parseFloat(assetDetails.cashInHand)     || 0,
      savings_balance:  parseFloat(assetDetails.savingsBalance)  || 0,
      checking_balance: parseFloat(assetDetails.checkingBalance) || 0,
    };
    if (assetDetails.foreignCurrencies && assetDetails.foreignCurrencies.length > 0) {
      payload.foreign_currencies = assetDetails.foreignCurrencies.map((fc) => ({
        currency:         fc.currency,
        cash_in_hand:     parseFloat(fc.cashInHand)     || 0,
        savings_balance:  parseFloat(fc.savingsBalance)  || 0,
        checking_balance: parseFloat(fc.checkingBalance) || 0,
      }));
    }
  }

  if (selectedAssets.includes('gold')) {
    payload.gold = {
      input_mode:   assetDetails.goldInputMode || 'weight',
      weight_grams: parseFloat(assetDetails.goldWeight) || null,
      karat:        assetDetails.goldKarat || '24k',
      direct_value: parseFloat(assetDetails.goldValue)  || null,
    };
  }

  if (selectedAssets.includes('silver')) {
    payload.silver = {
      input_mode:   assetDetails.silverInputMode || 'weight',
      weight_grams: parseFloat(assetDetails.silverWeight) || null,
      direct_value: parseFloat(assetDetails.silverValue)  || null,
    };
  }

  if (selectedAssets.includes('investments') && assetDetails.investments && assetDetails.investments.length > 0) {
    payload.investments = assetDetails.investments.map((inv) => ({
      type:         inv.type,
      intention:    inv.intention,
      market_value: parseFloat(inv.marketValue) || null,
      profits:      parseFloat(inv.profits)     || null,
      cash_share:   parseFloat(inv.cashShare)   || null,
      receivables:  parseFloat(inv.receivables) || null,
    }));
  }

  if (selectedAssets.includes('businessAssets')) {
    payload.business_assets = {
      inventory:   parseFloat(assetDetails.businessInventory)   || 0,
      cash:        parseFloat(assetDetails.businessCash)         || 0,
      receivables: parseFloat(assetDetails.businessReceivables)  || 0,
    };
  }

  if (selectedAssets.includes('moneyOwed')) {
    payload.money_owed = {
      loans_given:       parseFloat(assetDetails.loansGiven)       || 0,
      expected_payments: parseFloat(assetDetails.expectedPayments) || 0,
    };
  }

  payload.liabilities = {
    personal_loans:    parseFloat(liabilities.personalLoans)    || 0,
    credit_card:       parseFloat(liabilities.creditCard)        || 0,
    mortgage_payments: parseFloat(liabilities.mortgagePayments)  || 0,
    car_loan:          parseFloat(liabilities.carLoan)           || 0,
    other_debts:       parseFloat(liabilities.otherDebts)        || 0,
  };

  return payload;
}
