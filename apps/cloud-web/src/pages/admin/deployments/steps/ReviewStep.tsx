import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Check } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { useCreateDeployment } from '@/hooks/admin/deployments';
import type { CreateDeploymentData } from '@/schemas/admin/deployments';

interface ReviewStepProps {
  form: UseFormReturn<CreateDeploymentData>;
  createMutation: ReturnType<typeof useCreateDeployment>;
  onBack: () => void;
  onEditMode: () => void;
  onEditDetails: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ form, createMutation, onBack, onEditMode, onEditDetails }) => {
  const values = form.getValues();
  const isAgent = values.managementMode === 'agent';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2">Management Mode</Typography>
          <Button variant="link" className="p-0 h-auto" onClick={onEditMode}>
            Change
          </Button>
        </div>
        <Badge variant="secondary" className="capitalize">
          {isAgent ? 'Managed' : 'Local'}
        </Badge>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2">Details</Typography>
          <Button variant="link" className="p-0 h-auto" onClick={onEditDetails}>
            Change
          </Button>
        </div>
        {[
          { label: 'Name', value: values.name || '—' },
          { label: 'Endpoint URL', value: values.url || '—' },
          ...(isAgent ? [{ label: 'Type', value: values.type ?? '—' }] : []),
          { label: 'Version', value: values.version || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      <Form
        form={form}
        mutation={createMutation}
        resetOnSuccess={false}
        transformSubmit={(data) =>
          data.managementMode === 'manual'
            ? { name: data.name, url: data.url, managementMode: data.managementMode, version: data.version }
            : data
        }
      >
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button type="submit" isLoading={createMutation.isPending} loadingText="Creating...">
            <Check className="h-4 w-4 mr-2" />
            Create Deployment
          </Button>
        </div>
      </Form>
    </div>
  );
};
