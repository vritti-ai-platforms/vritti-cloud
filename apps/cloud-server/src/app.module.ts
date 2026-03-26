import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as schema from '@/db/schema';
import { relations } from '@/db/schema';

import './db/schema.registry';

import { RouterModule } from '@nestjs/core';
import {
  AuthConfigModule,
  DatabaseModule,
  type DatabaseModuleOptions,
  DataTableModule,
  EmailModule,
  LoggerModule,
  RootModule,
} from '@vritti/api-sdk';
import { validate } from './config/env.validation';
import { AdminAppVersionModule } from './modules/admin-api/app-version/app-version.module';
import { AdminCloudProviderModule } from './modules/admin-api/cloud-provider/cloud-provider.module';
import { AdminDeploymentModule } from './modules/admin-api/deployment/deployment.module';
import { AdminEnumModule } from './modules/admin-api/enum/enum.module';
import { AdminIndustryModule } from './modules/admin-api/industry/industry.module';
import { AdminOrganizationModule } from './modules/admin-api/organization/organization.module';
import { AdminPlanModule } from './modules/admin-api/plan/plan.module';
import { AdminPriceModule } from './modules/admin-api/price/price.module';
import { AdminRegionModule } from './modules/admin-api/region/region.module';
import { AuthModule } from './modules/cloud-api/auth/auth.module';
import { CloudDeploymentModule } from './modules/cloud-api/deployment/deployment.module';
import { IndustryModule } from './modules/cloud-api/industry/industry.module';
import { MediaModule } from './modules/cloud-api/media/media.module';
import { OnboardingModule } from './modules/cloud-api/onboarding/onboarding.module';
import { OrganizationModule } from './modules/cloud-api/organization/organization.module';
import { RegionModule } from './modules/cloud-api/region/region.module';

import { UserModule } from './modules/cloud-api/user/user.module';
import { SelectModule } from './modules/select-api/select.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    // Global services (encryption, SMS, WhatsApp)
    ServicesModule,
    // Event emitter for SSE real-time updates
    EventEmitterModule.forRoot(),
    // Logger module
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          environment: configService.getOrThrow('NODE_ENV'),
          appName: configService.getOrThrow('APP_NAME'),
          provider: configService.getOrThrow('LOG_PROVIDER'),
          level: configService.getOrThrow('LOG_LEVEL'),
          format: configService.getOrThrow('LOG_FORMAT'),
          enableFileLogger: configService.getOrThrow('LOG_TO_FILE'),
          filePath: configService.getOrThrow('LOG_FILE_PATH'),
          maxFiles: configService.getOrThrow('LOG_MAX_FILES'),

          enableHttpLogger: true,
          httpLogger: {
            enableRequestLog: true,
            enableResponseLog: true,
            slowRequestThreshold: 3000, // milliseconds
          },
        };
      },
      inject: [ConfigService],
    }),
    // Multi-tenant database module (Gateway Mode)
    // forServer() automatically registers TenantContextInterceptor and imports RequestModule
    DatabaseModule.forServer({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const options: DatabaseModuleOptions = {
          // Primary database configuration for tenant registry
          primaryDb: {
            host: config.getOrThrow<string>('PRIMARY_DB_HOST'),
            port: config.get<number>('PRIMARY_DB_PORT'),
            username: config.getOrThrow<string>('PRIMARY_DB_USERNAME'),
            password: config.getOrThrow<string>('PRIMARY_DB_PASSWORD'),
            database: config.getOrThrow<string>('PRIMARY_DB_DATABASE'),
            schema: config.get<string>('PRIMARY_DB_SCHEMA'),
            sslMode: config.get<'require' | 'prefer' | 'disable' | 'no-verify'>('PRIMARY_DB_SSL_MODE'),
          },

          drizzleSchema: schema,
          // Relations must be passed separately for db.query to work (drizzle-orm v2)
          drizzleRelations: relations,

          // Connection pool configuration
          connectionCacheTTL: 300000, // 5 minutes
          maxConnections: 10,
        };
        return options;
      },
    }),
    // Authentication module (Global guard + JWT)
    // Must be imported after DatabaseModule since VrittiAuthGuard depends on its services
    AuthConfigModule.forRootAsync(),
    // Email module (global, provides EmailService)
    EmailModule,
    // Root module (health + CSRF controllers)
    RootModule,
    // Cloud API modules

    UserModule,
    OnboardingModule,
    AuthModule,
    SettingsModule,
    MediaModule,
    OrganizationModule,
    IndustryModule,
    DataTableModule.forRoot({ tableViews: schema.tableViews }),
    RegionModule,
    CloudDeploymentModule,
    // Admin API modules
    AdminAppVersionModule,
    AdminPlanModule,
    AdminDeploymentModule,
    AdminRegionModule,
    AdminCloudProviderModule,
    AdminIndustryModule,
    AdminOrganizationModule,
    AdminPriceModule,
    AdminEnumModule,
    // Select API module
    SelectModule,
    // Route prefixes
    RouterModule.register([
      {
        path: 'cloud-api',
        children: [
          UserModule,
          MediaModule,
          OrganizationModule,
          IndustryModule,
          RegionModule,
          CloudDeploymentModule,
        ],
      },
      {
        path: '',
        children: [AuthModule, OnboardingModule, SettingsModule],
      },
      {
        path: 'admin-api',
        children: [
          AdminAppVersionModule,
          AdminPlanModule,
          AdminDeploymentModule,
          AdminRegionModule,
          AdminCloudProviderModule,
          AdminIndustryModule,
          AdminOrganizationModule,
          AdminPriceModule,
          AdminEnumModule,
        ],
      },
      {
        path: 'select-api',
        children: [SelectModule],
      },
      // Top-level: /table-states and /table-views (no prefix)
      {
        path: '',
        module: DataTableModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
