import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Check, Mail, MailPlus, Phone, PhoneCall, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';

type ContactChangeStep = 'identity' | 'newContact' | 'verify' | 'success';

const STEP_ORDER: ContactChangeStep[] = ['identity', 'newContact', 'verify', 'success'];

interface ContactChangeProgressIndicatorProps {
  contactType: 'email' | 'phone';
  currentStep: ContactChangeStep;
  progress?: number;
}

// Renders step progress for email or phone change flows
export const ContactChangeProgressIndicator: React.FC<ContactChangeProgressIndicatorProps> = ({
  contactType,
  currentStep,
  progress,
}) => {
  const activeStep = STEP_ORDER.indexOf(currentStep) + 1;

  const steps: StepDef[] = useMemo(() => {
    if (contactType === 'email') {
      return [
        { label: 'Verify Identity', icon: <ShieldCheck className="h-4 w-4" /> },
        { label: 'New Email', icon: <MailPlus className="h-4 w-4" /> },
        { label: 'Verify Email', icon: <Mail className="h-4 w-4" /> },
        { label: 'Complete', icon: <Check className="h-4 w-4" /> },
      ];
    }

    return [
      { label: 'Verify Identity', icon: <ShieldCheck className="h-4 w-4" /> },
      { label: 'New Phone', icon: <PhoneCall className="h-4 w-4" /> },
      { label: 'Verify Phone', icon: <Phone className="h-4 w-4" /> },
      { label: 'Complete', icon: <Check className="h-4 w-4" /> },
    ];
  }, [contactType]);

  return (
    <div className="mx-auto w-full max-w-[398px]">
      <StepProgressIndicator steps={steps} currentStep={activeStep} progress={progress} />
    </div>
  );
};
