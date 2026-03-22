import { Module } from '@nestjs/common';
// App Version (root)
import { AppVersionController } from './root/controllers/app-version.controller';
import { AppVersionRepository } from './root/repositories/app-version.repository';
import { AppVersionService } from './root/services/app-version.service';
// Microfrontend
import { MicrofrontendController } from './microfrontend/controllers/microfrontend.controller';
import { MicrofrontendRepository } from './microfrontend/repositories/microfrontend.repository';
import { MicrofrontendService } from './microfrontend/services/microfrontend.service';
// Feature
import { FeatureController } from './feature/root/controllers/feature.controller';
import { FeatureRepository } from './feature/root/repositories/feature.repository';
import { FeatureService } from './feature/root/services/feature.service';
// Feature Permission
import { FeaturePermissionController } from './feature/feature-permission/controllers/feature-permission.controller';
import { FeaturePermissionRepository } from './feature/feature-permission/repositories/feature-permission.repository';
import { FeaturePermissionService } from './feature/feature-permission/services/feature-permission.service';
// Feature Microfrontend
import { FeatureMicrofrontendController } from './feature/feature-microfrontend/controllers/feature-microfrontend.controller';
import { FeatureMicrofrontendRepository } from './feature/feature-microfrontend/repositories/feature-microfrontend.repository';
import { FeatureMicrofrontendService } from './feature/feature-microfrontend/services/feature-microfrontend.service';
// App
import { AppController } from './app/root/controllers/app.controller';
import { AppRepository } from './app/root/repositories/app.repository';
import { AppService } from './app/root/services/app.service';
// App Feature
import { AppFeatureController } from './app/app-feature/controllers/app-feature.controller';
import { AppFeatureRepository } from './app/app-feature/repositories/app-feature.repository';
import { AppFeatureService } from './app/app-feature/services/app-feature.service';
// App Price
import { AppPriceController } from './app/app-price/controllers/app-price.controller';
import { AppPriceRepository } from './app/app-price/repositories/app-price.repository';
import { AppPriceService } from './app/app-price/services/app-price.service';
// Role
import { RoleController } from './role/root/controllers/role.controller';
import { RoleRepository } from './role/root/repositories/role.repository';
import { RoleService } from './role/root/services/role.service';
// Role Permission
import { RolePermissionController } from './role/role-permission/controllers/role-permission.controller';
import { RoleFeaturePermissionRepository } from './role/role-permission/repositories/role-feature-permission.repository';
import { RolePermissionService } from './role/role-permission/services/role-permission.service';

@Module({
  controllers: [
    AppVersionController,
    MicrofrontendController,
    FeatureController,
    FeaturePermissionController,
    FeatureMicrofrontendController,
    AppController,
    AppFeatureController,
    AppPriceController,
    RoleController,
    RolePermissionController,
  ],
  providers: [
    // App Version (root)
    AppVersionService,
    AppVersionRepository,
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
    // Role Permission
    RolePermissionService,
    RoleFeaturePermissionRepository,
  ],
  exports: [
    AppVersionRepository,
    MicrofrontendRepository,
    FeatureRepository,
    FeaturePermissionRepository,
    FeatureMicrofrontendRepository,
    AppRepository,
    AppFeatureRepository,
    AppPriceRepository,
    RoleRepository,
    RoleFeaturePermissionRepository,
  ],
})
export class AppVersionModule {}
