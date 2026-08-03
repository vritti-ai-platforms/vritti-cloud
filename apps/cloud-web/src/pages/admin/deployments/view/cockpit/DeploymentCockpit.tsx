import type React from 'react';
import type { AgentStatus, Deployment } from '@/schemas/admin/deployments';
import { ComponentGrid } from './ComponentGrid';
import { ConditionsBanner } from './ConditionsBanner';
import { EventTimeline } from './EventTimeline';
import { HostGauges } from './HostGauges';

interface DeploymentCockpitProps {
  deployment: Deployment;
  agent: AgentStatus;
  deploymentSlug: string;
}

// The managed deployment's Overview tab: reconcile banner + host gauges + component grid + event timeline.
export const DeploymentCockpit: React.FC<DeploymentCockpitProps> = ({ deployment, agent, deploymentSlug }) => (
  <div className="flex flex-col gap-6">
    <ConditionsBanner agent={agent} />
    <HostGauges host={agent.host} />
    <ComponentGrid deployment={deployment} agent={agent} deploymentSlug={deploymentSlug} />
    <EventTimeline deploymentId={deployment.id} />
  </div>
);
