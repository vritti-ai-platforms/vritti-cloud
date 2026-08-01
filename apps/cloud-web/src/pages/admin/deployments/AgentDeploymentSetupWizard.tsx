import {
  agentStatusQueryKey,
  deploymentQueryKey,
  useAgentStatus,
  useIssueEnrollToken,
  useSyncDeploymentCatalog,
  useUpdateDeployment,
} from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Form } from '@vritti/quantum-ui/Form';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Select } from '@vritti/quantum-ui/Select';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  KeyRound,
  Link2,
  RefreshCw,
  ServerCog,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { AgentStatus, Deployment, EnrollToken } from '@/schemas/admin/deployments';
import {
  assembleSecretProvider,
  DEFAULT_SECRET_PROVIDER,
  SECRET_AUTH_METHOD_FIELDS,
  SECRET_AUTH_METHODS,
  SECRET_PROVIDER_TYPES,
  secretProviderField,
  secretProviderSecretsField,
  validateSecretProvider,
} from '@/schemas/admin/deployments';
import { AgentEnrollReveal } from './components/AgentEnrollReveal';

const AGENT_SETUP_STEPS: StepDef[] = [
  { label: 'Enroll Agent', icon: <ServerCog className="h-4 w-4" /> },
  { label: 'Connect', icon: <Link2 className="h-4 w-4" /> },
  { label: 'Secret Store', icon: <KeyRound className="h-4 w-4" /> },
  { label: 'Provision', icon: <Boxes className="h-4 w-4" /> },
  { label: 'Sync', icon: <RefreshCw className="h-4 w-4" /> },
];

type AgentSetupStep = 1 | 2 | 3 | 4 | 5;

// The agent has finished reconciling the desired state and is running the requested generation.
function isReconcileReady(agent: AgentStatus): boolean {
  return (
    agent.lastPhase === 'ready' && agent.lastGeneration != null && agent.lastGeneration === agent.desiredGeneration
  );
}

// The agent reported a phase that is not progressing toward ready.
function isFailingPhase(agent: AgentStatus): boolean {
  return /error|fail/i.test(agent.lastPhase ?? '');
}

function deriveInitialStep(agent: AgentStatus, deployment: Deployment): AgentSetupStep {
  if (!agent.enrolled) return agent.status === 'pending' ? 2 : 1;
  if (!deployment.secretProvider) return 3;
  if (!isReconcileReady(agent)) return 4;
  return 5;
}

interface AgentDeploymentSetupWizardProps {
  deployment: Deployment;
  agent: AgentStatus;
}

