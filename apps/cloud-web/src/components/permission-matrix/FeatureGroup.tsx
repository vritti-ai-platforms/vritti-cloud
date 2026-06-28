import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import type { MatrixFeature, Platform } from '@/schemas/admin/permission-matrix';
import { cellKey, type MatrixState } from './utils';

interface FeatureGroupProps {
  feature: MatrixFeature;
  // The app's platform columns (fixed slots so every cell lines up)
  columns: Platform[];
  state: MatrixState;
  onToggleMembership: (featureId: string, platform: Platform) => void;
  onTogglePermission: (featureId: string, featurePermissionId: string, platform: Platform) => void;
  onToggleAll: (featureId: string, platform: Platform) => void;
}

// A feature row: name + a per-platform membership toggle. When a platform is on, an "All" master checkbox +
// the individual permission checkboxes reveal beneath; off hides them. A member with no boxes ticked = view-only.
export const FeatureGroup: React.FC<FeatureGroupProps> = ({
  feature,
  columns,
  state,
  onToggleMembership,
  onTogglePermission,
  onToggleAll,
}) => {
  const anyMember = columns.some((pf) => feature.platforms.includes(pf) && state.has(cellKey(feature.id, pf)));

  return (
    <div className={anyMember ? 'bg-muted/20' : undefined}>
      {/* Master row — the feature + per-platform membership switch */}
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="flex-1 text-sm font-medium text-foreground">{feature.name}</span>
        <div className="flex">
          {columns.map((pf) =>
            feature.platforms.includes(pf) ? (
              <div key={pf} className="flex w-24 justify-center">
                <CompactSwitch
                  checked={state.has(cellKey(feature.id, pf))}
                  onCheckedChange={() => onToggleMembership(feature.id, pf)}
                />
              </div>
            ) : (
              <div key={pf} className="w-24" />
            ),
          )}
        </div>
      </div>

      {/* Revealed for member platforms: an "All" master checkbox row, then the individual permissions */}
      {anyMember && (
        <div className="animate-in fade-in slide-in-from-top-1 pb-1.5 duration-200">
          {/* All (tri-state) — grant/clear every permission of the feature on a platform */}
          <div className="flex items-center gap-3 py-1 pl-10 pr-4">
            <span className="flex-1 text-[13px] font-medium text-foreground/80">All</span>
            <div className="flex">
              {columns.map((pf) => {
                const set = feature.platforms.includes(pf) ? state.get(cellKey(feature.id, pf)) : undefined;
                if (!set) return <div key={pf} className="w-24" />;
                const ids = feature.permissions.map((p) => p.featurePermissionId);
                const allOn = ids.length > 0 && ids.every((id) => set.has(id));
                const someOn = ids.some((id) => set.has(id)) && !allOn;
                return (
                  <div key={pf} className="flex w-24 justify-center">
                    <Checkbox
                      checked={allOn ? true : someOn ? 'indeterminate' : false}
                      onCheckedChange={() => onToggleAll(feature.id, pf)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {feature.permissions.map((permission) => (
            <div key={permission.featurePermissionId} className="flex items-center gap-3 py-1 pl-10 pr-4">
              <span className="flex-1 text-[13px] text-muted-foreground">{permission.label}</span>
              <div className="flex">
                {columns.map((pf) => {
                  const member = feature.platforms.includes(pf) && state.has(cellKey(feature.id, pf));
                  return member ? (
                    <div key={pf} className="flex w-24 justify-center">
                      <Checkbox
                        checked={state.get(cellKey(feature.id, pf))?.has(permission.featurePermissionId) ?? false}
                        onCheckedChange={() => onTogglePermission(feature.id, permission.featurePermissionId, pf)}
                      />
                    </div>
                  ) : (
                    <div key={pf} className="w-24" />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
