import {
  useAssignMarketCountry,
  useDeleteMarket,
  useMarket,
  useMarketCountries,
  useUnassignMarketCountry,
} from '@hooks/admin/markets';
import { cn } from '@vritti/quantum-ui';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { Empty } from '@vritti/quantum-ui/Empty';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { BadgeDollarSign, Globe, Link2, Link2Off, MapPin, MapPinOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditMarketForm } from './forms/EditMarketForm';

export const MarketViewPage = () => {
  const { id } = useSlugParams('marketSlug');
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: market } = useMarket(id);
  const { data: countries = [], isLoading: countriesLoading } = useMarketCountries(id ?? '');

  const deleteMutation = useDeleteMarket({
    onSuccess: () => navigate('/markets'),
  });

  const assignMutation = useAssignMarketCountry();
  const unassignMutation = useUnassignMarketCountry();

  // Toggle a country on or off for this market
  const handleCountryToggle = (countryId: string, enabled: boolean) => {
    if (!id) return;
    if (enabled) {
      assignMutation.mutate({ marketId: id, countryId });
    } else {
      unassignMutation.mutate({ marketId: id, countryId });
    }
  };

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${market.name}?`,
      description: `${market.name} and all its associated data will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={market.name}
        description={`${market.currencyCode} — ${market.code}`}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Countries</p>
              <p className="text-2xl font-semibold">{market.countryCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <BadgeDollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan Prices</p>
              <p className="text-2xl font-semibold">{market.planPriceCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="text-2xl font-semibold">{market.currencyCode}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countries card */}
      <Card>
        <CardHeader>
          <CardTitle>Countries</CardTitle>
          <CardDescription>Assign which countries belong to this market.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-48">
          {countriesLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Spinner className="size-6 text-primary" />
              Loading countries...
            </div>
          ) : countries.length === 0 ? (
            <Empty
              icon={<MapPinOff />}
              title="No countries"
              description="No countries have been configured yet. Add a country to assign it to this market."
              action={
                <Button size="sm" onClick={() => navigate('/countries')}>
                  Add Country
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {countries.map((country) => {
                const isPending =
                  (assignMutation.isPending && assignMutation.variables?.countryId === country.id) ||
                  (unassignMutation.isPending && unassignMutation.variables?.countryId === country.id);

                return (
                  <div
                    key={country.id}
                    className={cn(
                      'flex items-center justify-between px-3 rounded-xl border h-[69px]',
                      country.isAssigned ? 'bg-primary/5 border-primary/30' : 'border-border',
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm">{country.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {country.code}
                        </Badge>
                        <Badge variant="secondary">{country.defaultCurrency}</Badge>
                      </div>
                    </div>
                    <Button
                      variant={country.isAssigned ? 'default' : 'outline'}
                      size="sm"
                      isLoading={isPending}
                      loadingText={country.isAssigned ? 'Removing' : 'Adding'}
                      startAdornment={
                        country.isAssigned ? <Link2Off className="size-4" /> : <Link2 className="size-4" />
                      }
                      className="min-w-24"
                      onClick={() => handleCountryToggle(country.id, !country.isAssigned)}
                    >
                      {country.isAssigned ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DangerZone
        title="Delete this market"
        description="This action cannot be undone. All associated data will be permanently removed."
        buttonText="Delete Market"
        onClick={handleDelete}
        disabled={!market.canDelete}
        warning={
          !market.canDelete
            ? `This market has ${market.countryCount} country(ies) and ${market.planPriceCount} plan price(s) associated with it. Remove all associations before deleting.`
            : undefined
        }
      />

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        icon={Globe}
        title="Edit Market"
        description="Update the details for this market."
        content={(close) => <EditMarketForm market={market} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
