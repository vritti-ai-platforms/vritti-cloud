# Frontend Service Response Pattern

## Do NOT use MutationResponse from quantum-ui

Never import `MutationResponse` from `@vritti/quantum-ui/api-response`. Use properly typed responses.

## Create services → return the entity type

```typescript
// CORRECT
export function createFeature(data: CreateFeatureData): Promise<Feature> {
  return axios.post<Feature>('admin-api/features', data).then((r) => r.data);
}

// WRONG — generic type, frontend can't access entity fields
export function createFeature(data: CreateFeatureData): Promise<MutationResponse> {
  return axios.post<MutationResponse>('admin-api/features', data).then((r) => r.data);
}
```

## Update/delete services → return SuccessResponse

```typescript
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';

export function updateFeature({ id, data }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/features/${id}`, data).then((r) => r.data);
}
```

## Table query services → use TableResponse<T>

For endpoints that return paginated table data with server-managed state, use the generic `TableResponse<T>` type alias in the schema file:

```typescript
// In schemas/admin/features.ts
import type { TableResponse } from '@vritti/quantum-ui/api-response';
export type FeaturesTableResponse = TableResponse<Feature>;
```

## Hook types must match service types

```typescript
// Create hook — returns entity
useMutation<Feature, AxiosError, CreateFeatureData>

// Update hook — returns SuccessResponse
useMutation<SuccessResponse, AxiosError, { id: string; data: UpdateFeatureData }>
```
