import { useVerifyPasskeySetup } from '@hooks/account/security';
import type { BackupCodesResponse } from '@services/account/security.service';
import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { AxiosError } from 'axios';
import { Fingerprint } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { BackupCodesView } from './BackupCodesView';

interface Props {
  handle: DialogHandle;
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

export const PasskeySetupDialog: React.FC<Props> = ({ handle }) => {
  const [backupCodes, setBackupCodes] = useState<BackupCodesResponse | null>(null);
  const mutation = useVerifyPasskeySetup({
    onSuccess: (response) => setBackupCodes(response),
  });

  const errorMessage = getErrorMessage(mutation.error);

  if (backupCodes) {
    return (
      <Dialog handle={handle} title="Save Your Backup Codes">
        <BackupCodesView
          backupCodes={backupCodes.backupCodes}
          warning={backupCodes.warning}
          onDone={handle.close}
        />
      </Dialog>
    );
  }

  return (
    <Dialog handle={handle} title="Set Up Passkey">
      <div className="space-y-6">
        <Typography variant="body2" intent="muted">
          Use biometrics or your device PIN to sign in
        </Typography>

        {errorMessage && <Alert variant="destructive" title="Error" description={errorMessage} />}

        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Fingerprint className="h-10 w-10 text-primary" />
          </div>
          <Typography variant="body2" intent="muted" align="center" className="max-w-xs">
            {mutation.isPending
              ? 'Follow the prompts on your device to create your passkey...'
              : 'When you click the button below, your device will prompt you to create a passkey using Face ID, Touch ID, or your device PIN.'}
          </Typography>
        </div>

        <Button
          onClick={() => mutation.mutate()}
          className="w-full"
          isLoading={mutation.isPending}
          loadingText="Creating passkey..."
        >
          Create Passkey
        </Button>
      </div>
    </Dialog>
  );
};
