import { Module } from '@nestjs/common';
// Version (root)
import { VersionRepository } from './root/repositories/version.repository';
import { VersionService } from './root/services/version.service';
// Microfrontend
import { MicrofrontendRepository } from './microfrontend/repositories/microfrontend.repository';
import { MicrofrontendService } from './microfrontend/services/microfrontend.service';
// Feature
import { FeatureRepository } from './feature/root/repositories/feature.repository';
import { FeatureService } from './feature/root/services/feature.service';
// Feature Permission
import { FeaturePermissionRepository } from './feature/feature-permission/repositories/feature-permission.repository';
import { FeaturePermissionService } from './feature/feature-permission/services/feature-permission.service';
// Feature Microfrontend
import { FeatureMicrofrontendRepository } from './feature/feature-microfrontend/repositories/feature-microfrontend.repository';
import { FeatureMicrofrontendService } from './feature/feature-microfrontend/services/feature-microfrontend.service';
// App
import { AppRepository } from './app/root/repositories/app.repository';
import { AppService } from './app/root/services/app.service';
// App Feature
import { AppFeatureRepository } from './app/app-feature/repositories/app-feature.repository';
import { AppFeatureService } from './app/app-feature/services/app-feature.service';
// App Price
import { AppPriceRepository } from './app/app-price/repositories/app-price.repository';
import { AppPriceService } from './app/app-price/services/app-price.service';
// Role
import { RoleAppRepository } from './role/root/repositories/role-app.repository';
import { RoleRepository } from './role/root/repositories/role.repository';
import { RoleService } from './role/root/services/role.service';
// Role Permission
import { RoleFeaturePermissionRepository } from './role/role-permission/repositories/role-feature-permission.repository';
import { RolePermissionService } from './role/role-permission/services/role-permission.service';

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
    // Role
    RoleService,
    RoleRepository,
    RoleAppRepository,
    // Role Permission
    RolePermissionService,
    RoleFeaturePermissionRepository,
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
    RoleRepository,
    RoleAppRepository,
    RoleFeaturePermissionRepository,
    // Services
    VersionService,
    AppService,
    FeatureService,
    RoleService,
    MicrofrontendService,
    AppFeatureService,
    AppPriceService,
    FeaturePermissionService,
    FeatureMicrofrontendService,
    RolePermissionService,
  ],
})
export class VersionDomainModule {}
