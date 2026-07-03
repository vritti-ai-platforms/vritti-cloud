import { FEATURE_PERMISSIONS_TABLE_KEY, useBulkCreatePermissions } from '@hooks/admin/versions/features/permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { CheckboxGroup } from '@vritti/quantum-ui/CheckboxGroup';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { CircleCheck, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';

// Standard global permission presets for one-click adding (created with isGlobal = true)
export const PERMISSION_PRESETS: { code: string; label: string }[] = [
  { code: 'view', label: 'View' },
  { code: 'create', label: 'Create' },
  { code: 'edit', label: 'Edit' },
  { code: 'delete', label: 'Delete' },
  { code: 'export', label: 'Export' },
  { code: 'import', label: 'Import' },
  { code: 'print', label: 'Print' },
];

interface QuickAddPermissionsFormProps {
  featureId: string;
  existingCodes: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuickAddPermissionsForm: React.FC<QuickAddPermissionsFormProps> = ({
  featureId,
  existingCodes,
  onSuccess,
  onCancel,
}) => {
  const { versionId } = useVersionContext();
  const missing = PERMISSION_PRESETS.filter((p) => !existingCodes.includes(p.code));

  const form = useForm<{ codes: string[] }>({ defaultValues: { codes: missing.map((p) => p.code) } });
  const selected = form.watch('codes');
  const bulkMutation = useBulkCreatePermissions(FEATURE_PERMISSIONS_TABLE_KEY(versionId, featureId), { onSuccess });

  if (missing.length === 0) {
    return (
      <>
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
          <div className="relative flex size-14 items-center justify-center rounded-full bg-success/10">
            <ShieldCheck className="size-7 text-success" />
            <CircleCheck className="-right-0.5 -bottom-0.5 absolute size-5 rounded-full bg-background text-success" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground text-sm">All set</p>
            <p className="text-muted-foreground text-sm">Every standard permission is already added to this feature.</p>
          </div>
        </div>
        <DialogActions>
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </DialogActions>
      </>
    );
  }

  return (
    <Form
      form={form}
      mutation={bulkMutation}
      onCancel={onCancel}
      transformSubmit={(data: { codes: string[] }) => ({
        versionId,
        permissions: missing
          .filter((p) => data.codes.includes(p.code))
          .map((preset) => ({
            featureId,
            code: preset.code,
            label: preset.label,
            isGlobal: true,
            businessIds: [],
          })),
      })}
    >
      <CheckboxGroup
        name="codes"
        label="Permissions"
        clearable
        columns={2}
        options={missing.map((p) => ({ value: p.code, label: p.label }))}
      />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" disabled={selected.length === 0} loadingText="Adding...">
          Add {selected.length}
        </Button>
      </DialogActions>
    </Form>
  );
};
