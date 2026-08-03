import {
  agentStatusQueryKey,
  deploymentQueryKey,
  useAgentStatus,
  useDeleteDeployment,
  useIssueEnrollToken,
  useRegenerateSigningKey,
  useSyncDeploymentCatalog,
} from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, RefreshCw, ServerCog } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AgentStatus, Deployment, DeploymentSigningKey, EnrollToken } from '@/schemas/admin/deployments';
import { AgentEnrollReveal } from './components/AgentEnrollReveal';
import { SigningKeyReveal } from './components/SigningKeyReveal';
import {
  AGENT_WIZARD_STEPS,
  type AgentStepId,
  certIssued,
  deriveAgentLifecycleStep,
  isFailingPhase,
  isReconcileReady,
  needsDnsDelegation,
  stepAfterConnect,
  stepNumber,
  toStepDefs,
} from './wizardSteps';

type LifecycleStep = Extract<
  AgentStepId,
  'signing-key' | 'enroll' | 'connect' | 'dns-delegation' | 'provision' | 'sync'
>;

interface AgentSetupFlowProps {
  deployment: Deployment;
  // Resolved once by the caller — drives the initial resume step; live updates come from the query below.
  agent: AgentStatus;
}

export const AgentSetupFlow: React.FC<AgentSetupFlowProps> = ({ deployment, agent: initialAgent }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [step, setStep] = useState<LifecycleStep>(() => deriveAgentLifecycleStep(deployment, initialAgent));
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

  // Live agent status — polls faster while waiting on the wildcard cert or reconcile so the gates
  // update promptly.
  const { data: agent } = useAgentStatus(deployment.id, {
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      if (step === 'dns-delegation' && !certIssued(data)) return 5000;
      if (step === 'provision' && !isReconcileReady(data) && !isFailingPhase(data)) return 3000;
      return data.enrolled ? 15000 : 5000;
    },
  });

  const invalidateAgent = () => queryClient.invalidateQueries({ queryKey: agentStatusQueryKey(deployment.id) });

  const enrollMutation = useIssueEnrollToken({
    onSuccess: (response) => {
      setEnrollToken(response.data);
      invalidateAgent();
    },
  });

  const regenerateMutation = useRegenerateSigningKey({
    onSuccess: (response) => {
      setSigningKey(response.data);
      queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) });
    },
  });

  const syncCatalogMutation = useSyncDeploymentCatalog({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) }),
  });

  // Auto-advance from Connect only when the agent FIRST connects while the user waits on Connect — NOT
  // on every render, so navigating Back to re-enroll doesn't bounce the user forward. A managed edge
  // routes through DNS delegation until its wildcard cert is issued.
  const nextFromConnect = stepAfterConnect(deployment, agent);
  const wasEnrolled = useRef(initialAgent.enrolled);
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
      />

      <StepProgressIndicator
        steps={toStepDefs(AGENT_WIZARD_STEPS)}
        currentStep={stepNumber(AGENT_WIZARD_STEPS, step)}
      />

      {step === 'signing-key' && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Generate signing key</Typography>
              <Typography variant="body2" intent="muted">
                Generate this deployment's keypair. Its public key is embedded in core-server as the license key so it
                can verify signed catalog + entitlement pushes from cloud. Generate it before enrolling so the agent
                provisions with the real key.
              </Typography>
            </div>

            {signingKey ? (
              <>
                <SigningKeyReveal signingKey={signingKey} />
                <div className="flex justify-end">
                  <Button onClick={() => setStep('enroll')} endAdornment={<ArrowRight className="size-4" />}>
                    Continue
                  </Button>
                </div>
              </>
            ) : deployment.hasSigningKey ? (
              <>
                <Typography variant="body2" intent="muted">
                  Signing key already generated — regenerate if you've lost it (takes effect on the next provision).
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
                  <Button onClick={() => setStep('enroll')} endAdornment={<ArrowRight className="size-4" />}>
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

      {step === 'enroll' && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Enroll agent</Typography>
              <Typography variant="body2" intent="muted">
                Issue a one-time enroll token and its keypair for this deployment. Paste the token and connection
                details onto the deployment VM so the agent can connect back to cloud.
              </Typography>
            </div>

            {enrollToken ? (
              <>
                <AgentEnrollReveal enrollToken={enrollToken} deploymentId={deployment.id} />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep('signing-key')}
                    startAdornment={<ArrowLeft className="size-4" />}
                  >
                    Back
                  </Button>
                  <Button onClick={() => setStep('connect')} endAdornment={<ArrowRight className="size-4" />}>
                    Continue
                  </Button>
                </div>
              </>
            ) : agent.status === 'pending' ? (
              <>
                <Typography variant="body2" intent="muted">
                  An enroll token was already issued and is waiting for the agent to connect. Regenerate if it expired
                  or was lost.
                </Typography>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep('signing-key')}
                    startAdornment={<ArrowLeft className="size-4" />}
                  >
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => enrollMutation.mutate(deployment.id)}
                      isLoading={enrollMutation.isPending}
                      loadingText="Generating..."
                      startAdornment={<RefreshCw className="size-4" />}
                    >
                      Regenerate Token
                    </Button>
                    <Button onClick={() => setStep('connect')} endAdornment={<ArrowRight className="size-4" />}>
                      Continue
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep('signing-key')}
                  startAdornment={<ArrowLeft className="size-4" />}
                >
                  Back
                </Button>
                <Button
                  onClick={() => enrollMutation.mutate(deployment.id)}
                  isLoading={enrollMutation.isPending}
                  loadingText="Generating..."
                  startAdornment={<ServerCog className="size-4" />}
                >
                  Enroll Agent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'connect' && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Agent connection</Typography>
              <Typography variant="body2" intent="muted">
                Start the agent on the deployment VM with the enroll token. This page updates automatically once it
                connects.
              </Typography>
            </div>

            {agent.enrolled ? (
              <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                <CheckCircle2 className="size-5 shrink-0 text-success" />
                <div className="w-full space-y-4">
                  <p className="text-sm font-medium">Agent connected</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailField label="Agent Version" type="string" value={agent.agentVersion} mono />
                    <DetailField label="Last Heartbeat" type="dateTime" value={agent.lastHeartbeatAt} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
                <Spinner className="size-5 shrink-0 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Waiting for the agent to connect…</p>
                  <Typography variant="body2" intent="muted">
                    Run the agent on the VM with the enroll token you copied. Connection is detected automatically.
                  </Typography>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('enroll')}
                startAdornment={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(nextFromConnect)}
                disabled={!agent.enrolled}
                endAdornment={<ArrowRight className="size-4" />}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'dns-delegation' && (
        <DnsDelegationStep agent={agent} onBack={() => setStep('connect')} onContinue={() => setStep('provision')} />
      )}

      {step === 'provision' && (
        <ProvisionStep
          agent={agent}
          onBack={() => setStep(needsDnsDelegation(deployment) ? 'dns-delegation' : 'connect')}
          onContinue={() => setStep('sync')}
        />
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
                onClick={() => setStep('provision')}
                startAdornment={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>
              <Button
                onClick={() => syncCatalogMutation.mutate(deployment.id)}
                isLoading={syncCatalogMutation.isPending}
                loadingText="Syncing..."
                disabled={!isReconcileReady(agent)}
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

interface DnsDelegationStepProps {
  agent: AgentStatus;
  onBack: () => void;
  onContinue: () => void;
}

const DnsDelegationStep: React.FC<DnsDelegationStepProps> = ({ agent, onBack, onContinue }) => {
  const issued = certIssued(agent);
  const delegation = agent.acmeDelegation;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="space-y-1">
          <Typography variant="h6">DNS delegation</Typography>
          <Typography variant="body2" intent="muted">
            The agent issues one wildcard certificate for this deployment and derives routing automatically. Add the DNS
            records below so ACME can validate and issue it.
          </Typography>
        </div>

        {issued ? (
          <>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
              <CheckCircle2 className="size-5 shrink-0 text-success" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Wildcard certificate issued</p>
                <Typography variant="body2" intent="muted">
                  The DNS record was verified and the wildcard certificate is in place. No further DNS changes are
                  needed.
                </Typography>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
                Back
              </Button>
              <Button onClick={onContinue} endAdornment={<ArrowRight className="size-4" />}>
                Continue
              </Button>
            </div>
          </>
        ) : delegation ? (
          <>
            <Typography variant="body2" className="font-medium">
              Add these DNS records at your domain's DNS provider (any provider works):
            </Typography>

            <div className="space-y-2">
              <Typography variant="body2" intent="muted">
                1. Nameserver — one-time. A normal record that resolves this deployment's DNS server. Keep it unproxied
                (DNS-only).
              </Typography>
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3">
                <CopyField label="Name" value={delegation.nameserver} mono />
                <DetailField label="Type" type="string" value="A" mono />
                <CopyField label="Value" value={delegation.serverIp} mono />
              </div>
            </div>

            <div className="space-y-2">
              <Typography variant="body2" intent="muted">
                2. Zone delegation — one-time. Delegates the challenge zone to the nameserver above so Let's Encrypt can
                reach it.
              </Typography>
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3">
                <CopyField label="Name" value={delegation.zone} mono />
                <DetailField label="Type" type="string" value="NS" mono />
                <CopyField label="Value" value={`${delegation.nameserver}.`} mono />
              </div>
            </div>

            <div className="space-y-2">
              <Typography variant="body2" intent="muted">
                3. Challenge record — lets ACME validate the wildcard.
              </Typography>
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3">
                <CopyField label="Name" value={delegation.name} mono />
                <DetailField label="Type" type="string" value="CNAME" mono />
                <CopyField label="Target" value={`${delegation.target}.`} mono />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
              <Spinner className="size-5 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Waiting for the records to propagate and the certificate to issue…
                </p>
                <Typography variant="body2" intent="muted">
                  This page updates automatically once the wildcard certificate is issued. Propagation can take a few
                  minutes.
                </Typography>
              </div>
            </div>
            <div className="flex justify-start">
              <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
                Back
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
              <Spinner className="size-5 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Preparing the certificate request…</p>
                <Typography variant="body2" intent="muted">
                  The agent is starting its DNS service and registering with Let's Encrypt. The CNAME record to add will
                  appear here shortly — keep the agent running on the VM.
                </Typography>
              </div>
            </div>
            <div className="flex justify-start">
              <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
                Back
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface ProvisionStepProps {
  agent: AgentStatus;
  onBack: () => void;
  onContinue: () => void;
}

const ProvisionStep: React.FC<ProvisionStepProps> = ({ agent, onBack, onContinue }) => {
  const ready = isReconcileReady(agent);
  const failing = !ready && isFailingPhase(agent);
  const generation = `${agent.lastGeneration ?? '—'} / ${agent.desiredGeneration}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="space-y-1">
          <Typography variant="h6">Provision stack</Typography>
          <Typography variant="body2" intent="muted">
            The agent reconciles the desired state — pulling images and bringing up postgres, redis, nats, core-server,
            and nginx. This can take a few minutes.
          </Typography>
        </div>

        {ready ? (
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            <div className="w-full space-y-4">
              <p className="text-sm font-medium">Stack provisioned</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField label="Phase" type="string" value={agent.lastPhase} />
                <DetailField label="Generation" type="string" value={generation} mono />
              </div>
            </div>
          </div>
        ) : failing ? (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/15 p-4 text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Provisioning failed</p>
              <p className="text-sm">{agent.lastMessage ?? `Agent reported phase "${agent.lastPhase}".`}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <Spinner className="size-5 shrink-0 text-muted-foreground" />
            <div className="w-full space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Reconciling{agent.lastPhase ? ` — ${agent.lastPhase}` : '…'}</p>
                {agent.lastMessage && (
                  <Typography variant="body2" intent="muted">
                    {agent.lastMessage}
                  </Typography>
                )}
              </div>
              <DetailField label="Generation" type="string" value={generation} mono />
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
            Back
          </Button>
          <Button onClick={onContinue} disabled={!ready} endAdornment={<ArrowRight className="size-4" />}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
