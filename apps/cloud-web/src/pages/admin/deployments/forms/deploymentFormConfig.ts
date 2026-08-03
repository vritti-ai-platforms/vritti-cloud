import {
  assembleSecretProvider,
  DEFAULT_SECRET_PROVIDER,
  type Deployment,
  type UpdateDeploymentData,
} from '@/schemas/admin/deployments';

// Shared defaults for any per-tab deployment edit form. Each config tab renders only ITS subset of
// fields but seeds the whole form from these, so unchanged fields submit at their current values.
export function buildDeploymentDefaults(deployment: Deployment): UpdateDeploymentData {
  const isManual = deployment.managementMode === 'manual';
  return {
    name: deployment.name,
    url: deployment.url,
    mode: deployment.mode,
    edge: deployment.edge,
    addonPgbackrest: deployment.addonPgbackrest,
    backupRetention: deployment.backupRetention,
    addonGitea: deployment.addonGitea,
    regionId: deployment.regionId,
    cloudProviderId: deployment.cloudProviderId,
    tenantType: deployment.tenantType,
    type: deployment.type,
    status: deployment.status,
    version: deployment.version ?? '',
    acmeEmail: deployment.acmeEmail ?? '',
    secretProvider: isManual ? undefined : (deployment.secretProvider ?? DEFAULT_SECRET_PROVIDER),
    secretProviderSecrets: {},
  };
}

// Maps form data to the update payload — agent deployments fold their sealed secret-store secrets in.
export function deploymentSubmitTransform(deployment: Deployment, data: UpdateDeploymentData) {
  const isManual = deployment.managementMode === 'manual';
  return { id: deployment.id, data: isManual ? data : { ...data, ...assembleSecretProvider(data) } };
}
