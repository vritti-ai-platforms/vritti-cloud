import { Injectable, Logger } from '@nestjs/common';
import { CoreHttpService } from './core-http.service';

// Proxies config cache management calls to core-server
@Injectable()
export class CoreConfigService {
  private readonly logger = new Logger(CoreConfigService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Invalidates the in-memory config cache for a single org on core-server
  async invalidateOrg(url: string, webhookSecret: string, orgId: string): Promise<void> {
    await this.http.post(url, webhookSecret, `/config/webhook/invalidate/${orgId}`, {});
    this.logger.log(`Invalidated config cache for org ${orgId} in core`);
  }

  // Invalidates the entire config cache on core-server (all orgs)
  async invalidateAll(url: string, webhookSecret: string): Promise<void> {
    await this.http.post(url, webhookSecret, '/config/webhook/invalidate-all', {});
    this.logger.log('Invalidated all config cache in core');
  }
}
