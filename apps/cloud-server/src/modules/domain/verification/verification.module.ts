import { Module } from '@nestjs/common';
import { VerificationRepository } from './repositories/verification.repository';
import { VerificationService } from './services/verification.service';

@Module({
  providers: [VerificationService, VerificationRepository],
  exports: [VerificationService],
})
export class VerificationModule {}
