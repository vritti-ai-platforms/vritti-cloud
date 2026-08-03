import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';
import type { Deployment } from '@/schemas/admin/deployments';
import { SecretStoreForm } from '../../components/SecretStoreForm';

interface SecretStoreStepProps {
  deployment: Deployment;
  onBack: () => void;
  onContinue: () => void;
}

// First-time secret-store entry — a provisioning prerequisite. The agent blocks with AwaitingSecretStore
// until this is set; saving PATCHes the spec and advances.
export const SecretStoreStep: React.FC<SecretStoreStepProps> = ({ deployment, onBack, onContinue }) => (
  <Card>
    <CardContent className="flex flex-col gap-4 py-6">
      <div className="space-y-1">
        <Typography variant="h6">Secret store</Typography>
        <Typography variant="body2" intent="muted">
          Tell the agent where to pull this deployment's stack secrets from. It can't provision the stack until a secret
          store is configured.
        </Typography>
      </div>

      <SecretStoreForm deployment={deployment} onSuccess={onContinue} onBack={onBack} submitLabel="Save & Continue" />
    </CardContent>
  </Card>
);
