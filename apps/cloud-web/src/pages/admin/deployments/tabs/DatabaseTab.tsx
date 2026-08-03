import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Database } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { type Deployment, type UpdateDeploymentData, updateDeploymentSchema } from '@/schemas/admin/deployments';
import { renderDatabaseFields } from '../components/configFields';
import { EditableConfigCard } from '../components/EditableConfigCard';
import { buildDeploymentDefaults, deploymentSubmitTransform } from '../forms/deploymentFormConfig';

interface DatabaseTabProps {
  deployment: Deployment;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({ deployment }) => {
  const [editing, setEditing] = useState(false);

  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: buildDeploymentDefaults(deployment),
  });
  const mode = useWatch({ control: form.control, name: 'mode' });
  const pgbackrestOn = useWatch({ control: form.control, name: 'addonPgbackrest' });
  const managed = mode === 'managed';

  // pgBackRest is only valid for a managed DB — force it off when switching to external so a stale
  // "on" value can't trip the "requires managed" validation on an otherwise-valid external edit.
  useEffect(() => {
    if (mode === 'external') form.setValue('addonPgbackrest', false);
  }, [mode, form]);

  const mutation = useUpdateDeployment({ onSuccess: () => setEditing(false) });
  const onCancel = () => {
    form.reset(buildDeploymentDefaults(deployment));
    setEditing(false);
  };

  const view =
    deployment.mode === 'managed' ? (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Mode" type="string" value={<Badge variant="secondary">Managed</Badge>} />
          <DetailField
            label="pgBackRest"
            type="string"
            value={
              <Badge variant={deployment.addonPgbackrest ? 'success' : 'secondary'}>
                {deployment.addonPgbackrest ? 'Enabled' : 'Disabled'}
              </Badge>
            }
          />
          {deployment.addonPgbackrest && (
            <DetailField label="Retention" type="string" value={`${deployment.backupRetention} full backups`} mono />
          )}
        </div>
        {deployment.addonPgbackrest && (
          <Typography variant="body2" intent="muted">
            Offsite (R2) backup target &amp; keys come from the secret store (<span className="font-mono">R2_*</span>).
          </Typography>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Mode" type="string" value={<Badge variant="outline">External</Badge>} />
        <div className="sm:col-span-2 lg:col-span-2">
          <Typography variant="body2" intent="muted">
            The agent doesn't run Postgres — the DB connection is provided via the secret store.
          </Typography>
        </div>
      </div>
    );

  return (
    <EditableConfigCard
      title="Database"
      description="How this deployment's Postgres is provided, and its backups."
      icon={Database}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={onCancel}
      form={form}
      mutation={mutation}
      transformSubmit={(data) => deploymentSubmitTransform(deployment, data)}
      view={view}
    >
      {renderDatabaseFields({ managed, pgbackrestOn: !!pgbackrestOn })}
    </EditableConfigCard>
  );
};
