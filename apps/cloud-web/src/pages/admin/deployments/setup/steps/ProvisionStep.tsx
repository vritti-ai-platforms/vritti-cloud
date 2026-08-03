import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type React from 'react';
import type { AgentStatus } from '@/schemas/admin/deployments';
import { activeCondition, isReady, reconcileError } from '../setupLifecycle';

interface ProvisionStepProps {
  agent: AgentStatus;
  onBack: () => void;
  onContinue: () => void;
}

export const ProvisionStep: React.FC<ProvisionStepProps> = ({ agent, onBack, onContinue }) => {
  const ready = isReady(agent);
  const error = ready ? undefined : reconcileError(agent);
  const reconciling = activeCondition(agent, 'Reconciling');
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
          <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            <div className="w-full space-y-4">
              <p className="text-sm font-medium">Stack provisioned</p>
              <DetailField label="Generation" type="string" value={generation} mono />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/15 p-4 text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Provisioning failed</p>
              <p className="text-sm">{error.message || `Agent reported ${error.reason}.`}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
            <Spinner className="size-5 shrink-0 text-muted-foreground" />
            <div className="w-full space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Reconciling…</p>
                {reconciling?.message && (
                  <Typography variant="body2" intent="muted">
                    {reconciling.message}
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
