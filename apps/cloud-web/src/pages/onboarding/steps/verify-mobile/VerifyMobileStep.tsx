import { useOnboarding } from '@context/onboarding';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import type React from 'react';
import { useState } from 'react';
import { MethodSelectionStep } from './steps/MethodSelectionStep';
import { OTPVerificationStep } from './steps/OTPVerificationStep';
import { PhoneInputStep } from './steps/PhoneInputStep';
import { QRVerificationStep } from './steps/QRVerificationStep';
import { SuccessStep } from './steps/SuccessStep';

type MobileSubStep = 'method-selection' | 'qr-verification' | 'phone-input' | 'otp' | 'success';

// Derives the active sub-step from progress + selected method
function getSubStep(progress: number, method: 'whatsapp' | 'sms' | 'manual' | null): MobileSubStep {
  if (progress === 0) return 'method-selection';
  if (progress === 25 && method === 'manual') return 'phone-input';
  if (progress === 25) return 'qr-verification';
  if (progress === 50) return 'otp';
  return 'success';
}

// Mobile verification flow driven by OnboardingContext progress
export const VerifyMobileStep: React.FC = () => {
  const { progress, setProgress, refetch } = useOnboarding();
  const [method, setMethod] = useState<'whatsapp' | 'sms' | 'manual' | null>(null);
  const [phone, setPhone] = useState<PhoneValue | undefined>(undefined);
  const [phoneCountry, setPhoneCountry] = useState('');

  switch (getSubStep(progress, method)) {
    case 'method-selection':
      return (
        <MethodSelectionStep
          onMethodSelect={(m) => {
            setMethod(m);
            setProgress(25);
          }}
        />
      );

    case 'qr-verification':
      return (
        <QRVerificationStep
          method={method as 'whatsapp' | 'sms'}
          onSuccess={(p) => {
            setPhone(p as PhoneValue);
            setProgress(75);
          }}
          onBack={() => setProgress(0)}
        />
      );

    case 'phone-input':
      return (
        <PhoneInputStep
          onSuccess={(p, country) => {
            setPhone(p);
            setPhoneCountry(country);
            setProgress(50);
          }}
          onBack={() => setProgress(0)}
        />
      );

    case 'otp':
      return (
        <OTPVerificationStep
          phoneNumber={phone as PhoneValue}
          phoneCountry={phoneCountry}
          onSuccess={() => {
            setProgress(75);
          }}
          onBack={() => setProgress(25)}
          onChangeNumber={() => setProgress(25)}
        />
      );

    case 'success':
      return (
        <SuccessStep
          phoneNumber={phone}
          onContinue={() => {
            setProgress(100);
            refetch();
          }}
        />
      );
  }
};
