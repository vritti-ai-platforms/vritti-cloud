import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, SuccessResponseDto } from '@vritti/api-sdk';
import type { FeatureType, NewFeaturePermission } from '@/db/schema';
import { FeatureRepository } from '../../root/repositories/feature.repository';
import type { SetFeaturePermissionsDto } from '@/modules/admin-api/version/feature/feature-permission/dto/request/set-feature-permissions.dto';
import { FeaturePermissionRepository } from '../repositories/feature-permission.repository';

@Injectable()
export class FeaturePermissionService {
  private readonly logger = new Logger(FeaturePermissionService.name);

  constructor(
    private readonly featurePermissionRepository: FeaturePermissionRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  // Returns the permission type strings for a feature
  async findByFeature(featureId: string): Promise<{ types: string[] }> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    const permissions = await this.featurePermissionRepository.findByFeatureId(featureId);
    this.logger.log(`Fetched permissions for feature: ${featureId} (${permissions.length} types)`);
    return { types: permissions.map((p) => p.type) };
  }

  // Replaces all permissions for a feature with the given types
  async setPermissions(featureId: string, dto: SetFeaturePermissionsDto): Promise<SuccessResponseDto> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }

    const rows: NewFeaturePermission[] = dto.types.map((type) => ({
      versionId: feature.versionId,
      featureId,
      type: type as FeatureType,
    }));

    // Delete all existing + bulk create new in a transaction
    await this.featurePermissionRepository.transaction(async (tx) => {
      await this.featurePermissionRepository.deleteByFeatureId(featureId, tx);
      await this.featurePermissionRepository.bulkCreate(rows, tx);
    });

    this.logger.log(`Set ${dto.types.length} permissions for feature: ${featureId}`);
    return { success: true, message: `Permissions for "${feature.name}" updated successfully (${dto.types.length} types).` };
  }
}
