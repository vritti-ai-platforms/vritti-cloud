import { GroupColorField } from '@components/cloud/GroupColorField';
import { useCreateSiteGroup } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import type { useDialog } from '@vritti/quantum-ui/hooks';
import { SiteGroupSelector } from '@vritti/quantum-ui/selects/site-group';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Network } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type CreateSiteGroupData, createSiteGroupSchema } from '@/schemas/cloud/org-structure';

type DialogHandle = ReturnType<typeof useDialog>;

interface AddSiteGroupDialogProps {
  handle: DialogHandle;
  orgId: string;
  defaultParentId?: string;
}

export const AddSiteGroupDialog = ({ handle, orgId, defaultParentId }: AddSiteGroupDialogProps) => (
  <Dialog
    handle={handle}
    icon={Network}
    title="Add Site Group"
    description="Site groups manage sites across legal entities — roles, rollups, and assignments."
    className="sm:max-w-xl"
    content={(close) => <AddSiteGroupForm orgId={orgId} defaultParentId={defaultParentId} onClose={close} />}
  />
);

const AddSiteGroupForm = ({
  orgId,
  defaultParentId,
  onClose,
}: {
  orgId: string;
  defaultParentId?: string;
  onClose: () => void;
}) => {
  const form = useForm<CreateSiteGroupData>({
    resolver: zodResolver(createSiteGroupSchema),
    defaultValues: { name: '', code: '', parentId: defaultParentId ?? null, color: null },
  });
  const createMutation = useCreateSiteGroup({ onSuccess: onClose });

  return (
    <Form
      form={form}
      mutation={createMutation}
      onCancel={onClose}
      transformSubmit={(data) => ({
        orgId,
        data: { ...data, color: data.color ?? null },
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
            params={{ orgId }}
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
        <Button type="submit" loadingText="Creating...">
          Create Site Group
        </Button>
      </DialogActions>
    </Form>
  );
};
