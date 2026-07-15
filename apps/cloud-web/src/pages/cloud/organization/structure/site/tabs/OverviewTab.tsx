import { useOrgStructure } from '@hooks/cloud/org-structure';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { Building2, MapPin, Pencil } from 'lucide-react';
import { SITE_TYPE_LABELS, type Site } from '@/schemas/cloud/org-sites';
import { SiteForm } from '../forms/SiteForm';

interface OverviewTabProps {
  orgId: string;
  site: Site;
}

// Renders a label-value pair for site details
function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

// Overview tab showing site details and location metadata
export const OverviewTab = ({ orgId, site }: OverviewTabProps) => {
  const editDialog = useDialog();
  const { data: structure } = useOrgStructure(orgId);

  const legalEntity = structure?.legalEntities.find((le) => le.id === site.legalEntityId);
  const legalEntityName = legalEntity?.name;
  const groupName = structure?.siteGroups.find((group) => group.id === site.groupId)?.name;

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
            <DetailRow label="Name" value={site.name} />
            <DetailRow label="Code" value={site.code} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Type</span>
              <Badge variant="outline" className="w-fit text-xs">
                {SITE_TYPE_LABELS[site.type]}
              </Badge>
            </div>
            <DetailRow label="Legal Entity" value={legalEntityName} />
            <DetailRow label="Site Group" value={groupName ?? 'Ungrouped'} />
            <DetailRow label="Description" value={site.description} />
          </div>
        </CardContent>
      </Card>

      {/* Location card */}
      {(site.address ||
        site.city ||
        site.state ||
        site.country ||
        site.timezone ||
        legalEntity?.currencyCode ||
        site.phone) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Location</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailRow label="Address" value={site.address} />
              <DetailRow label="City" value={site.city} />
              <DetailRow label="State / Province" value={site.state} />
              <DetailRow label="Country" value={site.country} />
              <DetailRow label="Timezone" value={site.timezone} />
              <DetailRow label="Currency" value={legalEntity?.currencyCode} />
              <DetailRow label="Phone" value={site.phone} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        icon={Building2}
        title={`Edit ${site.name}`}
        description="Update the details for this site."
        className="sm:max-w-2xl"
        content={(close) => (
          <SiteForm orgId={orgId} site={site} taxRegistrations={structure?.taxRegistrations ?? []} onClose={close} />
        )}
      />
    </div>
  );
};
