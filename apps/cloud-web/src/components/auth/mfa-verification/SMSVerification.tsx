import { useSendSmsCode, useVerifySms } from '@hooks/auth';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import type { LoginResponse } from '@services/auth.service';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Smartphone } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface SMSVerificationProps {
  sessionId: string;
  maskedPhone: string;
  onSuccess: (response: LoginResponse) => void;
}

// SMS verification component for MFA login — send code, then OTP input with verify and resend.
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
        <div className="size-13 rounded-full bg-primary/10 flex items-center justify-center">
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
          className="w-full h-9 rounded-lg bg-primary text-primary-foreground"
          isLoading={sendSmsMutation.isPending}
          loadingText="Sending..."
        >
          Send SMS code
        </Button>
      ) : (
        /* OTP Form */
        <Form form={form} mutation={verifySmsMutation} transformSubmit={(data) => ({ sessionId, code: data.code })}>
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
                className="w-full h-9 rounded-lg bg-primary text-primary-foreground"
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
