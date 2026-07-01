import { Badge } from '@vritti/quantum-ui/Badge';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import { Lock } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import {
  type BuMatrixApp,
  type BuMatrixCell,
  type BuMatrixFeature,
  type FeatureUnlocks,
  MATRIX_PLATFORMS,
  type MatrixPlatform,
  PLATFORM_LABEL,
} from '@/schemas/cloud/bu-matrix';
import { isCheckedIn, isMemberIn, toggleMemberIn, togglePermIn } from './selection';

// Controlled form field — `value` is the code-keyed allow-list, `onChange` emits the next value. Drop it inside a
// quantum <Form> with a `name` prop and it auto-registers via Controller (switches + checkboxes become form fields).
interface SnapshotMatrixProps {
  apps: BuMatrixApp[];
  name?: string;
  value?: FeatureUnlocks;
  onChange?: (next: FeatureUnlocks) => void;
  // Read-only render — switches/checkboxes are disabled (show state), everything else (locks, upsell) is identical
  readOnly?: boolean;
}

// Internal callback bundle the sub-components consume
interface MatrixHandlers {
  isMember: (featureCode: string, platform: MatrixPlatform) => boolean;
  isChecked: (featureCode: string, platform: MatrixPlatform, permCode: string) => boolean;
  onToggle: (featureCode: string, platform: MatrixPlatform, permCode: string) => void;
  onToggleMember: (featureCode: string, platform: MatrixPlatform, inPlanCodes: string[]) => void;
}

// The in-plan permission codes of a feature on a platform — what the feature switch grants/clears
function inPlanCodes(feature: BuMatrixFeature, platform: MatrixPlatform): string[] {
  return feature.permissions.filter((p) => p[platform]?.inPlan).map((p) => p.code);
}

// True when the feature ships on this platform but the plan unlocks nothing there (the switch becomes a lock)
function lockedOnPlatform(feature: BuMatrixFeature, platform: MatrixPlatform): boolean {
  return feature.platforms.includes(platform) && inPlanCodes(feature, platform).length === 0;
}

// Plan names that would unlock this feature on a given platform (union across its locked cells) — the upsell
function platformUpsell(feature: BuMatrixFeature, platform: MatrixPlatform): string[] {
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
}: {
  cell: BuMatrixCell | null;
  platformLocked: boolean;
  member: boolean;
  checked: boolean;
  onToggle: () => void;
  readOnly?: boolean;
}) {
  if (cell === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  if (platformLocked) {
    return null;
  }
  if (!cell.inPlan) {
    const tip = cell.availableIn.length ? `Available in ${cell.availableIn.join(', ')}` : 'Not in your plan';
    return (
      <span title={tip} className="flex size-5 items-center justify-center rounded bg-warning/15 text-warning">
        <Lock className="size-3" />
      </span>
    );
  }
  if (!member) {
    return <Checkbox checked={false} disabled />;
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
}: {
  feature: BuMatrixFeature;
  isMember: MatrixHandlers['isMember'];
  isChecked: MatrixHandlers['isChecked'];
  onToggle: MatrixHandlers['onToggle'];
  onToggleMember: MatrixHandlers['onToggleMember'];
  readOnly?: boolean;
}) {
  const locked = !feature.inPlan;
  // Reveal the permission rows only when a switch is on — collapse for plan-locked or switched-off features
  const expanded = isMember(feature.code, 'web') || isMember(feature.code, 'mobile');
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
              const up = platformUpsell(feature, platform);
              const tip = up.length ? `Available in ${up.join(', ')}` : 'Not in your plan';
              return (
                <div key={platform} className="flex w-24 justify-center">
                  <span
                    title={tip}
                    className="flex size-5 items-center justify-center rounded bg-warning/15 text-warning"
                  >
                    <Lock className="size-3" />
                  </span>
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
}: {
  app: BuMatrixApp;
  isMember: MatrixHandlers['isMember'];
  isChecked: MatrixHandlers['isChecked'];
  onToggle: MatrixHandlers['onToggle'];
  onToggleMember: MatrixHandlers['onToggleMember'];
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
              isMember={isMember}
              isChecked={isChecked}
              onToggle={onToggle}
              onToggleMember={onToggleMember}
              readOnly={readOnly}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// The shared snapshot-driven Apps & Features matrix — a controlled form field. `value` (the code-keyed allow-list)
// and `onChange` are injected by quantum <Form> when used with a `name` prop; every switch/checkbox edits `value`.
export const SnapshotMatrix: React.FC<SnapshotMatrixProps> = ({ apps, value = {}, onChange, readOnly }) => {
  const handlers: MatrixHandlers = {
    isMember: (code, platform) => isMemberIn(value, code, platform),
    isChecked: (code, platform, permCode) => isCheckedIn(value, code, platform, permCode),
    onToggle: (code, platform, permCode) => onChange?.(togglePermIn(value, code, platform, permCode)),
    onToggleMember: (code, platform, inPlanCodes) => onChange?.(toggleMemberIn(value, code, platform, inPlanCodes)),
  };

  return (
    <div className="flex flex-col gap-3">
      {apps.map((app) => (
        <AppCard key={app.code} app={app} {...handlers} readOnly={readOnly} />
      ))}
    </div>
  );
};
