import {
  agentStatusQueryKey,
  deploymentQueryKey,
  useIssueEnrollToken,
  useSyncDeploymentCatalog,
} from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, CheckCircle2, Link2, RefreshCw, ServerCog } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { AgentStatus, Deployment, EnrollToken } from '@/schemas/admin/deployments';
import { AgentEnrollReveal } from './components/AgentEnrollReveal';

const AGENT_SETUP_STEPS: StepDef[] = [
  { label: 'Enroll Agent', icon: <ServerCog className="h-4 w-4" /> },
  { label: 'Connect', icon: <Link2 className="h-4 w-4" /> },
  { label: 'Sync', icon: <RefreshCw className="h-4 w-4" /> },
];

type AgentSetupStep = 1 | 2 | 3;

function deriveInitialStep(agent: AgentStatus): AgentSetupStep {
  if (agent.enrolled) return 3;
  if (agent.status === 'pending') return 2;
  return 1;
}

interface AgentDeploymentSetupWizardProps {
  deployment: Deployment;
  agent: AgentStatus;
}

export const AgentDeploymentSetupWizard: React.FC<AgentDeploymentSetupWizardProps> = ({ deployment, agent }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<AgentSetupStep>(() => deriveInitialStep(agent));
  const [enrollToken, setEnrollToken] = useState<EnrollToken | null>(null);

  const invalidateDeployment = () => queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) });
  const invalidateAgent = () => queryClient.invalidateQueries({ queryKey: agentStatusQueryKey(deployment.id) });

  const enrollMutation = useIssueEnrollToken({
    onSuccess: (response) => {
      setEnrollToken(response.data);
      invalidateAgent();
    },
  });

  const syncCatalogMutation = useSyncDeploymentCatalog({
    onSuccess: () => invalidateDeployment(),
  });

  useEffect(() => {
    if (step === 2 && agent.enrolled) setStep(3);
  }, [step, agent.enrolled]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deployment.name}
        titleSlot={<Badge variant="secondary">Managed</Badge>}
        description="Complete setup to start using this deployment"
      />

      <StepProgressIndicator steps={AGENT_SETUP_STEPS} currentStep={step} />

      {step === 1 && (
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
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} endAdornment={<ArrowRight className="size-4" />}>
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
                    onClick={() => enrollMutation.mutate(deployment.id)}
                    isLoading={enrollMutation.isPending}
                    loadingText="Generating..."
                    startAdornment={<RefreshCw className="size-4" />}
                  >
                    Regenerate Token
                  </Button>
                  <Button onClick={() => setStep(2)} endAdornment={<ArrowRight className="size-4" />}>
                    Continue
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-end">
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

      {step === 2 && (
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
              <Button variant="outline" onClick={() => setStep(1)} startAdornment={<ArrowLeft className="size-4" />}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!agent.enrolled}
                endAdornment={<ArrowRight className="size-4" />}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Sync catalog</Typography>
              <Typography variant="body2" intent="muted">
                Pushes the signed feature catalog to your core. Once synced, this deployment is ready to use.
              </Typography>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} startAdornment={<ArrowLeft className="size-4" />}>
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
