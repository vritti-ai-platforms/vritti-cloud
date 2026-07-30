import { Alert } from '@vritti/quantum-ui/Alert';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';
import type { DeploymentSigningKey } from '@/schemas/admin/deployments';

interface SigningKeyRevealProps {
  signingKey: DeploymentSigningKey;
  showResyncNote?: boolean;
}

export const SigningKeyReveal: React.FC<SigningKeyRevealProps> = ({ signingKey, showResyncNote }) => (
  <div className="space-y-4">
    <Alert
      variant="warning"
      title="Shown only once"
      description="This public key cannot be retrieved again. You can regenerate a new keypair anytime."
    />

    <CopyField label="License public key" description="LICENSE_PUBLIC_KEY" value={signingKey.publicKey} />
    <CopyField label="Deployment ID" description="DEPLOYMENT_ID" value={signingKey.deploymentId} />

    <Typography variant="body2" intent="muted">
      Set LICENSE_PUBLIC_KEY and DEPLOYMENT_ID in your core deployment's environment, then restart core so signed
      requests, licenses, and entitlements verify against this key.
      {showResyncNote && ' After updating the env, resync the deployment so core receives freshly signed data.'}
    </Typography>
  </div>
);
