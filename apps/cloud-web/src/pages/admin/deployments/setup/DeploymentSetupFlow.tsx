import {
  agentStatusQueryKey,
  deploymentQueryKey,
  useDeleteDeployment,
  useIssueEnrollToken,
  useRegenerateSigningKey,
  useSyncDeploymentCatalog,
} from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeploymentAgent } from '@/providers/AgentStreamProvider';
import type { Deployment, DeploymentSigningKey, EnrollToken } from '@/schemas/admin/deployments';
import {
  deriveManagedStep,
  isReady,
  MANAGED_SETUP_STEPS,
  type ManagedSetupStep,
  needsDns,
  stepNumber,
  toStepDefs,
} from './setupLifecycle';
import { ConnectStep } from './steps/ConnectStep';
import { DnsDelegationStep } from './steps/DnsDelegationStep';
import { EnrollStep } from './steps/EnrollStep';
import { ProvisionStep } from './steps/ProvisionStep';
import { SecretStoreStep } from './steps/SecretStoreStep';
import { SigningKeyStep } from './steps/SigningKeyStep';
import { SyncStep } from './steps/SyncStep';

interface DeploymentSetupFlowProps {
  deployment: Deployment;
}

export const DeploymentSetupFlow: React.FC<DeploymentSetupFlowProps> = ({ deployment }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();
  // Live agent status (AgentStreamProvider / SSE) — the setup gates advance the instant the agent reports.
  const agent = useDeploymentAgent();
  const [step, setStep] = useState<ManagedSetupStep>(() => deriveManagedStep(deployment, agent));
  const [enrollToken, setEnrollToken] = useState<EnrollToken | null>(null);
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

  const invalidateAgent = () => queryClient.invalidateQueries({ queryKey: agentStatusQueryKey(deployment.id) });
  const invalidateDeployment = () => queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) });

  const enrollMutation = useIssueEnrollToken({
    onSuccess: (response) => {
      setEnrollToken(response.data);
      invalidateAgent();
    },
  });

  const regenerateMutation = useRegenerateSigningKey({
    onSuccess: (response) => {
      setSigningKey(response.data);
      invalidateDeployment();
    },
  });

  const syncCatalogMutation = useSyncDeploymentCatalog({ onSuccess: () => invalidateDeployment() });

  // Auto-advance from Connect only when the agent FIRST connects while the user waits on Connect — NOT on
  // every render, so navigating Back to re-enroll doesn't bounce the user forward. A managed edge routes
  // through DNS delegation until its wildcard cert is issued.
  const nextFromConnect: ManagedSetupStep = needsDns(deployment, agent) ? 'dns' : 'provision';
  const wasEnrolled = useRef(agent.enrolled);
  useEffect(() => {
    if (step === 'connect' && agent.enrolled && !wasEnrolled.current) {
      setStep(nextFromConnect);
    }
    wasEnrolled.current = agent.enrolled;
  }, [step, agent.enrolled, nextFromConnect]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deployment.name}
        titleSlot={<Badge variant="secondary">Managed</Badge>}
        description="Complete setup to start using this deployment"
        actions={
          <Badge variant="warning">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
            Setting up
          </Badge>
        }
      />

      <StepProgressIndicator
        steps={toStepDefs(MANAGED_SETUP_STEPS)}
        currentStep={stepNumber(MANAGED_SETUP_STEPS, step)}
      />

      {step === 'signing-key' && (
        <SigningKeyStep
          deployment={deployment}
          signingKey={signingKey}
          onGenerate={() => regenerateMutation.mutate(deployment.id)}
          isGenerating={regenerateMutation.isPending}
          onContinue={() => setStep('enroll')}
        />
      )}

      {step === 'enroll' && (
        <EnrollStep
          deployment={deployment}
          enrollToken={enrollToken}
          status={agent.status}
          onIssue={() => enrollMutation.mutate(deployment.id)}
          isIssuing={enrollMutation.isPending}
          onBack={() => setStep('signing-key')}
          onContinue={() => setStep('secret-store')}
        />
      )}

      {step === 'secret-store' && (
        <SecretStoreStep
          deployment={deployment}
          onBack={() => setStep('enroll')}
          onContinue={() => setStep('connect')}
        />
      )}

      {step === 'connect' && (
        <ConnectStep agent={agent} onBack={() => setStep('secret-store')} onContinue={() => setStep(nextFromConnect)} />
      )}

      {step === 'dns' && (
        <DnsDelegationStep agent={agent} onBack={() => setStep('connect')} onContinue={() => setStep('provision')} />
      )}

      {step === 'provision' && (
        <ProvisionStep
          agent={agent}
          onBack={() => setStep(needsDns(deployment, agent) ? 'dns' : 'connect')}
          onContinue={() => setStep('sync')}
        />
      )}

      {step === 'sync' && (
        <SyncStep
          onSync={() => syncCatalogMutation.mutate(deployment.id)}
          isSyncing={syncCatalogMutation.isPending}
          canSync={isReady(agent)}
          onBack={() => setStep('provision')}
        />
      )}

      <DangerZone
        title="Delete this deployment"
        description="Remove this deployment and its enrollment. This cannot be undone."
        buttonText="Delete Deployment"
        onClick={handleDelete}
        disabled={!!deployment.organizationCount}
        warning={`This deployment is used by ${deployment.organizationCount} organization${deployment.organizationCount !== 1 ? 's' : ''}. Remove all associated organizations before deleting.`}
        showWarning={!!deployment.organizationCount}
      />
    </div>
  );
};
