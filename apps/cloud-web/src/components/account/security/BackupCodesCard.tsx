import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { KeyRound } from 'lucide-react';
import type React from 'react';

interface BackupCodesCardProps {
  remaining: number;
  total: number;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const BackupCodesCard: React.FC<BackupCodesCardProps> = ({
  remaining,
  total,
  onRegenerate,
  isRegenerating,
}) => (
  <div className="border border-border rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <KeyRound className="h-5 w-5 text-muted-foreground" />
        <div>
          <Typography variant="body1" className="font-medium">
            Backup Codes
          </Typography>
          <Typography variant="body2" intent="muted">
            {remaining} of {total} remaining
          </Typography>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={isRegenerating}
        isLoading={isRegenerating}
        loadingText="Regenerating..."
      >
        Regenerate
      </Button>
    </div>
  </div>
);
