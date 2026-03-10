import { zodResolver } from '@hookform/resolvers/zod';
import { useVerifyTotp } from '@hooks/auth';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import type { LoginResponse } from '@services/auth.service';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';

interface TOTPVerificationProps {
  /** MFA session ID for verification */
  sessionId: string;
  /** Callback when TOTP verification succeeds */
  onSuccess: (response: LoginResponse) => void;
}

/**
 * TOTP verification component for MFA login
 *
 * Displays authenticator app icon and 6-digit OTP input field.
 * Automatically submits when 6 digits are entered.
 *
 * Owns its own mutation and uses Form's mutation prop for automatic error handling.
 */
export const TOTPVerification: React.FC<TOTPVerificationProps> = ({ sessionId, onSuccess }) => {
  const verifyTotpMutation = useVerifyTotp({ onSuccess });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  return (
    <div className="space-y-6">
      {/* Icon Container */}
      <div className="flex justify-center">
        <div className="w-[52px] h-[52px] rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Description */}
      <Typography variant="body2" align="center" intent="muted">
        Enter the 6-digit code from your authenticator app
      </Typography>

      {/* OTP Form */}
      <Form
        form={form}
        mutation={verifyTotpMutation}
        transformSubmit={(data) => ({ sessionId, code: data.code })}
        showRootError
      >
        <FieldGroup>
          <div className="flex justify-center">
            <OTPField
              name="code"
              onChange={(value) => {
                if (value.length === 6 && !verifyTotpMutation.isPending) {
                  verifyTotpMutation.mutate({ sessionId, code: value });
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
        </FieldGroup>
      </Form>
    </div>
  );
};
