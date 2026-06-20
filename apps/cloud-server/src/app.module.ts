import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  AuthConfigModule,
  DatabaseModule,
  type DatabaseModuleOptions,
  DataTableModule,
  EmailModule,
  LoggerModule,
  RootModule,
  type TokenExpiryString,
} from '@vritti/api-sdk';
import * as schema from '@/db/schema';
import { relations } from '@/db/schema';
import { validate } from './config/env.validation';
import { AccountModule } from './modules/account/account.module';
import { AdminBusinessModule } from './modules/admin-api/business/business.module';
import { AdminCloudProviderModule } from './modules/admin-api/cloud-provider/cloud-provider.module';
import { AdminCountryModule } from './modules/admin-api/country/country.module';
import { AdminDeploymentModule } from './modules/admin-api/deployment/deployment.module';
import { AdminPlanModule } from './modules/admin-api/plan/plan.module';
import { AdminRegionModule } from './modules/admin-api/region/region.module';
import { AdminVersionModule } from './modules/admin-api/version/version.module';
import { AuthModule } from './modules/cloud-api/auth/auth.module';
import { BusinessModule } from './modules/cloud-api/business/business.module';
import { CloudDeploymentModule } from './modules/cloud-api/deployment/deployment.module';
import { MediaModule } from './modules/cloud-api/media/media.module';
import { OnboardingModule } from './modules/cloud-api/onboarding/onboarding.module';
import { OrganizationModule } from './modules/cloud-api/organization/organization.module';
import { UserModule } from './modules/cloud-api/user/user.module';
import { SelectModule } from './modules/select-api/select.module';
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

          // Relations drive db.query.X in Drizzle 1.0; schema generic was removed.
          drizzleRelations: relations,

          maxConnections: 10,
        };
        return options;
      },
    }),
    // Authentication module (Global guard + JWT)
    // Must be imported after DatabaseModule since VrittiAuthGuard depends on its services
    AuthConfigModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        tokenExpiry: {
          access: config.getOrThrow('ACCESS_TOKEN_EXPIRY') as TokenExpiryString,
          refresh: config.getOrThrow('REFRESH_TOKEN_EXPIRY') as TokenExpiryString,
        },
        cookie: {
          refreshCookieName: config.get('REFRESH_COOKIE_NAME', 'vritti_refresh'),
          refreshCookieSecure: config.get('NODE_ENV') === 'production',
          refreshCookieSameSite: 'strict' as const,
          refreshCookieDomain: config.get('REFRESH_COOKIE_DOMAIN'),
        },
      }),
    }),
    // Email module (global, provides EmailService)
    EmailModule,
    // Root module (health + CSRF controllers)
    RootModule,
    // Cloud API modules

    UserModule,
    OnboardingModule,
    AuthModule,
    AccountModule,
    MediaModule,
    OrganizationModule,
    BusinessModule,
    DataTableModule.forRoot({ tableViews: schema.tableViews }),
    CloudDeploymentModule,
    // Admin API modules
    AdminVersionModule,
    AdminPlanModule,
    AdminDeploymentModule,
    AdminRegionModule,
    AdminCloudProviderModule,
    AdminBusinessModule,
    AdminCountryModule,
    // Select API module
    SelectModule,
    // Route prefixes
    RouterModule.register([
      {
        path: 'cloud-api',
        children: [UserModule, MediaModule, OrganizationModule, BusinessModule, CloudDeploymentModule],
      },
      {
        path: '',
        children: [AuthModule, OnboardingModule, AccountModule],
      },
      {
        path: 'admin-api',
        children: [
          AdminVersionModule,
          AdminPlanModule,
          AdminDeploymentModule,
          AdminRegionModule,
          AdminCloudProviderModule,
          AdminBusinessModule,
          AdminCountryModule,
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
