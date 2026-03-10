import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@hooks/auth';
import { scheduleTokenRefresh, setToken } from '@vritti/quantum-ui/axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Lock, Mail } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthDivider } from '../../components/auth/AuthDivider';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import type { LoginFormData } from '../../schemas/auth';
import { loginSchema } from '../../schemas/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin({
    onSuccess: (response) => {
      // Check if MFA is required
      if (response.requiresMfa && response.mfaChallenge) {
        // Navigate to MFA verification with challenge data
        navigate('../mfa-verify', {
          state: { mfaChallenge: response.mfaChallenge },
          replace: true,
        });
        return;
      }

      // Incomplete onboarding — refresh cookie is set, interceptor recovers token on first API call
      if (response.requiresOnboarding) {
        window.location.href = '/onboarding';
        return;
      }

      // Store access token
      if (response.accessToken) {
        setToken(response.accessToken);
        if (response.expiresIn) {
          scheduleTokenRefresh(response.expiresIn);
        }
      }

      // Full page reload to refresh auth state and routes
      window.location.href = '/';
    },
  });

  // Pre-fill email if coming from signup page
  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      form.setValue('email', emailFromState);
    }
  }, [location.state?.email, form]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Welcome back
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Sign in to your Vritti AI Cloud account
        </Typography>
      </div>

      {/* Form */}
      <Form form={form} mutation={loginMutation} showRootError>
        <FieldGroup>
          <TextField
            name="email"
            label="Email"
            placeholder="Enter your email"
            startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
          />

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Password</FieldLabel>
              <Button variant="link" className="p-0 h-auto text-sm font-medium">
                <Link to="../forgot-password">Forgot?</Link>
              </Button>
            </div>
            <PasswordField
              name="password"
              placeholder="Enter your password"
              startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" loadingText="Signing in...">
              Login
            </Button>
          </Field>
        </FieldGroup>
      </Form>

      {/* Divider */}
      <AuthDivider />

      {/* Social Auth */}
      <SocialAuthButtons />

      {/* Footer */}
      <div className="text-center">
        <Typography variant="body2" align="center" intent="muted">
          Don't have an account?{' '}
          <Button variant="link" className="p-0 h-auto font-medium">
            <Link to="../signup">Create one</Link>
          </Button>
        </Typography>
      </div>
    </div>
  );
};
