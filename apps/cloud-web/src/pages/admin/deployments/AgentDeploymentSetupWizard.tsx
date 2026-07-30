import { Badge } from '@vritti/quantum-ui/Badge';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Empty } from '@vritti/quantum-ui/Empty';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Cloud, Link2, RefreshCw, ServerCog } from 'lucide-react';
import type React from 'react';
import type { Deployment } from '@/schemas/admin/deployments';

const AGENT_SETUP_STEPS: StepDef[] = [
  { label: 'Enroll Agent', icon: <ServerCog className="h-4 w-4" /> },
  { label: 'Connect', icon: <Link2 className="h-4 w-4" /> },
  { label: 'Sync', icon: <RefreshCw className="h-4 w-4" /> },
];

interface AgentDeploymentSetupWizardProps {
  deployment: Deployment;
}

export const AgentDeploymentSetupWizard: React.FC<AgentDeploymentSetupWizardProps> = ({ deployment }) => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title={deployment.name}
      titleSlot={<Badge variant="secondary">Managed</Badge>}
      description={deployment.type}
    />

    <div className="opacity-60 pointer-events-none">
      <StepProgressIndicator steps={AGENT_SETUP_STEPS} currentStep={1} />
    </div>

    <Card>
      <CardContent className="py-6">
        <Empty
          icon={<Cloud className="size-6" />}
          title="Agent-managed setup is coming soon"
          description="Enrolling and connecting an agent-managed deployment will be available in an upcoming release."
        />
      </CardContent>
    </Card>
  </div>
);
