import { Module } from '@nestjs/common';
import { OAuthPendingLinkDomainRepository } from './repositories/oauth-pending-link.repository';
import { OAuthProviderDomainRepository } from './repositories/oauth-provider.repository';
import { OAuthStateDomainRepository } from './repositories/oauth-state.repository';

@Module({
  providers: [OAuthProviderDomainRepository, OAuthStateDomainRepository, OAuthPendingLinkDomainRepository],
  exports: [OAuthProviderDomainRepository, OAuthStateDomainRepository, OAuthPendingLinkDomainRepository],
})
export class OAuthDomainModule {}
