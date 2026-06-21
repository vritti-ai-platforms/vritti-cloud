import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import type { Platform, RoleTemplateFeature } from '@/schemas/admin/role-templates';
import { grantKey } from './utils';

interface FeatureGroupProps {
  feature: RoleTemplateFeature;
  // The app's platform columns (fixed slots so every cell lines up)
  columns: Platform[];
  selected: Set<string>;
  onTogglePermission: (featurePermissionId: string, platform: Platform) => void;
  onToggleColumn: (feature: RoleTemplateFeature, platform: Platform) => void;
}

// A feature as a parent/child group: a bold master row (tri-state "grant whole feature" per platform)
// followed by indented, muted permission rows with individual checkboxes.
export const FeatureGroup: React.FC<FeatureGroupProps> = ({
  feature,
  columns,
  selected,
  onTogglePermission,
  onToggleColumn,
}) => (
  <div className="py-1.5">
    {/* Master row — the feature */}
    <div className="flex items-center gap-3 px-4 py-1.5">
      <span className="flex-1 text-sm font-semibold text-foreground">{feature.name}</span>
      <div className="flex">
        {columns.map((pf) => {
          if (!feature.platforms.includes(pf)) return <div key={pf} className="w-24" />;
          const keys = feature.permissions.map((p) => grantKey(p.featurePermissionId, pf));
          const allOn = keys.length > 0 && keys.every((k) => selected.has(k));
          const someOn = keys.some((k) => selected.has(k));
          return (
            <div key={pf} className="flex w-24 flex-col items-center gap-0.5">
              <Checkbox
                checked={allOn ? true : someOn ? 'indeterminate' : false}
                onCheckedChange={() => onToggleColumn(feature, pf)}
              />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">All</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Child rows — individual permissions */}
    {feature.permissions.map((permission) => (
      <div key={permission.featurePermissionId} className="flex items-center gap-3 py-1 pl-10 pr-4">
        <span className="flex-1 text-sm text-muted-foreground">{permission.label}</span>
        <div className="flex">
          {columns.map((pf) =>
            feature.platforms.includes(pf) ? (
              <div key={pf} className="flex w-24 justify-center">
                <Checkbox
                  checked={selected.has(grantKey(permission.featurePermissionId, pf))}
                  onCheckedChange={() => onTogglePermission(permission.featurePermissionId, pf)}
                />
              </div>
            ) : (
              <div key={pf} className="w-24" />
            ),
          )}
        </div>
      </div>
    ))}
  </div>
);
