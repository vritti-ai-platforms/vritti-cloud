import { zodResolver } from '@hookform/resolvers/zod';
import type { OTPFormData } from '@schemas/verification';
import { otpSchema } from '@schemas/verification';
import type { UseMutationResult } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { AxiosError } from 'axios';
import { Clock, Info } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { SuccessResponse } from '@/services/settings/verification.service';

interface OtpVerificationStepProps {
  contactType: 'email' | 'phone';
  newContactValue: string;
  verifyMutation: UseMutationResult<SuccessResponse, AxiosError, { otpCode: string }>;
  onResend: () => void;
  resendTimer: number;
  onSuccess: () => void;
  onBack: () => void;
}

export const OtpVerificationStep: React.FC<OtpVerificationStepProps> = ({
  contactType,
  newContactValue,
  verifyMutation,
  onResend,
  resendTimer,
  onSuccess,
  onBack,
}) => {
  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' },
  });

  const handleSubmit = (data: OTPFormData) => {
    verifyMutation.mutate({ otpCode: data.otpCode }, { onSuccess: () => onSuccess() });
  };

  const spamHint = contactType === 'email' ? 'Check your spam folder' : 'Check your messages';

  return (
    <Form form={form} onSubmit={handleSubmit} mutation={verifyMutation} showRootError>
      <FieldGroup>
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-primary">
            Please enter the 6-digit code sent to <span className="font-semibold">{newContactValue}</span>
          </Typography>
        </div>

        <div className="space-y-4">
          <Field className="flex justify-center">
            <OTPField
              name="otpCode"
              onChange={(value) => {
                if (value.length === 6 && !verifyMutation.isPending) {
                  form.handleSubmit(handleSubmit)();
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
          <Typography variant="body2" intent="muted" className="text-xs text-center">
            Didn't receive it? {spamHint}
          </Typography>
        </div>

        <div className="flex gap-3 justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Verify Code</Button>
        </div>
      </FieldGroup>
    </Form>
  );
};
