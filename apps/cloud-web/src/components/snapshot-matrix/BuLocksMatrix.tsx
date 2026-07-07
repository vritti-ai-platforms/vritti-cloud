import { Badge } from '@vritti/quantum-ui/Badge';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import { Tooltip } from '@vritti/quantum-ui/Tooltip';
import type {
  BuFeatureLocks,
  BuMatrixApp,
  BuMatrixCell,
  BuMatrixFeature,
  PlatformBucket,
} from '@vritti/quantum-ui/types/catalog-resolver';
import { Lock, LockKeyhole } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import { MATRIX_PLATFORMS, PLATFORM_LABEL } from '@/schemas/cloud/bu-matrix';
import {
  isCodeLockedIn,
  isPlatformLockedIn,
  normalizeLocksCell,
  toggleCodeLock,
  togglePlatformLock,
} from './selection';

// Controlled form field — drop it inside a quantum <Form> with a `name` prop and it auto-registers via Controller.
// The BU lock editor's twin of SnapshotMatrix: `value` IS the deny-list (BuFeatureLocks) — switch ON = whole
// feature locked on that platform (null), checked box = that permission locked. Everything unchecked = available.
interface BuLocksMatrixProps {
  apps: BuMatrixApp[];
  name?: string;
  value?: BuFeatureLocks;
  onChange?: (next: BuFeatureLocks) => void;
  // Read-only render — switches/checkboxes are disabled (show state), plan locks and upsell render identically
  readOnly?: boolean;
}

// The in-plan permission codes of a feature on a platform — what a whole-platform lock covers
function inPlanCodes(feature: BuMatrixFeature, platform: PlatformBucket): string[] {
  return feature.permissions.filter((p) => p[platform]?.inPlan).map((p) => p.code);
}

// True when the feature ships on this platform but the plan unlocks nothing there (nothing to lock — upsell chip)
function lockedOnPlatform(feature: BuMatrixFeature, platform: PlatformBucket): boolean {
  return feature.platforms.includes(platform) && inPlanCodes(feature, platform).length === 0;
}

// Tooltip body for a plan-lock chip — lists the plans that unlock it (or a fallback when none do)
function lockTooltip(plans: string[]): React.ReactNode {
  if (plans.length === 0) return 'Not included in your plan';
  return (
    <span>
      Available in <span className="font-semibold">{plans.join(', ')}</span>
    </span>
  );
}

// Plan names that would unlock this feature on a given platform (union across its locked cells) — the upsell
function platformUpsell(feature: BuMatrixFeature, platform: PlatformBucket): string[] {
  const names = new Set<string>();
  for (const perm of feature.permissions) {
    const cell = perm[platform];
    if (cell && !cell.inPlan) for (const n of cell.availableIn) names.add(n);
  }
  for (const n of feature.availableIn) names.add(n);
  return [...names];
}

