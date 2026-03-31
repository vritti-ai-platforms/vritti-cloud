import { useFeaturesWithPermissions, useRoleTemplatePermissions, useSetRoleTemplatePermissions } from '@hooks/admin/role-templates';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@vritti/quantum-ui/Collapsible';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { groupBy } from 'lodash';
import { ChevronDown, ChevronRight, Layers, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { FeatureWithPermissions, PermissionEntry } from '@/schemas/admin/role-templates';

interface RoleTemplatePermissionFormProps {
  roleId: string;
}

// Capitalize first letter of a permission type: VIEW -> View
function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
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

  // Fetch features with their available permission types
  const { data: features = [], isLoading: featuresLoading } = useFeaturesWithPermissions(versionId);

  // Fetch current role template permissions
  const { data: rolePermissions, isLoading: permissionsLoading } = useRoleTemplatePermissions(versionId, roleId);

  // Local state: featureId -> Set of selected types
  const [selected, setSelected] = useState<Map<string, Set<string>>>(new Map());

  // Track which app groups are expanded
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Snapshot of the server state for dirty detection
  const initialRef = useRef<string>('');

  const saveMutation = useSetRoleTemplatePermissions();

  // Initialize from server data when both queries resolve
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

  // Group features by their primary app code
  const appGroups = useMemo(() => {
    const grouped = groupBy(features, (f: FeatureWithPermissions) => f.appCodes[0] ?? 'Unassigned');
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [features]);

  // Format app code into display name: "order-management" -> "Order Management"
  const appLabel = useCallback((code: string) => {
    if (code === 'Unassigned') return code;
    return code
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, []);

  // Toggle a single permission type on a feature
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

  // Toggle all features in an app group
  const toggleAppGroup = useCallback(
    (appFeatures: FeatureWithPermissions[]) => {
      setSelected((prev) => {
        const next = new Map(prev);
        const allFullySelected = appFeatures.every((f) => {
          const sel = next.get(f.id);
          return sel && sel.size === f.permissions.length;
        });

        for (const f of appFeatures) {
          if (allFullySelected) {
            next.delete(f.id);
          } else {
            next.set(f.id, new Set(f.permissions));
          }
        }
        return next;
      });
    },
    [],
  );

  // Toggle app group expansion
  const toggleExpanded = useCallback((appCode: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(appCode)) next.delete(appCode);
      else next.add(appCode);
      return next;
    });
  }, []);

  // Compute dirty state
  const isDirty = serializeSelected(selected) !== initialRef.current;

  // Count total selected permissions
  const totalSelected = useMemo(() => {
    let count = 0;
    for (const types of selected.values()) count += types.size;
    return count;
  }, [selected]);

  // Save handler
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
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-36 mt-1" />
          </div>
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
          <p className="text-sm font-medium text-foreground">No features available</p>
          <p className="text-xs text-muted-foreground mt-1">Add features to the catalog first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Permissions</h3>
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

      {/* Permission tree */}
      <div className="border rounded-lg divide-y">
        {appGroups.map(([appCode, appFeatures]) => {
          // Compute app-level check state
          const allFeaturesFullySelected = appFeatures.every((f) => {
            const sel = selected.get(f.id);
            return sel && sel.size === f.permissions.length;
          });
          const someFeaturesSelected = appFeatures.some((f) => selected.has(f.id));
          const isExpanded = expanded.has(appCode);

          return (
            <Collapsible
              key={appCode}
              open={isExpanded}
              onOpenChange={() => toggleExpanded(appCode)}
            >
              {/* App group header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Checkbox
                  checked={allFeaturesFullySelected ? true : someFeaturesSelected ? 'indeterminate' : false}
                  onCheckedChange={() => toggleAppGroup(appFeatures)}
                />
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 flex-1 text-left hover:text-foreground/80 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium">{appLabel(appCode)}</span>
                  </button>
                </CollapsibleTrigger>
              </div>

              {/* Features within this app group */}
              <CollapsibleContent>
                <div className="border-t bg-muted/20 divide-y divide-border/50">
                  {appFeatures.map((feature) => {
                    const featureTypes = selected.get(feature.id);
                    const isAllSelected = featureTypes !== undefined && featureTypes.size === feature.permissions.length;
                    const isPartial = featureTypes !== undefined && featureTypes.size > 0 && !isAllSelected;

                    return (
                      <div key={feature.id} className="flex items-start gap-4 px-10 py-3">
                        {/* Feature-level checkbox */}
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isAllSelected ? true : isPartial ? 'indeterminate' : false}
                            onCheckedChange={() => toggleAllFeatureTypes(feature.id, feature.permissions)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">{feature.name}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {feature.code}
                            </Badge>
                          </div>
                          {/* Permission type checkboxes */}
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
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Permission count footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="size-3.5" />
        <span>
          {totalSelected} permission(s) across {selected.size} feature(s)
        </span>
      </div>
    </div>
  );
};
