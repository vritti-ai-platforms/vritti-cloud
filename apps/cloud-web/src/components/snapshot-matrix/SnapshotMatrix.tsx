import { Badge } from '@vritti/quantum-ui/Badge';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import { Tooltip } from '@vritti/quantum-ui/Tooltip';
import type {
  BuMatrixApp,
  BuMatrixCell,
  BuMatrixFeature,
  FeatureUnlocks,
  PlatformBucket,
} from '@vritti/quantum-ui/types/catalog-resolver';
import { Lock } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import { MATRIX_PLATFORMS, PLATFORM_LABEL } from '@/schemas/cloud/bu-matrix';
import { isCheckedIn, isMemberIn, toggleMemberIn, togglePermIn } from './selection';

// Controlled form field — drop it inside a quantum <Form> with a `name` prop and it auto-registers via Controller.
// Role editors: `value` is the effective allow-list — switch ON / checked = granted.
// The BU lock editor uses the BuLocksMatrix twin instead.
interface SnapshotMatrixProps {
  apps: BuMatrixApp[];
  name?: string;
  value?: FeatureUnlocks;
  onChange?: (next: FeatureUnlocks) => void;
  // Read-only render — switches/checkboxes are disabled (show state), everything else (locks, upsell) is identical
  readOnly?: boolean;
  // When true, plan-locked cells stay grantable (dormant until upgrade) — role editor ONLY.
  allowLockedGrants?: boolean;
}

// Internal callback bundle the sub-components consume
interface MatrixHandlers {
  isMember: (featureCode: string, platform: PlatformBucket) => boolean;
  isChecked: (featureCode: string, platform: PlatformBucket, permCode: string) => boolean;
  onToggle: (featureCode: string, platform: PlatformBucket, permCode: string) => void;
  onToggleMember: (featureCode: string, platform: PlatformBucket, inPlanCodes: string[]) => void;
}

// The in-plan permission codes of a feature on a platform — what the feature switch grants/clears
function inPlanCodes(feature: BuMatrixFeature, platform: PlatformBucket): string[] {
  return feature.permissions.filter((p) => p[platform]?.inPlan).map((p) => p.code);
}

// True when the feature ships on this platform but the plan unlocks nothing there (the switch becomes a lock)
function lockedOnPlatform(feature: BuMatrixFeature, platform: PlatformBucket): boolean {
  return feature.platforms.includes(platform) && inPlanCodes(feature, platform).length === 0;
}

// Tooltip body for a lock chip — lists the plans that unlock it (or a fallback when none do)
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

