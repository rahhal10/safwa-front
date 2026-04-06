import { useLanguage } from '../../i18n/LanguageContext';

export default function StepNavigation({ currentStep, totalSteps, onBack, onNext, isLastStep }) {
  const { t } = useLanguage();

  return (
    <div className="step-navigation">
      <button
        className="btn btn-secondary"
        onClick={onBack}
        disabled={currentStep === 1}
        type="button"
      >
        {t('buttons.back')}
      </button>
      <div className="step-counter">
        {currentStep} / {totalSteps}
      </div>
      <button
        className="btn btn-primary"
        onClick={onNext}
        type="button"
      >
        {isLastStep ? t('buttons.calculate') : t('buttons.next')}
      </button>
    </div>
  );
}
