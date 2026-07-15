import { useLockMatrix, useSetLockMatrix } from '@hooks/cloud/org-locks';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import type { FeatureLocks } from '@vritti/quantum-ui/types/catalog-resolver';
import { Layers, LockKeyhole } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { countLocks, SiteLocksMatrix } from '@/components/snapshot-matrix';
import type { LockScope } from '@/services/cloud/org-locks.service';

const SCOPE_NOUN: Record<LockScope['kind'], string> = {
  org: 'organization',
  legalEntity: 'legal entity',
  siteGroup: 'site group',
  site: 'site',
};

interface FeatureLocksTabProps {
  scope: LockScope;
}

// Feature Locks tab — the scope's lock editor; the matrix form field IS the deny-list (FeatureLocks), untouched items stay available.
export const FeatureLocksTab: React.FC<FeatureLocksTabProps> = ({ scope }) => {
  const scopeNoun = SCOPE_NOUN[scope.kind];
  const { data, isLoading } = useLockMatrix(scope);
  const apps = data?.apps ?? [];

  const form = useForm<{ locks: FeatureLocks }>({ defaultValues: { locks: {} } });
  // Re-baseline the form to what was just saved so dirty tracking restarts from the persisted state
  const saveMutation = useSetLockMatrix(scope, { onSuccess: () => form.reset(form.getValues()) });
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
      <Card className="flex flex-col">
        <CardContent className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <Layers className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No features at this scope yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            There is nothing to lock for this {scopeNoun} right now. Features scoped here will appear as they ship.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form form={form} mutation={saveMutation} resetOnSuccess={false} className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Everything in your <span className="font-medium text-foreground">{data?.plan.name}</span> plan is available by
          default. Switch a feature ON to lock it entirely for this {scopeNoun}, or tick individual permissions to lock
          just those.
        </p>
        <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
          Save Changes
        </Button>
      </div>

      {/* App cards → lock matrix (auto-registered as the `locks` form field) */}
      <SiteLocksMatrix name="locks" apps={apps} scopeNoun={scopeNoun} />

      {/* Footer */}
      <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <LockKeyhole className={`size-3.5 ${counts.permissions > 0 ? 'text-destructive' : ''}`} />
        <span className={counts.permissions > 0 ? 'text-destructive' : undefined}>
          {counts.features} feature(s) · {counts.permissions} permission(s) locked for this {scopeNoun}
        </span>
      </div>
    </Form>
  );
};
