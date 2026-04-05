import { zodResolver } from '@hookform/resolvers/zod';
import { useInitiateTotpSetup, useVerifyTotpSetup } from '@hooks/account/security';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import type { BackupCodesResponse } from '@services/account/security.service';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BackupCodesView } from './BackupCodesView';

interface Props {
  handle: DialogHandle;
}

// Placeholder QR value for the blurred preview
const PLACEHOLDER_QR = 'otpauth://totp/placeholder';

export const TotpSetupDialog: React.FC<Props> = ({ handle }) => {
  const [backupCodes, setBackupCodes] = useState<BackupCodesResponse | null>(null);
  const initMutation = useInitiateTotpSetup();
  const verifyMutation = useVerifyTotpSetup({
    onSuccess: (response) => setBackupCodes(response),
  });
  const totpData = initMutation.isSuccess ? initMutation.data : null;

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  // Show backup codes after successful verification
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
    <Dialog handle={handle} title="Set Up Authenticator App">
      <div className="space-y-6">
        <Typography variant="body2" intent="muted">
          {totpData
            ? 'Scan with Google Authenticator, Authy, or Microsoft Authenticator'
            : 'Tap the QR code to reveal it'}
        </Typography>

        {/* QR code — blurred placeholder until revealed */}
        <div className="flex justify-center">
          <div className="relative p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={totpData ? totpData.keyUri : PLACEHOLDER_QR}
              size={180}
              className={totpData ? '' : 'blur-md'}
            />
            {!totpData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="default"
                  onClick={() => initMutation.mutate()}
                  isLoading={initMutation.isPending}
                  loadingText="Loading..."
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View QR Code
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Manual key — only shown after reveal */}
        {totpData && (
          <div className="px-3 py-2 bg-muted/50 border border-border rounded-lg flex items-center justify-between gap-2">
            <Typography variant="caption" intent="muted" className="shrink-0">
              Manual key:
            </Typography>
            <Typography variant="caption" className="font-mono text-foreground select-all truncate">
              {totpData.manualSetupKey}
            </Typography>
          </div>
        )}

        {/* OTP form — only enabled after reveal */}
        <Form form={form} mutation={verifyMutation} transformSubmit={(data) => data.code} showRootError>
          <FieldGroup>
            <div className="space-y-4">
              <Typography variant="body2" align="center" className="text-foreground font-medium">
                Enter the 6-digit code from your app
              </Typography>
              <div className="flex justify-center">
                <OTPField
                  name="code"
                  disabled={!totpData}
                  onChange={(value) => {
                    if (value.length === 6 && totpData && !verifyMutation.isPending) {
                      verifyMutation.mutate(value);
                    }
                  }}
                />
              </div>
            </div>

            <Field>
              <Button
                type="submit"
                className="w-full"
                loadingText="Verifying..."
                disabled={!totpData}
              >
                Verify & Enable
              </Button>
            </Field>
          </FieldGroup>
        </Form>
      </div>
    </Dialog>
  );
};
