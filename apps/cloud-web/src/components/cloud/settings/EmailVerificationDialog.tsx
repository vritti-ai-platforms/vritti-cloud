import { zodResolver } from '@hookform/resolvers/zod';
import { newEmailSchema, otpSchema } from '@schemas/verification';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { useEmailChangeFlow } from '@/hooks/cloud/settings/useEmailChangeFlow';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export const EmailVerificationDialog: React.FC<Props> = ({ isOpen, onClose, currentEmail }) => {
  const {
    state,
    resendTimer,
    startFlow,
    identityMutation,
    changeEmailMutation,
    verifyEmailMutation,
    handleResendOtp,
    goBack,
    reset,
  } = useEmailChangeFlow(currentEmail);

  const [redirectTimer, setRedirectTimer] = useState(3);

  // Auto-start flow when dialog opens
  useEffect(() => {
    if (isOpen) {
      startFlow();
    } else {
      reset();
    }
  }, [isOpen, startFlow, reset]);

  // Success auto-redirect countdown
  useEffect(() => {
    if (state.step === 'success' && redirectTimer > 0) {
      const timer = setTimeout(() => setRedirectTimer(redirectTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (state.step === 'success' && redirectTimer === 0) {
      onClose();
    }
  }, [state.step, redirectTimer, onClose]);

  // Step 1: Identity Confirmation Form
  const identityForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  // Step 2: New Email Form
  const emailForm = useForm<z.infer<typeof newEmailSchema>>({
    resolver: zodResolver(newEmailSchema),
    defaultValues: { newEmail: '' },
  });

  // Step 3: Verification Form
  const verifyForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  // Calculate progress percentage
  const progress = {
    identity: 25,
    newEmail: 50,
    verify: 75,
    success: 100,
  }[state.step];

  const stepTitle = {
    identity: 'Confirm Your Identity',
    newEmail: 'Enter New Email Address',
    verify: 'Verify New Email Address',
    success: 'Email Address Updated Successfully',
  }[state.step];

  const stepDescription =
    state.step !== 'success'
      ? {
          identity: 'We need to verify your identity before making changes',
          newEmail: 'Enter the new email address you want to use',
          verify: 'Enter the verification code sent to your new email',
        }[state.step]
      : undefined;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={stepTitle}
      description={stepDescription}
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <Typography variant="body2" intent="muted" className="text-xs text-right">
            {progress}%
          </Typography>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <Typography variant="body2" className="text-destructive">
              {state.error}
            </Typography>
          </div>
        )}

        {/* Step 1: Identity Confirmation */}
        {state.step === 'identity' && (
          <Form form={identityForm} mutation={identityMutation} showRootError>
            <FieldGroup>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <Typography variant="body2" className="text-primary">
                  For your security, please verify your identity before changing your email address
                </Typography>
              </div>

              <div className="space-y-2">
                <Typography variant="body2">Current Email</Typography>
                <Typography variant="body1" className="font-semibold">
                  {currentEmail}
                </Typography>
              </div>

              <div className="space-y-4">
                <Typography variant="body2">Enter the verification code sent to your email</Typography>
                <Field className="flex justify-center">
                  <OTPField
                    name="code"
                    onChange={(value) => {
                      if (value.length === 6) {
                        identityForm.handleSubmit((data) => identityMutation.mutateAsync(data))();
                      }
                    }}
                  />
                </Field>
                <div className="flex items-center justify-center">
                  <Button type="button" variant="ghost" size="sm" onClick={handleResendOtp} disabled={resendTimer > 0}>
                    <Clock className="h-4 w-4 mr-2" />
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </FieldGroup>
          </Form>
        )}

        {/* Step 2: New Email */}
        {state.step === 'newEmail' && (
          <Form form={emailForm} mutation={changeEmailMutation} showRootError>
            <FieldGroup>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <Typography variant="body2" className="text-primary">
                  Your current email will remain active until you verify the new one
                </Typography>
              </div>

              <TextField label="Current Email" value={currentEmail} disabled readOnly />

              <TextField name="newEmail" label="New Email" placeholder="newemail@example.com" />

              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <Typography variant="body2" className="text-primary">
                  Change requests: {state.changeRequestsToday}/3 today
                </Typography>
              </div>

              <div className="flex gap-3 justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button type="submit">Send Verification Code</Button>
              </div>
            </FieldGroup>
          </Form>
        )}

        {/* Step 3: Verify New Email */}
        {state.step === 'verify' && (
          <Form form={verifyForm} mutation={verifyEmailMutation} showRootError>
            <FieldGroup>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <Typography variant="body2" className="text-primary">
                  Please enter the 6-digit code sent to <span className="font-semibold">{state.newEmail}</span>
                </Typography>
              </div>

              <div className="space-y-4">
                <Field className="flex justify-center">
                  <OTPField
                    name="code"
                    onChange={(value) => {
                      if (value.length === 6) {
                        verifyForm.handleSubmit((data) => verifyEmailMutation.mutateAsync(data))();
                      }
                    }}
                  />
                </Field>
                <div className="flex items-center justify-center">
                  <Button type="button" variant="ghost" size="sm" onClick={handleResendOtp} disabled={resendTimer > 0}>
                    <Clock className="h-4 w-4 mr-2" />
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                  </Button>
                </div>
                <Typography variant="body2" intent="muted" className="text-xs text-center">
                  Didn't receive it? Check your spam folder
                </Typography>
              </div>

              <div className="flex gap-3 justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button type="submit">Verify Code</Button>
              </div>
            </FieldGroup>
          </Form>
        )}

        {/* Step 4: Success */}
        {state.step === 'success' && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-18 w-18 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>

            <div className="space-y-2">
              <Typography variant="body1">Your email has been successfully changed to</Typography>
              <Typography variant="body1" className="font-semibold">
                {state.newEmail}
              </Typography>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <Typography variant="body2" className="text-primary text-left">
                For your security, we sent a notification to your previous email ({currentEmail}) with a revert link
                valid for 72 hours
              </Typography>
            </div>

            <Typography variant="body2" intent="muted">
              <Clock className="h-4 w-4 inline mr-2" />
              Redirecting to profile in {redirectTimer} seconds...
            </Typography>

            <Button onClick={onClose} className="w-full">
              Close Dialog
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
