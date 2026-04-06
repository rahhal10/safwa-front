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
  const [nisabStandard, setNisabStandard] = useState('silver');
  const [saveStatus, setSaveStatus] = useState(null);   // null | 'saving' | 'saved' | 'error'
  const [saveMessage, setSaveMessage] = useState('');

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

  const handleCalculate = async (standardArg) => {
    const standard = typeof standardArg === 'string' ? standardArg : nisabStandard;
    const result = calcZakat({
      assetValues: assetDetails,
      liabilities,
      goldPricePerGram: metalPrices.goldJodPerGram || 0,
      silverPricePerGram: metalPrices.silverJodPerGram || 0,
      nisabStandard: standard,
    });
    setCalcResult(result);

    // ── Save everything to the backend ──────────────────────
    setSaveStatus('saving');
    setSaveMessage('');
    try {
      const payload = buildPayload({
        personalInfo, selectedAssets, assetDetails,
        liabilities, nisabStandard: standard, metalPrices,
      });
      const res = await fetch('/api/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('saved');
        setSaveMessage(`Saved successfully (ID: ${data.user_id})`);
      } else {
        setSaveStatus('error');
        setSaveMessage(data.message || 'Save failed.');
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err?.message || 'Could not reach the server. Is the backend running?');
    }
  };

  const handleNisabChange = (standard) => {
    setNisabStandard(standard);
    if (calcResult) handleCalculate(standard);
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
              nisabStandard={nisabStandard}
              onNisabChange={handleNisabChange}
              saveStatus={saveStatus}
              saveMessage={saveMessage}
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

// ── Maps all step state into the backend POST /api/users shape ───────────────
function n(v) { return parseFloat(v) || 0; }

function buildPayload({ personalInfo, selectedAssets, assetDetails, liabilities, nisabStandard, metalPrices }) {
  const assets = [];

  if (selectedAssets.includes('cash')) {
    assets.push({ category: 'cash', amount: n(assetDetails.cashInHand) + n(assetDetails.savingsBalance) + n(assetDetails.checkingBalance) });
  }
  if (selectedAssets.includes('gold')) {
    const grams = n(assetDetails.goldWeight);
    const price = metalPrices.goldJodPerGram || 0;
    assets.push({ category: 'gold', amount: price > 0 ? grams * price : grams, notes: `${grams}g` });
  }
  if (selectedAssets.includes('silver')) {
    const grams = n(assetDetails.silverWeight);
    const price = metalPrices.silverJodPerGram || 0;
    assets.push({ category: 'silver', amount: price > 0 ? grams * price : grams, notes: `${grams}g` });
  }
  if (selectedAssets.includes('stocks')) {
    assets.push({ category: 'stocks', amount: n(assetDetails.stocksValue) });
  }
  if (selectedAssets.includes('investmentFunds')) {
    assets.push({ category: 'investment_funds', amount: n(assetDetails.fundsValue) });
  }
  if (selectedAssets.includes('businessAssets')) {
    assets.push({ category: 'business', amount: n(assetDetails.businessInventory) + n(assetDetails.businessCash) });
  }
  if (selectedAssets.includes('moneyOwed')) {
    assets.push({ category: 'money_owed', amount: n(assetDetails.amountOwed) });
  }
  if (assets.length === 0) assets.push({ category: 'cash', amount: 0 });

  const liabilitiesArr = [
    { field: 'personalLoans',    category: 'personal_loan', due: true  },
    { field: 'creditCard',       category: 'credit_card',   due: true  },
    { field: 'mortgagePayments', category: 'mortgage',      due: false },
    { field: 'carLoan',          category: 'car_loan',      due: false },
    { field: 'otherDebts',       category: 'other',         due: false },
  ]
    .filter(({ field }) => n(liabilities[field]) > 0)
    .map(({ field, category, due }) => ({ category, amount: n(liabilities[field]), due_within_12_months: due }));

  return {
    phone_number:   (personalInfo.phoneNumber   || '').trim(),
    account_number: (personalInfo.accountNumber || '').trim(),
    nisab_standard: nisabStandard || 'silver',
    assets,
    liabilities: liabilitiesArr,
  };
}
