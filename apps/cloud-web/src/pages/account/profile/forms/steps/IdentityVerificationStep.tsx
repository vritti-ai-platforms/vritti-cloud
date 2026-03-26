import { zodResolver } from '@hookform/resolvers/zod';
import type { OTPFormData } from '@schemas/verification';
import { otpSchema } from '@schemas/verification';
import type { UseMutationResult } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { AxiosError } from 'axios';
import { Clock, Info, Send } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { IdentityVerificationResponse, SuccessResponse } from '@/services/account/verification.service';

interface IdentityVerificationStepProps {
  contactType: 'email' | 'phone';
  contactValue: string;
  requestMutation: UseMutationResult<IdentityVerificationResponse, AxiosError, void>;
  verifyMutation: UseMutationResult<SuccessResponse, AxiosError, { otpCode: string }>;
  onResend: () => void;
  resendTimer: number;
  onOtpSent: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

// Identity verification step — first sends OTP, then verifies it
export const IdentityVerificationStep: React.FC<IdentityVerificationStepProps> = ({
  contactType,
  contactValue,
  requestMutation,
  verifyMutation,
  onResend,
  resendTimer,
  onOtpSent,
  onSuccess,
  onCancel,
}) => {
  const [otpSent, setOtpSent] = useState(false);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' },
  });

  const contactLabel = contactType === 'email' ? 'email address' : 'phone number';

  // Sends OTP to current contact
  const handleSendOtp = () => {
    requestMutation.mutate(undefined, {
      onSuccess: () => {
        setOtpSent(true);
        onOtpSent();
      },
    });
  };

  // Verifies the OTP code
  const handleVerify = (data: OTPFormData) => {
    verifyMutation.mutate({ otpCode: data.otpCode }, { onSuccess: () => onSuccess() });
  };

  // Before OTP is sent — show info + send button
  if (!otpSent) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-primary">
            For your security, we need to verify your identity before changing your {contactLabel}
          </Typography>
        </div>

        <div className="space-y-2">
          <Typography variant="body2">Current {contactType === 'email' ? 'Email' : 'Phone'}</Typography>
          <Typography variant="body1" className="font-semibold">
            {contactValue}
          </Typography>
        </div>

        <Typography variant="body2" intent="muted">
          We'll send a 6-digit verification code to your current {contactType} to confirm your identity.
        </Typography>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSendOtp} disabled={requestMutation.isPending}>
            <Send className="h-4 w-4 mr-2" />
            Send Verification Code
          </Button>
        </div>
      </div>
    );
  }

  // After OTP is sent — show OTP input
  return (
    <Form form={form} onSubmit={handleVerify} mutation={verifyMutation} showRootError>
      <FieldGroup>
        <div className="space-y-2">
          <Typography variant="body2">Current {contactType === 'email' ? 'Email' : 'Phone'}</Typography>
          <Typography variant="body1" className="font-semibold">
            {contactValue}
          </Typography>
        </div>

        <div className="space-y-4">
          <Typography variant="body2">Enter the verification code sent to your {contactType}</Typography>
          <Field className="flex justify-center">
            <OTPField
              name="otpCode"
              onChange={(value) => {
                if (value.length === 6 && !verifyMutation.isPending) {
                  form.handleSubmit(handleVerify)();
                }
              }}
            />
          </Field>
          <div className="flex items-center justify-center">
            <Button type="button" variant="ghost" size="sm" onClick={onResend} disabled={resendTimer > 0}>
              <Clock className="h-4 w-4 mr-2" />
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </FieldGroup>
    </Form>
  );
};
