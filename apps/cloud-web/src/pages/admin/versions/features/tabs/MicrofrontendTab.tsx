import { zodResolver } from '@hookform/resolvers/zod';
import {
  useFeatureMicrofrontends,
  useRemoveFeatureMicrofrontend,
  useSetFeatureMicrofrontend,
} from '@hooks/admin/feature-microfrontends';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { MicrofrontendSelector } from '@vritti/quantum-ui/selects/microfrontend';
import { TextField } from '@vritti/quantum-ui/TextField';
import { keyBy } from 'lodash';
import { Globe, LinkIcon, Monitor, Smartphone, Unlink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import {
  type FeatureMicrofrontend,
  type SetFeatureMicrofrontendData,
  setFeatureMicrofrontendSchema,
} from '@/schemas/admin/features';

interface MicrofrontendTabProps {
  featureId: string;
}

type Platform = 'WEB' | 'MOBILE';

export const MicrofrontendTab = ({ featureId }: MicrofrontendTabProps) => {
  const { versionId } = useVersionContext();
  const { data: links, isLoading } = useFeatureMicrofrontends(versionId, featureId);
  const linksByPlatform = useMemo(() => keyBy(links ?? [], 'platform'), [links]);
  if (isLoading) {
    return (
      <div className="grid gap-4 pt-4">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <PlatformSection platform="WEB" featureId={featureId} link={linksByPlatform.WEB} />
      <PlatformSection platform="MOBILE" featureId={featureId} link={linksByPlatform.MOBILE} />
    </div>
  );
};

// Section for a single platform (WEB or MOBILE)
interface PlatformSectionProps {
  platform: Platform;
  featureId: string;
  link?: FeatureMicrofrontend;
}

const PlatformSection = ({ platform, featureId, link }: PlatformSectionProps) => {
  const { versionId } = useVersionContext();
  const confirm = useConfirm();
  const [showForm, setShowForm] = useState(false);

  const removeMutation = useRemoveFeatureMicrofrontend(versionId, featureId, {
    onSuccess: () => setShowForm(false),
  });

  const PlatformIcon = platform === 'WEB' ? Monitor : Smartphone;

  // Unlink the microfrontend from this feature
  const handleUnlink = async () => {
    if (!link) return;
    const confirmed = await confirm({
      title: 'Unlink microfrontend?',
      description: `The ${platform} microfrontend configuration will be removed from this feature.`,
      confirmLabel: 'Unlink',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate(link.microfrontendId);
  };

  // Form is open
  if (showForm) {
    return (
      <LinkMicrofrontendForm
        platform={platform}
        featureId={featureId}
        defaultValues={
          link
            ? {
                microfrontendId: link.microfrontendId,
                exposedModule: link.exposedModule,
                routePrefix: link.routePrefix,
              }
            : undefined
        }
        onCancel={() => setShowForm(false)}
        onSuccess={() => setShowForm(false)}
      />
    );
  }

  // Not configured
  if (!link) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <PlatformIcon className="size-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">{platform}</CardTitle>
            <CardDescription>Not configured</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-4 text-center">
          <LinkIcon className="size-6 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">No microfrontend linked</p>
          <p className="text-xs text-muted-foreground mt-1">
            Link a {platform.toLowerCase()} microfrontend to define how this feature is rendered.
          </p>
          <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
            Link Microfrontend
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Configured — show linked MF details
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <PlatformIcon className="size-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">{platform}</CardTitle>
            <CardDescription>Module federation configuration</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleUnlink}
            disabled={removeMutation.isPending}
          >
            <Unlink className="size-4 mr-1" />
            Unlink
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Microfrontend</p>
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">{link.microfrontendName}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Code</p>
            <Badge variant="outline" className="font-mono text-xs">
              {link.microfrontendCode}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Exposed Module</p>
            <Badge variant="outline" className="font-mono text-xs">
              {link.exposedModule}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Route Prefix</p>
            <Badge variant="outline" className="font-mono text-xs">
              {link.routePrefix}
            </Badge>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Remote Entry</p>
          <p className="font-mono text-xs text-foreground bg-muted/50 rounded px-2 py-1 truncate">{link.remoteEntry}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Form for linking/editing a microfrontend on a platform
interface LinkMicrofrontendFormProps {
  platform: Platform;
  featureId: string;
  defaultValues?: { microfrontendId: string; exposedModule: string; routePrefix: string };
  onCancel: () => void;
  onSuccess: () => void;
}

const LinkMicrofrontendForm = ({
  platform,
  featureId,
  defaultValues,
  onCancel,
  onSuccess,
}: LinkMicrofrontendFormProps) => {
  const { versionId } = useVersionContext();

  const form = useForm<SetFeatureMicrofrontendData>({
    resolver: zodResolver(setFeatureMicrofrontendSchema),
    defaultValues: defaultValues ?? {
      microfrontendId: '',
      exposedModule: '',
      routePrefix: '',
    },
  });

  const setMutation = useSetFeatureMicrofrontend(versionId, featureId, { onSuccess });

  const PlatformIcon = platform === 'WEB' ? Monitor : Smartphone;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <PlatformIcon className="size-5 text-muted-foreground" />
        <div>
          <CardTitle className="text-base">Link {platform} Microfrontend</CardTitle>
          <CardDescription>Configure the module federation entry for this feature</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form form={form} mutation={setMutation}>
          <MicrofrontendSelector
            name="microfrontendId"
            params={{ versionId, platform }}
            description="Which MF bundle renders this feature"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              name="exposedModule"
              label="Exposed Module"
              placeholder="e.g. ./Orders"
              description="Module name exported from the MF"
            />
            <TextField
              name="routePrefix"
              label="Route Prefix"
              placeholder="e.g. /orders"
              description="URL path for this feature"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loadingText="Saving...">
              Save Configuration
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
