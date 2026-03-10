import { zodResolver } from '@hookform/resolvers/zod';
import { useInitiateMobileVerification } from '@hooks/onboarding/mobile-verification';
import type { PhoneFormData } from '@schemas/auth';
import { phoneSchema } from '@schemas/auth';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

interface PhoneInputStepProps {
  onSuccess: (phoneNumber: PhoneValue, phoneCountry: string) => void;
  onBack: () => void;
}

// Phone number input form - manages own form and mutation
export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({ onSuccess, onBack }) => {
  // Form management
  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
      phoneCountry: 'IN',
    },
  });

  // Initiate verification mutation
  const initiateMutation = useInitiateMobileVerification({
    onSuccess: () => {
      const phone = form.getValues('phone');
      const phoneCountry = form.getValues('phoneCountry');
      onSuccess(phone as PhoneValue, phoneCountry);
    },
  });
  return (
    <div className="space-y-6">
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to methods
      </Link>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Enter your mobile number
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          We'll send you a verification code
        </Typography>
      </div>

      <Form
        form={form}
        mutation={initiateMutation}
        transformSubmit={(data) => ({
          phone: data.phone,
          phoneCountry: data.phoneCountry,
          method: 'manual' as const,
        })}
        showRootError
      >
        <FieldGroup>
          <PhoneField name="phone" label="Phone Number" defaultCountry="IN" />

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" loadingText="Sending Code...">
              Send Code
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
