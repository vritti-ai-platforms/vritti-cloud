export function planAppsQueryKey(planId: string) {
  return ['admin', 'plans', planId, 'apps'] as const;
}
