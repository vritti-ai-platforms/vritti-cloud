import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2, Copy, KeyRound } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import type { DeploymentSigningKey } from '@/schemas/admin/deployments';

interface CopyFieldProps {
  label: string;
  value: string;
}

// Read-only env value with a copy-to-clipboard button
const CopyField: React.FC<CopyFieldProps> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  // Copy the value and flash a confirmation state
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy value:', error);
    }
  }, [value]);

  return (
    <div className="space-y-1">
      <Typography variant="body2" intent="muted">
        {label}
      </Typography>
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 bg-secondary border border-border rounded text-sm font-mono text-foreground break-all select-all">
          {value}
        </div>
        <Button type="button" variant="outline" size="icon" onClick={handleCopy} aria-label={`Copy ${label}`}>
          {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

interface SigningKeyRevealDialogProps {
  handle: DialogHandle;
  signingKey: DeploymentSigningKey | null;
  showResyncNote?: boolean;
}

// One-time reveal of a deployment's signing public key with copy-to-clipboard for the core env values
export const SigningKeyRevealDialog: React.FC<SigningKeyRevealDialogProps> = ({
  handle,
  signingKey,
  showResyncNote,
}) => (
  <Dialog
    handle={handle}
    icon={KeyRound}
    title="Signing Public Key"
    description="Paste these values into the core deployment's environment."
    content={(close) =>
      signingKey && (
        <div className="space-y-4">
          <Alert
            variant="warning"
            title="Shown only once"
            description="This public key cannot be retrieved again. You can regenerate a new keypair from the deployment page anytime."
          />

          <CopyField label="CLOUD_PUBLIC_KEY" value={signingKey.publicKey} />
          <CopyField label="DEPLOYMENT_ID" value={signingKey.deploymentId} />

          <Typography variant="body2" intent="muted">
            Set CLOUD_PUBLIC_KEY and DEPLOYMENT_ID in the core deployment's environment, then restart it so signed
            requests, licenses, and entitlements verify against the new key.
            {showResyncNote && ' After updating the env, resync the deployment so core receives freshly signed data.'}
          </Typography>

          <Button onClick={close} className="w-full">
            I've saved the key
          </Button>
        </div>
      )
    }
  />
);
