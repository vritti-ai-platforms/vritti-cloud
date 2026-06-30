import { usePlanUnlocks, useSetPlanUnlocked } from '@hooks/admin/versions/businesses/plans/permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { Empty } from '@vritti/quantum-ui/Empty';
import { Form } from '@vritti/quantum-ui/Form';
import { Layers } from 'lucide-react';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { PlanUnlock } from '@/services/admin/versions/businesses/plans/permissions.service';
import { PlanMatrix } from '../components/PlanMatrix';

// Suspense boundary — the editor below mounts only once the matrix data has loaded
export const AppsAndFeaturesTab: React.FC = () => (
  <Suspense fallback={<PermissionMatrixSkeleton />}>
    <PlanUnlocksEditor />
  </Suspense>
);

const PlanUnlocksEditor: React.FC = () => {
  const { versionId, businessId, planId } = useVersionContext();
  const { data } = usePlanUnlocks(versionId, businessId, planId);
  const apps = data.apps;
  const saveMutation = useSetPlanUnlocked(versionId, businessId, planId);

  // Data is guaranteed present (suspense), so seed react-hook-form directly — no reset/seededRef dance
  const form = useForm<{ unlocks: PlanUnlock[] }>({
    defaultValues: { unlocks: apps.flatMap((a) => a.unlocks) },
  });

  if (apps.length === 0) {
    return (
      <Empty
        className="min-h-120"
        icon={<Layers />}
        title="No features available"
        description="Assign features to this business’s apps to unlock their permissions here."
      />
    );
  }

  return (
    <Form form={form} mutation={saveMutation} resetOnSuccess={false}>
      <div className="flex min-h-120 flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Switch a feature on per platform to unlock it in the plan, then check the actions it unlocks. A switched-on
            feature with no actions is unlocked but view-only.
          </p>
          <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
            Save Unlocks
          </Button>
        </div>

        <PlanMatrix name="unlocks" apps={apps} />
      </div>
    </Form>
  );
};
