import { Module } from '@nestjs/common';
import { OAuthProviderRepository } from './repositories/oauth-provider.repository';
import { OAuthStateRepository } from './repositories/oauth-state.repository';

@Module({
  providers: [OAuthProviderRepository, OAuthStateRepository],
  exports: [OAuthProviderRepository, OAuthStateRepository],
})
export class OAuthDomainModule {}
