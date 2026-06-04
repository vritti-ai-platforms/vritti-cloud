import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { VersionDomainModule } from '@domain/version/version.module';
import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
// App Feature
import { AppFeatureController } from './app/app-feature/controllers/app-feature.controller';
// App Price
import { AppPriceController } from './app/app-price/controllers/app-price.controller';
// App
import { AppController } from './app/root/controllers/app.controller';
// Feature Microfrontend
import { FeatureMicrofrontendController } from './feature/feature-microfrontend/controllers/feature-microfrontend.controller';
// Feature Permission
import { FeaturePermissionController } from './feature/feature-permission/controllers/feature-permission.controller';
// Feature
import { FeatureController } from './feature/root/controllers/feature.controller';
// Microfrontend
import { MicrofrontendController } from './microfrontend/controllers/microfrontend.controller';
// Role Template App
import { RoleTemplateAppController } from './role-template/role-template-app/controllers/role-template-app.controller';
// Role Template Permission
import { RoleTemplatePermissionController } from './role-template/role-template-permission/controllers/role-template-permission.controller';
// Role Template
import { RoleTemplateController } from './role-template/root/controllers/role-template.controller';
// Version (root)
import { VersionController } from './root/controllers/version.controller';

@Module({
  imports: [VersionDomainModule, CoreServerModule, DeploymentDomainModule],
  controllers: [
    VersionController,
    MicrofrontendController,
    FeatureController,
    FeaturePermissionController,
    FeatureMicrofrontendController,
    AppController,
    AppFeatureController,
    AppPriceController,
    RoleTemplateController,
    RoleTemplateAppController,
    RoleTemplatePermissionController,
  ],
  exports: [VersionDomainModule],
})
export class AdminVersionModule {}
