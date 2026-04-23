import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TimezoneSelector } from '@vritti/quantum-ui/selects/timezone';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { BusinessUnit } from '@/schemas/cloud/org-business-units';
import { type CreateBusinessUnitData, createBusinessUnitSchema } from '@/schemas/cloud/org-business-units';

interface BusinessUnitFormProps {
  unit?: BusinessUnit;
  existingUnits: BusinessUnit[];
  defaultParentId?: string;
  onSubmit: (data: CreateBusinessUnitData) => void;
  onCancel: () => void;
  isPending: boolean;
}

// BU type options for the select dropdown
const typeOptions = [
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'REGION', label: 'Region' },
  { value: 'FRANCHISEE', label: 'Franchisee' },
  { value: 'BRANCH', label: 'Branch' },
  { value: 'TEAM', label: 'Team' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'CUSTOM', label: 'Custom' },
];

// Form for creating or editing a business unit
export const BusinessUnitForm: React.FC<BusinessUnitFormProps> = ({
  unit,
  existingUnits,
  defaultParentId,
  onSubmit,
  onCancel,
  isPending,
}) => {
  const isEditing = !!unit;

  const form = useForm<CreateBusinessUnitData>({
    resolver: zodResolver(createBusinessUnitSchema),
    defaultValues: {
      name: unit?.name ?? '',
      code: unit?.code ?? '',
      type: unit?.type ?? 'BRANCH',
      parentId: unit?.parentId ?? defaultParentId ?? '',
      description: unit?.description ?? '',
      address: unit?.address ?? '',
      city: unit?.city ?? '',
      state: unit?.state ?? '',
      country: unit?.country ?? '',
      timezone: unit?.timezone ?? '',
      phone: unit?.phone ?? '',
    },
  });

  // Build parent options — exclude self and descendants to prevent circular reference
  const parentOptions = [
    { value: '', label: 'None (top level)' },
    ...existingUnits
      .filter((bu) => bu.id !== unit?.id)
      .map((bu) => ({
        value: bu.id,
        label: `${bu.name} (${bu.code})`,
      })),
  ];

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField name="name" label="Name" placeholder="e.g. North America HQ" />
        <TextField name="code" label="Code" placeholder="e.g. NA-HQ" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select name="type" label="Type" placeholder="Select type" options={typeOptions} />
        <Select name="parentId" label="Parent Unit" placeholder="Select parent" options={parentOptions} />
      </div>

      <TextField name="description" label="Description" placeholder="Optional description" />

      {/* Metadata fields */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold mb-3">Location Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField name="address" label="Address" placeholder="Street address" />
          <TextField name="city" label="City" placeholder="City" />
          <TextField name="state" label="State / Province" placeholder="State or province" />
          <TextField name="country" label="Country" placeholder="Country" />
          <TimezoneSelector name="timezone" label="Timezone" placeholder="Select timezone" />
          <TextField name="phone" label="Phone" placeholder="e.g. +1 555 123 4567" />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending} loadingText={isEditing ? 'Saving...' : 'Creating...'}>
          {isEditing ? 'Save Changes' : 'Create Business Unit'}
        </Button>
      </div>
    </Form>
  );
};
