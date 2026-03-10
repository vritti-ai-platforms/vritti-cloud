import { zodResolver } from '@hookform/resolvers/zod';
import { useInitiateMobileVerification, useVerifyMobileOtp } from '@hooks/onboarding/mobile-verification';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Smartphone } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

interface OTPVerificationStepProps {
  phoneNumber: PhoneValue;
  phoneCountry: string;
  onSuccess: () => void;
  onBack: () => void;
  onChangeNumber: () => void;
}

// 6-digit OTP input - manages own form and mutations
export const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({
  phoneNumber,
  phoneCountry,
  onSuccess,
  onBack,
  onChangeNumber,
}) => {
  // Internal state management
  const [error, setError] = useState<string | null>(null);

  // Form management
  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Verify OTP mutation
  const verifyOtpMutation = useVerifyMobileOtp({
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      const errorMessage = (err.response?.data as { detail?: string })?.detail || 'Invalid verification code';
      setError(errorMessage);
    },
  });

  // Resend verification mutation
  const resendMutation = useInitiateMobileVerification({
    onSuccess: () => {
      setError(null);
      form.reset();
    },
    onError: (err) => {
      const errorMessage = (err.response?.data as { detail?: string })?.detail || 'Failed to resend code';
      setError(errorMessage);
    },
  });

  // Resend handler
  const handleResend = useCallback(() => {
    resendMutation.mutate({
      phone: phoneNumber as string,
      phoneCountry,
      method: 'manual' as const,
    });
  }, [phoneNumber, phoneCountry, resendMutation]);
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your mobile
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Enter the code sent to
        </Typography>
        <Typography variant="body2" align="center" className="text-foreground font-medium">
          {phoneNumber}
        </Typography>
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

      <Form form={form} mutation={verifyOtpMutation} transformSubmit={(data) => data.code} showRootError>
        <FieldGroup>
          <div className="flex justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>

          <Field>
            <FieldLabel className="sr-only">Verification Code</FieldLabel>
            <OTPField
              name="code"
              onChange={(value) => {
                setError(null);
                if (value.length === 6 && !verifyOtpMutation.isPending) {
                  // Auto-submit when 6 digits entered
                  verifyOtpMutation.mutate(value);
                }
              }}
            />
            <Typography variant="body2" intent="muted" className="text-center mt-2">
              Enter the 6-digit code sent via SMS
            </Typography>
          </Field>

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" loadingText="Verifying...">
              Verify & Continue
            </Button>
          </Field>

          <div className="flex justify-center gap-4 text-sm">
            <Button variant="link" className="p-0 h-auto font-normal underline" onClick={onChangeNumber}>
              Change number
            </Button>
            <Button
              variant="link"
              className="p-0 h-auto font-normal underline"
              onClick={handleResend}
              isLoading={resendMutation.isPending}
              loadingText="Sending..."
            >
              Resend code
            </Button>
          </div>
        </FieldGroup>
      </Form>
    </div>
  );
};
