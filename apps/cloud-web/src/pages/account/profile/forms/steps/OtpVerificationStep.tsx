import { zodResolver } from '@hookform/resolvers/zod';
import type { OTPFormData } from '@schemas/verification';
import { otpSchema } from '@schemas/verification';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { useTimer } from '@vritti/quantum-ui/hooks';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Clock, Info } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useResendTargetOtp } from '@/hooks/account/profile/useResendTargetOtp';
import { useVerifyNewTarget } from '@/hooks/account/profile/useVerifyNewTarget';
import { CHANNELS } from '@/services/account/profile.service';

interface OtpVerificationStepProps {
  contactType: 'email' | 'phone';
  newContactValue: string;
  onSuccess: () => void;
  onBack: () => void;
}

// Step 3 — verify OTP sent to new contact
export const OtpVerificationStep: React.FC<OtpVerificationStepProps> = ({
  contactType,
  newContactValue,
  onSuccess,
  onBack,
}) => {
  const targetChannel = contactType === 'email' ? CHANNELS.EMAIL : CHANNELS.PHONE;
  const { timer: resendTimer, startTimer } = useTimer(45);

  const verifyMutation = useVerifyNewTarget({
    onSuccess: () => onSuccess(),
  });
  const resendMutation = useResendTargetOtp({
    onSuccess: () => startTimer(45),
  });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' },
  });

  const spamHint = contactType === 'email' ? 'Check your spam folder' : 'Check your messages';

  return (
    <Form
      form={form}
      mutation={verifyMutation}
      transformSubmit={(data) => ({ channel: targetChannel, otpCode: data.otpCode })}
      showRootError
    >
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
                  verifyMutation.mutate({ channel: targetChannel, otpCode: value });
                }
              }}
            />
          </Field>
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => resendMutation.mutate(targetChannel)}
              disabled={resendTimer > 0}
            >
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
