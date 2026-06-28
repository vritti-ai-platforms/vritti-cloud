import { Module } from '@nestjs/common';
// App Feature
import { AppFeatureRepository } from './business/app/app-feature/repositories/app-feature.repository';
// App Price
import { AppPriceRepository } from './business/app/app-price/repositories/app-price.repository';
// App
import { AppRepository } from './business/app/root/repositories/app.repository';
import { AppService } from './business/app/root/services/app.service';
// Business Feature (feature ↔ app assignment within a business)
import { BusinessFeatureService } from './business/feature/services/business-feature.service';
// Role Template Permission
import { RoleTemplateFeatureRepository } from './business/role-template/role-template-permission/repositories/role-template-feature.repository';
import { RoleTemplateFeaturePermissionRepository } from './business/role-template/role-template-permission/repositories/role-template-feature-permission.repository';
import { RoleTemplatePermissionService } from './business/role-template/role-template-permission/services/role-template-permission.service';
import { RoleTemplateRepository } from './business/role-template/root/repositories/role-template.repository';
// Role Template
import { RoleTemplateService } from './business/role-template/root/services/role-template.service';
// Version Business (junction)
import { VersionBusinessRepository } from './business/root/repositories/version-business.repository';
import { VersionBusinessService } from './business/root/services/version-business.service';
// Feature Permission
import { FeaturePermissionRepository } from './feature/feature-permission/repositories/feature-permission.repository';
import { FeaturePermissionService } from './feature/feature-permission/services/feature-permission.service';
// Feature
import { FeatureRepository } from './feature/root/repositories/feature.repository';
import { FeatureService } from './feature/root/services/feature.service';
// Microfrontend
import { MicrofrontendRepository } from './microfrontend/repositories/microfrontend.repository';
import { MicrofrontendService } from './microfrontend/services/microfrontend.service';
// Version (root)
import { VersionRepository } from './root/repositories/version.repository';
import { VersionService } from './root/services/version.service';

@Module({
  providers: [
    // Version (root)
    VersionService,
    VersionRepository,
    // Version Business (junction)
    VersionBusinessService,
    VersionBusinessRepository,
    // Microfrontend
    MicrofrontendService,
    MicrofrontendRepository,
    // Feature
    FeatureService,
    FeatureRepository,
    // Feature Permission
    FeaturePermissionService,
    FeaturePermissionRepository,
    // App
    AppService,
    AppRepository,
    // App Feature
    AppFeatureRepository,
    // Business Feature
    BusinessFeatureService,
    // App Price
    AppPriceRepository,
    // Role Template
    RoleTemplateService,
    RoleTemplateRepository,
    // Role Template Permission
    RoleTemplatePermissionService,
    RoleTemplateFeatureRepository,
    RoleTemplateFeaturePermissionRepository,
  ],
  exports: [
    // Repositories
    VersionRepository,
    VersionBusinessRepository,
    MicrofrontendRepository,
    FeatureRepository,
    FeaturePermissionRepository,
    AppRepository,
    AppFeatureRepository,
    AppPriceRepository,
    RoleTemplateRepository,
    RoleTemplateFeatureRepository,
    RoleTemplateFeaturePermissionRepository,
    // Services
    VersionService,
    VersionBusinessService,
    AppService,
    FeatureService,
    RoleTemplateService,
    MicrofrontendService,
    BusinessFeatureService,
    FeaturePermissionService,
    RoleTemplatePermissionService,
  ],
})
export class VersionDomainModule {}
