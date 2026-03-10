import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2 } from 'lucide-react';
import type React from 'react';

interface SuccessStepProps {
  hasMfa: boolean;
  onContinue: () => void;
  isPending?: boolean;
}

// MFA setup completion matching the OAuth success page pattern
export const SuccessStep: React.FC<SuccessStepProps> = ({ hasMfa, onContinue, isPending }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <Typography variant="h4" align="center" className="text-foreground">
          All set!
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          {hasMfa
            ? 'Your account has been created and secured with multi-factor authentication.'
            : 'Your account has been created successfully. You can enable MFA later in your settings.'}
        </Typography>
      </div>

      <Button
        onClick={onContinue}
        isLoading={isPending}
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground"
      >
        Continue
      </Button>

      <Typography variant="caption" align="center" intent="muted">
        You're all set — welcome to Vritti AI Cloud
      </Typography>
    </div>
  );
};
