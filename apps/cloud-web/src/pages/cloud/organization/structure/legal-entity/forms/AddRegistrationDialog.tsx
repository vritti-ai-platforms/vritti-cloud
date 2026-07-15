import { useCreateTaxRegistration } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { BadgeCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  type CreateTaxRegistrationData,
  createTaxRegistrationSchema,
  type LegalEntity,
} from '@/schemas/cloud/org-structure';

interface RegistrationFormProps {
  orgId: string;
  legalEntity: LegalEntity;
  onClose: () => void;
}

const RegistrationForm = ({ orgId, legalEntity, onClose }: RegistrationFormProps) => {
  const form = useForm<CreateTaxRegistrationData>({
    resolver: zodResolver(createTaxRegistrationSchema),
    defaultValues: { taxNumber: '', region: '' },
  });

  const createMutation = useCreateTaxRegistration({ onSuccess: onClose });

  return (
    <Form
      form={form}
      mutation={createMutation}
      transformSubmit={(data) => ({
        orgId,
        leId: legalEntity.id,
        data: { ...data, region: data.region || undefined },
      })}
      onCancel={onClose}
    >
      <TextField name="taxNumber" label="Tax Number" placeholder="e.g. 29AAECS7712C1Z2" />
      <TextField name="region" label="Region" placeholder="e.g. Karnataka" />

      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" isLoading={createMutation.isPending} loadingText="Adding...">
          Add Registration
        </Button>
      </DialogActions>
    </Form>
  );
};

interface AddRegistrationDialogProps {
  handle: DialogHandle;
  orgId: string;
  legalEntity: LegalEntity | null;
}

export const AddRegistrationDialog = ({ handle, orgId, legalEntity }: AddRegistrationDialogProps) => (
  <Dialog
    handle={handle}
    icon={BadgeCheck}
    title={legalEntity ? `Add Registration — ${legalEntity.name}` : 'Add Registration'}
    description="Add a tax registration (e.g. GSTIN or VAT number) for this legal entity."
    content={(close) =>
      legalEntity ? <RegistrationForm orgId={orgId} legalEntity={legalEntity} onClose={close} /> : null
    }
  />
);
