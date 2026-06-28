import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type { MatrixApp, Platform } from '@/schemas/admin/permission-matrix';
import { FeatureGroup } from './FeatureGroup';
import { addedFeatureCount, appPlatforms, type MatrixState, PLATFORM_LABEL } from './utils';

interface AppCardProps {
  app: MatrixApp;
  state: MatrixState;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleMembership: (featureId: string, platform: Platform) => void;
  onTogglePermission: (featureId: string, featurePermissionId: string, platform: Platform) => void;
  onToggleAll: (featureId: string, platform: Platform) => void;
}

// An app as a card (layer 1): section header with an added/total feature count + the platform-column grid (layer 2)
export const AppCard: React.FC<AppCardProps> = ({
  app,
  state,
  expanded,
  onToggleExpanded,
  onToggleMembership,
  onTogglePermission,
  onToggleAll,
}) => {
  const columns = appPlatforms(app);
  const total = app.features.length;
  const added = addedFeatureCount(app, columns, state);
  const full = added > 0 && added === total;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Collapsible
        open={expanded}
        onOpenChange={onToggleExpanded}
        headerClassName="bg-muted/50 px-4 py-3 transition-colors hover:bg-muted"
        triggerClassName="gap-2.5"
        trigger={
          <>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DynamicIcon name={app.icon as IconName} className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col items-start gap-0.5 leading-none">
              <span className="text-[15px] font-semibold text-foreground">{app.name}</span>
              <span className={`text-xs tabular-nums ${full ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                {added}/{total} feature{total === 1 ? '' : 's'} added
              </span>
            </div>
          </>
        }
      >
        {/* Column header — platform labels, aligned with the toggle/checkbox columns */}
        <div className="flex items-center gap-3 border-y bg-background px-4 py-2">
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Feature
          </span>
          <div className="flex">
            {columns.map((pf) => (
              <span
                key={pf}
                className="w-24 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {PLATFORM_LABEL[pf]}
              </span>
            ))}
          </div>
        </div>

        {/* Feature groups */}
        <div className="divide-y bg-background">
          {app.features.map((feature) => (
            <FeatureGroup
              key={feature.id}
              feature={feature}
              columns={columns}
              state={state}
              onToggleMembership={onToggleMembership}
              onTogglePermission={onTogglePermission}
              onToggleAll={onToggleAll}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  );
};
