import { VersionService } from '@domain/version/root/services/version.service';
import { Injectable, Logger } from '@nestjs/common';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';

@Injectable()
export class VersionSnapshotService {
  private readonly logger = new Logger(VersionSnapshotService.name);

  constructor(
    private readonly versionService: VersionService,
    private readonly catalogSyncService: CatalogSyncService,
  ) {}

  // Builds the version snapshot, then pushes the refreshed catalog + role templates to every deployment on that version
  async createSnapshot(id: string): Promise<SuccessResponseDto> {
    const result = await this.versionService.createSnapshot(id);
    const version = await this.versionService.findById(id);
    await this.catalogSyncService.syncVersion(version.version);
    this.logger.log(`Snapshot created and catalog pushed to deployments for version: ${id}`);
    return result;
  }
}
