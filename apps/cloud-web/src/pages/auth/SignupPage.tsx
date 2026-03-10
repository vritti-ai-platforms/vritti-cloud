import { AuthDivider } from '@components/auth/AuthDivider';
import { SocialAuthButtons } from '@components/auth/SocialAuthButtons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '@hooks/auth';
import type { SignupFormData } from '@schemas/auth';
import { signupSchema } from '@schemas/auth';
import { scheduleTokenRefresh, setToken } from '@vritti/quantum-ui/axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Lock, Mail, User } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const signupMutation = useSignup({
    onSuccess: (response) => {
      // Store access token (setToken automatically dispatches auth-state-change event)
      if (response.accessToken) {
        setToken(response.accessToken);
        // Schedule proactive token refresh
        if (response.expiresIn) {
          scheduleTokenRefresh(response.expiresIn);
        }
      }

      // Navigate to success page with email in URL and state flag
      const email = form.getValues('email');
      navigate(`../auth-success?email=${encodeURIComponent(email)}`, {
        state: { isEmail: true },
      });
    },
  });

  const password = form.watch('password');

  const handleLoginInstead = () => {
    const email = form.getValues('email');
    navigate('../login', { state: { email } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Create your account
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Get started with Vritti AI Cloud
        </Typography>
      </div>

      {/* Form */}
      <Form
        form={form}
        mutation={signupMutation}
        transformSubmit={(data: SignupFormData) => ({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
        })}
        showRootError
        rootErrorAction={
          <Button size="xs" variant="default" onClick={handleLoginInstead}>
            Login
          </Button>
        }
      >
        <FieldGroup>
          {/* Full Name */}
          <TextField
            name="fullName"
            label="Full Name"
            placeholder="John Doe"
            startAdornment={<User className="h-3.5 w-3.5 text-muted-foreground" />}
          />

          {/* Work Email */}
          <TextField
            name="email"
            label="Work Email"
            type="email"
            placeholder="you@company.com"
            startAdornment={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
          />

          {/* Password */}
          <PasswordField
            name="password"
            label="Password"
            placeholder="password"
            startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            showStrengthIndicator
          />

          {/* Confirm Password */}
          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            placeholder="password"
            startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            showMatchIndicator
            matchPassword={password}
          />

          {/* Submit Button */}
          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground">
              Create Account
            </Button>
          </Field>

          {/* Terms and Conditions */}
          <Typography variant="body2" align="center" intent="muted" className="text-center">
            By creating an account, you agree to our{' '}
            <Button variant="link" className="p-0 h-auto font-normal">
              <a href="https://vrittiai.com/terms" target="_blank" rel="noopener noreferrer">
                Terms
              </a>
            </Button>{' '}
            &{' '}
            <Button variant="link" className="p-0 h-auto font-normal">
              <a href="https://vrittiai.com/privacy-policy" target="_blank" rel="noopener noreferrer">
                Privacy
              </a>
            </Button>
          </Typography>
        </FieldGroup>
      </Form>

      {/* Divider */}
      <AuthDivider />

      {/* Social Auth */}
      <SocialAuthButtons />

      {/* Footer */}
      <div className="text-center">
        <Typography variant="body2" align="center" intent="muted">
          Already have an account?{' '}
          <Button variant="link" className="p-0 h-auto font-medium">
            <Link to="../login">Login</Link>
          </Button>
        </Typography>
      </div>
    </div>
  );
};
