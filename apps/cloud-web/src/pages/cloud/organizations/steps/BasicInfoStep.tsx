import { Button } from '@vritti/quantum-ui/Button';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { IndustrySelector } from '@vritti/quantum-ui/selects/IndustrySelect';
import { TextField } from '@vritti/quantum-ui/TextField';
import { UploadFile } from '@vritti/quantum-ui/UploadFile';
import { ArrowRight } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useCheckSubdomain } from '@/hooks/cloud/organizations';
import type { CreateOrgFormData } from '@/schemas/cloud/organizations';
import { OrgSize } from '@/schemas/cloud/organizations';

interface BasicInfoStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  onContinue: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form, onContinue }) => {
  const checkSubdomainMutation = useCheckSubdomain({ onSuccess: onContinue });

  return (
    <Form form={form} mutation={checkSubdomainMutation} transformSubmit={(data) => data.subdomain}>
      <FieldGroup>
        <TextField name="name" label="Organization Name" placeholder="e.g., HealthFirst Clinics" />
        <TextField
          name="subdomain"
          label="Organization URL"
          placeholder="company-slug"
          endAdornment={<span className="text-muted-foreground text-sm pr-3">.vrittiai.com</span>}
          description="This will be your organization's subdomain URL"
        />
        <IndustrySelector name="industryId" onOptionSelect={(opt) => form.setValue('industryName', opt?.label ?? '')} />
        <Select
          name="size"
          label="Organization Size"
          placeholder="Select size"
          options={Object.values(OrgSize).map((v) => ({ value: v, label: `${v} employees` }))}
        />
      </FieldGroup>

      <UploadFile
        name="logo"
        label="Organization Logo (optional)"
        accept="image/png,image/jpeg"
        anchor="dropzone"
        placeholder="Click or drag to upload logo"
        hint="PNG, JPG up to 10MB"
      />

      <div className="flex justify-end">
        <Button type="submit">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Form>
  );
};
