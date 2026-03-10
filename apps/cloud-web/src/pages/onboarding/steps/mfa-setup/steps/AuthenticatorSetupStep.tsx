import { zodResolver } from '@hookform/resolvers/zod';
import { useInitiateTotpSetup, useVerifyTotpSetup } from '@hooks/onboarding/mfa';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import type { BackupCodesResponse } from '@services/onboarding.service';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useForm } from 'react-hook-form';

interface AuthenticatorSetupStepProps {
  onBack: () => void;
  onSuccess: (response: BackupCodesResponse) => void;
}

// Placeholder QR value for the blurred preview
const PLACEHOLDER_QR = 'otpauth://totp/placeholder';

// Authenticator app setup — blurred QR preview, "View QR" fires mutation, then OTP verification
export const AuthenticatorSetupStep: React.FC<AuthenticatorSetupStepProps> = ({ onBack, onSuccess }) => {
  const initMutation = useInitiateTotpSetup();
  const verifyMutation = useVerifyTotpSetup({ onSuccess });
  const totpData = initMutation.isSuccess ? initMutation.data : null;

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={verifyMutation.isPending}
        className="inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to MFA options
      </Button>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Setup Authenticator App
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          {totpData
            ? 'Scan with Google Authenticator, Authy, or Microsoft Authenticator'
            : 'Tap the QR code to reveal it'}
        </Typography>
      </div>

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
              className="w-full bg-primary text-primary-foreground"
              loadingText="Verifying..."
              disabled={!totpData}
            >
              Verify & Continue
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
