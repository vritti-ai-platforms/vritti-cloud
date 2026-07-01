import { usePermissionUsage } from '@hooks/admin/versions/features/permissions';
import { Alert } from '@vritti/quantum-ui/Alert';
import { Badge } from '@vritti/quantum-ui/Badge';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Building2, CreditCard, Shield } from 'lucide-react';
import type { PermissionUsageRef } from '@/schemas/admin/feature-permissions';

interface PermissionUsageBreakdownProps {
  versionId: string;
  permissionId: string;
}

// Delete-impact body: fetches the permission's usage and renders a summary alert + business-wise plan/role breakdown.
export const PermissionUsageBreakdown = ({ versionId, permissionId }: PermissionUsageBreakdownProps) => {
  const { data: usage, isLoading } = usePermissionUsage(versionId, permissionId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }
  if (!usage) return null;

  const used = usage.planCount + usage.roleTemplateCount > 0;
  if (!used) {
    return <Alert variant="info" description="Not used by any plan or role template — safe to delete." />;
  }

  const summary = `Used in ${pluralize('plan', usage.planCount, true)} and ${pluralize(
    'role template',
    usage.roleTemplateCount,
    true,
  )} across ${pluralize('business', usage.businesses.length, true)}. Deleting removes it from all of them.`;

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="warning" description={summary} />
      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
        {usage.businesses.map((biz) => (
          <div key={biz.businessId} className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="size-4 text-muted-foreground" />
              {biz.businessName}
            </div>
            {biz.plans.length > 0 && <UsageLine icon={<CreditCard className="size-3.5" />} items={biz.plans} />}
            {biz.roleTemplates.length > 0 && (
              <UsageLine icon={<Shield className="size-3.5" />} items={biz.roleTemplates} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// One category (plans or role templates) — an icon + a wrap of name badges
function UsageLine({ icon, items }: { icon: React.ReactNode; items: PermissionUsageRef[] }) {
  return (
    <div className="flex items-start gap-2 py-0.5 text-muted-foreground">
      <span className="mt-1 shrink-0">{icon}</span>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item.id} variant="outline" className="text-xs font-medium">
            {item.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
