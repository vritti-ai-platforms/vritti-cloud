import { useOnboarding } from '@context/onboarding';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSendEmailOtp, useVerifyEmail } from '@hooks/onboarding';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';
import { useForm } from 'react-hook-form';

interface VerifyEmailFormProps {
  onChangeClick: () => void;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({ onChangeClick }) => {
  const { email, refetch } = useOnboarding();

  const verifyEmailMutation = useVerifyEmail({
    onSuccess: async () => {
      // Refetch onboarding status to get updated currentStep
      // OnboardingRouter will render the next step component
      await refetch();
    },
    onError: (error) => {
      console.error('Email verification failed:', error);
    },
  });

  const resendOtpMutation = useSendEmailOtp({
    onSuccess: () => {
      form.reset();
    },
  });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your email
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          We've sent a verification code to
        </Typography>
        <div className="flex items-center justify-center gap-2">
          <Typography variant="body2" align="center" className="text-foreground font-medium">
            {email}
          </Typography>
          <Button variant="link" onClick={onChangeClick}>
            Change
          </Button>
        </div>
      </div>

      <Form form={form} mutation={verifyEmailMutation} transformSubmit={(data: OTPFormData) => data.code} showRootError>
        <FieldGroup>
          <Field>
            <FieldLabel className="sr-only">Verification Code</FieldLabel>
            <OTPField
              name="code"
              onChange={(value) => {
                if (value.length === 6) {
                  form.handleSubmit((data) => verifyEmailMutation.mutateAsync(data.code))();
                }
              }}
            />
            <Typography variant="body2" intent="muted" className="text-center mt-2">
              Enter the 6-digit verification code
            </Typography>
          </Field>

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground">
              Verify Email
            </Button>
          </Field>

          <Typography variant="body2" align="center" intent="muted" className="text-center">
            Didn't receive the code?{' '}
            <Button
              variant="link"
              onClick={() => {
                form.clearErrors();
                resendOtpMutation.mutate();
              }}
              isLoading={resendOtpMutation.isPending}
              loadingText="Sending..."
              disabled={verifyEmailMutation.isPending}
            >
              Resend
            </Button>
          </Typography>
        </FieldGroup>
      </Form>
    </div>
  );
};
