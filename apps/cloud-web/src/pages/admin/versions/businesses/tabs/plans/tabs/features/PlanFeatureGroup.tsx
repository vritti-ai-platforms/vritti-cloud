import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import type { AvailablePlanFeature } from '@/services/admin/versions/businesses/plans/permissions.service';

interface PlanFeatureGroupProps {
  feature: AvailablePlanFeature;
  selected: Set<string>;
  onTogglePermission: (featurePermissionId: string) => void;
  onToggleFeature: (featurePermissionIds: string[]) => void;
}

// A feature as a parent/child group: a bold master row (tri-state "unlock whole feature")
// followed by indented, muted permission rows with individual unlock checkboxes.
export const PlanFeatureGroup: React.FC<PlanFeatureGroupProps> = ({
  feature,
  selected,
  onTogglePermission,
  onToggleFeature,
}) => {
  const ids = feature.permissions.map((p) => p.featurePermissionId);
  const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
  const someOn = ids.some((id) => selected.has(id)) && !allOn;

  return (
    <div className="py-1.5">
      {/* Master row — the feature */}
      <div className="flex items-center gap-3 px-4 py-1.5">
        <span className="flex-1 text-sm font-semibold text-foreground">{feature.name}</span>
        <div className="flex w-28 flex-col items-center gap-0.5">
          <Checkbox
            checked={allOn ? true : someOn ? 'indeterminate' : false}
            onCheckedChange={() => onToggleFeature(ids)}
          />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">All</span>
        </div>
      </div>

      {/* Child rows — individual permissions */}
      {feature.permissions.map((permission) => (
        <div key={permission.featurePermissionId} className="flex items-center gap-3 py-1 pl-10 pr-4">
          <span className="flex-1 text-sm text-muted-foreground">{permission.label}</span>
          <div className="flex w-28 justify-center">
            <Checkbox
              checked={selected.has(permission.featurePermissionId)}
              onCheckedChange={() => onTogglePermission(permission.featurePermissionId)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
