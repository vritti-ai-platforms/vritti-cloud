import { zodResolver } from '@hookform/resolvers/zod';
import { useResendTimer } from '@hooks/cloud/account/useResendTimer';
import type { NewEmailFormData } from '@schemas/verification';
import { newEmailSchema } from '@schemas/verification';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Info } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContactChangeProgressIndicator } from '@/components/cloud/account/profile/ContactChangeProgressIndicator';
import { useRequestEmailChange } from '@/hooks/cloud/account/useRequestEmailChange';
import { useRequestEmailIdentityVerification } from '@/hooks/cloud/account/useRequestEmailIdentityVerification';
import { useResendEmailOtp } from '@/hooks/cloud/account/useResendEmailOtp';
import { useVerifyEmailChange } from '@/hooks/cloud/account/useVerifyEmailChange';
import { useVerifyEmailIdentity } from '@/hooks/cloud/account/useVerifyEmailIdentity';
import { ContactChangeSuccessStep } from './steps/ContactChangeSuccessStep';
import { IdentityVerificationStep } from './steps/IdentityVerificationStep';
import { OtpVerificationStep } from './steps/OtpVerificationStep';

type EmailStep = 'identity' | 'newEmail' | 'verify' | 'success';

// Maps email dialog steps to the shared progress indicator step names
const STEP_MAP: Record<EmailStep, 'identity' | 'newContact' | 'verify' | 'success'> = {
  identity: 'identity',
  newEmail: 'newContact',
  verify: 'verify',
  success: 'success',
};

interface Props {
  onClose: () => void;
  currentEmail: string;
}

// Conditionally mounted by parent — fires identity verification on mount
export const EmailVerificationDialog: React.FC<Props> = ({ onClose, currentEmail }) => {
  const [step, setStep] = useState<EmailStep>('identity');
  const [newEmail, setNewEmail] = useState('');
  const { timer: resendTimer, startTimer } = useResendTimer();

  // Mutations
  const requestIdentityMutation = useRequestEmailIdentityVerification();
  const verifyIdentityMutation = useVerifyEmailIdentity();
  const requestChangeMutation = useRequestEmailChange({
    onSuccess: (_result, variables) => {
      setNewEmail(variables.newEmail);
      setStep('verify');
      startTimer(45);
    },
  });
  const verifyChangeMutation = useVerifyEmailChange();
  const resendOtpMutation = useResendEmailOtp({
    onSuccess: () => startTimer(45),
  });

  // New email form
  const emailForm = useForm<NewEmailFormData>({
    resolver: zodResolver(newEmailSchema),
    defaultValues: { newEmail: '' },
  });

  const handleResend = () => resendOtpMutation.mutate();

  const stepTitle = {
    identity: 'Confirm Your Identity',
    newEmail: 'Enter New Email Address',
    verify: 'Verify New Email Address',
    success: 'Email Address Updated Successfully',
  }[step];

  const stepDescription =
    step !== 'success'
      ? {
          identity: 'We need to verify your identity before making changes',
          newEmail: 'Enter the new email address you want to use',
          verify: 'Enter the verification code sent to your new email',
        }[step]
      : undefined;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={stepTitle}
      description={stepDescription}
    >
      <div className="space-y-6">
        <ContactChangeProgressIndicator contactType="email" currentStep={STEP_MAP[step]} />

        {step === 'identity' && (
          <IdentityVerificationStep
            contactType="email"
            contactValue={currentEmail}
            requestMutation={requestIdentityMutation}
            verifyMutation={verifyIdentityMutation}
            onResend={handleResend}
            resendTimer={resendTimer}
            onOtpSent={() => startTimer(45)}
            onSuccess={() => setStep('newEmail')}
            onCancel={onClose}
          />
        )}

        {step === 'newEmail' && (
          <Form
            form={emailForm}
            onSubmit={(data) => requestChangeMutation.mutate({ newEmail: data.newEmail })}
            mutation={requestChangeMutation}
            showRootError
          >
            <FieldGroup>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <Typography variant="body2" className="text-primary">
                  Your current email will remain active until you verify the new one
                </Typography>
              </div>

              <TextField label="Current Email" value={currentEmail} disabled readOnly />
              <TextField name="newEmail" label="New Email" placeholder="newemail@example.com" />

              <div className="flex gap-3 justify-between">
                <Button type="button" variant="outline" onClick={() => setStep('identity')}>
                  Back
                </Button>
                <Button type="submit">Send Verification Code</Button>
              </div>
            </FieldGroup>
          </Form>
        )}

        {step === 'verify' && (
          <OtpVerificationStep
            contactType="email"
            newContactValue={newEmail}
            verifyMutation={verifyChangeMutation}
            onResend={handleResend}
            resendTimer={resendTimer}
            onSuccess={() => setStep('success')}
            onBack={() => setStep('newEmail')}
          />
        )}

        {step === 'success' && (
          <ContactChangeSuccessStep contactType="email" newContactValue={newEmail} onClose={onClose} />
        )}
      </div>
    </Dialog>
  );
};
