import { useAgentStatus } from '@hooks/admin/deployments';
import type React from 'react';
import type { Deployment } from '@/schemas/admin/deployments';
import { AgentDeploymentTabs } from './AgentDeploymentTabs';
import { AgentSetupFlow } from './AgentSetupFlow';

interface AgentDeploymentViewProps {
  deployment: Deployment;
  id: string;
}

export const AgentDeploymentView: React.FC<AgentDeploymentViewProps> = ({ deployment, id }) => {
  const { data: agent } = useAgentStatus(id);

  const setupComplete = agent.enrolled && deployment.catalogSynced;

  if (!setupComplete) {
    return <AgentSetupFlow deployment={deployment} agent={agent} />;
  }

  return <AgentDeploymentTabs deployment={deployment} agent={agent} id={id} />;
};
