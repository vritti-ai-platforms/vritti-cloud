import { useCreateRole, useRoleTemplates } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { FileText, LayoutTemplate, Shield } from 'lucide-react';
import { useState } from 'react';
import type { RoleTemplate } from '@/schemas/cloud/roles';

interface TemplatePickerDialogProps {
  orgId: string;
  handle: DialogHandle;
  onSuccess: () => void;
}

// Dialog for selecting a role template to create a role from
export const TemplatePickerDialog: React.FC<TemplatePickerDialogProps> = ({ orgId, handle, onSuccess }) => {
  const { data: templates = [], isLoading } = useRoleTemplates(orgId);
  const createMutation = useCreateRole();
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);

  // Creates a role from the selected template
  function handleUseTemplate(template: RoleTemplate) {
    setCreatingTemplate(template.name);
    createMutation.mutate(
      {
        orgId,
        data: {
          name: template.name,
          description: template.description,
          features: template.features,
          // Default roles seeded from a template are read-only
          isLocked: true,
        },
      },
      {
        onSuccess: () => {
          setCreatingTemplate(null);
          handle.close();
          onSuccess();
        },
        onError: () => {
          setCreatingTemplate(null);
        },
      },
    );
  }

  return (
    <Dialog
      handle={handle}
      icon={Shield}
      title="Add Default Roles"
      description="Add pre-configured default roles from templates. Default roles are read-only."
      className="sm:max-w-2xl"
      content={() => (
        <div className="flex flex-col gap-4">
          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`tmpl-skel-${i.toString()}`} className="h-28 rounded-lg" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && templates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No templates available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Role templates have not been configured for this organization.
              </p>
            </div>
          )}

          {/* Template cards */}
          {!isLoading && templates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {templates.map((template) => {
                const featureCount = Object.keys(template.features).length;
                const isCreating = creatingTemplate === template.name;

                return (
                  <Card key={template.name}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        {/* Template info */}
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 shrink-0">
                            <LayoutTemplate className="size-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate">{template.name}</h3>
                            {template.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Feature count */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {featureCount} feature{featureCount !== 1 ? 's' : ''}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUseTemplate(template)}
                            isLoading={isCreating}
                            loadingText="Creating..."
                            disabled={creatingTemplate !== null}
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    />
  );
};
