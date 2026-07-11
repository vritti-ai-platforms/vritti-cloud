import { useCreateRoleTemplate } from '@hooks/admin/versions/businesses/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { RadioGroup } from '@vritti/quantum-ui/RadioGroup';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import { SCOPE_OPTIONS } from '@/schemas/admin/features';
import {
  type CreateRoleTemplateData,
  type CreateRoleTemplateInput,
  createRoleTemplateSchema,
  SITE_TYPE_OPTIONS,
} from '@/schemas/admin/role-templates';

interface AddRoleTemplateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddRoleTemplateForm: React.FC<AddRoleTemplateFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId, businessId } = useVersionContext();

  const form = useForm<CreateRoleTemplateInput, unknown, CreateRoleTemplateData>({
    resolver: zodResolver(createRoleTemplateSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      scope: 'SITE',
      siteType: 'OUTLET',
      versionId: versionId ?? '',
    },
  });

  const createMutation = useCreateRoleTemplate(versionId, businessId, { onSuccess });
  const scope = form.watch('scope');

  const previousScope = useRef(scope);
  useEffect(() => {
    if (previousScope.current !== scope) {
      previousScope.current = scope;
      form.resetField('siteType');
    }
  }, [scope, form]);

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => (data.scope === 'SITE' ? data : { ...data, siteType: undefined })}
    >
      <TextField name="code" label="Code" placeholder="e.g. cashier" />
      <TextField name="name" label="Role Name" placeholder="e.g. Sales Manager" />
      <Select name="scope" label="Scope" placeholder="Select scope" options={SCOPE_OPTIONS} />
      {scope === 'SITE' && (
        <RadioGroup name="siteType" label="Site Type" orientation="horizontal" options={SITE_TYPE_OPTIONS} />
      )}
      <TextField name="description" label="Description" placeholder="Optional description" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Role Template
        </Button>
      </DialogActions>
    </Form>
  );
};
