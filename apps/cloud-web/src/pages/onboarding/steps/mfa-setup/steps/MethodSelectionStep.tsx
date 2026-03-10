import { useSkipMFASetup } from '@hooks/onboarding/mfa';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ChevronRight, KeyRound, Smartphone } from 'lucide-react';
import type React from 'react';

type MFAMethod = 'authenticator' | 'passkey';

interface MethodSelectionStepProps {
  onMethodSelect: (method: MFAMethod) => void;
  onSuccess: () => void;
}

// MFA method selection — clicking a card navigates directly to setup
export const MethodSelectionStep: React.FC<MethodSelectionStepProps> = ({ onMethodSelect, onSuccess }) => {
  const skipMutation = useSkipMFASetup({ onSuccess });
  const error = skipMutation.error?.message || null;
  const methods = [
    {
      id: 'passkey' as const,
      title: 'Passkey',
      description: 'Use Face ID, Touch ID, or your device PIN for quick sign-in',
      icon: <KeyRound className="h-5 w-5" />,
      badge: 'Recommended',
    },
    {
      id: 'authenticator' as const,
      title: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or similar apps',
      icon: <Smartphone className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Secure your account
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Add multi-factor authentication
        </Typography>
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

      <div className="space-y-3">
        {methods.map((method) => (
          <Button
            variant="ghost"
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            disabled={skipMutation.isPending}
            className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all flex items-center gap-4 text-left group h-auto"
          >
            <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-secondary text-foreground">
              {method.icon}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Typography variant="body1" className="font-medium text-foreground truncate">
                  {method.title}
                </Typography>
                {method.badge && (
                  <Badge variant="default" className="shrink-0">
                    {method.badge}
                  </Badge>
                )}
              </div>
              <Typography variant="body2" intent="muted" className="text-wrap">
                {method.description}
              </Typography>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        ))}
      </div>

      <Typography variant="body2" align="center" intent="muted">
        Email and Phone are already verified and available as backup options
      </Typography>

      <Button
        variant="outline"
        onClick={() => skipMutation.mutate()}
        className="w-full border-border text-foreground"
        isLoading={skipMutation.isPending}
        loadingText="Skipping..."
      >
        Skip for now
      </Button>
    </div>
  );
};
