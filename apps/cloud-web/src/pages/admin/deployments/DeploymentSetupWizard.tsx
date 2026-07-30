import { deploymentQueryKey, useRegenerateSigningKey, useSyncDeploymentCatalog } from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, KeyRound, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { Deployment, DeploymentSigningKey } from '@/schemas/admin/deployments';
import { SigningKeyReveal } from './components/SigningKeyReveal';

const SETUP_STEPS: StepDef[] = [
  { label: 'Signing Key', icon: <KeyRound className="h-4 w-4" /> },
  { label: 'Catalog', icon: <RefreshCw className="h-4 w-4" /> },
];

type SetupStep = 1 | 2;

interface DeploymentSetupWizardProps {
  deployment: Deployment;
}

export const DeploymentSetupWizard: React.FC<DeploymentSetupWizardProps> = ({ deployment }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<SetupStep>(deployment.hasSigningKey ? 2 : 1);
  const [signingKey, setSigningKey] = useState<DeploymentSigningKey | null>(null);

  const invalidateDeployment = () => queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) });

  const regenerateMutation = useRegenerateSigningKey({
    onSuccess: (response) => {
      setSigningKey(response.data);
      invalidateDeployment();
    },
  });

  const syncCatalogMutation = useSyncDeploymentCatalog({
    onSuccess: () => invalidateDeployment(),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deployment.name}
        titleSlot={<Badge variant="secondary">Local</Badge>}
        description="Complete setup to start using this deployment"
      />

      <StepProgressIndicator steps={SETUP_STEPS} currentStep={step} />

      {step === 1 && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Generate signing key</Typography>
              <Typography variant="body2" intent="muted">
                Generate a keypair for this deployment. The public key is revealed once — set it on your core deployment
                so it can verify signed licenses and entitlements.
              </Typography>
            </div>

            {signingKey ? (
              <>
                <SigningKeyReveal signingKey={signingKey} />
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} endAdornment={<ArrowRight className="size-4" />}>
                    Continue
                  </Button>
                </div>
              </>
            ) : deployment.hasSigningKey ? (
              <>
                <Typography variant="body2" intent="muted">
                  Signing key already generated — regenerate if you've lost it.
                </Typography>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => regenerateMutation.mutate(deployment.id)}
                    isLoading={regenerateMutation.isPending}
                    loadingText="Regenerating..."
                    startAdornment={<KeyRound className="size-4" />}
                  >
                    Regenerate Signing Key
                  </Button>
                  <Button onClick={() => setStep(2)} endAdornment={<ArrowRight className="size-4" />}>
                    Continue
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={() => regenerateMutation.mutate(deployment.id)}
                  isLoading={regenerateMutation.isPending}
                  loadingText="Generating..."
                  startAdornment={<KeyRound className="size-4" />}
                >
                  Generate Signing Key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Sync catalog</Typography>
              <Typography variant="body2" intent="muted">
                Pushes the signed feature catalog to your core. Once synced, this deployment is ready to use.
              </Typography>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} startAdornment={<ArrowLeft className="size-4" />}>
                Back
              </Button>
              <Button
                onClick={() => syncCatalogMutation.mutate(deployment.id)}
                isLoading={syncCatalogMutation.isPending}
                loadingText="Syncing..."
                startAdornment={<RefreshCw className="size-4" />}
              >
                Sync Catalog
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
