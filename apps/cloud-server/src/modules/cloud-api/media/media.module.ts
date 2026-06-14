import { MediaDomainModule } from '@domain/media/media.module';
import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [MediaDomainModule],
  controllers: [MediaController],
})
export class MediaModule {}
