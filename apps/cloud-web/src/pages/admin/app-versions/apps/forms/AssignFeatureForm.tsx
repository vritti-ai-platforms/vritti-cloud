import { useQuery } from '@tanstack/react-query';
import { useAssignAppFeatures } from '@hooks/admin/apps';
import { axios } from '@vritti/quantum-ui/axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Blocks, Check } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import { getAppFeatures } from '@/services/admin/apps.service';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface AssignFeatureFormProps {
  appId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Multi-select feature assignment with checkbox list
export const AssignFeatureForm: React.FC<AssignFeatureFormProps> = ({
  appId,
  onSuccess,
  onCancel,
}) => {
  const { versionId } = useVersionContext();
  const { data: allFeatures = [], isLoading: isLoadingAll } = useQuery<SelectOption[]>({
    queryKey: ['admin', 'versions', versionId, 'features', 'select'],
    queryFn: () => axios.get(`admin-api/app-versions/${versionId}/features/select`).then((r) => r.data.options ?? r.data),
  });
  const { data: existingFeatures = [], isLoading: isLoadingExisting } = useQuery({
    queryKey: ['admin', 'versions', versionId, 'apps', appId, 'features'],
    queryFn: () => getAppFeatures(versionId, appId),
    enabled: !!appId,
  });
  const existingIds = new Set(existingFeatures.map((f) => f.id));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const assignMutation = useAssignAppFeatures({
    onSuccess: () => {
      onSuccess();
    },
  });

  // Toggle feature selection
  const toggleFeature = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Submit selected features
  const handleSubmit = () => {
    if (selected.size === 0) return;
    assignMutation.mutate({
      versionId,
      appId,
      data: { featureIds: Array.from(selected) },
    });
  };

  const isLoading = isLoadingAll || isLoadingExisting;

  // Features not yet assigned (value = feature id)
  const available = allFeatures.filter((f) => !existingIds.has(f.value));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-5 text-primary" />
      </div>
    );
  }

  if (available.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Blocks className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">All features assigned</p>
        <p className="text-xs text-muted-foreground mt-1">There are no more features available to assign.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
        {available.map((feature) => {
          const isSelected = selected.has(feature.value);
          return (
            <button
              type="button"
              key={feature.value}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              onClick={() => toggleFeature(feature.value)}
            >
              <div
                className={`flex items-center justify-center size-5 rounded border shrink-0 transition-colors ${
                  isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                }`}
              >
                {isSelected && <Check className="size-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{feature.label}</p>
                <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
        <p className="text-xs text-muted-foreground">{selected.size} feature(s) selected</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selected.size === 0}
            isLoading={assignMutation.isPending}
            loadingText="Assigning..."
          >
            Assign Features
          </Button>
        </div>
      </div>
    </div>
  );
};
