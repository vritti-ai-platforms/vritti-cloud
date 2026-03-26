import { Dialog } from '@vritti/quantum-ui/Dialog';
import type React from 'react';
import { useState } from 'react';
import { ContactChangeProgressIndicator } from '@/components/cloud/account/profile/ContactChangeProgressIndicator';
import type { ProfileData } from '@/schemas/cloud/account';
import { ContactChangeSuccessStep } from './steps/ContactChangeSuccessStep';
import { IdentityVerificationStep } from './steps/IdentityVerificationStep';
import { NewContactStep } from './steps/NewContactStep';
import { OtpVerificationStep } from './steps/OtpVerificationStep';

type ContactStep = 'identity' | 'newContact' | 'verify' | 'success';

const STEP_MAP = {
  identity: 'identity',
  newContact: 'newContact',
  verify: 'verify',
  success: 'success',
} as const;

interface Props {
  open: boolean;
  contactType: 'email' | 'phone';
  onClose: () => void;
  profile: ProfileData;
}

// Thin orchestrator — each step owns its mutations, forms, and timers
export const ContactChangeDialog: React.FC<Props> = ({ open, contactType, onClose, profile }) => {
  const [step, setStep] = useState<ContactStep>('identity');
  const [progress, setProgress] = useState(0);
  const [newContactValue, setNewContactValue] = useState('');

  const currentValue = contactType === 'email' ? profile.email : (profile.phone as string);
  const dialogTitle = contactType === 'email' ? 'Change Email' : 'Change Phone';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={dialogTitle}
    >
      <div className="space-y-6">
        <ContactChangeProgressIndicator contactType={contactType} currentStep={STEP_MAP[step]} progress={progress} />

        {step === 'identity' && (
          <IdentityVerificationStep
            contactType={contactType}
            email={profile.email}
            phone={profile.phone as string}
            onSuccess={() => {
              setStep('newContact');
              setProgress(0);
            }}
            onCancel={onClose}
          />
        )}

        {step === 'newContact' && (
          <NewContactStep
            contactType={contactType}
            currentValue={currentValue}
            onSuccess={(newValue) => {
              setNewContactValue(newValue);
              setStep('verify');
              setProgress(50);
            }}
          />
        )}

        {step === 'verify' && (
          <OtpVerificationStep
            contactType={contactType}
            newContactValue={newContactValue}
            onSuccess={() => {
              setStep('success');
              setProgress(0);
            }}
            onBack={() => setStep('newContact')}
          />
        )}

        {step === 'success' && (
          <ContactChangeSuccessStep contactType={contactType} newContactValue={newContactValue} onClose={onClose} />
        )}
      </div>
    </Dialog>
  );
};
