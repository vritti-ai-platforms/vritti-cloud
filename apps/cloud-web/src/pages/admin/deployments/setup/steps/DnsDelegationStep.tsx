import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type React from 'react';
import type { AgentStatus } from '@/schemas/admin/deployments';
import { certIssued } from '../setupLifecycle';

interface DnsDelegationStepProps {
  agent: AgentStatus;
  onBack: () => void;
  onContinue: () => void;
}

export const DnsDelegationStep: React.FC<DnsDelegationStepProps> = ({ agent, onBack, onContinue }) => {
  const issued = certIssued(agent);
  const delegation = agent.delegation;

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
            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="size-5 shrink-0 text-success" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Wildcard certificate issued</p>
                <Typography variant="body2" intent="muted">
                  The DNS records were verified and the wildcard certificate is in place. No further DNS changes are
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
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3">
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
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3">
                <CopyField label="Name" value={delegation.zone} mono />
                <DetailField label="Type" type="string" value="NS" mono />
                <CopyField label="Value" value={`${delegation.nameserver}.`} mono />
              </div>
            </div>

            <div className="space-y-2">
              <Typography variant="body2" intent="muted">
                3. Challenge record — lets ACME validate the wildcard.
              </Typography>
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3">
                <CopyField label="Name" value={delegation.name} mono />
                <DetailField label="Type" type="string" value="CNAME" mono />
                <CopyField label="Target" value={`${delegation.target}.`} mono />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
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
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <Spinner className="size-5 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Preparing the certificate request…</p>
                <Typography variant="body2" intent="muted">
                  The agent is starting its DNS service and registering with Let's Encrypt. The records to add will
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
