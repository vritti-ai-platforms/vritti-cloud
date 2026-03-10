import { useOnboarding } from '@context/onboarding';
import type { BackupCodesResponse } from '@services/onboarding.service';
import type React from 'react';
import { useState } from 'react';
import { AuthenticatorSetupStep } from './steps/AuthenticatorSetupStep';
import { BackupCodesStep } from './steps/BackupCodesStep';
import { MethodSelectionStep } from './steps/MethodSelectionStep';
import { PasskeySetupStep } from './steps/PasskeySetupStep';

type MFAMethod = 'authenticator' | 'passkey';
type MFASubStep = 'method-selection' | 'authenticator-setup' | 'passkey-setup' | 'backup-codes';

// Derives the active sub-step from progress + selected method
function getSubStep(progress: number, method: MFAMethod | null): MFASubStep {
  if (progress === 0) return 'method-selection';
  if (progress === 25 && method === 'authenticator') return 'authenticator-setup';
  if (progress === 25) return 'passkey-setup';
  return 'backup-codes';
}

// MFA setup flow driven by OnboardingContext progress
export const MFASetupStep: React.FC = () => {
  const { progress, setProgress, refetch } = useOnboarding();
  const [method, setMethod] = useState<MFAMethod | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupWarning, setBackupWarning] = useState('');

  // Returns to method selection
  const handleBack = () => setProgress(0);

  // Handles successful TOTP or passkey verification
  const handleVerifySuccess = (response: BackupCodesResponse) => {
    setBackupCodes(response.backupCodes);
    setBackupWarning(response.warning);
    setProgress(50);
  };

  switch (getSubStep(progress, method)) {
    case 'method-selection':
      return (
        <MethodSelectionStep
          onMethodSelect={(m) => {
            setMethod(m);
            setProgress(25);
          }}
          onSuccess={() => {
            setProgress(75);
            refetch();
          }}
        />
      );

    case 'authenticator-setup':
      return <AuthenticatorSetupStep onBack={handleBack} onSuccess={handleVerifySuccess} />;

    case 'passkey-setup':
      return <PasskeySetupStep onBack={handleBack} onSuccess={handleVerifySuccess} />;

    case 'backup-codes':
      return backupCodes ? (
        <BackupCodesStep backupCodes={backupCodes} warning={backupWarning} onContinue={refetch} />
      ) : null;
  }
};
