import { Button } from '@vritti/quantum-ui/Button';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2 } from 'lucide-react';
import type React from 'react';

interface SuccessStepProps {
  phoneNumber?: PhoneValue;
  onContinue: () => void;
}

// Success confirmation matching the OAuth success page pattern
export const SuccessStep: React.FC<SuccessStepProps> = ({ phoneNumber, onContinue }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <Typography variant="h4" align="center" className="text-foreground">
          Mobile Verified
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Your mobile number has been successfully verified
        </Typography>
      </div>

      {phoneNumber && (
        <div className="bg-accent rounded-lg p-3 text-center border border-border">
          <Typography variant="caption" intent="muted" className="block mb-1">
            Verified number
          </Typography>
          <Typography variant="body2" className="font-medium text-foreground">
            {phoneNumber}
          </Typography>
        </div>
      )}

      <Button onClick={onContinue} className="w-full bg-primary text-primary-foreground">
        Continue
      </Button>

      <Typography variant="caption" align="center" intent="muted">
        Just a few more steps to secure your account
      </Typography>
    </div>
  );
};
