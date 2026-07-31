import { useDeployment } from '@hooks/admin/deployments';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { useParams } from 'react-router-dom';
import { AgentDeploymentView } from './AgentDeploymentView';
import { DeploymentSetupWizard } from './DeploymentSetupWizard';
import { DeploymentTabs } from './DeploymentTabs';

export const DeploymentViewPage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const { deploymentSlug } = useParams();

  const { data: deployment } = useDeployment(id ?? '');

  const isManual = deployment.managementMode === 'manual';
  const setupComplete = deployment.hasSigningKey && deployment.catalogSynced;

  if (!isManual) {
    return <AgentDeploymentView deployment={deployment} id={id ?? ''} />;
  }

  if (!setupComplete) {
    return <DeploymentSetupWizard deployment={deployment} />;
  }

  return <DeploymentTabs deployment={deployment} deploymentSlug={deploymentSlug ?? ''} id={id ?? ''} />;
};
