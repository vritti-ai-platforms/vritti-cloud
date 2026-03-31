import { getRelativeTime } from '@/utils/getRelativeTime';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  GOOGLE: { label: 'Google', color: 'text-foreground' },
  MICROSOFT: { label: 'Microsoft', color: 'text-foreground' },
  APPLE: { label: 'Apple', color: 'text-foreground' },
  FACEBOOK: { label: 'Facebook', color: 'text-foreground' },
  X: { label: 'X (Twitter)', color: 'text-foreground' },
};

interface LinkedAccountCardProps {
  provider: string;
  isConnected: boolean;
  connectedAt?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
  canDisconnect: boolean;
  isDisconnecting?: boolean;
}

export const LinkedAccountCard: React.FC<LinkedAccountCardProps> = ({
  provider,
  isConnected,
  connectedAt,
  onConnect,
  onDisconnect,
  canDisconnect,
  isDisconnecting,
}) => {
  const meta = PROVIDER_META[provider] ?? { label: provider, color: 'text-foreground' };

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-secondary">
            <Typography variant="body2" className="font-bold text-foreground">
              {meta.label.charAt(0)}
            </Typography>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="body1" className="font-medium">
                {meta.label}
              </Typography>
              {isConnected && <Badge variant="default">Connected</Badge>}
            </div>
            <Typography variant="body2" intent="muted">
              {isConnected && connectedAt ? `Linked ${getRelativeTime(connectedAt)}` : 'Not connected'}
            </Typography>
          </div>
        </div>
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={onDisconnect}
            disabled={!canDisconnect || isDisconnecting}
            isLoading={isDisconnecting}
            loadingText="Disconnecting..."
          >
            Disconnect
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onConnect}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};
