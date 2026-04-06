import { useLanguage } from '../i18n/LanguageContext';
import InputField from './ui/InputField';
import StepNavigation from './ui/StepNavigation';

export default function StepPersonalInfo({ data, onChange, onNext, errors = {} }) {
  const { t } = useLanguage();

  const handleChange = (field) => (e) => {
    onChange({ ...data, [field]: e.target.value });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">{t('personalInfo.title')}</h2>
        <p className="step-subtitle">{t('personalInfo.subtitle')}</p>
      </div>

      <div className="form-grid">
        <InputField
          label={t('personalInfo.phoneNumber')}
          id="phoneNumber"
          type="tel"
          value={data.phoneNumber || ''}
          onChange={handleChange('phoneNumber')}
          error={errors.phoneNumber ? t(errors.phoneNumber) : undefined}
        />
        <InputField
          label={t('personalInfo.accountNumber')}
          id="accountNumber"
          value={data.accountNumber || ''}
          onChange={handleChange('accountNumber')}
        />
      </div>

      <StepNavigation
        currentStep={1}
        totalSteps={5}
        onBack={() => {}}
        onNext={onNext}
        isLastStep={false}
      />
    </div>
  );
}
