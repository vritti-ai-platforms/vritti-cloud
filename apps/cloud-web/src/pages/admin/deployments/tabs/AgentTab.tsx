import { agentStatusQueryKey, useIssueEnrollToken } from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DateTimeCell, StringCell } from '@vritti/quantum-ui/DataTable';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Radio, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { AgentStatus, Deployment, EnrollToken } from '@/schemas/admin/deployments';
import { AgentEnrollReveal } from '../components/AgentEnrollReveal';

const AGENT_STATUS_VARIANT: Record<NonNullable<AgentStatus['status']>, 'success' | 'warning' | 'destructive'> = {
  enrolled: 'success',
  pending: 'warning',
  revoked: 'destructive',
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const EXPIRY_WARNING_DAYS = 21;

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function ExpiryBadge({ notAfter }: { notAfter: string }) {
  const days = daysUntil(notAfter);
  if (days <= 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= EXPIRY_WARNING_DAYS) return <Badge variant="warning">{`Expires in ${days}d`}</Badge>;
  return null;
}

interface AgentTabProps {
  deployment: Deployment;
  agent: AgentStatus;
}

export const AgentTab: React.FC<AgentTabProps> = ({ deployment, agent }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [enrollToken, setEnrollToken] = useState<EnrollToken | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Radio className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>Agent status</CardTitle>
              <CardDescription>Live connection and reconciliation state reported by the agent.</CardDescription>
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
          <DetailField label="Last Phase" type="string" value={agent.lastPhase} />
          <DetailField label="Last Message" type="string" value={agent.lastMessage} />
          <DetailField
            label="Generation"
            type="string"
            value={`${agent.lastGeneration ?? '—'} / ${agent.desiredGeneration}`}
            mono
          />
          <DetailField
            label="Gitea"
            type="string"
            value={
              <Badge variant={agent.giteaProvisioned ? 'success' : 'secondary'}>
                {agent.giteaProvisioned ? 'Provisioned' : 'Pending'}
              </Badge>
            }
          />
          <DetailField label="ACME Email" type="string" value={deployment.acmeEmail} mono />
        </div>
        <div className="space-y-3 border-t pt-6">
          <Typography variant="body2" className="font-medium">
            Domains
          </Typography>
          {deployment.domains.length === 0 ? (
            <Typography variant="body2" intent="muted">
              No domains configured
            </Typography>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-2 font-medium">Host</th>
                    <th className="px-4 py-2 font-medium">Upstream</th>
                  </tr>
                </thead>
                <tbody>
                  {deployment.domains.map((domain) => (
                    <tr key={domain.host} className="border-b last:border-0">
                      <td className="px-4 py-2">
                        <StringCell value={domain.host} mono />
                      </td>
                      <td className="px-4 py-2">
                        <StringCell value={domain.upstream} mono />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {agent.deploymentPubKey && (
          <div className="border-t pt-6">
            <CopyField label="Deployment public key" value={agent.deploymentPubKey} mono />
          </div>
        )}
        <div className="space-y-3 border-t pt-6">
          <Typography variant="body2" className="font-medium">
            TLS Certificates
          </Typography>
          {agent.certificates.length === 0 ? (
            <Typography variant="body2" intent="muted">
              No certificates yet
            </Typography>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-2 font-medium">Host</th>
                    <th className="px-4 py-2 font-medium">Issued</th>
                    <th className="px-4 py-2 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.certificates.map((cert) => (
                    <tr key={cert.host} className="border-b last:border-0">
                      <td className="px-4 py-2">
                        <StringCell value={cert.host} mono />
                      </td>
                      <td className="px-4 py-2">
                        <DateTimeCell value={cert.issuedAt} />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <DateTimeCell value={cert.notAfter} />
                          <ExpiryBadge notAfter={cert.notAfter} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
  );
};