// One (permission, platform) cell. When the WHOLE platform is plan-locked the lock lives on the feature row, so the
// per-permission cells are left blank; otherwise: — when N/A, a lock + upsell for a single locked permission, a
// disabled box until the switch is on, and an active checkbox once it is.
function Cell({
  cell,
  platformLocked,
  member,
  checked,
  onToggle,
  readOnly,
  allowLockedGrants,
}: {
  cell: BuMatrixCell | null;
  platformLocked: boolean;
  member: boolean;
  checked: boolean;
  onToggle: () => void;
  readOnly?: boolean;
  allowLockedGrants?: boolean;
}) {
  if (cell === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  // Without locked-grant editing the platform lock lives on the feature row, so locked cells stay blank
  if (platformLocked && !allowLockedGrants) {
    return null;
  }
  // Platform switch is off — hide the permission checkboxes for that platform entirely
  if (!member) {
    return null;
  }
  if (!cell.inPlan) {
    if (readOnly || !allowLockedGrants) {
      return (
        <Tooltip content={lockTooltip(cell.availableIn)}>
          <span className="flex size-5 items-center justify-center rounded bg-warning/15 text-warning">
            <Lock className="size-3" />
          </span>
        </Tooltip>
      );
    }
    // Role editor: plan-locked permissions are still GRANTABLE (dormant until upgrade) — checkbox with a
    // small lock badge on its bottom-right corner (hover shows the unlocking plans)
    return (
      <Tooltip content={lockTooltip(cell.availableIn)}>
        <span className="relative inline-flex">
          <Checkbox checked={checked} onCheckedChange={onToggle} />
          <span className="pointer-events-none absolute -bottom-1 -right-1 flex size-3 items-center justify-center text-warning">
            <Lock className="size-2" />
          </span>
        </span>
      </Tooltip>
    );
  }
  return <Checkbox checked={checked} disabled={readOnly} onCheckedChange={onToggle} />;
}

// A single feature block: master row (name + per-platform switch) then one row per permission
function FeatureBlock({
  feature,
  isMember,
  isChecked,
  onToggle,
  onToggleMember,
  readOnly,
  allowLockedGrants,
}: {
  feature: BuMatrixFeature;
  isMember: MatrixHandlers['isMember'];
  isChecked: MatrixHandlers['isChecked'];
  onToggle: MatrixHandlers['onToggle'];
  onToggleMember: MatrixHandlers['onToggleMember'];
  readOnly?: boolean;
  allowLockedGrants?: boolean;
}) {
  const locked = !feature.inPlan;
  // Every platform the feature ships on is plan-locked — nothing here is actionable
  const fullyLocked = feature.platforms.length > 0 && feature.platforms.every((p) => lockedOnPlatform(feature, p));
  // Permission rows reveal only while a switch is on; read-only collapses fully plan-locked features
  const expanded = (isMember(feature.code, 'web') || isMember(feature.code, 'mobile')) && !(readOnly && fullyLocked);
  // Plan names unlocking this feature (across platforms) — shown as the right-aligned upsell when locked
  const upsell = [...new Set([...platformUpsell(feature, 'web'), ...platformUpsell(feature, 'mobile')])];

  return (
    <div className={locked ? 'opacity-95' : undefined}>
      {/* Master row — feature name, right-aligned upsell, and a per-platform switch (or lock when plan-locked) */}
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
              // Plain lock by default (BU matrix / read-only). In the role editor the switch stays usable
              // (grants view-only membership, dormant until upgrade) with a small corner lock badge.
              if (readOnly || !allowLockedGrants) {
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
              return (
                <div key={platform} className="flex w-24 justify-center">
                  <Tooltip content={lockTooltip(platformUpsell(feature, platform))}>
                    <span className="relative inline-flex">
                      <CompactSwitch
                        checked={isMember(feature.code, platform)}
                        onCheckedChange={() => onToggleMember(feature.code, platform, inPlanCodes(feature, platform))}
                      />
                      <span className="pointer-events-none absolute -bottom-1 -right-1 flex size-3 items-center justify-center text-warning">
                        <Lock className="size-2" />
                      </span>
                    </span>
                  </Tooltip>
                </div>
              );
            }
            return (
              <div key={platform} className="flex w-24 justify-center">
                <CompactSwitch
                  checked={isMember(feature.code, platform)}
                  disabled={readOnly}
                  onCheckedChange={() => onToggleMember(feature.code, platform, inPlanCodes(feature, platform))}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission rows — revealed only when a platform switch is on (collapsed when locked or switched off) */}
      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 pb-1 duration-200">
          {feature.permissions.map((perm) => (
            <div key={perm.code} className="flex items-center gap-3 py-1.5 pl-12 pr-4">
              <span className="flex-1 truncate text-sm text-foreground/80">{perm.label}</span>
              <div className="flex">
                {MATRIX_PLATFORMS.map((platform) => (
                  <div key={platform} className="flex w-24 justify-center">
                    <Cell
                      cell={perm[platform]}
                      platformLocked={lockedOnPlatform(feature, platform)}
                      member={isMember(feature.code, platform)}
                      checked={isChecked(feature.code, platform, perm.code)}
                      onToggle={() => onToggle(feature.code, platform, perm.code)}
                      readOnly={readOnly}
                      allowLockedGrants={allowLockedGrants}
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
  isMember,
  isChecked,
  onToggle,
  onToggleMember,
  readOnly,
  allowLockedGrants,
}: {
  app: BuMatrixApp;
  isMember: MatrixHandlers['isMember'];
  isChecked: MatrixHandlers['isChecked'];
  onToggle: MatrixHandlers['onToggle'];
  onToggleMember: MatrixHandlers['onToggleMember'];
  readOnly?: boolean;
  allowLockedGrants?: boolean;
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
              isMember={isMember}
              isChecked={isChecked}
              onToggle={onToggle}
              onToggleMember={onToggleMember}
              readOnly={readOnly}
              allowLockedGrants={allowLockedGrants}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// The shared snapshot-driven Apps & Features matrix — a controlled form field. `value` (the code-keyed selection)
// and `onChange` are injected by quantum <Form> when used with a `name` prop; every switch/checkbox edits `value`.
export const SnapshotMatrix: React.FC<SnapshotMatrixProps> = ({
  apps,
  value = {},
  onChange,
  readOnly,
  allowLockedGrants,
}) => {
  const handlers: MatrixHandlers = {
    isMember: (code, platform) => isMemberIn(value, code, platform),
    isChecked: (code, platform, permCode) => isCheckedIn(value, code, platform, permCode),
    onToggle: (code, platform, permCode) => onChange?.(togglePermIn(value, code, platform, permCode)),
    onToggleMember: (code, platform, inPlanCodes) => onChange?.(toggleMemberIn(value, code, platform, inPlanCodes)),
  };

  return (
    <div className="flex flex-col gap-3">
      {apps.map((app) => (
        <AppCard key={app.code} app={app} {...handlers} readOnly={readOnly} allowLockedGrants={allowLockedGrants} />
      ))}
    </div>
  );
};
