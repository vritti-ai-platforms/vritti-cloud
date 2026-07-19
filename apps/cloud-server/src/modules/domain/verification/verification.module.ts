import { Module } from '@nestjs/common';
import { VerificationDomainRepository } from './repositories/verification.repository';
import { VerificationDomainService } from './services/verification.service';

@Module({
  providers: [VerificationDomainService, VerificationDomainRepository],
  exports: [VerificationDomainService],
})
export class VerificationModule {}
