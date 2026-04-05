import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle, Clock } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface ContactChangeSuccessStepProps {
  contactType: 'email' | 'phone';
  newContactValue: string;
  onClose: () => void;
}

export const ContactChangeSuccessStep: React.FC<ContactChangeSuccessStepProps> = ({
  contactType,
  newContactValue,
  onClose,
}) => {
  const [redirectTimer, setRedirectTimer] = useState(3);

  useEffect(() => {
    if (redirectTimer > 0) {
      const t = setTimeout(() => setRedirectTimer(redirectTimer - 1), 1000);
      return () => clearTimeout(t);
    }
    onClose();
  }, [redirectTimer, onClose]);

  const contactLabel = contactType === 'email' ? 'email' : 'phone number';

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="body1">Your {contactLabel} has been successfully changed to</Typography>
        <Typography variant="body1" className="font-semibold">
          {newContactValue}
        </Typography>
      </div>

      <Typography variant="body2" intent="muted">
        <Clock className="h-4 w-4 inline mr-2" />
        Redirecting to profile in {redirectTimer} seconds...
      </Typography>

      <Button onClick={onClose} className="w-full">
        Close Dialog
      </Button>
    </div>
  );
};
