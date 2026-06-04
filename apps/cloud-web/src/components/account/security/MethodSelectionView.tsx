import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ChevronRight, KeyRound, Smartphone } from 'lucide-react';
import type React from 'react';

interface MethodSelectionViewProps {
  onSelectTotp: () => void;
  onSelectPasskey: () => void;
}

const methods = [
  {
    id: 'totp',
    title: 'Authenticator App',
    description: 'Use Google Authenticator, Authy, or similar apps',
    icon: <Smartphone className="h-5 w-5" />,
    key: 'totp' as const,
  },
  {
    id: 'passkey',
    title: 'Passkey / Security Key',
    description: 'Use Face ID, Touch ID, or your device PIN',
    icon: <KeyRound className="h-5 w-5" />,
    badge: 'Recommended',
    key: 'passkey' as const,
  },
];

export const MethodSelectionView: React.FC<MethodSelectionViewProps> = ({ onSelectTotp, onSelectPasskey }) => (
  <div className="space-y-3">
    {methods.map((method) => (
      <Button
        variant="ghost"
        key={method.id}
        onClick={method.key === 'totp' ? onSelectTotp : onSelectPasskey}
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
);
