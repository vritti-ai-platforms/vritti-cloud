import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AdminApiModule } from '@/modules/admin-api/admin-api.module';
import { ServicesModule } from '@/services/services.module';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationMemberRepository } from './repositories/organization-member.repository';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationService } from './services/organization.service';
import { OrganizationUsersController } from './controllers/organization-users.controller';
import { OrganizationUsersService } from './services/organization-users.service';

@Module({
  imports: [ServicesModule, AdminApiModule, MediaModule],
  controllers: [OrganizationController, OrganizationUsersController],
  providers: [OrganizationService, OrganizationRepository, OrganizationMemberRepository, OrganizationUsersService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
