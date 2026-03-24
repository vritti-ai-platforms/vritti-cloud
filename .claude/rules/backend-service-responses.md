# Backend Service Response Pattern

## create() → returns entity DTO

The frontend needs the created entity's ID and data. Always return the full entity DTO from create methods.

```typescript
// CORRECT
async create(dto: CreateFeatureDto): Promise<FeatureDto> {
  const feature = await this.featureRepository.create(dto);
  this.logger.log(`Created feature: ${feature.code} (${feature.id})`);
  return FeatureDto.from(feature);
}

// WRONG — frontend can't get the new entity ID
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
| `create()` / `assign()` | Entity DTO (`FeatureDto`, `AppDto`, etc.) |
| `update()` | `SuccessResponseDto` |
| `delete()` / `remove()` | `SuccessResponseDto` |
| `findById()` | Entity DTO |
| `findForTable()` | `TableResponseDto` (result[], count, state, activeViewId) |
| `findForSelect()` | `SelectQueryResult` (from api-sdk) |
