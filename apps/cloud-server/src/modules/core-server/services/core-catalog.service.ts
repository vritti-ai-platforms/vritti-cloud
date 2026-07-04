import { Injectable, Logger } from '@nestjs/common';
import type { CatalogLicense, SignedDocument } from '@vritti/api-sdk/license';
import { CoreHttpService } from './core-http.service';

// Pushes signed catalog licenses (version snapshots) to core-server deployments — deployment-level, not org-scoped
@Injectable()
export class CoreCatalogService {
  private readonly logger = new Logger(CoreCatalogService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Replaces the deployment's active catalog with a signed license document (idempotent by snapshot hash)
  async pushCatalog(url: string, signingKey: string, doc: SignedDocument<CatalogLicense>): Promise<void> {
    await this.http.put(url, signingKey, '/catalog/internal', doc);
    this.logger.log(`Pushed catalog license for version ${doc.payload.version} (hash ${doc.payload.hash}) to core`);
  }
}
