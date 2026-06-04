import { Module } from '@nestjs/common';
import { AppCodeRepository } from './repositories/app-code.repository';
import { AppCodeService } from './services/app-code.service';

@Module({
  providers: [AppCodeService, AppCodeRepository],
  exports: [AppCodeService],
})
export class AppCodeDomainModule {}
