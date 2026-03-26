import { zodResolver } from '@hookform/resolvers/zod';
import { useResendTimer } from '@hooks/cloud/account/useResendTimer';
import type { NewPhoneFormData } from '@schemas/verification';
import { newPhoneSchema } from '@schemas/verification';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Info } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContactChangeProgressIndicator } from '@/components/cloud/account/profile/ContactChangeProgressIndicator';
import { useRequestPhoneChange } from '@/hooks/cloud/account/useRequestPhoneChange';
import { useRequestPhoneIdentityVerification } from '@/hooks/cloud/account/useRequestPhoneIdentityVerification';
import { useResendPhoneOtp } from '@/hooks/cloud/account/useResendPhoneOtp';
import { useVerifyPhoneChange } from '@/hooks/cloud/account/useVerifyPhoneChange';
import { useVerifyPhoneIdentity } from '@/hooks/cloud/account/useVerifyPhoneIdentity';
import { ContactChangeSuccessStep } from './steps/ContactChangeSuccessStep';
import { IdentityVerificationStep } from './steps/IdentityVerificationStep';
import { OtpVerificationStep } from './steps/OtpVerificationStep';

type PhoneStep = 'identity' | 'newPhone' | 'verify' | 'success';

// Maps phone dialog steps to the shared progress indicator step names
const STEP_MAP: Record<PhoneStep, 'identity' | 'newContact' | 'verify' | 'success'> = {
  identity: 'identity',
  newPhone: 'newContact',
  verify: 'verify',
  success: 'success',
};

interface Props {
  onClose: () => void;
  currentPhone: PhoneValue;
  currentCountry: string;
}

// Conditionally mounted by parent — fires identity verification on mount
export const PhoneVerificationDialog: React.FC<Props> = ({ onClose, currentPhone, currentCountry }) => {
  const [step, setStep] = useState<PhoneStep>('identity');
  const [newPhone, setNewPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState(currentCountry);
  const { timer: resendTimer, startTimer } = useResendTimer();

  // Mutations
  const requestIdentityMutation = useRequestPhoneIdentityVerification();
  const verifyIdentityMutation = useVerifyPhoneIdentity();
  const requestChangeMutation = useRequestPhoneChange({
    onSuccess: (_result, variables) => {
      setNewPhone(variables.newPhone);
      setStep('verify');
      startTimer(45);
    },
  });
  const verifyChangeMutation = useVerifyPhoneChange();
  const resendOtpMutation = useResendPhoneOtp({
    onSuccess: () => startTimer(45),
  });

  // New phone form
  const phoneForm = useForm<NewPhoneFormData>({
    resolver: zodResolver(newPhoneSchema),
    defaultValues: { newPhone: '', phoneCountry: currentCountry },
  });

  const handleResend = () => resendOtpMutation.mutate();

  const stepTitle = {
    identity: 'Confirm Your Identity',
    newPhone: 'Enter New Phone Number',
    verify: 'Verify New Phone Number',
    success: 'Phone Number Updated Successfully',
  }[step];

  const stepDescription =
    step !== 'success'
      ? {
          identity: 'We need to verify your identity before making changes',
          newPhone: 'Enter the new phone number you want to use',
          verify: 'Enter the verification code sent to your new phone',
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
        <ContactChangeProgressIndicator contactType="phone" currentStep={STEP_MAP[step]} />

        {step === 'identity' && (
          <IdentityVerificationStep
            contactType="phone"
            contactValue={currentPhone as string}
            requestMutation={requestIdentityMutation}
            verifyMutation={verifyIdentityMutation}
            onResend={handleResend}
            resendTimer={resendTimer}
            onOtpSent={() => startTimer(45)}
            onSuccess={() => setStep('newPhone')}
            onCancel={onClose}
          />
        )}

        {step === 'newPhone' && (
          <Form
            form={phoneForm}
            onSubmit={(data) =>
              requestChangeMutation.mutate({ newPhone: data.newPhone, newPhoneCountry: phoneCountry })
            }
            mutation={requestChangeMutation}
            showRootError
          >
            <FieldGroup>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <Typography variant="body2" className="text-primary">
                  Your current phone will remain active until you verify the new one
                </Typography>
              </div>

              <PhoneField
                label="Current Phone"
                value={currentPhone}
                defaultCountry={currentCountry as never}
                disabled
              />

              <PhoneField
                name="newPhone"
                label="New Phone Number"
                onChange={(value) => {
                  if (typeof value === 'object' && value !== null && 'country' in value) {
                    setPhoneCountry((value as { country?: string }).country || 'IN');
                  }
                }}
              />

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
            contactType="phone"
            newContactValue={newPhone}
            verifyMutation={verifyChangeMutation}
            onResend={handleResend}
            resendTimer={resendTimer}
            onSuccess={() => setStep('success')}
            onBack={() => setStep('newPhone')}
          />
        )}

        {step === 'success' && (
          <ContactChangeSuccessStep
            contactType="phone"
            newContactValue={newPhone}
            onClose={onClose}
          />
        )}
      </div>
    </Dialog>
  );
};
