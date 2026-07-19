import { Module } from '@nestjs/common';
// App Feature
import { AppFeatureDomainRepository } from './business/app/app-feature/repositories/app-feature.repository';
// App
import { AppDomainRepository } from './business/app/root/repositories/app.repository';
import { AppDomainService } from './business/app/root/services/app.service';
// Business Feature (feature ↔ app assignment within a business)
import { BusinessFeatureDomainService } from './business/feature/services/business-feature.service';
// Role Template Permission
import { RoleTemplateFeatureDomainRepository } from './business/role-template/role-template-permission/repositories/role-template-feature.repository';
import { RoleTemplateFeaturePermissionDomainRepository } from './business/role-template/role-template-permission/repositories/role-template-feature-permission.repository';
import { RoleTemplatePermissionDomainService } from './business/role-template/role-template-permission/services/role-template-permission.service';
import { RoleTemplateDomainRepository } from './business/role-template/root/repositories/role-template.repository';
// Role Template
import { RoleTemplateDomainService } from './business/role-template/root/services/role-template.service';
// Version Business (junction)
import { VersionBusinessDomainRepository } from './business/root/repositories/version-business.repository';
import { VersionBusinessDomainService } from './business/root/services/version-business.service';
// Feature Permission
import { FeaturePermissionDomainRepository } from './feature/feature-permission/repositories/feature-permission.repository';
import { FeaturePermissionDomainService } from './feature/feature-permission/services/feature-permission.service';
// Feature
import { FeatureDomainRepository } from './feature/root/repositories/feature.repository';
import { FeatureDomainService } from './feature/root/services/feature.service';
// Microfrontend
import { MicrofrontendDomainRepository } from './microfrontend/repositories/microfrontend.repository';
import { MicrofrontendDomainService } from './microfrontend/services/microfrontend.service';
// Version (root)
import { VersionDomainRepository } from './root/repositories/version.repository';
import { VersionDomainService } from './root/services/version.service';

@Module({
  providers: [
    // Version (root)
    VersionDomainService,
    VersionDomainRepository,
    // Version Business (junction)
    VersionBusinessDomainService,
    VersionBusinessDomainRepository,
    // Microfrontend
    MicrofrontendDomainService,
    MicrofrontendDomainRepository,
    // Feature
    FeatureDomainService,
    FeatureDomainRepository,
    // Feature Permission
    FeaturePermissionDomainService,
    FeaturePermissionDomainRepository,
    // App
    AppDomainService,
    AppDomainRepository,
    // App Feature
    AppFeatureDomainRepository,
    // Business Feature
    BusinessFeatureDomainService,
    // Role Template
    RoleTemplateDomainService,
    RoleTemplateDomainRepository,
    // Role Template Permission
    RoleTemplatePermissionDomainService,
    RoleTemplateFeatureDomainRepository,
    RoleTemplateFeaturePermissionDomainRepository,
  ],
  exports: [
    // Repositories
    VersionDomainRepository,
    VersionBusinessDomainRepository,
    MicrofrontendDomainRepository,
    FeatureDomainRepository,
    FeaturePermissionDomainRepository,
    AppDomainRepository,
    AppFeatureDomainRepository,
    RoleTemplateDomainRepository,
    RoleTemplateFeatureDomainRepository,
    RoleTemplateFeaturePermissionDomainRepository,
    // Services
    VersionDomainService,
    VersionBusinessDomainService,
    AppDomainService,
    FeatureDomainService,
    RoleTemplateDomainService,
    MicrofrontendDomainService,
    BusinessFeatureDomainService,
    FeaturePermissionDomainService,
    RoleTemplatePermissionDomainService,
  ],
})
export class VersionDomainModule {}
