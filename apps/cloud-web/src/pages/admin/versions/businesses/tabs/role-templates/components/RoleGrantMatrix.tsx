import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import { Shield } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type React from 'react';
import { useState } from 'react';
import { MatrixCard, type MatrixColumn, MatrixRow } from '@/components/permission-matrix';
import type { Platform, RoleTemplateApp, RoleTemplateFeature, RoleTemplateGrant } from '@/schemas/admin/role-templates';
import { PLATFORM_LABEL, PLATFORM_ORDER } from '@/services/admin/versions/businesses/plans/permissions.service';

// ── pure operations on the grants array (the form field value) ──
function indexOf(grants: RoleTemplateGrant[], featureId: string, platform: Platform): number {
  return grants.findIndex((g) => g.featureId === featureId && g.platform === platform);
}

// The switch — add a grant element (view-only) or remove it (drops its nested permissions)
function toggleGrant(grants: RoleTemplateGrant[], featureId: string, platform: Platform): RoleTemplateGrant[] {
  const i = indexOf(grants, featureId, platform);
  return i >= 0 ? grants.filter((_, x) => x !== i) : [...grants, { featureId, platform, permissions: [] }];
}

function togglePermission(
  grants: RoleTemplateGrant[],
  featureId: string,
  permId: string,
  platform: Platform,
): RoleTemplateGrant[] {
  const i = indexOf(grants, featureId, platform);
  if (i < 0) return grants;
  const el = grants[i];
  const permissions = el.permissions.includes(permId)
    ? el.permissions.filter((p) => p !== permId)
    : [...el.permissions, permId];
  return grants.map((g, x) => (x === i ? { ...g, permissions } : g));
}

function toggleAll(
  grants: RoleTemplateGrant[],
  featureId: string,
  platform: Platform,
  allIds: string[],
): RoleTemplateGrant[] {
  const i = indexOf(grants, featureId, platform);
  if (i < 0) return grants;
  const el = grants[i];
  const allOn = allIds.length > 0 && allIds.every((id) => el.permissions.includes(id));
  return grants.map((g, x) => (x === i ? { ...g, permissions: allOn ? [] : [...allIds] } : g));
}

function appPlatforms(app: RoleTemplateApp): Platform[] {
  return PLATFORM_ORDER.filter((p) => app.features.some((f) => f.platforms.includes(p)));
}

// A controlled form field: `value` is the grants array, `onChange` emits the next array. Used inside a quantum
// <Form> with a `name` prop (auto-Controller) — the parent never watches per-toggle.
interface RoleGrantMatrixProps {
  apps: RoleTemplateApp[];
  name?: string;
  value?: RoleTemplateGrant[];
  onChange?: (next: RoleTemplateGrant[]) => void;
}

export const RoleGrantMatrix: React.FC<RoleGrantMatrixProps> = ({ apps, value = [], onChange }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const emit = (next: RoleTemplateGrant[]) => onChange?.(next);

  const grantSet = new Map(value.map((g) => [`${g.featureId}:${g.platform}`, new Set(g.permissions)]));
  const cellKey = (featureId: string, platform: Platform) => `${featureId}:${platform}`;
  const isOn = (featureId: string, platform: Platform) => grantSet.has(cellKey(featureId, platform));
  const perms = (featureId: string, platform: Platform) => grantSet.get(cellKey(featureId, platform));

  const toggleApp = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const grantCount = value.reduce((sum, g) => sum + g.permissions.length, 0);

  return (
    <div className="flex flex-1 flex-col gap-3">
      {apps.map((app) => {
        const platforms = appPlatforms(app);
        const columns: MatrixColumn[] = platforms.map((p) => ({ key: p, label: PLATFORM_LABEL[p] }));
        const total = app.features.length;
        const granted = app.features.filter((f) => platforms.some((p) => isOn(f.id, p))).length;

        return (
          <MatrixCard
            key={app.id}
            icon={app.icon}
            name={app.name}
            countLabel={`${granted}/${total} feature${total === 1 ? '' : 's'} granted`}
            columns={columns}
            expanded={expanded.has(app.id)}
            onToggleExpanded={() => toggleApp(app.id)}
          >
            {app.features.map((feature) => (
              <RoleFeatureRows
                key={feature.id}
                feature={feature}
                columns={columns}
                isOn={isOn}
                perms={perms}
                onToggleGrant={(p) => emit(toggleGrant(value, feature.id, p))}
                onTogglePermission={(permId, p) => emit(togglePermission(value, feature.id, permId, p))}
                onToggleAll={(p, allIds) => emit(toggleAll(value, feature.id, p, allIds))}
              />
            ))}
          </MatrixCard>
        );
      })}

      {/* Summary */}
      <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-muted-foreground">
        <Shield className="size-3.5" />
        <span>
          {value.length} feature(s) · {grantCount} grant(s)
        </span>
      </div>
    </div>
  );
};

function RoleFeatureRows({
  feature,
  columns,
  isOn,
  perms,
  onToggleGrant,
  onTogglePermission,
  onToggleAll,
}: {
  feature: RoleTemplateFeature;
  columns: MatrixColumn[];
  isOn: (featureId: string, platform: Platform) => boolean;
  perms: (featureId: string, platform: Platform) => Set<string> | undefined;
  onToggleGrant: (platform: Platform) => void;
  onTogglePermission: (permId: string, platform: Platform) => void;
  onToggleAll: (platform: Platform, allIds: string[]) => void;
}) {
  const onPlatform = (key: string) => feature.platforms.includes(key as Platform);
  const on = (key: string) => onPlatform(key) && isOn(feature.id, key as Platform);
  const anyOn = columns.some((c) => on(c.key));
  const allIds = feature.permissions.map((p) => p.featurePermissionId);

  return (
    <div className={anyOn ? 'bg-muted/20' : undefined}>
      <MatrixRow
        label={
          <span className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
              <DynamicIcon name={(feature.lucideIcon ?? 'square') as IconName} className="size-3.5" />
            </span>
            <span className="truncate">{feature.name}</span>
          </span>
        }
        columns={columns}
        renderCell={(key) =>
          onPlatform(key) ? (
            <CompactSwitch checked={on(key)} onCheckedChange={() => onToggleGrant(key as Platform)} />
          ) : null
        }
      />

      {anyOn && (
        <div className="animate-in fade-in slide-in-from-top-1 pb-1.5 duration-200">
          <MatrixRow
            indent
            label="All"
            labelClassName="text-sm font-medium text-foreground/80"
            columns={columns}
            renderCell={(key) => {
              const set = on(key) ? perms(feature.id, key as Platform) : undefined;
              if (!set) return null;
              const allOn = allIds.length > 0 && allIds.every((id) => set.has(id));
              const someOn = allIds.some((id) => set.has(id)) && !allOn;
              return (
                <Checkbox
                  checked={allOn ? true : someOn ? 'indeterminate' : false}
                  onCheckedChange={() => onToggleAll(key as Platform, allIds)}
                />
              );
            }}
          />

          {feature.permissions.map((perm) => (
            <MatrixRow
              key={perm.featurePermissionId}
              indent
              label={perm.label}
              labelClassName="text-sm text-muted-foreground"
              columns={columns}
              renderCell={(key) =>
                on(key) ? (
                  <Checkbox
                    checked={perms(feature.id, key as Platform)?.has(perm.featurePermissionId) ?? false}
                    onCheckedChange={() => onTogglePermission(perm.featurePermissionId, key as Platform)}
                  />
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
