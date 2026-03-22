import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@vritti/quantum-ui/Avatar';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Select } from '@vritti/quantum-ui/Select';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { UploadFile } from '@vritti/quantum-ui/UploadFile';
import { Building2, Edit } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteOrganization } from '@/services/cloud/organizations.service';
import { useMediaUrl } from '@/hooks/cloud/media/useMediaUrl';
import { useOrganization, useUpdateOrganization } from '@/hooks/cloud/organizations';
import { OrgSize, updateOrganizationSchema } from '@/schemas/cloud/organizations';
import type { UpdateOrgFormData } from '@/schemas/cloud/organizations';

const SIZE_OPTIONS = [
  { value: '0-10', label: '0-10 employees' },
  { value: '10-20', label: '10-20 employees' },
  { value: '20-50', label: '20-50 employees' },
  { value: '50-100', label: '50-100 employees' },
  { value: '100-500', label: '100-500 employees' },
  { value: '500+', label: '500+ employees' },
];

// Formats ISO date string to a readable format
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const OrganizationSettingsPage: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: org, isLoading } = useOrganization(orgId);
  const { data: logoUrl } = useMediaUrl(org?.mediaId);
  const [isEditing, setIsEditing] = useState(false);

  const updateOrgMutation = useUpdateOrganization(orgId, {
    onSuccess: () => setIsEditing(false),
  });

  const form = useForm<UpdateOrgFormData>({
    resolver: zodResolver(updateOrganizationSchema),
    values: {
      name: org?.name || '',
      size: (org?.size as OrgSize) || OrgSize.s0_10,
    },
  });

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const deleteMutation = useMutation<void, AxiosError>({
    mutationFn: () => deleteOrganization(orgId),
    onSuccess: () => navigate("/", { replace: true }),
  });

  // Confirms and deletes the organization
  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${org?.name ?? "organization"}?`,
      description: "This organization and all its data will be permanently removed. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (confirmed) deleteMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12">
        <Typography variant="body1" intent="muted">
          Failed to load organization data
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Edit/Save/Cancel actions */}
      <PageHeader
        title="Organization Settings"
        description="Manage your organization details and configuration"
        actions={
          isEditing ? (
            <div className="flex gap-3">
              <Button type="submit" form="org-settings-form" disabled={updateOrgMutation.isPending}>
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={updateOrgMutation.isPending}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )
        }
      />

      <Form
        id="org-settings-form"
        form={form}
        mutation={updateOrgMutation}
        showRootError
        transformSubmit={(data) => {
          const formData = new FormData();
          formData.append('name', data.name);
          formData.append('size', data.size);
          if (data.logo) formData.append('file', data.logo);
          return formData;
        }}
      >
        {/* Organization Logo Card */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Logo</CardTitle>
            <CardDescription>Update your organization logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-8">
              {isEditing ? (
                <UploadFile
                  name="logo"
                  label=""
                  accept="image/png,image/jpeg"
                  anchor="avatar"
                  placeholder="Click or drag to upload logo"
                  hint="PNG, JPG up to 10MB"
                />
              ) : (
                <Avatar className="h-20 w-20 shadow-[0px_0px_0px_4px_white,0px_12px_24px_4px_rgba(10,29,54,0.08),0px_4px_6px_-0.75px_rgba(10,29,54,0.08)]">
                  {logoUrl && <AvatarImage src={logoUrl} alt={org.name} />}
                  <AvatarFallback className="text-lg">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-1 pt-2">
                <Typography variant="body2" intent="muted">
                  PNG, JPG up to 10MB
                </Typography>
                {!isEditing && (
                  <Typography variant="body2" intent="muted">
                    Enable edit mode to upload a new logo
                  </Typography>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Update your organization name and size</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <TextField
                name="name"
                label="Organization Name"
                placeholder="e.g., HealthFirst Clinics"
                disabled={!isEditing}
              />

              <Select
                name="size"
                label="Organization Size"
                placeholder="Select size"
                options={SIZE_OPTIONS}
                disabled={!isEditing}
              />

              <TextField
                name="subdomain"
                label="Subdomain"
                value={org.subdomain}
                disabled
                readOnly
                description="Subdomain cannot be changed after creation"
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </Form>

      {/* Organization Info Card (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Info</CardTitle>
          <CardDescription>Read-only organization metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Organization ID
                </Typography>
                <Typography variant="body1" className="font-mono text-sm">
                  {org.id}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Organization Identifier
                </Typography>
                <Typography variant="body1" className="font-mono text-sm">
                  {org.orgIdentifier}
                </Typography>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Industry ID
                </Typography>
                <Typography variant="body1" className="font-mono text-sm">
                  {org.industryId}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Plan ID
                </Typography>
                <Typography variant="body1" className="font-mono text-sm">
                  {org.planId || 'Not assigned'}
                </Typography>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Deployment ID
                </Typography>
                <Typography variant="body1" className="font-mono text-sm">
                  {org.deploymentId || 'Not assigned'}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Created
                </Typography>
                <Typography variant="body1">{formatDate(org.createdAt)}</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Organization */}
      <DangerZone
        title="Delete Organization"
        description={`Permanently delete ${org?.name ?? "this organization"} and all its data. This action cannot be undone.`}
        buttonText="Delete Organization"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      />
    </div>
  );
};
