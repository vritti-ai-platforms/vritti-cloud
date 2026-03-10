import { Button } from '@vritti/quantum-ui/Button';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { FilePreview } from '@vritti/quantum-ui/FilePreview';
import { Form } from '@vritti/quantum-ui/Form';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Check } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { useCreateOrganization } from '@/hooks/cloud/organizations';
import type { CreateOrgFormData } from '@/schemas/cloud/organizations';

interface ReviewStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  agreedToTerms: boolean;
  onAgreedToTermsChange: (checked: boolean) => void;
  createMutation: ReturnType<typeof useCreateOrganization>;
  onBack: () => void;
  onEditBasicInfo: () => void;
  onChangeInfrastructure: () => void;
  onChangePlan: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  form,
  agreedToTerms,
  onAgreedToTermsChange,
  createMutation,
  onBack,
  onEditBasicInfo,
  onChangeInfrastructure,
  onChangePlan,
}) => {
  const logo = form.getValues('logo');
  const planName = form.getValues('planName');
  const planPrice = form.getValues('planPrice');
  const planCurrency = form.getValues('planCurrency');
  const regionName = form.getValues('regionName');
  const cloudProviderName = form.getValues('cloudProviderName');
  const deploymentName = form.getValues('deploymentName');

  const priceDisplay = planPrice ? `${planCurrency === 'INR' ? '₹' : planCurrency}${planPrice}/month` : null;

  return (
    <div className="space-y-4">
      {/* Organization details summary */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2">Organization Details</Typography>
          <Button variant="link" className="p-0 h-auto" onClick={onEditBasicInfo}>
            Edit
          </Button>
        </div>
        {[
          { label: 'Name', value: form.getValues('name') },
          { label: 'URL', value: `${form.getValues('subdomain')}.vrittiai.com` },
          { label: 'Size', value: `${form.getValues('size')} employees` },
          { label: 'Industry', value: form.getValues('industryName') ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}

        {/* Logo row with thumbnail */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Logo</span>
          {logo ? (
            <div className="flex items-center gap-2">
              <FilePreview file={logo} size={32} className="rounded-full" />
              <span className="font-medium max-w-36 truncate">{logo.name}</span>
            </div>
          ) : (
            <span className="font-medium">—</span>
          )}
        </div>
      </div>

      {/* Infrastructure summary */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2">Infrastructure</Typography>
          <Button variant="link" className="p-0 h-auto" onClick={onChangeInfrastructure}>
            Change
          </Button>
        </div>
        {[
          { label: 'Region', value: regionName ?? '—' },
          { label: 'Provider', value: cloudProviderName ?? '—' },
          { label: 'Deployment', value: deploymentName ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Plan summary */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2">Selected Plan</Typography>
          <Button variant="link" className="p-0 h-auto" onClick={onChangePlan}>
            Change
          </Button>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <Typography variant="body1" className="font-medium">
            {planName ?? '—'}
          </Typography>
          {priceDisplay && <span className="text-sm text-primary font-semibold">{priceDisplay}</span>}
        </div>
      </div>

      {/* Terms + navigation */}
      <Form
        form={form}
        mutation={createMutation}
        showRootError
        transformSubmit={(data) => {
          const formData = new FormData();
          formData.append('name', data.name);
          formData.append('subdomain', data.subdomain);
          formData.append('orgIdentifier', data.subdomain);
          formData.append('size', data.size);
          if (data.planId != null) formData.append('planId', data.planId);
          if (data.deploymentId != null) formData.append('deploymentId', data.deploymentId);
          if (data.industryId != null) formData.append('industryId', data.industryId);
          if (data.logo) formData.append('file', data.logo);
          return formData;
        }}
      >
        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy."
          checked={agreedToTerms}
          onCheckedChange={(checked) => onAgreedToTermsChange(checked === true)}
        />
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button type="submit" disabled={!agreedToTerms} isLoading={createMutation.isPending}>
            <Check className="h-4 w-4 mr-2" />
            Create Company
          </Button>
        </div>
      </Form>
    </div>
  );
};
