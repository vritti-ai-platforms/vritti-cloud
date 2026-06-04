import { Module } from '@nestjs/common';
import { MediaDomainModule } from '@domain/media/media.module';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [MediaDomainModule],
  controllers: [MediaController],
})
export class MediaModule {}
