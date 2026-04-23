# Frontend Service Response Pattern

## Do NOT use MutationResponse from quantum-ui

Never import `MutationResponse` from `@vritti/quantum-ui/api-response`. Use properly typed responses.

## Create services → return CreateResponse\<Entity\>

The backend wraps created entities in `{ success, message, data }`. Use `CreateResponse<T>` from quantum-ui.

```typescript
import type { CreateResponse } from '@vritti/quantum-ui/api-response';

// CORRECT
export function createFeature(data: CreateFeatureData): Promise<CreateResponse<Feature>> {
  return axios.post<CreateResponse<Feature>>('admin-api/features', data).then((r) => r.data);
}

// WRONG — bare entity, missing success/message
export function createFeature(data: CreateFeatureData): Promise<Feature> {
  return axios.post<Feature>('admin-api/features', data).then((r) => r.data);
}

// WRONG — generic type, no entity data
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
// Create hook — returns wrapped entity
useMutation<CreateResponse<Feature>, AxiosError, CreateFeatureData>

// Update hook — returns SuccessResponse
useMutation<SuccessResponse, AxiosError, { id: string; data: UpdateFeatureData }>
```
