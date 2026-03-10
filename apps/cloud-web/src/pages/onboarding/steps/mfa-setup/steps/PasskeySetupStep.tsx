import { usePasskeyRegistration } from '@hooks/onboarding/mfa';
import type { BackupCodesResponse } from '@services/onboarding.service';
import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { AxiosError } from 'axios';
import { ArrowLeft, Fingerprint } from 'lucide-react';
import type React from 'react';

interface PasskeySetupStepProps {
  onBack: () => void;
  onSuccess: (response: BackupCodesResponse) => void;
}

// Returns user-friendly message from WebAuthn errors
function getErrorMessage(error: AxiosError | Error | null): string | null {
  if (!error) return null;

  if (error.name === 'NotAllowedError') return 'Passkey registration was cancelled. Please try again.';
  if (error.name === 'NotSupportedError') return 'Passkeys are not supported on this device or browser.';
  if (error.name === 'SecurityError') return 'Security error. Please ensure you are on a secure connection.';
  if (error.name === 'InvalidStateError') return 'A passkey already exists for this account on this device.';
  if (error.name === 'AbortError') return 'The operation was cancelled. Please try again.';

  return error.message || 'An unexpected error occurred.';
}

// Passkey setup with biometric/PIN registration prompt
export const PasskeySetupStep: React.FC<PasskeySetupStepProps> = ({ onBack, onSuccess }) => {
  const mutation = usePasskeyRegistration({ onSuccess });

  const errorMessage = getErrorMessage(mutation.error);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={mutation.isPending}
        className="inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to MFA options
      </Button>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Set up Passkey
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Use biometrics or your device PIN to sign in
        </Typography>
      </div>

      {errorMessage && <Alert variant="destructive" title="Error" description={errorMessage} />}

      <div className="flex flex-col items-center py-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Fingerprint className="h-10 w-10 text-primary" />
        </div>
        <Typography variant="body2" intent="muted" align="center" className="max-w-[300px]">
          {mutation.isPending
            ? 'Follow the prompts on your device to create your passkey...'
            : 'When you click the button below, your device will prompt you to create a passkey using Face ID, Touch ID, or your device PIN.'}
        </Typography>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        className="w-full bg-primary text-primary-foreground"
        isLoading={mutation.isPending}
        loadingText="Creating passkey..."
      >
        Create Passkey
      </Button>
    </div>
  );
};
