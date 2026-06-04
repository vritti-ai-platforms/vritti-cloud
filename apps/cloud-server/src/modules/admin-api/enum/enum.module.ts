import { Module } from '@nestjs/common';
import { EnumController } from './controllers/enum.controller';

@Module({
  controllers: [EnumController],
})
export class AdminEnumModule {}
