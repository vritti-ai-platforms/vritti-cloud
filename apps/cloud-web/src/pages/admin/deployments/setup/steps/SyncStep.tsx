import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import type React from 'react';

interface SyncStepProps {
  onSync: () => void;
  isSyncing: boolean;
  canSync: boolean;
  onBack: () => void;
}

export const SyncStep: React.FC<SyncStepProps> = ({ onSync, isSyncing, canSync, onBack }) => (
  <Card>
    <CardContent className="flex flex-col gap-4 py-6">
      <div className="space-y-1">
        <Typography variant="h6">Sync catalog</Typography>
        <Typography variant="body2" intent="muted">
          Pushes the signed feature catalog to your core. Once synced, this deployment is ready to use.
        </Typography>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <Button
          onClick={onSync}
          isLoading={isSyncing}
          loadingText="Syncing..."
          disabled={!canSync}
          startAdornment={<RefreshCw className="size-4" />}
        >
          Sync Catalog
        </Button>
      </div>
    </CardContent>
  </Card>
);
