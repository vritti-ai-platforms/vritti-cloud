import { useCreateSite, useUpdateSite } from '@hooks/cloud/org-sites';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { LegalEntitySelector } from '@vritti/quantum-ui/selects/legal-entity';
import { SiteGroupSelector } from '@vritti/quantum-ui/selects/site-group';
import { TimezoneSelector } from '@vritti/quantum-ui/selects/timezone';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { Site } from '@/schemas/cloud/org-sites';
import { type CreateSiteData, createSiteSchema } from '@/schemas/cloud/org-sites';
import type { TaxRegistration } from '@/schemas/cloud/org-structure';

interface SiteFormProps {
  orgId: string;
  site?: Site;
  taxRegistrations: TaxRegistration[];
  defaultGroupId?: string;
  defaultLegalEntityId?: string;
  onClose: () => void;
}

const typeOptions = [
  { value: 'OUTLET', label: 'Outlet', description: 'Sells to customers — POS, stock, purchasing' },
  { value: 'WAREHOUSE', label: 'Warehouse', description: 'Stock only — receipts, transfers, no customer sales' },
  { value: 'PRODUCTION', label: 'Production', description: 'Manufacturing — central kitchen, plant, workshop' },
];

// Clears empty optional selects so the payload carries real ids only
function cleanSiteData(data: CreateSiteData): CreateSiteData {
  return { ...data, registrationId: data.registrationId || undefined, groupId: data.groupId || undefined };
}

export const SiteForm: React.FC<SiteFormProps> = ({
  orgId,
  site,
  taxRegistrations,
  defaultGroupId,
  defaultLegalEntityId,
  onClose,
}) => {
  const form = useForm<CreateSiteData>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      name: site?.name ?? '',
      code: site?.code ?? '',
      type: site?.type ?? 'OUTLET',
      legalEntityId: site?.legalEntityId ?? defaultLegalEntityId ?? '',
      registrationId: site?.registrationId ?? '',
      groupId: site?.groupId ?? defaultGroupId ?? '',
      timezone: site?.timezone ?? '',
    },
  });

  const createMutation = useCreateSite({ onSuccess: onClose });
  const updateMutation = useUpdateSite({ onSuccess: onClose });

  const legalEntityId = form.watch('legalEntityId');

  const previousLegalEntityId = useRef(legalEntityId);
  useEffect(() => {
    if (previousLegalEntityId.current !== legalEntityId) {
      previousLegalEntityId.current = legalEntityId;
      form.setValue('registrationId', '');
    }
  }, [legalEntityId, form]);

  const registrationOptions = taxRegistrations
    .filter((reg) => reg.legalEntityId === legalEntityId)
    .map((reg) => ({
      value: reg.id,
      label: reg.taxNumber,
      description: reg.region ?? undefined,
    }));

  const fields = (
    <>
      <div className="space-y-6">
        <FormSection title="Identity">
          <TextField name="name" label="Name" placeholder="e.g. Indiranagar" />
          <TextField name="code" label="Code" placeholder="e.g. BLR-01" />
          <div className="col-span-2">
            <Select name="type" label="Type" placeholder="Select type" options={typeOptions} />
          </div>
        </FormSection>

        <FormSection title="Ownership">
          <LegalEntitySelector
            name="legalEntityId"
            label="Legal Entity"
            description="Sets the site's currency and tax."
            params={{ orgId }}
          />
          <Select
            name="registrationId"
            label="Tax Registration"
            placeholder="Select registration"
            options={registrationOptions}
            clearable
            description="GSTIN/VAT under the selected legal entity."
          />
        </FormSection>

        <FormSection title="Placement">
          <SiteGroupSelector
            name="groupId"
            label="Site Group"
            description="For roles and reporting rollups."
            params={{ orgId }}
            clearable
          />
          <TimezoneSelector name="timezone" label="Timezone" placeholder="Select timezone" />
        </FormSection>
      </div>

      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText={site ? 'Saving...' : 'Creating...'}>
          {site ? 'Save Changes' : 'Create Site'}
        </Button>
      </DialogActions>
    </>
  );

  if (site) {
    return (
      <Form
        form={form}
        mutation={updateMutation}
        transformSubmit={(data) => ({ orgId, siteId: site.id, data: cleanSiteData(data) })}
        onCancel={onClose}
      >
        {fields}
      </Form>
    );
  }

  return (
    <Form
      form={form}
      mutation={createMutation}
      transformSubmit={(data) => ({ orgId, data: cleanSiteData(data) })}
      onCancel={onClose}
    >
      {fields}
    </Form>
  );
};
