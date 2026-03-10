import { useOnboarding } from '@context/onboarding';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSetPassword } from '@hooks/onboarding';
import type { SetPasswordFormData } from '@schemas/auth';
import { setPasswordSchema } from '@schemas/auth';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Check, Lock } from 'lucide-react';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';

export const SetPasswordStep: React.FC = () => {
  const { refetch } = useOnboarding();
  const setPasswordMutation = useSetPassword({
    onSuccess: refetch,
  });

  const form = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control: form.control, name: 'password' }) || '';

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    {
      label: 'Uppercase, lowercase & number',
      met: /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Create a password
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Secure your account with a password
        </Typography>
      </div>

      <Form form={form} mutation={setPasswordMutation} transformSubmit={(data) => data.password} showRootError>
        <FieldGroup>
          <PasswordField
            name="password"
            label="Password"
            placeholder="Enter password"
            startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            showStrengthIndicator
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            showMatchIndicator
            matchPassword={password}
          />

          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            {passwordRequirements.map((req) => (
              <div key={req.label} className="flex items-center gap-2 text-sm">
                <div
                  className={`flex items-center justify-center w-4 h-4 rounded-full ${
                    req.met ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'
                  }`}
                >
                  {req.met && <Check className="w-3 h-3" />}
                </div>
                <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>{req.label}</span>
              </div>
            ))}
          </div>

          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              loadingText="Setting Password..."
            >
              Set Password
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