// One (permission, platform) cell — checked = LOCKED for this business unit. A whole-platform lock (switch on)
// checks and freezes every box; otherwise each box locks its own permission. Plan-locked cells stay upsell chips.
function LockCell({
  cell,
  planLocked,
  platformLocked,
  checked,
  disabled,
  onToggle,
  readOnly,
}: {
  cell: BuMatrixCell | null;
  planLocked: boolean;
  platformLocked: boolean;
  checked: boolean;
  // Dependency gate — true when a prerequisite permission is no longer granted (it's force-locked here)
  disabled?: boolean;
  onToggle: () => void;
  readOnly?: boolean;
}) {
  if (cell === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  // The whole platform is plan-locked — its lock chip lives on the feature row, cells stay blank
  if (planLocked) {
    return null;
  }
  if (!cell.inPlan) {
    return (
      <Tooltip content={lockTooltip(cell.availableIn)}>
        <span className="flex size-5 items-center justify-center rounded bg-warning/15 text-warning">
          <Lock className="size-3" />
        </span>
      </Tooltip>
    );
  }
  const box = (
    <Checkbox checked={checked} disabled={readOnly || platformLocked || disabled} onCheckedChange={onToggle} />
  );
  if (!checked) return box;
  return (
    <Tooltip content="Locked for this business unit">
      <span className="relative inline-flex">
        {box}
        <span className="pointer-events-none absolute -bottom-1 -right-1 flex size-3 items-center justify-center text-destructive">
          <LockKeyhole className="size-2" />
        </span>
      </span>
    </Tooltip>
  );
}

// A single feature block: master row (name + per-platform lock switch) then one row per permission
function FeatureBlock({
  feature,
  locks,
  onToggleCode,
  onTogglePlatform,
  readOnly,
}: {
  feature: BuMatrixFeature;
  locks: BuFeatureLocks;
  onToggleCode: (featureCode: string, platform: PlatformBucket, permCode: string) => void;
  onTogglePlatform: (featureCode: string, platform: PlatformBucket) => void;
  readOnly?: boolean;
}) {
  const locked = !feature.inPlan;
  // Every platform the feature ships on is plan-locked — nothing here is lockable
  const fullyLocked = feature.platforms.length > 0 && feature.platforms.every((p) => lockedOnPlatform(feature, p));
  // A permission is GRANTED on a platform when it's in-plan and not currently locked — the DAG operates on this set
  const permByCode = new Map(feature.permissions.map((p) => [p.code, p]));
  const isGranted = (permCode: string, platform: PlatformBucket): boolean => {
    const cell = permByCode.get(permCode)?.[platform];
    return !!cell?.inPlan && !isCodeLockedIn(locks, feature.code, platform, permCode);
  };
  // Permission rows stay visible so per-permission locks are always editable — hidden only when fully plan-locked
  const expanded = !fullyLocked;
  // Plan names unlocking this feature (across platforms) — shown as the right-aligned upsell when locked
  const upsell = [...new Set([...platformUpsell(feature, 'web'), ...platformUpsell(feature, 'mobile')])];

  return (
    <div className={locked ? 'opacity-95' : undefined}>
      {/* Master row — feature name, right-aligned upsell, and a per-platform lock switch (or plan-lock chip) */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
          <DynamicIcon name={(feature.icon ?? 'square') as IconName} className="size-3.5" />
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-sm font-medium ${locked ? 'text-muted-foreground' : 'text-foreground'}`}
        >
          {feature.name}
        </span>
        {locked && upsell.length > 0 && (
          <Badge variant="outline" className="gap-1 border-warning/40 text-xs font-semibold text-warning">
            <Lock className="size-2.5" /> Available in {upsell.join(' / ')}
          </Badge>
        )}
        <div className="flex">
          {MATRIX_PLATFORMS.map((platform) => {
            if (!feature.platforms.includes(platform)) {
              return <div key={platform} className="w-24" />;
            }
            if (lockedOnPlatform(feature, platform)) {
              return (
                <div key={platform} className="flex w-24 justify-center">
                  <Tooltip content={lockTooltip(platformUpsell(feature, platform))}>
                    <span className="flex size-5 items-center justify-center rounded bg-warning/15 text-warning">
                      <Lock className="size-3" />
                    </span>
                  </Tooltip>
                </div>
              );
            }
            // The switch LOCKS the whole feature on that platform — ON = locked (red badge)
            if (isPlatformLockedIn(locks, feature.code, platform)) {
              return (
                <div key={platform} className="flex w-24 justify-center">
                  <Tooltip content="Feature locked for this business unit">
                    <span className="relative inline-flex">
                      <CompactSwitch
                        checked
                        disabled={readOnly}
                        onCheckedChange={() => onTogglePlatform(feature.code, platform)}
                      />
                      <span className="pointer-events-none absolute -bottom-1 -right-1 flex size-3 items-center justify-center text-destructive">
                        <LockKeyhole className="size-2" />
                      </span>
                    </span>
                  </Tooltip>
                </div>
              );
            }
            return (
              <div key={platform} className="flex w-24 justify-center">
                <CompactSwitch
                  checked={false}
                  disabled={readOnly}
                  onCheckedChange={() => onTogglePlatform(feature.code, platform)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission rows — always visible (per-permission locks stay editable) unless fully plan-locked */}
      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 pb-1 duration-200">
          {feature.permissions.map((perm) => (
            <div key={perm.code} className="flex items-center gap-3 py-1.5 pl-12 pr-4">
              <span className="flex-1 truncate text-sm text-foreground/80">{perm.label}</span>
              <div className="flex">
                {MATRIX_PLATFORMS.map((platform) => (
                  <div key={platform} className="flex w-24 justify-center">
                    <LockCell
                      cell={perm[platform]}
                      planLocked={lockedOnPlatform(feature, platform)}
                      platformLocked={isPlatformLockedIn(locks, feature.code, platform)}
                      checked={isCodeLockedIn(locks, feature.code, platform, perm.code)}
                      disabled={!perm.dependsOn.every((dep) => isGranted(dep, platform))}
                      onToggle={() => onToggleCode(feature.code, platform, perm.code)}
                      readOnly={readOnly}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// An app card (collapsed by default): header with an unlocked/total count, then its feature blocks
function AppCard({
  app,
  locks,
  onToggleCode,
  onTogglePlatform,
  readOnly,
}: {
  app: BuMatrixApp;
  locks: BuFeatureLocks;
  onToggleCode: (featureCode: string, platform: PlatformBucket, permCode: string) => void;
  onTogglePlatform: (featureCode: string, platform: PlatformBucket) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Collapsible
        open={open}
        onOpenChange={() => setOpen((o) => !o)}
        headerClassName="bg-muted/50 px-4 py-3 transition-colors hover:bg-muted"
        triggerClassName="gap-2.5"
        trigger={
          <>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DynamicIcon name={(app.icon ?? 'layers') as IconName} className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col items-start gap-0.5 leading-none">
              <span className="text-sm font-semibold text-foreground">{app.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {app.unlockedCount}/{app.totalCount} unlocked
              </span>
            </div>
          </>
        }
      >
        {/* Column header */}
        <div className="flex items-center gap-3 border-y bg-background px-4 py-2">
          <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Feature</span>
          <div className="flex">
            {MATRIX_PLATFORMS.map((platform) => (
              <span
                key={platform}
                className="w-24 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {PLATFORM_LABEL[platform]}
              </span>
            ))}
          </div>
        </div>

        {/* Feature blocks */}
        <div className="divide-y bg-background">
          {app.features.map((feature) => (
            <FeatureBlock
              key={feature.code}
              feature={feature}
              locks={locks}
              onToggleCode={onToggleCode}
              onTogglePlatform={onTogglePlatform}
              readOnly={readOnly}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// The BU lock matrix — a controlled form field over the deny-list. `value` and `onChange` are injected by
// quantum <Form> when used with a `name` prop; every switch/checkbox edits the deny-list immutably.
export const BuLocksMatrix: React.FC<BuLocksMatrixProps> = ({ apps, value = {}, onChange, readOnly }) => {
  // Feature lookup so a lock toggle can re-derive its cell through the dependency filter (deps live on the feature)
  const featureByCode = new Map<string, BuMatrixFeature>();
  for (const app of apps) for (const feature of app.features) featureByCode.set(feature.code, feature);

  const onToggleCode = (featureCode: string, platform: PlatformBucket, permCode: string) => {
    const next = toggleCodeLock(value, featureCode, platform, permCode);
    const feature = featureByCode.get(featureCode);
    onChange?.(feature ? normalizeLocksCell(next, feature, platform) : next);
  };
  const onTogglePlatform = (featureCode: string, platform: PlatformBucket) =>
    onChange?.(togglePlatformLock(value, featureCode, platform));

  return (
    <div className="flex flex-col gap-3">
      {apps.map((app) => (
        <AppCard
          key={app.code}
          app={app}
          locks={value}
          onToggleCode={onToggleCode}
          onTogglePlatform={onTogglePlatform}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};
