import type { Deployment, UpdateDeploymentData } from '@/schemas/admin/deployments';

// Defaults for the general-details edit form (connection card). Component config is edited on the
// component pages, so this seeds only the top-level identity fields.
export function buildDeploymentDefaults(deployment: Deployment): UpdateDeploymentData {
  return {
    name: deployment.name,
    url: deployment.url,
    version: deployment.version ?? '',
    tenantType: deployment.tenantType,
    status: deployment.status,
  };
}

// Maps general-details form data to the update payload (no component spec is touched here).
export function deploymentSubmitTransform(deployment: Deployment, data: UpdateDeploymentData) {
  return { id: deployment.id, data };
}
