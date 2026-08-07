import { useDeployment } from '@hooks/admin/deployments';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { useParams } from 'react-router-dom';
import { AgentStreamProvider } from '@/providers/AgentStreamProvider';
import type { Deployment } from '@/schemas/admin/deployments';
import { DeploymentSetupFlow } from './setup/DeploymentSetupFlow';
import { LocalSetupFlow } from './setup/LocalSetupFlow';
import { localSetupComplete, managedSetupComplete } from './setup/setupLifecycle';
import { LocalDeploymentView } from './view/LocalDeploymentView';
import { ManagedDeploymentView } from './view/ManagedDeploymentView';

// Reads the live agent (from the provider's SSE stream) to gate setup-vs-cockpit for a managed deployment.
const ManagedContent = ({
  deployment,
  deploymentSlug,
  id,
}: {
  deployment: Deployment;
  deploymentSlug: string;
  id: string;
}) => {
  if (!managedSetupComplete(deployment)) {
    return <DeploymentSetupFlow deployment={deployment} />;
  }
  return <ManagedDeploymentView deployment={deployment} deploymentSlug={deploymentSlug} id={id} />;
};

// Managed: one SSE stream (AgentStreamProvider) feeds the whole subtree. Split out so the live agent stream
// only mounts for managed deployments (local deployments have no agent).
const ManagedRoute = (props: { deployment: Deployment; deploymentSlug: string; id: string }) => (
  <AgentStreamProvider>
    <ManagedContent {...props} />
  </AgentStreamProvider>
);

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
