import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2, Copy } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';

interface Props {
  backupCodes: string[];
  warning?: string;
  onDone: () => void;
}

// Displays backup codes in a 2-column grid with copy functionality
export const BackupCodesView: React.FC<Props> = ({ backupCodes, warning, onDone }) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (error) {
      console.error('Failed to copy codes:', error);
    }
  }, [backupCodes]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
        </div>
        <Typography variant="body2" intent="muted">
          Store these codes in a safe place. You'll need them if you lose access to your authenticator.
        </Typography>
      </div>

      {warning && <Alert variant="warning" title="Important" description={warning} />}

      <div className="grid grid-cols-2 gap-2">
        {backupCodes.map((code, index) => (
          <div
            key={index}
            className="px-3 py-2 bg-secondary border border-border rounded text-sm font-mono text-foreground text-center select-all"
          >
            {code}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleCopyAll} className="w-full border-border">
        {copiedAll ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
            Copied all codes!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy all codes
          </>
        )}
      </Button>

      <Button onClick={onDone} className="w-full">
        I've saved my codes
      </Button>
    </div>
  );
};
