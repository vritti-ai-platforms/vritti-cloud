import { useResendOAuthOtp, useVerifyOAuthEmail } from '@hooks/auth';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import { toast } from '@vritti/quantum-ui';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Verifies email ownership before linking an OAuth provider whose email the provider did not verify (e.g. Facebook)
export const OAuthVerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email');
  const provider = searchParams.get('provider');
  const providerLabel = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'your provider';

  const verifyMutation = useVerifyOAuthEmail({
    onSuccess: (data) => {
      // Full navigation so the app re-evaluates auth status with the newly upgraded session cookie
      window.location.assign(data.requiresOnboarding ? '/onboarding' : '/');
    },
  });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  const resendMutation = useResendOAuthOtp({
    onSuccess: () => {
      form.clearErrors();
      form.reset();
      toast.success('A new verification code has been sent to your email.');
    },
  });

  // Guard against direct visits without the server redirect context
  if (!email) {
    return (
      <div className="text-center space-y-6">
        <Typography variant="h4" align="center" className="text-foreground">
          Nothing to verify
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Please sign in again to continue.
        </Typography>
        <Button
          onClick={() => navigate('/login', { replace: true })}
          className="w-full bg-primary text-primary-foreground"
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/15">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your email
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          An account already uses this email. Enter the code we sent to confirm it's you before linking {providerLabel}.
        </Typography>
        <Typography variant="body2" align="center" className="text-foreground font-medium">
          {email}
        </Typography>
      </div>

      <Form form={form} mutation={verifyMutation} transformSubmit={(data: OTPFormData) => data.code}>
        <FieldGroup>
          <Field>
            <FieldLabel className="sr-only">Verification Code</FieldLabel>
            <OTPField
              name="code"
              onChange={(value) => {
                if (value.length === 6) {
                  form.handleSubmit((data) => verifyMutation.mutateAsync(data.code))();
                }
              }}
            />
            <Typography variant="body2" intent="muted" className="text-center mt-2">
              Enter the 6-digit verification code
            </Typography>
          </Field>

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground">
              Verify & Continue
            </Button>
          </Field>

          <div className="text-center space-y-1">
            <Typography variant="body2" align="center" intent="muted" className="text-center">
              Didn't receive the code?{' '}
              <Button
                variant="link"
                onClick={() => {
                  form.clearErrors();
                  resendMutation.mutate();
                }}
                isLoading={resendMutation.isPending}
                loadingText="Sending..."
                disabled={verifyMutation.isPending}
              >
                Resend
              </Button>
            </Typography>
            <Typography variant="caption" align="center" intent="muted" className="text-center">
              Wrong account?{' '}
              <Button variant="link" onClick={() => navigate('/login', { replace: true })}>
                Start over
              </Button>
            </Typography>
          </div>
        </FieldGroup>
      </Form>
    </div>
  );
};
