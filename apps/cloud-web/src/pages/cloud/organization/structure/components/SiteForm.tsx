import { useCreateSite, useUpdateSite } from '@hooks/cloud/org-sites';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TimezoneSelector } from '@vritti/quantum-ui/selects/timezone';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { Site } from '@/schemas/cloud/org-sites';
import { type CreateSiteData, createSiteSchema } from '@/schemas/cloud/org-sites';
import type { LegalEntity, SiteGroup, TaxRegistration } from '@/schemas/cloud/org-structure';

interface SiteFormProps {
  orgId: string;
  site?: Site;
  legalEntities: LegalEntity[];
  taxRegistrations: TaxRegistration[];
  siteGroups: SiteGroup[];
  defaultGroupId?: string;
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
  legalEntities,
  taxRegistrations,
  siteGroups,
  defaultGroupId,
  onClose,
}) => {
  const form = useForm<CreateSiteData>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      name: site?.name ?? '',
      code: site?.code ?? '',
      type: site?.type ?? 'OUTLET',
      legalEntityId: site?.legalEntityId ?? '',
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

  const legalEntityOptions = legalEntities.map((le) => ({
    value: le.id,
    label: le.name,
    description: le.code,
  }));

  const registrationOptions = [
    { value: '', label: 'None' },
    ...taxRegistrations
      .filter((reg) => reg.legalEntityId === legalEntityId)
      .map((reg) => ({
        value: reg.id,
        label: reg.taxNumber,
        description: reg.region ?? undefined,
      })),
  ];

  const groupOptions = [
    { value: '', label: 'None (ungrouped)' },
    ...siteGroups.map((group) => ({
      value: group.id,
      label: group.name,
      description: group.code,
    })),
  ];

  const fields = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField name="name" label="Name" placeholder="e.g. Indiranagar" />
        <TextField name="code" label="Code" placeholder="e.g. BLR-01" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select name="type" label="Type" placeholder="Select type" options={typeOptions} />
        <Select
          name="legalEntityId"
          label="Legal Entity"
          placeholder="Select legal entity"
          options={legalEntityOptions}
          description="Owns the money — currency comes from here"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          name="registrationId"
          label="Tax Registration"
          placeholder="Select registration"
          options={registrationOptions}
          description="Filtered to the selected legal entity's registrations"
        />
        <Select
          name="groupId"
          label="Site Group"
          placeholder="Select group"
          options={groupOptions}
          description="How the site is managed — roles and rollups"
        />
      </div>

      <TimezoneSelector name="timezone" label="Timezone" placeholder="Select timezone" />

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
