import { useBuPermissionMatrix, useSetBuPermissions } from '@hooks/cloud/org-business-units';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import type { BuFeatureLocks } from '@vritti/quantum-ui/types/catalog-resolver';
import { Layers, LockKeyhole } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { BuLocksMatrix, countLocks } from '@/components/snapshot-matrix';

interface AppsAndFeaturesTabProps {
  orgId: string;
  buId: string;
}

// Apps & Features tab — the BU's lock editor. The matrix form field IS the deny-list (BuFeatureLocks):
// a feature switch ON locks the whole feature on that platform, a checked box locks that one permission.
// Everything untouched stays available, so new plan features flow to the BU automatically.
export const AppsAndFeaturesTab: React.FC<AppsAndFeaturesTabProps> = ({ orgId, buId }) => {
  const { data, isLoading } = useBuPermissionMatrix(orgId, buId);
  const apps = data?.apps ?? [];

  const form = useForm<{ locks: BuFeatureLocks }>({ defaultValues: { locks: {} } });
  // Re-baseline the form to what was just saved so dirty tracking restarts from the persisted state
  const saveMutation = useSetBuPermissions(orgId, buId, { onSuccess: () => form.reset(form.getValues()) });
  const seededRef = useRef(false);

  // Seed the form once from the stored deny-list — the editor shows exactly what was saved
  useEffect(() => {
    if (!data || seededRef.current) return;
    form.reset({ locks: data.locks });
    seededRef.current = true;
  }, [data, form]);

  const counts = countLocks(apps, form.watch('locks'));

  if (isLoading) return <PermissionMatrixSkeleton />;

  if (apps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No features available</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This plan has no apps to configure for the business unit.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form form={form} mutation={saveMutation} resetOnSuccess={false} className="flex min-h-100 flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Everything in your <span className="font-medium text-foreground">{data?.plan.name}</span> plan is available by
          default. Switch a feature ON to lock it entirely for this business unit, or tick individual permissions to
          lock just those.
        </p>
        <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
          Save Changes
        </Button>
      </div>

      {/* App cards → lock matrix (auto-registered as the `locks` form field) */}
      <BuLocksMatrix name="locks" apps={apps} />

      {/* Footer */}
      <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <LockKeyhole className={`size-3.5 ${counts.permissions > 0 ? 'text-destructive' : ''}`} />
        <span className={counts.permissions > 0 ? 'text-destructive' : undefined}>
          {counts.features} feature(s) · {counts.permissions} permission(s) locked for this business unit
        </span>
      </div>
    </Form>
  );
};
