import {
  deploymentQueryKey,
  useDeleteDeployment,
  useRegenerateSigningKey,
  useSyncDeploymentCatalog,
} from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, KeyRound, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Deployment, DeploymentSigningKey } from '@/schemas/admin/deployments';
import { SigningKeyReveal } from './components/SigningKeyReveal';
import {
  deriveManualLifecycleStep,
  MANUAL_WIZARD_STEPS,
  type ManualStepId,
  stepNumber,
  toStepDefs,
} from './wizardSteps';

type LifecycleStep = Extract<ManualStepId, 'signing-key' | 'sync'>;

interface ManualSetupFlowProps {
  deployment: Deployment;
}

export const ManualSetupFlow: React.FC<ManualSetupFlowProps> = ({ deployment }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [step, setStep] = useState<LifecycleStep>(() => deriveManualLifecycleStep(deployment));
  const [signingKey, setSigningKey] = useState<DeploymentSigningKey | null>(null);

  const deleteMutation = useDeleteDeployment({ onSuccess: () => navigate('/deployments') });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${deployment.name}?`,
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(deployment.id);
  };

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

      <StepProgressIndicator
        steps={toStepDefs(MANUAL_WIZARD_STEPS)}
        currentStep={stepNumber(MANUAL_WIZARD_STEPS, step)}
      />

      {step === 'signing-key' && (
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
                  <Button onClick={() => setStep('sync')} endAdornment={<ArrowRight className="size-4" />}>
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
                  <Button onClick={() => setStep('sync')} endAdornment={<ArrowRight className="size-4" />}>
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

      {step === 'sync' && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Sync catalog</Typography>
              <Typography variant="body2" intent="muted">
                Pushes the signed feature catalog to your core. Once synced, this deployment is ready to use.
              </Typography>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('signing-key')}
                startAdornment={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>
              <Button
                onClick={() => syncCatalogMutation.mutate(deployment.id)}
                isLoading={syncCatalogMutation.isPending}
                loadingText="Syncing..."
                disabled={!deployment.hasSigningKey}
                startAdornment={<RefreshCw className="size-4" />}
              >
                Sync Catalog
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DangerZone
        title="Delete this deployment"
        description="Remove this deployment. This cannot be undone."
        buttonText="Delete Deployment"
        onClick={handleDelete}
        disabled={!!deployment.organizationCount}
        warning={`This deployment is used by ${deployment.organizationCount} organization${deployment.organizationCount !== 1 ? 's' : ''}. Remove all associated organizations before deleting.`}
        showWarning={!!deployment.organizationCount}
      />
    </div>
  );
};
