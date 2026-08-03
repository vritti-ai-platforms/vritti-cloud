import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, RefreshCw, ServerCog } from 'lucide-react';
import type React from 'react';
import type { AgentStatus, Deployment, EnrollToken } from '@/schemas/admin/deployments';
import { AgentEnrollReveal } from '../../components/AgentEnrollReveal';

interface EnrollStepProps {
  deployment: Deployment;
  enrollToken: EnrollToken | null;
  status: AgentStatus['status'];
  onIssue: () => void;
  isIssuing: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export const EnrollStep: React.FC<EnrollStepProps> = ({
  deployment,
  enrollToken,
  status,
  onIssue,
  isIssuing,
  onBack,
  onContinue,
}) => (
  <Card>
    <CardContent className="flex flex-col gap-4 py-6">
      <div className="space-y-1">
        <Typography variant="h6">Enroll agent</Typography>
        <Typography variant="body2" intent="muted">
          Issue a one-time enroll token and its keypair for this deployment. Paste the token and connection details onto
          the deployment VM so the agent can connect back to cloud.
        </Typography>
      </div>

      {enrollToken ? (
        <>
          <AgentEnrollReveal enrollToken={enrollToken} deploymentId={deployment.id} />
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
              Back
            </Button>
            <Button onClick={onContinue} endAdornment={<ArrowRight className="size-4" />}>
              Continue
            </Button>
          </div>
        </>
      ) : status === 'pending' ? (
        <>
          <Typography variant="body2" intent="muted">
            An enroll token was already issued and is waiting for the agent to connect. Regenerate if it expired or was
            lost.
          </Typography>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onIssue}
                isLoading={isIssuing}
                loadingText="Generating..."
                startAdornment={<RefreshCw className="size-4" />}
              >
                Regenerate Token
              </Button>
              <Button onClick={onContinue} endAdornment={<ArrowRight className="size-4" />}>
                Continue
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
            Back
          </Button>
          <Button
            onClick={onIssue}
            isLoading={isIssuing}
            loadingText="Generating..."
            startAdornment={<ServerCog className="size-4" />}
          >
            Enroll Agent
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);
