import { PlanDomainModule } from '@domain/plan/plan.module';
import { PlanPriceDomainModule } from '@domain/plan-price/plan-price.module';
import { VersionDomainModule } from '@domain/version/version.module';
import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
// App
import { AppController } from './business/app/controllers/app.controller';
// Plan (version + business scoped)
import { PlanAppController } from './business/plan/plan-app/controllers/plan-app.controller';
import { PlanFeaturePermissionController } from './business/plan/plan-feature-permission/controllers/plan-feature-permission.controller';
import { PlanPriceController } from './business/plan/plan-price/controllers/plan-price.controller';
import { PlanController } from './business/plan/root/controllers/plan.controller';
// Business Features (feature ↔ app assignment + permissions overview)
import { BusinessFeatureController } from './business/feature/controllers/business-feature.controller';
// Business Permissions
import { BusinessPermissionController } from './business/permission/controllers/business-permission.controller';
// Role Template Permission
import { RoleTemplatePermissionController } from './business/role-template/role-template-permission/controllers/role-template-permission.controller';
// Business Role Template (business-scoped CRUD)
import { BusinessRoleTemplateController } from './business/role-template/root/controllers/business-role-template.controller';
// Businesses in a version
import { VersionBusinessController } from './business/root/controllers/version-business.controller';
// Feature Microfrontend
import { FeatureMicrofrontendController } from './feature/feature-microfrontend/controllers/feature-microfrontend.controller';
// Feature Permission (feature-scoped read-only table)
import { FeaturePermissionController } from './feature/permission/controllers/feature-permission.controller';
// Feature
import { FeatureController } from './feature/root/controllers/feature.controller';
// Microfrontend
import { MicrofrontendController } from './microfrontend/controllers/microfrontend.controller';
// Permission (version-scoped CRUD)
import { PermissionController } from './permission/controllers/permission.controller';
// Version (root)
import { VersionController } from './root/controllers/version.controller';
import { VersionSnapshotService } from './root/services/version-snapshot.service';

@Module({
  imports: [VersionDomainModule, CoreServerModule, PlanDomainModule, PlanPriceDomainModule],
  providers: [VersionSnapshotService],
  controllers: [
    VersionController,
    VersionBusinessController,
    BusinessPermissionController,
    PermissionController,
    MicrofrontendController,
    FeatureController,
    FeatureMicrofrontendController,
    FeaturePermissionController,
    AppController,
    BusinessFeatureController,
    BusinessRoleTemplateController,
    RoleTemplatePermissionController,
    PlanController,
    PlanAppController,
    PlanPriceController,
    PlanFeaturePermissionController,
  ],
  exports: [VersionDomainModule],
})
export class AdminVersionModule {}
