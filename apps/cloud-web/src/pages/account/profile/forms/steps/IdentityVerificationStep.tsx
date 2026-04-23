import { zodResolver } from '@hookform/resolvers/zod';
import type { OTPFormData } from '@schemas/verification';
import { otpSchema } from '@schemas/verification';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { useTimer } from '@vritti/quantum-ui/hooks';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Clock, Mail, Send, Smartphone } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIdentityVerificationStart } from '@/hooks/account/profile/useIdentityVerificationStart';
import { useResendTargetOtp } from '@/hooks/account/profile/useResendTargetOtp';
import { useVerifyIdentity } from '@/hooks/account/profile/useVerifyIdentity';
import { CHANNELS } from '@/services/account/profile.service';

interface IdentityVerificationStepProps {
  contactType: 'email' | 'phone';
  email: string;
  phone: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Step 1 — select method, send OTP, verify identity
export const IdentityVerificationStep: React.FC<IdentityVerificationStepProps> = ({
  contactType,
  email,
  phone,
  onSuccess,
  onCancel,
}) => {
  const defaultChannel = contactType === 'email' ? CHANNELS.IDENTITY_EMAIL : CHANNELS.IDENTITY_PHONE;
  const [selectedChannel, setSelectedChannel] = useState(defaultChannel);
  const [otpSent, setOtpSent] = useState(false);
  const { timer: resendTimer, startTimer } = useTimer();

  const requestMutation = useIdentityVerificationStart();
  const verifyMutation = useVerifyIdentity({
    onSuccess: () => onSuccess(),
  });
  const resendMutation = useResendTargetOtp({
    onSuccess: () => startTimer(45),
  });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' },
  });

  const contactLabel = contactType === 'email' ? 'email address' : 'phone number';

  // Sends OTP via selected channel
  const handleSendOtp = () => {
    requestMutation.mutate(selectedChannel, {
      onSuccess: () => {
        setOtpSent(true);
        startTimer(45);
      },
    });
  };

  const methods = [
    {
      id: CHANNELS.IDENTITY_EMAIL,
      title: 'Verify via Email',
      description: email,
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: CHANNELS.IDENTITY_PHONE,
      title: 'Verify via SMS',
      description: phone,
      icon: <Smartphone className="h-5 w-5" />,
    },
  ];

  // Method selection + Send OTP button
  if (!otpSent) {
    return (
      <div className="space-y-6">
        <Typography variant="body2" align="center" intent="muted">
          Choose how you'd like to verify your identity before changing your {contactLabel}
        </Typography>

        <div className="space-y-3">
          {methods.map((method) => {
            const isSelected = selectedChannel === method.id;
            return (
              <button
                type="button"
                key={method.id}
                onClick={() => setSelectedChannel(method.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 text-left ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}
                >
                  {method.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <Typography variant="body1" className="font-medium text-foreground">
                    {method.title}
                  </Typography>
                  <Typography variant="body2" intent="muted">
                    {method.description}
                  </Typography>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? 'border-primary' : 'border-muted-foreground'}`}
                >
                  {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSendOtp} disabled={requestMutation.isPending}>
            <Send className="h-4 w-4 mr-2" />
            Send OTP
          </Button>
        </div>
      </div>
    );
  }

  // After OTP is sent — show OTP input
  const sentTo = selectedChannel === CHANNELS.IDENTITY_EMAIL ? 'email' : 'phone';

  return (
    <Form
      form={form}
      mutation={verifyMutation}
      transformSubmit={(data) => ({ channel: selectedChannel, otpCode: data.otpCode })}
     
    >
      <FieldGroup>
        <div className="space-y-4">
          <Typography variant="body2">Enter the verification code sent to your {sentTo}</Typography>
          <Field className="flex justify-center">
            <OTPField
              name="otpCode"
              onChange={(value) => {
                if (value.length === 6 && !verifyMutation.isPending) {
                  verifyMutation.mutate({ channel: selectedChannel, otpCode: value });
                }
              }}
            />
          </Field>
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => resendMutation.mutate(selectedChannel)}
              disabled={resendTimer > 0}
            >
              <Clock className="h-4 w-4 mr-2" />
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOtpSent(false);
              form.reset();
            }}
          >
            Change Method
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </FieldGroup>
    </Form>
  );
};
