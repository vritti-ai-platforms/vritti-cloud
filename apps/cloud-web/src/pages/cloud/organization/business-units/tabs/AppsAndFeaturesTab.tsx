import { useBuPermissionMatrix, useSetBuPermissions } from '@hooks/cloud/org-business-units';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import { Layers, LockKeyhole } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { countLocks, SnapshotMatrix } from '@/components/snapshot-matrix';
import type { BuFeatureLocks } from '@/schemas/cloud/bu-matrix';

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
  const saveMutation = useSetBuPermissions(orgId, buId);

  const form = useForm<{ locks: BuFeatureLocks }>({ defaultValues: { locks: {} } });
  const seededRef = useRef(false);

  // Seed the form once from the stored deny-list — the editor shows exactly what was saved
  useEffect(() => {
    if (!data || seededRef.current) return;
    form.reset({ locks: data.locks });
    seededRef.current = true;
  }, [data, form]);

  const counts = countLocks(apps, form.watch('locks'));

  // await so the Form's isSubmitting (→ submit button loading) tracks the mutation; the hook surfaces its own errors
  const save = async (values: { locks: BuFeatureLocks }) => {
    try {
      await saveMutation.mutateAsync({ locks: values.locks });
      form.reset(values);
    } catch {
      // mutation error is reported by the hook / global handler
    }
  };

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
    <Form form={form} onSubmit={save} className="flex min-h-100 flex-col gap-4">
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
      <SnapshotMatrix name="locks" apps={apps} mode="locks" />

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
