import { Module } from '@nestjs/common';
import { AppVersionDomainModule } from '@domain/app-version/app-version.module';
// App Version (root)
import { AppVersionController } from './root/controllers/app-version.controller';
// Microfrontend
import { MicrofrontendController } from './microfrontend/controllers/microfrontend.controller';
// Feature
import { FeatureController } from './feature/root/controllers/feature.controller';
// Feature Permission
import { FeaturePermissionController } from './feature/feature-permission/controllers/feature-permission.controller';
// Feature Microfrontend
import { FeatureMicrofrontendController } from './feature/feature-microfrontend/controllers/feature-microfrontend.controller';
// App
import { AppController } from './app/root/controllers/app.controller';
// App Feature
import { AppFeatureController } from './app/app-feature/controllers/app-feature.controller';
// App Price
import { AppPriceController } from './app/app-price/controllers/app-price.controller';
// Role
import { RoleController } from './role/root/controllers/role.controller';
// Role Permission
import { RolePermissionController } from './role/role-permission/controllers/role-permission.controller';

@Module({
  imports: [AppVersionDomainModule],
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
  exports: [AppVersionDomainModule],
})
export class AdminAppVersionModule {}
