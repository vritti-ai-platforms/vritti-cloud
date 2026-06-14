import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { VersionDomainModule } from '@domain/version/version.module';
import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
// App Feature
import { AppFeatureController } from './business/app/app-feature/controllers/app-feature.controller';
// App
import { AppController } from './business/app/root/controllers/app.controller';
// Role Template App
import { RoleTemplateAppController } from './business/role-template/role-template-app/controllers/role-template-app.controller';
// Role Template Permission
import { RoleTemplatePermissionController } from './business/role-template/role-template-permission/controllers/role-template-permission.controller';
// Business Role Template (business-scoped list + create)
import { BusinessRoleTemplateController } from './business/role-template/root/controllers/business-role-template.controller';
// Role Template (version-scoped detail/update/delete)
import { RoleTemplateController } from './business/role-template/root/controllers/role-template.controller';
// Businesses in a version
import { VersionBusinessController } from './business/root/controllers/version-business.controller';
// Feature Microfrontend
import { FeatureMicrofrontendController } from './feature/feature-microfrontend/controllers/feature-microfrontend.controller';
// Feature Permission
import { FeaturePermissionController } from './feature/feature-permission/controllers/feature-permission.controller';
// Feature
import { FeatureController } from './feature/root/controllers/feature.controller';
// Microfrontend
import { MicrofrontendController } from './microfrontend/controllers/microfrontend.controller';
// Version (root)
import { VersionController } from './root/controllers/version.controller';

@Module({
  imports: [VersionDomainModule, CoreServerModule, DeploymentDomainModule],
  controllers: [
    VersionController,
    VersionBusinessController,
    MicrofrontendController,
    FeatureController,
    FeaturePermissionController,
    FeatureMicrofrontendController,
    AppController,
    AppFeatureController,
    RoleTemplateController,
    BusinessRoleTemplateController,
    RoleTemplateAppController,
    RoleTemplatePermissionController,
  ],
  exports: [VersionDomainModule],
})
export class AdminVersionModule {}
