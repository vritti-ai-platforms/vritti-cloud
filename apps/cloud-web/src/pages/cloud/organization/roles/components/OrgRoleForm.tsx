import { zodResolver } from '@hookform/resolvers/zod';
import { useOrgPermissions } from '@hooks/cloud/org-roles';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible, CollapsibleContent } from '@vritti/quantum-ui/Collapsible';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { TextField } from '@vritti/quantum-ui/TextField';
import { AppWindow, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateOrgRoleData, CreateOrgRoleFormData, OrgPermissionGroup, OrgRole } from '@/schemas/cloud/org-roles';
import { createOrgRoleSchema } from '@/schemas/cloud/org-roles';

interface OrgRoleFormProps {
  orgId: string;
  role?: OrgRole;
  onSubmit: (data: CreateOrgRoleData) => void;
  isPending: boolean;
}

// Capitalize first letter of a permission type: VIEW -> View
function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

// Form for creating or editing an org role with permission type tree
export const OrgRoleForm: React.FC<OrgRoleFormProps> = ({ orgId, role, onSubmit, isPending }) => {
  const isEditing = !!role;

  const form = useForm<CreateOrgRoleFormData>({
    resolver: zodResolver(createOrgRoleSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      scope: role?.scope ?? 'GLOBAL',
    },
  });

  const { data: permissionGroups = [], isLoading: permsLoading } = useOrgPermissions(orgId);

  // Permission selection state: featureCode -> Set of selected types
  const [selected, setSelected] = useState<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    if (role?.features) {
      for (const [code, types] of Object.entries(role.features)) {
        if (types.length > 0) map.set(code, new Set(types));
      }
    }
    return map;
  });

  // Track which app groups are expanded
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Sync when role features change (e.g. dialog re-opened with different role)
  useEffect(() => {
    if (role?.features) {
      const map = new Map<string, Set<string>>();
      for (const [code, types] of Object.entries(role.features)) {
        if (types.length > 0) map.set(code, new Set(types));
      }
      setSelected(map);
    }
  }, [role?.features]);

  // Toggle app group expansion
  const toggleExpanded = useCallback((appCode: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(appCode)) next.delete(appCode);
      else next.add(appCode);
      return next;
    });
  }, []);

  // Toggle a single permission type on a feature
  const toggleType = useCallback((featureCode: string, type: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const types = new Set(next.get(featureCode) ?? []);
      if (types.has(type)) types.delete(type);
      else types.add(type);
      if (types.size === 0) next.delete(featureCode);
      else next.set(featureCode, types);
      return next;
    });
  }, []);

  // Toggle all permission types for a feature
  const toggleAllFeatureTypes = useCallback((featureCode: string, availableTypes: string[]) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const current = next.get(featureCode);
      if (current && current.size === availableTypes.length) {
        next.delete(featureCode);
      } else {
        next.set(featureCode, new Set(availableTypes));
      }
      return next;
    });
  }, []);

  // Toggle all features in an app group
  const toggleAppGroup = useCallback((group: OrgPermissionGroup) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const allFullySelected = group.features.every((f) => {
        const sel = next.get(f.code);
        return sel && sel.size === f.permissions.length;
      });

      for (const f of group.features) {
        if (allFullySelected) {
          next.delete(f.code);
        } else {
          next.set(f.code, new Set(f.permissions));
        }
      }
      return next;
    });
  }, []);

  // Count total selected permissions
  const totalSelected = useMemo(() => {
    let count = 0;
    for (const types of selected.values()) count += types.size;
    return count;
  }, [selected]);

  // Build features record from state and merge with form data
  const handleFormSubmit = (data: CreateOrgRoleFormData) => {
    const features: Record<string, string[]> = {};
    for (const [code, types] of selected) {
      if (types.size > 0) features[code] = [...types];
    }
    onSubmit({ ...data, features });
  };

  return (
    <div className="flex flex-col gap-6">
      <Form form={form} onSubmit={handleFormSubmit} showRootError>
        {/* Role details */}
        <TextField name="name" label="Role Name" placeholder="e.g. Regional Manager" />
        <TextField name="description" label="Description" placeholder="Optional description" />
        <Select
          name="scope"
          label="Scope"
          placeholder="Select scope"
          options={[
            { value: 'GLOBAL', label: 'Global (all business units)' },
            { value: 'SUBTREE', label: 'Subtree (BU and descendants)' },
            { value: 'SINGLE_BU', label: 'Single Business Unit' },
          ]}
        />

        {/* Permission tree */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold">Permissions</h3>
              <p className="text-xs text-muted-foreground">
                {totalSelected} permission(s) across {selected.size} feature(s)
              </p>
            </div>
          </div>

          {permsLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-5 text-primary" />
            </div>
          )}

          {!permsLoading && permissionGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
              <AppWindow className="size-6 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No features available for this organization.</p>
            </div>
          )}

          {!permsLoading && permissionGroups.length > 0 && (
            <div className="border rounded-lg divide-y">
              {permissionGroups.map((group) => {
                const allFullySelected =
                  group.features.length > 0 &&
                  group.features.every((f) => {
                    const sel = selected.get(f.code);
                    return sel && sel.size === f.permissions.length;
                  });
                const someFeaturesSelected = group.features.some((f) => selected.has(f.code));
                const isExpanded = expanded.has(group.appCode);

                return (
                  <Collapsible
                    key={group.appCode}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(group.appCode)}
                  >
                    {/* App group header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Checkbox
                        checked={allFullySelected ? true : someFeaturesSelected ? 'indeterminate' : false}
                        onCheckedChange={() => toggleAppGroup(group)}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        className="flex items-center gap-2 flex-1 text-left cursor-pointer hover:text-foreground/80 transition-colors"
                        onClick={() => toggleExpanded(group.appCode)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') toggleExpanded(group.appCode);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm font-medium">{group.appName}</span>
                      </div>
                    </div>

                    {/* Features within this app group */}
                    <CollapsibleContent>
                      <div className="border-t bg-muted/20 divide-y divide-border/50">
                        {group.features.map((feature) => {
                          const featureTypes = selected.get(feature.code);
                          const isAllSelected =
                            featureTypes !== undefined && featureTypes.size === feature.permissions.length;
                          const isPartial =
                            featureTypes !== undefined && featureTypes.size > 0 && !isAllSelected;

                          return (
                            <div key={feature.code} className="flex items-start gap-4 px-10 py-3">
                              {/* Feature-level checkbox */}
                              <div className="pt-0.5">
                                <Checkbox
                                  checked={isAllSelected ? true : isPartial ? 'indeterminate' : false}
                                  onCheckedChange={() =>
                                    toggleAllFeatureTypes(feature.code, feature.permissions)
                                  }
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
                                      onCheckedChange={() => toggleType(feature.code, type)}
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
          )}

          {/* Permission count footer */}
          {!permsLoading && totalSelected > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Shield className="size-3.5" />
              <span>
                {totalSelected} permission(s) across {selected.size} feature(s)
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isPending} loadingText={isEditing ? 'Saving...' : 'Creating...'}>
            {isEditing ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </Form>
    </div>
  );
};
