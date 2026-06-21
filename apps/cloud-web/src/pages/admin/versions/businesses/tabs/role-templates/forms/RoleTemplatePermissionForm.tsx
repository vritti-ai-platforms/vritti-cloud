import {
  useFeaturesWithPermissions,
  useRoleTemplatePermissions,
  useSetRoleTemplatePermissions,
} from '@hooks/admin/versions/businesses/role-templates';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { AppFilter } from '@vritti/quantum-ui/selects/app';
import { Layers, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVersionContext } from '@/context/VersionScopeContext';

interface RoleTemplatePermissionFormProps {
  businessId: string;
  roleId: string;
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

export const RoleTemplatePermissionForm: React.FC<RoleTemplatePermissionFormProps> = ({ businessId, roleId }) => {
  const { versionId } = useVersionContext();

  const { data: features = [], isLoading: featuresLoading } = useFeaturesWithPermissions(versionId, businessId, roleId);
  const { data: rolePermissions, isLoading: permissionsLoading } = useRoleTemplatePermissions(
    versionId,
    businessId,
    roleId,
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [appFilter, setAppFilter] = useState<string[]>([]);
  const initialRef = useRef<string>('');

  const saveMutation = useSetRoleTemplatePermissions();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Initialize from server data — flatten each feature group's granted permission IDs
  useEffect(() => {
    if (!rolePermissions || features.length === 0) return;
    const ids = new Set<string>();
    for (const group of rolePermissions) {
      for (const perm of group.permissions) ids.add(perm.featurePermissionId);
    }
    setSelected(ids);
    initialRef.current = serializeSelected(ids);
  }, [rolePermissions, features]);

  // Filter features by selected app IDs (empty = show all)
  const visibleFeatures = useMemo(() => {
    if (appFilter.length === 0) return features;
    return features.filter((f) => f.appIds.some((id) => appFilter.includes(id)));
  }, [features, appFilter]);

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
    saveMutation.mutate({ versionId, businessId, roleId, data: { featurePermissionIds: [...selected] } });
  };

  // Loading state
  if (featuresLoading || permissionsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
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
          <p className="text-sm font-medium text-foreground">No apps linked</p>
          <p className="text-xs text-muted-foreground mt-1">Assign apps via Edit to start assigning permissions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-100">
      {/* Header with app filter and actions */}
      <div className="flex items-center justify-between">
        <AppFilter
          multiple
          onChange={(result) => {
            if (!result) {
              setAppFilter([]);
              return;
            }
            const val = result.value;
            setAppFilter(Array.isArray(val) ? val : [String(val)]);
          }}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty}
          isLoading={saveMutation.isPending}
          loadingText="Saving..."
        >
          Save Permissions
        </Button>
      </div>

      {/* Feature accordions */}
      <div className="border rounded-lg divide-y">
        {visibleFeatures.map((feature) => {
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
                  {feature.appCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="text-[10px]">
                      {appLabel(code)}
                    </Badge>
                  ))}
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
        <Shield className="size-3.5" />
        <span>{totalSelected} permission(s) selected</span>
      </div>
    </div>
  );
};
