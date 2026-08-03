import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type React from 'react';
import type { AgentStatus } from '@/schemas/admin/deployments';

interface ConnectStepProps {
  agent: AgentStatus;
  onBack: () => void;
  onContinue: () => void;
}

export const ConnectStep: React.FC<ConnectStepProps> = ({ agent, onBack, onContinue }) => (
  <Card>
    <CardContent className="flex flex-col gap-4 py-6">
      <div className="space-y-1">
        <Typography variant="h6">Agent connection</Typography>
        <Typography variant="body2" intent="muted">
          Start the agent on the deployment VM with the enroll token. This page updates automatically once it connects.
        </Typography>
      </div>

      {agent.enrolled ? (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
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
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
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
        <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={!agent.enrolled} endAdornment={<ArrowRight className="size-4" />}>
          Continue
        </Button>
      </div>
    </CardContent>
  </Card>
);
