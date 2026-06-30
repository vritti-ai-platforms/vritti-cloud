import { useBuPermissionMatrix, useSetBuPermissions } from '@hooks/cloud/org-business-units';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import { Layers, Lock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { countUnlocks, SnapshotMatrix, unlocksFromMatrix } from '@/components/snapshot-matrix';
import type { FeatureUnlocks } from '@/schemas/cloud/bu-matrix';

interface AppsAndFeaturesTabProps {
  orgId: string;
  buId: string;
}

// Apps & Features tab — the BU's permission lock editor. Snapshot-driven; the matrix is a react-hook-form field
// (`unlocks`), so the switches + checkboxes feed form dirty/reset/submit directly.
export const AppsAndFeaturesTab: React.FC<AppsAndFeaturesTabProps> = ({ orgId, buId }) => {
  const { data, isLoading } = useBuPermissionMatrix(orgId, buId);
  const apps = data?.apps ?? [];
  const saveMutation = useSetBuPermissions(orgId, buId);

  const form = useForm<{ unlocks: FeatureUnlocks }>({ defaultValues: { unlocks: {} } });
  const seededRef = useRef(false);

  // Seed the form once from the matrix (each in-plan cell's `selected` flag)
  useEffect(() => {
    if (!data || seededRef.current) return;
    form.reset({ unlocks: unlocksFromMatrix(data.apps) });
    seededRef.current = true;
  }, [data, form]);

  const counts = countUnlocks(form.watch('unlocks'));

  // await so the Form's isSubmitting (→ submit button loading) tracks the mutation; the hook surfaces its own errors
  const save = async (values: { unlocks: FeatureUnlocks }) => {
    try {
      await saveMutation.mutateAsync({ unlocks: values.unlocks });
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
          Your <span className="font-medium text-foreground">{data?.plan.name}</span> plan is the ceiling — switch off
          actions this business unit shouldn't use. Locked items show which plan would unlock them.
        </p>
        <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
          Save Unlocks
        </Button>
      </div>

      {/* App cards → feature matrix (auto-registered as the `unlocks` form field) */}
      <SnapshotMatrix name="unlocks" apps={apps} />

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        <span>
          {counts.features} feature(s) · {counts.permissions} unlock(s)
        </span>
      </div>
    </Form>
  );
};
