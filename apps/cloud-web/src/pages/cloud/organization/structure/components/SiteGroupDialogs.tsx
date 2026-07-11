import { useCreateSiteGroup, useUpdateSiteGroup } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import type { useDialog } from '@vritti/quantum-ui/hooks';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Network } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { type CreateSiteGroupData, createSiteGroupSchema, type SiteGroup } from '@/schemas/cloud/org-structure';

type DialogHandle = ReturnType<typeof useDialog>;

// Parent options excluding the group itself and its whole descendant subtree (a group can't nest under itself)
function parentGroupOptions(siteGroups: SiteGroup[], excludeId?: string) {
  const excluded = new Set<string>();
  if (excludeId) {
    excluded.add(excludeId);
    let grew = true;
    while (grew) {
      grew = false;
      for (const group of siteGroups) {
        if (group.parentId && excluded.has(group.parentId) && !excluded.has(group.id)) {
          excluded.add(group.id);
          grew = true;
        }
      }
    }
  }
  return [
    { value: '', label: 'None (top level)' },
    ...siteGroups
      .filter((group) => !excluded.has(group.id))
      .map((group) => ({ value: group.id, label: group.name, description: group.code })),
  ];
}

interface SiteGroupFieldsProps {
  parentOptions: { value: string; label: string; description?: string }[];
  submitLabel: string;
  loadingText: string;
}

const SiteGroupFields = ({ parentOptions, submitLabel, loadingText }: SiteGroupFieldsProps) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextField name="name" label="Name" placeholder="e.g. South Zone" />
      <TextField name="code" label="Code" placeholder="e.g. g-south" />
    </div>
    <Select
      name="parentId"
      label="Parent Group"
      placeholder="Select parent"
      options={parentOptions}
      description="Optional — sub-groups inherit roles and assignments from ancestors"
    />
    <DialogActions>
      <Button type="button" variant="outline" data-cancel>
        Cancel
      </Button>
      <Button type="submit" loadingText={loadingText}>
        {submitLabel}
      </Button>
    </DialogActions>
  </>
);

interface AddSiteGroupDialogProps {
  handle: DialogHandle;
  orgId: string;
  siteGroups: SiteGroup[];
  defaultParentId?: string;
}

export const AddSiteGroupDialog = ({ handle, orgId, siteGroups, defaultParentId }: AddSiteGroupDialogProps) => (
  <Dialog
    handle={handle}
    icon={Network}
    title="Add Site Group"
    description="Site groups manage sites across legal entities — roles, rollups, and assignments."
    className="sm:max-w-xl"
    content={(close) => (
      <AddSiteGroupForm orgId={orgId} siteGroups={siteGroups} defaultParentId={defaultParentId} onClose={close} />
    )}
  />
);

const AddSiteGroupForm = ({
  orgId,
  siteGroups,
  defaultParentId,
  onClose,
}: {
  orgId: string;
  siteGroups: SiteGroup[];
  defaultParentId?: string;
  onClose: () => void;
}) => {
  const form = useForm<CreateSiteGroupData>({
    resolver: zodResolver(createSiteGroupSchema),
    defaultValues: { name: '', code: '', parentId: defaultParentId ?? '' },
  });
  const createMutation = useCreateSiteGroup({ onSuccess: onClose });
  const parentOptions = useMemo(() => parentGroupOptions(siteGroups), [siteGroups]);

  return (
    <Form
      form={form}
      mutation={createMutation}
      onCancel={onClose}
      transformSubmit={(data) => ({ orgId, data: { ...data, parentId: data.parentId || undefined } })}
    >
      <SiteGroupFields parentOptions={parentOptions} submitLabel="Create Site Group" loadingText="Creating..." />
    </Form>
  );
};

interface EditSiteGroupDialogProps {
  handle: DialogHandle;
  orgId: string;
  siteGroups: SiteGroup[];
  group: SiteGroup | null;
}

export const EditSiteGroupDialog = ({ handle, orgId, siteGroups, group }: EditSiteGroupDialogProps) => (
  <Dialog
    handle={handle}
    icon={Network}
    title={group ? `Edit ${group.name}` : 'Edit Site Group'}
    description="Rename the group or move it under a different parent."
    className="sm:max-w-xl"
    content={(close) =>
      group ? <EditSiteGroupForm orgId={orgId} siteGroups={siteGroups} group={group} onClose={close} /> : null
    }
  />
);

const EditSiteGroupForm = ({
  orgId,
  siteGroups,
  group,
  onClose,
}: {
  orgId: string;
  siteGroups: SiteGroup[];
  group: SiteGroup;
  onClose: () => void;
}) => {
  const form = useForm<CreateSiteGroupData>({
    resolver: zodResolver(createSiteGroupSchema),
    defaultValues: { name: group.name, code: group.code, parentId: group.parentId ?? '' },
  });
  const updateMutation = useUpdateSiteGroup({ onSuccess: onClose });
  const parentOptions = useMemo(() => parentGroupOptions(siteGroups, group.id), [siteGroups, group.id]);

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onClose}
      transformSubmit={(data) => ({
        orgId,
        groupId: group.id,
        data: { ...data, parentId: data.parentId ? data.parentId : null },
      })}
    >
      <SiteGroupFields parentOptions={parentOptions} submitLabel="Save Changes" loadingText="Saving..." />
    </Form>
  );
};
