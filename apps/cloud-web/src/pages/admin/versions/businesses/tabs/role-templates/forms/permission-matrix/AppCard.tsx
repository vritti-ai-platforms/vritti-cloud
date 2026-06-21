import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type { Platform, RoleTemplateApp, RoleTemplateFeature } from '@/schemas/admin/role-templates';
import { FeatureGroup } from './FeatureGroup';
import { appPlatforms, grantKey, PLATFORM_LABEL } from './utils';

interface AppCardProps {
  app: RoleTemplateApp;
  selected: Set<string>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onTogglePermission: (featurePermissionId: string, platform: Platform) => void;
  onToggleFeatureColumn: (feature: RoleTemplateFeature, platform: Platform) => void;
}

// Granted / total permission count for one platform across all of an app's features
function platformCounts(
  app: RoleTemplateApp,
  platform: Platform,
  selected: Set<string>,
): { count: number; total: number } {
  let count = 0;
  let total = 0;
  for (const feature of app.features) {
    if (!feature.platforms.includes(platform)) continue;
    for (const perm of feature.permissions) {
      total += 1;
      if (selected.has(grantKey(perm.featurePermissionId, platform))) count += 1;
    }
  }
  return { count, total };
}

// An app as a card (layer 1): bold section header + a single labeled permission grid for its features (layer 2)
export const AppCard: React.FC<AppCardProps> = ({
  app,
  selected,
  expanded,
  onToggleExpanded,
  onTogglePermission,
  onToggleFeatureColumn,
}) => {
  const columns = appPlatforms(app);
  const featureCount = app.features.length;

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
        {/* Column header — labeled once per app, with the app's granted/total count per platform */}
        <div className="flex items-center gap-3 border-y bg-background px-4 py-2">
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Permission
          </span>
          <div className="flex">
            {columns.map((pf) => {
              const { count, total } = platformCounts(app, pf, selected);
              const full = count > 0 && count === total;
              return (
                <div key={pf} className="flex w-24 flex-col items-center gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {PLATFORM_LABEL[pf]}
                  </span>
                  <span
                    className={`text-[11px] tabular-nums ${full ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                  >
                    {count}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature groups */}
        <div className="divide-y bg-background">
          {app.features.map((feature) => (
            <FeatureGroup
              key={feature.id}
              feature={feature}
              columns={columns}
              selected={selected}
              onTogglePermission={onTogglePermission}
              onToggleColumn={onToggleFeatureColumn}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  );
};
