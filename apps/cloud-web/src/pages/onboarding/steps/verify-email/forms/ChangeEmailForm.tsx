import { useOnboarding } from '@context/onboarding';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChangeEmail } from '@hooks/onboarding';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const changeEmailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

interface ChangeEmailFormProps {
  onBack: () => void;
}

export const ChangeEmailForm: React.FC<ChangeEmailFormProps> = ({ onBack }) => {
  const { email, refetch } = useOnboarding();

  const changeEmailMutation = useChangeEmail({
    onSuccess: async () => {
      // Refetch onboarding status so the new email is reflected in context
      await refetch();
      onBack();
    },
  });

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Change your email
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Current email: <span className="text-foreground font-medium">{email}</span>
        </Typography>
      </div>

      <Form form={form} mutation={changeEmailMutation} transformSubmit={(data: ChangeEmailFormData) => data.email}>
        <FieldGroup className="gap-4">
          <TextField name="email" label="New Email Address" placeholder="Enter your new email" type="email" />

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" loadingText="Updating...">
              Update Email
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
