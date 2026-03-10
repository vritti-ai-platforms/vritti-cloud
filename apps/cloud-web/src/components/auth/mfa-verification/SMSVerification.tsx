import { zodResolver } from '@hookform/resolvers/zod';
import { useSendSmsCode, useVerifySms } from '@hooks/auth';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import type { LoginResponse } from '@services/auth.service';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Smartphone } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface SMSVerificationProps {
  /** MFA session ID for verification */
  sessionId: string;
  /** Masked phone number (e.g., "+1 *** *** 4567") */
  maskedPhone: string;
  /** Callback when SMS verification succeeds */
  onSuccess: (response: LoginResponse) => void;
}

/**
 * SMS verification component for MFA login
 *
 * Initially shows "Send SMS code" button. After sending,
 * displays OTP input field with verify button and resend link.
 *
 * Owns its own mutations and uses Form's mutation prop for automatic error handling.
 */
export const SMSVerification: React.FC<SMSVerificationProps> = ({ sessionId, maskedPhone, onSuccess }) => {
  const [codeSent, setCodeSent] = useState(false);

  const sendSmsMutation = useSendSmsCode({
    onSuccess: () => setCodeSent(true),
  });

  const verifySmsMutation = useVerifySms({
    onSuccess,
  });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const handleSendCode = () => {
    sendSmsMutation.mutate(sessionId);
  };

  const handleResend = () => {
    sendSmsMutation.mutate(sessionId);
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Icon Container */}
      <div className="flex justify-center">
        <div className="w-[52px] h-[52px] rounded-full bg-primary/10 flex items-center justify-center">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Description */}
      <Typography variant="body2" align="center" intent="muted">
        {codeSent ? `Enter the 6-digit code sent to ${maskedPhone}` : `Send verification code to ${maskedPhone}`}
      </Typography>

      {!codeSent ? (
        /* Send Code Button */
        <Button
          onClick={handleSendCode}
          className="w-full h-9 rounded-[10px] bg-primary text-primary-foreground"
          isLoading={sendSmsMutation.isPending}
          loadingText="Sending..."
        >
          Send SMS code
        </Button>
      ) : (
        /* OTP Form */
        <Form
          form={form}
          mutation={verifySmsMutation}
          transformSubmit={(data) => ({ sessionId, code: data.code })}
          showRootError
        >
          <FieldGroup>
            <div className="flex justify-center">
              <OTPField
                name="code"
                onChange={(value) => {
                  if (value.length === 6 && !verifySmsMutation.isPending) {
                    verifySmsMutation.mutate({ sessionId, code: value });
                  }
                }}
              />
            </div>

            <Field className="pt-2">
              <Button
                type="submit"
                className="w-full h-9 rounded-[10px] bg-primary text-primary-foreground"
                loadingText="Verifying..."
              >
                Verify
              </Button>
            </Field>

            {/* Resend Link */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={handleResend}
                isLoading={sendSmsMutation.isPending}
                loadingText="Sending..."
                disabled={verifySmsMutation.isPending}
              >
                Resend code
              </Button>
            </div>
          </FieldGroup>
        </Form>
      )}
    </div>
  );
};
