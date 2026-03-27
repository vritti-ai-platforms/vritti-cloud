import { useUpdateBusinessUnit } from '@hooks/cloud/org-business-units';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { Building2, MapPin, Pencil } from 'lucide-react';
import type { BusinessUnit, CreateBusinessUnitData } from '@/schemas/cloud/org-business-units';
import { BusinessUnitForm } from '../components/BusinessUnitForm';

interface OverviewTabProps {
  orgId: string;
  unit: BusinessUnit;
  allUnits: BusinessUnit[];
}

// Renders a label-value pair for BU details
function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

// Overview tab showing BU details and location metadata
export const OverviewTab = ({ orgId, unit, allUnits }: OverviewTabProps) => {
  const editDialog = useDialog();
  const updateMutation = useUpdateBusinessUnit();

  // Handles update and closes dialog
  function handleUpdate(data: CreateBusinessUnitData) {
    const cleaned = { ...data, parentId: data.parentId || undefined };
    updateMutation.mutate(
      { orgId, buId: unit.id, data: cleaned },
      { onSuccess: () => editDialog.close() },
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Details card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Details</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            startAdornment={<Pencil className="size-3.5" />}
            onClick={editDialog.open}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailRow label="Name" value={unit.name} />
            <DetailRow label="Code" value={unit.code} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Type</span>
              <Badge variant="outline" className="w-fit text-xs">
                {unit.type}
              </Badge>
            </div>
            <DetailRow label="Parent" value={unit.parentName} />
            <DetailRow label="Description" value={unit.description} />
          </div>
        </CardContent>
      </Card>

      {/* Location card */}
      {(unit.address || unit.city || unit.state || unit.country || unit.timezone || unit.phone) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Location</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailRow label="Address" value={unit.address} />
              <DetailRow label="City" value={unit.city} />
              <DetailRow label="State / Province" value={unit.state} />
              <DetailRow label="Country" value={unit.country} />
              <DetailRow label="Timezone" value={unit.timezone} />
              <DetailRow label="Phone" value={unit.phone} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        title={`Edit ${unit.name}`}
        description="Update the details for this business unit."
        className="sm:max-w-2xl"
        content={(close) => (
          <BusinessUnitForm
            unit={unit}
            existingUnits={allUnits}
            onSubmit={handleUpdate}
            onCancel={close}
            isPending={updateMutation.isPending}
          />
        )}
      />
    </div>
  );
};
