import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import { Lock } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type React from 'react';
import { useState } from 'react';
import { MatrixCard, type MatrixColumn, MatrixRow } from '@/components/permission-matrix';
import {
  PLATFORM_LABEL,
  PLATFORM_ORDER,
  type PlanMatrixApp,
  type PlanMatrixFeature,
  type PlanUnlock,
  type Platform,
} from '@/services/admin/versions/businesses/plans/permissions.service';

// ── pure operations on the unlocks array (the form field value) — no controlled re-render of the parent ──
function indexOf(unlocks: PlanUnlock[], featureId: string, platform: Platform): number {
  return unlocks.findIndex((u) => u.featureId === featureId && u.platform === platform);
}

// The switch — add an unlock element (view-only) or remove it (drops its nested permissions)
function toggleUnlock(unlocks: PlanUnlock[], featureId: string, platform: Platform): PlanUnlock[] {
  const i = indexOf(unlocks, featureId, platform);
  return i >= 0 ? unlocks.filter((_, x) => x !== i) : [...unlocks, { featureId, platform, permissions: [] }];
}

// Toggle one permission id within its unlock element
function togglePermission(unlocks: PlanUnlock[], featureId: string, permId: string, platform: Platform): PlanUnlock[] {
  const i = indexOf(unlocks, featureId, platform);
  if (i < 0) return unlocks;
  const el = unlocks[i];
  const permissions = el.permissions.includes(permId)
    ? el.permissions.filter((p) => p !== permId)
    : [...el.permissions, permId];
  return unlocks.map((u, x) => (x === i ? { ...u, permissions } : u));
}

// The "All" master — unlock every permission of the feature on a platform, or clear them
function toggleAll(unlocks: PlanUnlock[], featureId: string, platform: Platform, allIds: string[]): PlanUnlock[] {
  const i = indexOf(unlocks, featureId, platform);
  if (i < 0) return unlocks;
  const el = unlocks[i];
  const allOn = allIds.length > 0 && allIds.every((id) => el.permissions.includes(id));
  return unlocks.map((u, x) => (x === i ? { ...u, permissions: allOn ? [] : [...allIds] } : u));
}

function appPlatforms(app: PlanMatrixApp): Platform[] {
  return PLATFORM_ORDER.filter((p) => app.features.some((f) => f.platforms.includes(p)));
}

// A controlled form field: `value` is the unlocks array, `onChange` emits the next array. Drop it inside a quantum
// <Form> with a `name` prop and it auto-registers via Controller — the parent never watches per-toggle.
interface PlanMatrixProps {
  apps: PlanMatrixApp[];
  name?: string;
  value?: PlanUnlock[];
  onChange?: (next: PlanUnlock[]) => void;
}

export const PlanMatrix: React.FC<PlanMatrixProps> = ({ apps, value = [], onChange }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const emit = (next: PlanUnlock[]) => onChange?.(next);

  const unlockSet = new Map(value.map((u) => [`${u.featureId}:${u.platform}`, new Set(u.permissions)]));
  const cellKey = (featureId: string, platform: Platform) => `${featureId}:${platform}`;
  const isOn = (featureId: string, platform: Platform) => unlockSet.has(cellKey(featureId, platform));
  const perms = (featureId: string, platform: Platform) => unlockSet.get(cellKey(featureId, platform));

  const toggleApp = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const permissionCount = value.reduce((sum, u) => sum + u.permissions.length, 0);

  return (
    <div className="flex flex-1 flex-col gap-3">
      {apps.map((app) => {
        const platforms = appPlatforms(app);
        const columns: MatrixColumn[] = platforms.map((p) => ({ key: p, label: PLATFORM_LABEL[p] }));
        const total = app.features.length;
        const unlocked = app.features.filter((f) => platforms.some((p) => isOn(f.id, p))).length;

        return (
          <MatrixCard
            key={app.id}
            icon={app.icon}
            name={app.name}
            countLabel={`${unlocked}/${total} feature${total === 1 ? '' : 's'} unlocked`}
            columns={columns}
            expanded={expanded.has(app.id)}
            onToggleExpanded={() => toggleApp(app.id)}
          >
            {app.features.map((feature) => (
              <PlanFeatureRows
                key={feature.id}
                feature={feature}
                columns={columns}
                isOn={isOn}
                perms={perms}
                onToggleUnlock={(p) => emit(toggleUnlock(value, feature.id, p))}
                onTogglePermission={(permId, p) => emit(togglePermission(value, feature.id, permId, p))}
                onToggleAll={(p, allIds) => emit(toggleAll(value, feature.id, p, allIds))}
              />
            ))}
          </MatrixCard>
        );
      })}

      {/* Summary */}
      <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        <span>
          {value.length} feature(s) · {permissionCount} unlock(s)
        </span>
      </div>
    </div>
  );
};

function PlanFeatureRows({
  feature,
  columns,
  isOn,
  perms,
  onToggleUnlock,
  onTogglePermission,
  onToggleAll,
}: {
  feature: PlanMatrixFeature;
  columns: MatrixColumn[];
  isOn: (featureId: string, platform: Platform) => boolean;
  perms: (featureId: string, platform: Platform) => Set<string> | undefined;
  onToggleUnlock: (platform: Platform) => void;
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
            <CompactSwitch checked={on(key)} onCheckedChange={() => onToggleUnlock(key as Platform)} />
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
