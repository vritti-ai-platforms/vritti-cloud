import { useSendEmailOtp } from '@hooks/onboarding';
import { toast } from '@vritti/quantum-ui';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2 } from 'lucide-react';
import type React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

interface AuthSuccessState {
  isEmail?: boolean;
}

// Unified success page for both email signup and OAuth authentication
export const AuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Read email from URL query params (works for both server redirects and frontend routing)
  const email = searchParams.get('email');

  // Detect source: email signup (from frontend) has isEmail in state, OAuth (from server) doesn't
  const state = (location.state as AuthSuccessState) || {};
  const isEmail = state.isEmail ?? false;
  const isResume = searchParams.get('resume') === 'true';

  // Email signup: sends initial email OTP then navigates to onboarding
  const sendEmailOtpMutation = useSendEmailOtp({
    onSuccess: () => {
      navigate('../onboarding', { replace: true });
    },
  });

  const title = isResume ? 'Welcome back!' : 'Welcome to Vritti AI Cloud!';
  const subtitle = isEmail
    ? "We've sent a verification code to your email"
    : isResume
      ? "Let's pick up where you left off"
      : "Let's finish setting up your account";

  // Next steps - same for all users
  const nextSteps = [
    isEmail ? 'Confirm your email' : 'Choose a password',
    'Add your phone number',
    'Set up extra security',
  ];

  // Handlers
  const handleStartOnboarding = () => {
    if (isEmail) {
      // Email: send initial OTP to user's email
      sendEmailOtpMutation.mutate();
    } else {
      // OAuth: navigate directly to onboarding (axios will auto-recover token on first API call)
      if (!isResume) toast.success('Set a Password');
      navigate('../onboarding', { replace: true });
    }
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <Typography variant="h4" align="center" className="text-foreground">
          {title}
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          {subtitle}
        </Typography>
      </div>

      {/* Email Display Box — only shown for email signup */}
      {email && (
        <div className="bg-accent rounded-lg p-3 text-center border border-border">
          <Typography variant="caption" intent="muted" className="block mb-1">
            Account email
          </Typography>
          <Typography variant="body2" className="font-medium text-foreground">
            {email}
          </Typography>
        </div>
      )}

      {/* Next Steps */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        <Typography variant="body2" className="font-medium text-foreground">
          Next steps:
        </Typography>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {nextSteps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Start Onboarding Button */}
      <Button
        onClick={handleStartOnboarding}
        className="w-full bg-primary text-primary-foreground"
        isLoading={sendEmailOtpMutation.isPending}
        loadingText="Loading..."
      >
        {isResume ? 'Resume Onboarding' : 'Start Onboarding'}
      </Button>

      <Typography variant="caption" align="center" intent="muted" className="text-center">
        {isResume ? 'Continue from where you left off' : 'Just a few quick steps to secure your account'}
      </Typography>
    </div>
  );
};
