import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle } from 'lucide-react';
import type React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Displays errors that occur during the authentication flow (OAuth or email signup)
export const AuthErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorDescription =
    searchParams.get('error_description') ||
    searchParams.get('error') ||
    'An unexpected error occurred during authentication. Please try again.';

  const handleTryAgain = () => {
    navigate('../login', { replace: true });
  };

  return (
    <div className="text-center space-y-6">
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>

      {/* Title & Error Message */}
      <div className="text-center space-y-4">
        <Typography variant="h4" align="center" className="text-foreground">
          Authentication Failed
        </Typography>
        <Alert variant="destructive" title="Error" description={errorDescription} />
      </div>

      {/* Action Button */}
      <Button type="button" onClick={handleTryAgain} className="w-full bg-primary text-primary-foreground">
        Try Again
      </Button>

      {/* Help Text */}
      <Typography variant="caption" align="center" intent="muted" className="text-center">
        If you continue to experience issues, please contact support or try signing up with email and password instead.
      </Typography>
    </div>
  );
};
