import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  DEPLOYMENT_STATUS_OPTIONS,
  DEPLOYMENT_TENANT_TYPE_OPTIONS,
  type Deployment,
  type UpdateDeploymentData,
  updateDeploymentSchema,
} from '@/schemas/admin/deployments';

interface EditDeploymentDetailsFormProps {
  deployment: Deployment;
  onSuccess: () => void;
  onCancel: () => void;
}

// Edits only the deployment's top-level identity fields. Component config lives on the component pages,
// and managementType/region/cloudProvider are immutable post-create, so none are touched here.
export const EditDeploymentDetailsForm: React.FC<EditDeploymentDetailsFormProps> = ({
  deployment,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: {
      name: deployment.name,
      url: deployment.url,
      version: deployment.version ?? '',
      tenantType: deployment.tenantType,
      status: deployment.status,
    },
  });

  const updateMutation = useUpdateDeployment({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      transformSubmit={(data) => ({ id: deployment.id, data })}
      resetOnSuccess={false}
      onCancel={onCancel}
    >
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="Endpoint URL" placeholder="https://nexus-us-east.vrittiai.com" />
      <VersionSelector name="version" label="Version" placeholder="Select version" />
      <Select name="tenantType" label="Tenancy" options={DEPLOYMENT_TENANT_TYPE_OPTIONS} />
      <Select name="status" label="Status" options={DEPLOYMENT_STATUS_OPTIONS} />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
