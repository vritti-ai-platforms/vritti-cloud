import { useDeploymentPlans } from '@hooks/cloud/infrastructure';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, Check, CreditCard } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateOrgFormData } from '@/schemas/cloud/organizations';
import type { PlanOption } from '@/services/cloud/infrastructure.service';

interface ChoosePlanStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  selectedPlanId: string | undefined;
  onSelect: (plan: PlanOption) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const ChoosePlanStep: React.FC<ChoosePlanStepProps> = ({
  form,
  selectedPlanId,
  onSelect,
  onBack,
  onContinue,
}) => {
  const deploymentId = form.getValues('deploymentId') ?? '';
  const industryId = form.getValues('industryId') ?? '';

  const { data: plans = [], isLoading } = useDeploymentPlans(deploymentId, industryId);

  return (
    <Form form={form} onSubmit={onContinue}>
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          Loading available plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <CreditCard className="size-10 text-muted-foreground" />
          <Typography variant="body1" intent="muted">
            No plans available for this deployment and industry combination.
          </Typography>
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <Button
                  key={plan.id}
                  type="button"
                  variant="ghost"
                  className="group relative h-auto w-full cursor-pointer text-left rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => onSelect(plan)}
                >
                  {/* Selected ring */}
                  {isSelected && (
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary" />
                  )}

                  {/* Check mark */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                      <CreditCard className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <Typography variant="h4">{plan.name}</Typography>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{plan.code}</div>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-1">
                    {plan.price ? (
                      <>
                        <span className="text-2xl font-bold text-primary">
                          {plan.currency === 'INR' ? '₹' : plan.currency}
                          {plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Pricing not configured</span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={!selectedPlanId}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </Form>
  );
};
