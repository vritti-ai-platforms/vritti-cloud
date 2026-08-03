import { agentStatusQueryKey, useIssueEnrollToken } from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { KeyRound, Pencil, Radio, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { type AgentStatus, type Deployment, type EnrollToken, SECRET_AUTH_METHODS } from '@/schemas/admin/deployments';
import { AgentEnrollReveal } from '../../components/AgentEnrollReveal';
import { SecretStoreForm } from '../../components/SecretStoreForm';

const AGENT_STATUS_VARIANT: Record<NonNullable<AgentStatus['status']>, 'success' | 'warning' | 'destructive'> = {
  enrolled: 'success',
  pending: 'warning',
  revoked: 'destructive',
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function authMethodLabel(method: string) {
  return SECRET_AUTH_METHODS.find((m) => m.value === method)?.label ?? method;
}

interface AgentTabProps {
  deployment: Deployment;
  agent: AgentStatus;
}

// Identity + enrollment + secret-store rotation. Live health/host metrics/DNS/certs live on the cockpit
// + component pages.
export const AgentTab: React.FC<AgentTabProps> = ({ deployment, agent }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [enrollToken, setEnrollToken] = useState<EnrollToken | null>(null);
  const [editingSecretStore, setEditingSecretStore] = useState(false);

  const enrollMutation = useIssueEnrollToken({
    onSuccess: (response) => {
      setEnrollToken(response.data);
      queryClient.invalidateQueries({ queryKey: agentStatusQueryKey(deployment.id) });
    },
  });

  const handleRegenerate = async () => {
    const confirmed = await confirm({
      title: 'Regenerate enroll token?',
      description:
        'Issues a new one-time enroll token so you can reconnect an agent. Any previously issued token that was not yet used stops working.',
      confirmLabel: 'Regenerate',
    });
    if (confirmed) enrollMutation.mutate(deployment.id);
  };

  const inSync = agent.lastGeneration != null && agent.lastGeneration === agent.desiredGeneration;
  const secretStore = deployment.spec.components.secretStore;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Radio className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle>Agent identity</CardTitle>
                <CardDescription>Connection and enrollment for the agent on this deployment.</CardDescription>
              </div>
            </div>
            <Badge variant={agent.status ? AGENT_STATUS_VARIANT[agent.status] : 'secondary'}>
              {agent.status ? titleCase(agent.status) : 'Not enrolled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Agent Version" type="string" value={agent.agentVersion} mono />
            <DetailField label="Last Heartbeat" type="dateTime" value={agent.lastHeartbeatAt} />
            <DetailField
              label="Reconciliation"
              type="string"
              value={<Badge variant={inSync ? 'success' : 'warning'}>{inSync ? 'In sync' : 'Reconciling'}</Badge>}
            />
            <DetailField
              label="Generation"
              type="string"
              value={`${agent.lastGeneration ?? '—'} / ${agent.desiredGeneration}`}
              mono
            />
          </div>

          {agent.deploymentPubKey && (
            <div className="border-t pt-6">
              <CopyField label="Deployment public key" value={agent.deploymentPubKey} mono />
            </div>
          )}

          {enrollToken && (
            <div className="border-t pt-6">
              <AgentEnrollReveal enrollToken={enrollToken} deploymentId={deployment.id} />
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between gap-4 border-t">
          <Typography variant="body2" intent="muted">
            Regenerate an enroll token to reconnect or replace the agent on this deployment.
          </Typography>
          <Button
            variant="outline"
            onClick={handleRegenerate}
            isLoading={enrollMutation.isPending}
            loadingText="Generating..."
            startAdornment={<RefreshCw className="size-4" />}
          >
            Regenerate Enroll Token
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle>Secret Store</CardTitle>
                <CardDescription>Where and how the agent fetches this deployment's runtime secrets.</CardDescription>
              </div>
            </div>
            {!editingSecretStore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSecretStore(true)}
                startAdornment={<Pencil className="size-4" />}
              >
                {secretStore ? 'Rotate' : 'Configure'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSecretStore ? (
            <SecretStoreForm
              deployment={deployment}
              onSuccess={() => setEditingSecretStore(false)}
              onCancel={() => setEditingSecretStore(false)}
              submitLabel="Save Changes"
            />
          ) : secretStore ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Type" type="string" value={titleCase(secretStore.type)} />
              <DetailField label="URL" type="string" value={secretStore.url} mono />
              <DetailField label="Project ID" type="string" value={secretStore.projectId} mono />
              <DetailField label="Environment" type="string" value={secretStore.env} mono />
              <DetailField label="Auth Method" type="string" value={authMethodLabel(secretStore.auth.method)} />
            </div>
          ) : (
            <Typography variant="body2" intent="muted">
              No secret store configured. The agent needs one to fetch this deployment's runtime secrets — click
              Configure to add it.
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
