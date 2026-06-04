# Skeleton & Loading Conventions

## View pages — `useSuspenseQuery` + `<Suspense>` skeleton

View pages (pages that fetch a single entity by ID) use `useSuspenseQuery` so data is always defined. Loading state is handled by a `<Suspense>` boundary at the route level with a co-located skeleton fallback.

```typescript
// Hook — useSuspenseQuery, not useQuery
export function useRegion(id: string) {
  return useSuspenseQuery<Region, AxiosError>({
    queryKey: ['admin', 'regions', id],
    queryFn: () => getRegion(id),
  });
}

// Page — no loading branch, data always defined
const { data: region } = useRegion(id);

// Route — skeleton at Suspense boundary
<Suspense fallback={<RegionViewPageSkeleton />}>
  <RegionViewPage />
</Suspense>
```

## List pages — `useQuery` + DataTable `isLoading`

List pages keep `useQuery`. The `DataTable` component handles its own loading state via its `isLoading` prop. `PageHeader` renders instantly with a static title.

## Skeleton file conventions

- **Co-located** with the page: `{Page}Skeleton.tsx` next to `{Page}.tsx`
- **Compose from building blocks**: `PageHeaderSkeleton`, `CardSkeleton`, `TabsSkeleton`, `DangerZoneSkeleton`, `Skeleton`
- **No shadows or elevation** on skeleton cards — use `CardSkeleton` (no `shadow-sm`)
- **No colored borders** — skeleton danger zones use plain `border`, not `border-destructive/50`
- **Match layout** — same grid cols, gap, padding as the real page
- **Error handling** — handled by existing `QueryErrorBoundary` in layout, no extra setup needed

## Use the `/skeleton` skill to add skeletons to view pages.
