import {
  useFeaturesWithPermissions,
  useRoleTemplatePermissions,
  useSetRoleTemplatePermissions,
} from '@hooks/admin/role-templates';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { AppFilter } from '@vritti/quantum-ui/selects/app';
import { Layers, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { PermissionEntry } from '@/schemas/admin/role-templates';

interface RoleTemplatePermissionFormProps {
  roleId: string;
}

// Capitalize first letter of a permission type: VIEW -> View
function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

// Format app code into display name: "order-management" -> "Order Management"
function appLabel(code: string): string {
  return code
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Serialize a Map<string, Set<string>> into a stable string for comparison
function serializeSelected(map: Map<string, Set<string>>): string {
  const entries: string[] = [];
  for (const [featureId, types] of map) {
    const sorted = [...types].sort();
    entries.push(`${featureId}:${sorted.join(',')}`);
  }
  return entries.sort().join('|');
}

export const RoleTemplatePermissionForm: React.FC<RoleTemplatePermissionFormProps> = ({ roleId }) => {
  const { versionId } = useVersionContext();

  const { data: features = [], isLoading: featuresLoading } = useFeaturesWithPermissions(versionId, roleId);
  const { data: rolePermissions, isLoading: permissionsLoading } = useRoleTemplatePermissions(versionId, roleId);

  const [selected, setSelected] = useState<Map<string, Set<string>>>(new Map());
  const [appFilter, setAppFilter] = useState<string[]>([]);
  const initialRef = useRef<string>('');

  const saveMutation = useSetRoleTemplatePermissions();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Initialize from server data
  useEffect(() => {
    if (!rolePermissions || features.length === 0) return;
    const map = new Map<string, Set<string>>();
    for (const perm of rolePermissions) {
      const feature = features.find((f) => f.code === perm.featureCode);
      if (feature) map.set(feature.id, new Set(perm.types));
    }
    setSelected(map);
    initialRef.current = serializeSelected(map);
  }, [rolePermissions, features]);

  // Filter features by selected app IDs (empty = show all)
  const visibleFeatures = useMemo(() => {
    if (appFilter.length === 0) return features;
    return features.filter((f) => f.appIds.some((id) => appFilter.includes(id)));
  }, [features, appFilter]);

  // Toggle a single permission type
  const toggleType = useCallback((featureId: string, type: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const types = new Set(next.get(featureId) ?? []);
      if (types.has(type)) types.delete(type);
      else types.add(type);
      if (types.size === 0) next.delete(featureId);
      else next.set(featureId, types);
      return next;
    });
  }, []);

  // Toggle all permission types for a feature
  const toggleAllFeatureTypes = useCallback((featureId: string, availableTypes: string[]) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const current = next.get(featureId);
      if (current && current.size === availableTypes.length) {
        next.delete(featureId);
      } else {
        next.set(featureId, new Set(availableTypes));
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

  const totalSelected = useMemo(() => {
    let count = 0;
    for (const types of selected.values()) count += types.size;
    return count;
  }, [selected]);

  const handleSave = () => {
    const permissions: PermissionEntry[] = [];
    for (const [featureId, types] of selected) {
      for (const type of types) {
        permissions.push({ featureId, type });
      }
    }
    saveMutation.mutate({ versionId, roleId, data: { permissions } });
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
          <p className="text-xs text-muted-foreground mt-1">Add apps in the Apps tab to start assigning permissions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with app filter and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <p className="text-xs text-muted-foreground">{totalSelected} permission(s) selected</p>
        </div>
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
          const featureTypes = selected.get(feature.id);
          const selectedCount = featureTypes?.size ?? 0;
          const totalCount = feature.permissions.length;
          const isAllSelected = selectedCount === totalCount;
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
                  onCheckedChange={() => toggleAllFeatureTypes(feature.id, feature.permissions)}
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
                  {feature.permissions.map((type) => (
                    <Checkbox
                      key={type}
                      label={typeLabel(type)}
                      checked={featureTypes?.has(type) ?? false}
                      onCheckedChange={() => toggleType(feature.id, type)}
                    />
                  ))}
                </div>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="size-3.5" />
        <span>
          {totalSelected} permission(s) across {selected.size} feature(s)
        </span>
      </div>
    </div>
  );
};
