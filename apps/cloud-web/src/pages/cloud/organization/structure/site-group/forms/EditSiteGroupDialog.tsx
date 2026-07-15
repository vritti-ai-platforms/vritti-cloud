import { GroupColorField } from '@components/cloud/GroupColorField';
import { useUpdateSiteGroup } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import type { useDialog } from '@vritti/quantum-ui/hooks';
import { SiteGroupSelector } from '@vritti/quantum-ui/selects/site-group';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Network } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type CreateSiteGroupData, createSiteGroupSchema, type SiteGroup } from '@/schemas/cloud/org-structure';

type DialogHandle = ReturnType<typeof useDialog>;

interface EditSiteGroupDialogProps {
  handle: DialogHandle;
  orgId: string;
  group: SiteGroup | null;
}

export const EditSiteGroupDialog = ({ handle, orgId, group }: EditSiteGroupDialogProps) => (
  <Dialog
    handle={handle}
    icon={Network}
    title={group ? `Edit ${group.name}` : 'Edit Site Group'}
    description="Rename the group or move it under a different parent."
    className="sm:max-w-xl"
    content={(close) => (group ? <EditSiteGroupForm orgId={orgId} group={group} onClose={close} /> : null)}
  />
);

const EditSiteGroupForm = ({ orgId, group, onClose }: { orgId: string; group: SiteGroup; onClose: () => void }) => {
  const form = useForm<CreateSiteGroupData>({
    resolver: zodResolver(createSiteGroupSchema),
    defaultValues: {
      name: group.name,
      code: group.code,
      parentId: group.parentId ?? '',
      color: (group.color ?? null) as CreateSiteGroupData['color'],
    },
  });
  const updateMutation = useUpdateSiteGroup({ onSuccess: onClose });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onClose}
      transformSubmit={(data) => ({
        orgId,
        groupId: group.id,
        data: { ...data, parentId: data.parentId ? data.parentId : null, color: data.color ?? null },
      })}
    >
      <FormSection title="Details">
        <TextField name="name" label="Name" placeholder="e.g. South Zone" />
        <TextField name="code" label="Code" placeholder="e.g. g-south" />
        <div className="col-span-2">
          <SiteGroupSelector
            name="parentId"
            label="Parent Group"
            description="Leave empty for a top-level group."
            params={{ orgId, excludeId: group.id }}
            clearable
          />
        </div>
        <div className="col-span-2">
          <GroupColorField name="color" />
        </div>
      </FormSection>
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
