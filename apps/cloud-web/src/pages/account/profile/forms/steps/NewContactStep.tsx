import { zodResolver } from '@hookform/resolvers/zod';
import type { NewEmailFormData, NewPhoneFormData } from '@schemas/verification';
import { newEmailSchema, newPhoneSchema } from '@schemas/verification';
import { Button } from '@vritti/quantum-ui/Button';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Info } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useSubmitNewTarget } from '@/hooks/account/profile/useSubmitNewTarget';
import { CHANNELS } from '@/services/account/profile.service';

interface NewContactStepProps {
  contactType: 'email' | 'phone';
  currentValue: string;
  onSuccess: (newValue: string) => void;
}

// Step 2 — enter new email or phone, submit sends OTP to it
export const NewContactStep: React.FC<NewContactStepProps> = ({ contactType, currentValue, onSuccess }) => {
  const targetChannel = contactType === 'email' ? CHANNELS.EMAIL : CHANNELS.PHONE;

  const submitMutation = useSubmitNewTarget({
    onSuccess: (_result, variables) => {
      onSuccess(variables.target);
    },
  });

  const emailForm = useForm<NewEmailFormData>({
    resolver: zodResolver(newEmailSchema),
    defaultValues: { newEmail: '' },
  });

  const phoneForm = useForm<NewPhoneFormData>({
    resolver: zodResolver(newPhoneSchema),
    defaultValues: { newPhone: '', phoneCountry: 'IN' },
  });

  if (contactType === 'email') {
    return (
      <Form
        form={emailForm}
        mutation={submitMutation}
        transformSubmit={(data) => ({ channel: targetChannel, target: data.newEmail })}
       
      >
        <FieldGroup>
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <Typography variant="body2" className="text-primary">
              Your current email will remain active until you verify the new one
            </Typography>
          </div>

          <TextField label="Current Email" value={currentValue} disabled readOnly />
          <TextField name="newEmail" label="New Email" placeholder="newemail@example.com" />

          <div className="flex gap-3 justify-end">
            <Button type="submit">Send Verification Code</Button>
          </div>
        </FieldGroup>
      </Form>
    );
  }

  return (
    <Form
      form={phoneForm}
      mutation={submitMutation}
      transformSubmit={(data) => ({ channel: targetChannel, target: data.newPhone })}
     
    >
      <FieldGroup>
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-primary">
            Your current phone will remain active until you verify the new one
          </Typography>
        </div>

        <PhoneField label="Current Phone" value={currentValue as PhoneValue} defaultCountry="IN" disabled />
        <PhoneField name="newPhone" label="New Phone Number" />

        <div className="flex gap-3 justify-end">
          <Button type="submit">Send Verification Code</Button>
        </div>
      </FieldGroup>
    </Form>
  );
};
