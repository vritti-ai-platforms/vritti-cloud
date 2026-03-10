import { useOnboarding } from '@context/onboarding';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Check, KeyRound, Mail, Smartphone } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';

// Maps backend onboarding step strings to progress indicator step numbers
function deriveCurrentStep(onboardingStep: string): number {
  switch (onboardingStep) {
    case 'EMAIL_VERIFICATION':
    case 'SET_PASSWORD':
      return 1;
    case 'PHONE_VERIFICATION':
    case 'MOBILE_VERIFICATION':
      return 2;
    case 'MFA_SETUP':
    case 'TWO_FACTOR_SETUP':
      return 3;
    case 'COMPLETED':
    case 'COMPLETE':
      return 4;
    default:
      return 1;
  }
}

// Reads onboarding state directly — no props needed
export const MultiStepProgressIndicator: React.FC = () => {
  const { currentStep, signupMethod = 'email', progress = 0 } = useOnboarding();
  // Derived from context — recomputes on every render when currentStep changes
  const activeStep = deriveCurrentStep(currentStep);

  const steps: StepDef[] = useMemo(() => {
    const step1Config =
      signupMethod === 'oauth'
        ? { label: 'Set Password', icon: <KeyRound className="h-4 w-4" /> }
        : { label: 'Verify Email', icon: <Mail className="h-4 w-4" /> };

    return [
      { label: step1Config.label, icon: step1Config.icon },
      { label: 'Verify Mobile', icon: <Smartphone className="h-4 w-4" /> },
      { label: 'Enable MFA', icon: <KeyRound className="h-4 w-4" /> },
      { label: 'Complete', icon: <Check className="h-4 w-4" /> },
    ];
  }, [signupMethod]);

  return (
    <div className="mx-auto w-full max-w-[398px]">
      <StepProgressIndicator steps={steps} currentStep={activeStep} progress={progress} />
    </div>
  );
};
