import {
  deploymentQueryKey,
  useDeleteDeployment,
  useRegenerateSigningKey,
  useSyncDeploymentCatalog,
} from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Deployment, DeploymentSigningKey } from '@/schemas/admin/deployments';
import { deriveLocalStep, LOCAL_SETUP_STEPS, type LocalSetupStep, stepNumber, toStepDefs } from './setupLifecycle';
import { SigningKeyStep } from './steps/SigningKeyStep';
import { SyncStep } from './steps/SyncStep';

interface LocalSetupFlowProps {
  deployment: Deployment;
}

export const LocalSetupFlow: React.FC<LocalSetupFlowProps> = ({ deployment }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [step, setStep] = useState<LocalSetupStep>(() => deriveLocalStep(deployment));
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

  const syncCatalogMutation = useSyncDeploymentCatalog({ onSuccess: () => invalidateDeployment() });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deployment.name}
        titleSlot={<Badge variant="secondary">Manual</Badge>}
        description="Complete setup to start using this deployment"
        actions={
          <Badge variant="warning">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
            Setting up
          </Badge>
        }
      />

      <StepProgressIndicator steps={toStepDefs(LOCAL_SETUP_STEPS)} currentStep={stepNumber(LOCAL_SETUP_STEPS, step)} />

      {step === 'signing-key' && (
        <SigningKeyStep
          deployment={deployment}
          signingKey={signingKey}
          onGenerate={() => regenerateMutation.mutate(deployment.id)}
          isGenerating={regenerateMutation.isPending}
          onContinue={() => setStep('sync')}
        />
      )}

      {step === 'sync' && (
        <SyncStep
          onSync={() => syncCatalogMutation.mutate(deployment.id)}
          isSyncing={syncCatalogMutation.isPending}
          canSync={deployment.hasSigningKey}
          onBack={() => setStep('signing-key')}
        />
      )}

      <DangerZone
        title="Delete this deployment"
        description="Remove this deployment. This cannot be undone."
        buttonText="Delete Deployment"
        onClick={handleDelete}
        disabled={!!deployment.organizationCount}
        warning={`This deployment is used by ${pluralize('organization', deployment.organizationCount, true)}. Remove all associated organizations before deleting.`}
        showWarning={!!deployment.organizationCount}
      />
    </div>
  );
};
