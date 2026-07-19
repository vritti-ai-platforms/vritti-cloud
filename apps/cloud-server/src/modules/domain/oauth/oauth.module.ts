import { Module } from '@nestjs/common';
import { OAuthProviderDomainRepository } from './repositories/oauth-provider.repository';
import { OAuthStateDomainRepository } from './repositories/oauth-state.repository';

@Module({
  providers: [OAuthProviderDomainRepository, OAuthStateDomainRepository],
  exports: [OAuthProviderDomainRepository, OAuthStateDomainRepository],
})
export class OAuthDomainModule {}