export const AgentDeploymentSetupWizard: React.FC<AgentDeploymentSetupWizardProps> = ({ deployment, agent }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<AgentSetupStep>(() => deriveInitialStep(agent, deployment));
  const [enrollToken, setEnrollToken] = useState<EnrollToken | null>(null);

  // Live agent status — polls faster while provisioning so the reconcile gate updates promptly.
  const { data: liveAgent } = useAgentStatus(deployment.id, {
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      if (step === 4 && !isReconcileReady(data) && !isFailingPhase(data)) return 3000;
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

  const syncCatalogMutation = useSyncDeploymentCatalog({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) }),
  });

  // Auto-advance from Connect to Secret Store only when the agent FIRST connects while the user is
  // waiting on step 2 — NOT on every render. Otherwise an already-enrolled agent bounces the user
  // forward the instant they navigate Back, making it impossible to return and re-enroll.
  const wasEnrolled = useRef(agent.enrolled);
  useEffect(() => {
    if (step === 2 && liveAgent.enrolled && !wasEnrolled.current) setStep(3);
    wasEnrolled.current = liveAgent.enrolled;
  }, [step, liveAgent.enrolled]);

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
            ) : liveAgent.status === 'pending' ? (
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

            {liveAgent.enrolled ? (
              <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                <CheckCircle2 className="size-5 shrink-0 text-success" />
                <div className="w-full space-y-4">
                  <p className="text-sm font-medium">Agent connected</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailField label="Agent Version" type="string" value={liveAgent.agentVersion} mono />
                    <DetailField label="Last Heartbeat" type="dateTime" value={liveAgent.lastHeartbeatAt} />
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
                disabled={!liveAgent.enrolled}
                endAdornment={<ArrowRight className="size-4" />}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && <SecretStoreStep deployment={deployment} onBack={() => setStep(2)} onSaved={() => setStep(4)} />}

      {step === 4 && <ProvisionStep agent={liveAgent} onBack={() => setStep(3)} onContinue={() => setStep(5)} />}

      {step === 5 && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="space-y-1">
              <Typography variant="h6">Sync catalog</Typography>
              <Typography variant="body2" intent="muted">
                Pushes the signed feature catalog to your core. Once synced, this deployment is ready to use.
              </Typography>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)} startAdornment={<ArrowLeft className="size-4" />}>
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

interface SecretStoreStepProps {
  deployment: Deployment;
  onBack: () => void;
  onSaved: () => void;
}

const SecretStoreStep: React.FC<SecretStoreStepProps> = ({ deployment, onBack, onSaved }) => {
  const existing = deployment.secretProvider;
  const requireSecrets = !existing;

  const secretStoreSchema = z
    .object({
      secretProvider: secretProviderField,
      secretProviderSecrets: secretProviderSecretsField.optional(),
    })
    .superRefine((data, ctx) =>
      validateSecretProvider(data.secretProvider, data.secretProviderSecrets, ctx, requireSecrets),
    );

  const form = useForm<z.infer<typeof secretStoreSchema>>({
    resolver: zodResolver(secretStoreSchema),
    defaultValues: {
      secretProvider: existing
        ? {
            type: existing.type,
            url: existing.url,
            projectId: existing.projectId,
            env: existing.env,
            auth: { method: existing.auth.method, params: existing.auth.params },
          }
        : DEFAULT_SECRET_PROVIDER,
      secretProviderSecrets: {},
    },
  });

  const updateMutation = useUpdateDeployment({ onSuccess: onSaved });

  const authMethod = useWatch({ control: form.control, name: 'secretProvider.auth.method' });
  const authFields = SECRET_AUTH_METHOD_FIELDS[authMethod] ?? [];
  const secretPlaceholder = (label: string) =>
    existing ? 'Leave blank to keep existing' : `Enter ${label.toLowerCase()}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="space-y-1">
          <Typography variant="h6">Secret store</Typography>
          <Typography variant="body2" intent="muted">
            Configure where the agent sources runtime secrets. Saving reconfigures the desired state so the agent can
            bring up the stack.
          </Typography>
          {deployment.mode === 'external' && (
            <Typography variant="body2" intent="muted">
              This deployment uses an external database — include its connection credentials in the secret store.
            </Typography>
          )}
        </div>

        <Form
          form={form}
          mutation={updateMutation}
          resetOnSuccess={false}
          transformSubmit={(data) => ({ id: deployment.id, data: assembleSecretProvider(data) })}
        >
          <div className="space-y-3">
            <div>
              <Typography variant="subtitle2">Secret Store</Typography>
              <Typography variant="body2" intent="muted">
                Tells the agent where and how to fetch this deployment's secrets.
              </Typography>
            </div>
            <Select
              name="secretProvider.type"
              label="Type"
              placeholder="Select type"
              options={SECRET_PROVIDER_TYPES.map((type) => ({ value: type.value, label: type.label }))}
            />
            <TextField name="secretProvider.url" label="URL" placeholder="https://infisical.vrittiai.com" />
            <TextField name="secretProvider.projectId" label="Project ID" placeholder="Infisical project id" />
            <TextField name="secretProvider.env" label="Environment" placeholder="e.g. apw1" />
            <Select
              name="secretProvider.auth.method"
              label="Auth Method"
              placeholder="Select auth method"
              options={SECRET_AUTH_METHODS.map((method) => ({ value: method.value, label: method.label }))}
            />
            {authFields.map((field) =>
              field.secret ? (
                <PasswordField
                  key={field.key}
                  name={`secretProviderSecrets.${field.key}`}
                  label={field.label}
                  placeholder={secretPlaceholder(field.label)}
                />
              ) : (
                <TextField
                  key={field.key}
                  name={`secretProvider.auth.params.${field.key}`}
                  label={field.label}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ),
            )}
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
              Back
            </Button>
            <Button type="submit" loadingText="Saving..." endAdornment={<ArrowRight className="size-4" />}>
              Save & Continue
            </Button>
          </div>
        </Form>
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
