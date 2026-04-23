import { Module } from '@nestjs/common';
// App Feature
import { AppFeatureRepository } from './app/app-feature/repositories/app-feature.repository';
import { AppFeatureService } from './app/app-feature/services/app-feature.service';
// App Price
import { AppPriceRepository } from './app/app-price/repositories/app-price.repository';
import { AppPriceService } from './app/app-price/services/app-price.service';
// App
import { AppRepository } from './app/root/repositories/app.repository';
import { AppService } from './app/root/services/app.service';
// Feature Microfrontend
import { FeatureMicrofrontendRepository } from './feature/feature-microfrontend/repositories/feature-microfrontend.repository';
import { FeatureMicrofrontendService } from './feature/feature-microfrontend/services/feature-microfrontend.service';
// Feature Permission
import { FeaturePermissionRepository } from './feature/feature-permission/repositories/feature-permission.repository';
import { FeaturePermissionService } from './feature/feature-permission/services/feature-permission.service';
// Feature
import { FeatureRepository } from './feature/root/repositories/feature.repository';
import { FeatureService } from './feature/root/services/feature.service';
// Microfrontend
import { MicrofrontendRepository } from './microfrontend/repositories/microfrontend.repository';
import { MicrofrontendService } from './microfrontend/services/microfrontend.service';
// Role Template Permission
import { RoleTemplateFeaturePermissionRepository } from './role-template/role-template-permission/repositories/role-template-feature-permission.repository';
import { RoleTemplatePermissionService } from './role-template/role-template-permission/services/role-template-permission.service';
import { RoleTemplateRepository } from './role-template/root/repositories/role-template.repository';
// Role Template App
import { RoleTemplateAppRepository } from './role-template/role-template-app/repositories/role-template-app.repository';
import { RoleTemplateAppService } from './role-template/role-template-app/services/role-template-app.service';
// Role Template
import { RoleTemplateService } from './role-template/root/services/role-template.service';
// Version (root)
import { VersionRepository } from './root/repositories/version.repository';
import { VersionService } from './root/services/version.service';

@Module({
  providers: [
    // Version (root)
    VersionService,
    VersionRepository,
    // Microfrontend
    MicrofrontendService,
    MicrofrontendRepository,
    // Feature
    FeatureService,
    FeatureRepository,
    // Feature Permission
    FeaturePermissionService,
    FeaturePermissionRepository,
    // Feature Microfrontend
    FeatureMicrofrontendService,
    FeatureMicrofrontendRepository,
    // App
    AppService,
    AppRepository,
    // App Feature
    AppFeatureService,
    AppFeatureRepository,
    // App Price
    AppPriceService,
    AppPriceRepository,
    // Role Template
    RoleTemplateService,
    RoleTemplateRepository,
    // Role Template App
    RoleTemplateAppService,
    RoleTemplateAppRepository,
    // Role Template Permission
    RoleTemplatePermissionService,
    RoleTemplateFeaturePermissionRepository,
  ],
  exports: [
    // Repositories
    VersionRepository,
    MicrofrontendRepository,
    FeatureRepository,
    FeaturePermissionRepository,
    FeatureMicrofrontendRepository,
    AppRepository,
    AppFeatureRepository,
    AppPriceRepository,
    RoleTemplateRepository,
    RoleTemplateAppRepository,
    RoleTemplateFeaturePermissionRepository,
    // Services
    VersionService,
    AppService,
    FeatureService,
    RoleTemplateService,
    MicrofrontendService,
    AppFeatureService,
    AppPriceService,
    FeaturePermissionService,
    FeatureMicrofrontendService,
    RoleTemplateAppService,
    RoleTemplatePermissionService,
  ],
})
export class VersionDomainModule {}
