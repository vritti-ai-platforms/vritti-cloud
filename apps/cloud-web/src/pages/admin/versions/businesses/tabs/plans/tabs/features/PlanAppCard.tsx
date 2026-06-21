import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type { AvailablePlanApp } from '@/services/admin/versions/businesses/plans/permissions.service';
import { PlanFeatureGroup } from './PlanFeatureGroup';

interface PlanAppCardProps {
  app: AvailablePlanApp;
  selected: Set<string>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onTogglePermission: (featurePermissionId: string) => void;
  onToggleFeature: (featurePermissionIds: string[]) => void;
}

// An app as a card (layer 1): bold section header + a single labeled unlock grid for its features (layer 2)
export const PlanAppCard: React.FC<PlanAppCardProps> = ({
  app,
  selected,
  expanded,
  onToggleExpanded,
  onTogglePermission,
  onToggleFeature,
}) => {
  const featureCount = app.features.length;
  const ids = app.features.flatMap((f) => f.permissions.map((p) => p.featurePermissionId));
  const count = ids.filter((id) => selected.has(id)).length;
  const total = ids.length;
  const full = count > 0 && count === total;

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Collapsible
        open={expanded}
        onOpenChange={onToggleExpanded}
        headerClassName="bg-muted/60 px-4 py-3 transition-colors hover:bg-muted"
        triggerClassName="gap-2.5"
        trigger={
          <>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <DynamicIcon name={app.icon as IconName} className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col items-start gap-0.5 leading-none">
              <span className="text-[15px] font-semibold text-foreground">{app.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {featureCount} feature{featureCount === 1 ? '' : 's'}
              </span>
            </div>
          </>
        }
      >
        {/* Column header — labeled once per app, with the app's unlocked/total count */}
        <div className="flex items-center gap-3 border-y bg-background px-4 py-2">
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Permission
          </span>
          <div className="flex w-28 flex-col items-center gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Unlocked</span>
            <span
              className={`text-[11px] tabular-nums ${full ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
            >
              {count}/{total}
            </span>
          </div>
        </div>

        {/* Feature groups */}
        <div className="divide-y bg-background">
          {app.features.map((feature) => (
            <PlanFeatureGroup
              key={feature.id}
              feature={feature}
              selected={selected}
              onTogglePermission={onTogglePermission}
              onToggleFeature={onToggleFeature}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  );
};
