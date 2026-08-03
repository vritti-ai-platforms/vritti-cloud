import { useAgentStatus, useDeployment } from '@hooks/admin/deployments';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { useParams } from 'react-router-dom';
import type { Deployment } from '@/schemas/admin/deployments';
import { DeploymentSetupFlow } from './setup/DeploymentSetupFlow';
import { LocalSetupFlow } from './setup/LocalSetupFlow';
import { localSetupComplete, managedSetupComplete } from './setup/setupLifecycle';
import { LocalDeploymentView } from './view/LocalDeploymentView';
import { ManagedDeploymentView } from './view/ManagedDeploymentView';

// Managed: agent status gates setup-vs-cockpit. Split out so the live agent query only mounts for managed.
const ManagedRoute = ({
  deployment,
  deploymentSlug,
  id,
}: {
  deployment: Deployment;
  deploymentSlug: string;
  id: string;
}) => {
  const { data: agent } = useAgentStatus(id);

  if (!managedSetupComplete(deployment, agent)) {
    return <DeploymentSetupFlow deployment={deployment} agent={agent} />;
  }
  return <ManagedDeploymentView deployment={deployment} agent={agent} deploymentSlug={deploymentSlug} id={id} />;
};

export const DeploymentViewPage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const { deploymentSlug } = useParams();

  const { data: deployment } = useDeployment(id);

  if (deployment.managementType === 'managed') {
    return <ManagedRoute deployment={deployment} deploymentSlug={deploymentSlug ?? ''} id={id} />;
  }

  if (!localSetupComplete(deployment)) {
    return <LocalSetupFlow deployment={deployment} />;
  }
  return <LocalDeploymentView deployment={deployment} deploymentSlug={deploymentSlug ?? ''} id={id} />;
};
