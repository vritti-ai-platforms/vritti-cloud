# Backend Service Response Pattern

## create() / assign() → returns CreateResponseDto\<EntityDto\>

The frontend needs the created entity's ID/data AND success metadata (for toast messages). Wrap the entity in `CreateResponseDto<T>` from `@vritti/api-sdk`.

```typescript
import { CreateResponseDto } from '@vritti/api-sdk';

// CORRECT
async create(dto: CreateFeatureDto): Promise<CreateResponseDto<FeatureDto>> {
  const feature = await this.featureRepository.create(dto);
  this.logger.log(`Created feature: ${feature.code} (${feature.id})`);
  return { success: true, message: 'Feature created successfully.', data: FeatureDto.from(feature) };
}

// WRONG — no success/message metadata for toast
async create(dto: CreateFeatureDto): Promise<FeatureDto> {
  const feature = await this.featureRepository.create(dto);
  return FeatureDto.from(feature);
}

// WRONG — no entity data for frontend
async create(dto: CreateFeatureDto): Promise<SuccessResponseDto> {
  await this.featureRepository.create(dto);
  return { success: true, message: 'Feature created successfully.' };
}
```

## update() / delete() → returns SuccessResponseDto

No entity data needed. Return `{ success: true, message: '...' }`.

```typescript
async update(id: string, dto: UpdateFeatureDto): Promise<SuccessResponseDto> {
  await this.featureRepository.update(id, dto);
  return { success: true, message: 'Feature updated successfully.' };
}
```

## Summary

| Method | Return Type |
|--------|------------|
| `create()` / `assign()` | `CreateResponseDto<EntityDto>` (`{ success, message, data }`) |
| `update()` | `SuccessResponseDto` |
| `delete()` / `remove()` | `SuccessResponseDto` |
| `findById()` | Entity DTO |
| `findForTable()` | `TableResponseDto` (result[], count, state, activeViewId) |
| `findForSelect()` | `SelectQueryResult` (from api-sdk) |
