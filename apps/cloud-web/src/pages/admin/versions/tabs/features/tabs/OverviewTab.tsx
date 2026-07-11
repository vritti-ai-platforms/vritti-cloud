import { MaterialSymbol } from '@components/MaterialSymbol';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { type Feature, formatApplicableSiteTypes, SCOPE_TYPE_LABELS } from '@/schemas/admin/features';

interface OverviewTabProps {
  feature: Feature;
}

export const OverviewTab = ({ feature }: OverviewTabProps) => {
  return (
    <div className="pt-4">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <DetailField label="Name" type="string" value={feature.name} />
            <DetailField label="Code" type="string" value={feature.code} mono />
            <DetailField label="Scope" type="string" value={SCOPE_TYPE_LABELS[feature.scope]} />
            <DetailField
              label="Site Types"
              type="string"
              value={feature.scope === 'SITE' ? formatApplicableSiteTypes(feature.applicableSiteTypes ?? []) : null}
            />
          </div>
          <DetailField label="Description" type="string" value={feature.description} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <DetailField
              label="Web Icon (Lucide)"
              type="string"
              value={
                <span className="inline-flex items-center gap-2 font-mono">
                  <DynamicIcon name={feature.lucideIcon as IconName} className="size-4" />
                  {feature.lucideIcon}
                </span>
              }
            />
            <DetailField
              label="Android Icon (Material)"
              type="string"
              value={
                <span className="inline-flex items-center gap-2 font-mono">
                  <MaterialSymbol icon={feature.materialSymbol} size={16} />
                  {feature.materialSymbol}
                </span>
              }
            />
            <DetailField label="iOS Icon (SF Symbol)" type="string" value={feature.sfSymbol} mono />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
