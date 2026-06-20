import { usePlanAvailableFeatures, usePlanUnlocked, useSetPlanUnlocked } from '@hooks/admin/plan-permissions';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Layers, Lock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FeaturesTabProps {
  planId: string;
}

// Format app code into display name: "order-management" -> "Order Management"
function appLabel(code: string): string {
  return code
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Serialize a Set of ids into a stable string for dirty comparison
function serializeSelected(ids: Set<string>): string {
  return [...ids].sort().join('|');
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ planId }) => {
  const { id: versionId } = useSlugParams('versionSlug');
  const { id: businessId } = useSlugParams('businessSlug');

  const { data: features = [], isLoading: featuresLoading } = usePlanAvailableFeatures(
    versionId ?? '',
    businessId ?? '',
    planId,
  );
  const { data: unlocked, isLoading: unlockedLoading } = usePlanUnlocked(versionId ?? '', businessId ?? '', planId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const initialRef = useRef<string>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const saveMutation = useSetPlanUnlocked(versionId ?? '', businessId ?? '', planId);

  // Initialize from server data — the plan's currently unlocked feature-permission ids
  useEffect(() => {
    if (!unlocked || features.length === 0) return;
    const ids = new Set<string>(unlocked.featurePermissionIds);
    setSelected(ids);
    initialRef.current = serializeSelected(ids);
  }, [unlocked, features]);

  // Toggle a single permission
  const togglePermission = useCallback((featurePermissionId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(featurePermissionId)) next.delete(featurePermissionId);
      else next.add(featurePermissionId);
      return next;
    });
  }, []);

  // Toggle all permissions for a feature
  const toggleAllFeaturePermissions = useCallback((permissionIds: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = permissionIds.every((id) => next.has(id));
      if (allSelected) {
        for (const id of permissionIds) next.delete(id);
      } else {
        for (const id of permissionIds) next.add(id);
      }
      return next;
    });
  }, []);

  // Toggle feature expansion
  const toggleExpanded = useCallback((featureId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) next.delete(featureId);
      else next.add(featureId);
      return next;
    });
  }, []);

  const isDirty = serializeSelected(selected) !== initialRef.current;
  const totalSelected = selected.size;

  const handleSave = () => {
    saveMutation.mutate([...selected]);
  };

  // Loading state
  if (featuresLoading || unlockedLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end">
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="border rounded-lg divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (features.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="size-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No apps assigned</p>
          <p className="text-xs text-muted-foreground mt-1">Assign apps to this plan to unlock their permissions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-100">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Check the permissions this plan unlocks. Unchecked permissions stay visible but locked for upsell.
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty}
          isLoading={saveMutation.isPending}
          loadingText="Saving..."
        >
          Save Unlocks
        </Button>
      </div>

      {/* Feature accordions */}
      <div className="border rounded-lg divide-y">
        {features.map((feature) => {
          const permissionIds = feature.permissions.map((p) => p.featurePermissionId);
          const selectedCount = permissionIds.filter((id) => selected.has(id)).length;
          const totalCount = feature.permissions.length;
          const isAllSelected = totalCount > 0 && selectedCount === totalCount;
          const isPartial = selectedCount > 0 && !isAllSelected;
          const isExpanded = expanded.has(feature.id);

          return (
            <Collapsible
              key={feature.id}
              open={isExpanded}
              onOpenChange={() => toggleExpanded(feature.id)}
              headerClassName="px-4 py-3"
              triggerClassName="hover:text-foreground/80 transition-colors"
              leading={
                <Checkbox
                  checked={isAllSelected ? true : isPartial ? 'indeterminate' : false}
                  onCheckedChange={() => toggleAllFeaturePermissions(permissionIds)}
                />
              }
              trailing={
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {selectedCount} / {totalCount}
                </span>
              }
              trigger={
                <>
                  <span className="text-sm font-medium">{feature.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {appLabel(feature.appCode)}
                  </Badge>
                </>
              }
            >
              <div className="border-t bg-muted/20 px-12 py-3">
                <div className="flex flex-wrap gap-4">
                  {feature.permissions.map((permission) => (
                    <Checkbox
                      key={permission.featurePermissionId}
                      label={permission.label}
                      checked={selected.has(permission.featurePermissionId)}
                      onCheckedChange={() => togglePermission(permission.featurePermissionId)}
                    />
                  ))}
                </div>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        <span>{totalSelected} permission(s) unlocked</span>
      </div>
    </div>
  );
};
