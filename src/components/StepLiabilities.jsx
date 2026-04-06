import { useLanguage } from '../i18n/LanguageContext';
import InputField from './ui/InputField';
import StepNavigation from './ui/StepNavigation';

const LIABILITY_FIELDS = [
  'personalLoans',
  'creditCard',
  'mortgagePayments',
  'carLoan',
  'otherDebts',
];

export default function StepLiabilities({ data, onChange, onBack, onNext }) {
  const { t } = useLanguage();

  const handleChange = (field) => (e) => {
    onChange({ ...data, [field]: e.target.value });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">{t('liabilities.title')}</h2>
        <p className="step-subtitle">{t('liabilities.subtitle')}</p>
      </div>

      <div className="form-grid">
        {LIABILITY_FIELDS.map((field) => (
          <InputField
            key={field}
            label={t(`liabilities.${field}`)}
            id={field}
            type="number"
            value={data[field] || ''}
            onChange={handleChange(field)}
            placeholder="0.00"
          />
        ))}
      </div>

      <StepNavigation
        currentStep={4}
        totalSteps={5}
        onBack={onBack}
        onNext={onNext}
        isLastStep={false}
      />
    </div>
  );
}
