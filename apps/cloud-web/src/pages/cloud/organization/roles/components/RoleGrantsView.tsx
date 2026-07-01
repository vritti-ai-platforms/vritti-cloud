import { usePermissions } from '@hooks/cloud/roles';
import { Alert } from '@vritti/quantum-ui/Alert';
import { Empty } from '@vritti/quantum-ui/Empty';
import { Layers } from 'lucide-react';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { SnapshotMatrix } from '@/components/snapshot-matrix/SnapshotMatrix';
import type { FeatureUnlocks } from '@/schemas/cloud/bu-matrix';

interface RoleGrantsViewProps {
  orgId: string;
  features: FeatureUnlocks;
}

// Read-only permission view for default (locked) roles — renders the exact same matrix (green feature icons, warning
// lock chips, upsell badges) as the custom-role editor, only with every switch/checkbox disabled.
export const RoleGrantsView = ({ orgId, features }: RoleGrantsViewProps) => {
  const { data: matrix, isLoading } = usePermissions(orgId);
  const apps = matrix?.apps ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Alert
        variant="info"
        description="This is a default role — its permissions are managed by the platform and shown here read-only."
      />

      {isLoading ? (
        <PermissionMatrixSkeleton />
      ) : apps.length === 0 ? (
        <Empty
          className="min-h-100"
          icon={<Layers />}
          title="No features available"
          description="Nothing to show yet."
        />
      ) : (
        <SnapshotMatrix readOnly apps={apps} value={features} />
      )}
    </div>
  );
};
