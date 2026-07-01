import { defineRelations } from '@vritti/api-sdk/drizzle-orm';
import * as schema from './index';

export const relations = defineRelations(schema, (r) => ({
  // User relations
  users: {
    verifications: r.many.verifications(),
    mfaAuth: r.many.mfaAuth(),
    oauthProviders: r.many.oauthProviders(),
    sessions: r.many.sessions(),
    organizationMembers: r.many.organizationMembers(),
  },

  // Session relations
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },

  // OAuth provider relations
  oauthProviders: {
    user: r.one.users({
      from: r.oauthProviders.userId,
      to: r.users.id,
    }),
  },

  // Verification relations
  verifications: {
    user: r.one.users({
      from: r.verifications.userId,
      to: r.users.id,
    }),
  },

  // MFA auth relations
  mfaAuth: {
    user: r.one.users({
      from: r.mfaAuth.userId,
      to: r.users.id,
    }),
  },

  // Organization relations
  organizations: {
    members: r.many.organizationMembers(),
    business: r.one.businesses({
      from: r.organizations.businessCode,
      to: r.businesses.code,
    }),
    country: r.one.countries({
      from: r.organizations.countryId,
      to: r.countries.id,
    }),
    deployment: r.one.deployments({
      from: r.organizations.deploymentId,
      to: r.deployments.id,
    }),
  },

  // Organization member relations
  organizationMembers: {
    organization: r.one.organizations({
      from: r.organizationMembers.organizationId,
      to: r.organizations.id,
    }),
    user: r.one.users({
      from: r.organizationMembers.userId,
      to: r.users.id,
    }),
  },

  // Version relations
  versions: {
    features: r.many.features(),
    microfrontends: r.many.microfrontends(),
    businessApps: r.many.businessApps(),
    roleTemplates: r.many.roleTemplates(),
    plans: r.many.plans(),
    featurePermissions: r.many.featurePermissions(),
    businessAppFeatures: r.many.businessAppFeatures(),
    versionBusinesses: r.many.versionBusinesses(),
  },

  // Plan relations
  plans: {
    planPrices: r.many.planPrices(),
    planFeatures: r.many.planFeatures(),
    planFeaturePermissions: r.many.planFeaturePermissions(),
    version: r.one.versions({
      from: r.plans.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({
      from: r.plans.businessId,
      to: r.businesses.id,
    }),
    countries: r.many.countries({
      from: r.plans.id.through(r.planPrices.planId),
      to: r.countries.id.through(r.planPrices.countryId),
    }),
  },

  // Business relations
  businesses: {
    organizations: r.many.organizations(),
    plans: r.many.plans(),
    businessApps: r.many.businessApps(),
    businessAppFeatures: r.many.businessAppFeatures(),
    roleTemplates: r.many.roleTemplates(),
    versionBusinesses: r.many.versionBusinesses(),
  },

  // Version-Business junction relations
  versionBusinesses: {
    version: r.one.versions({
      from: r.versionBusinesses.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({
      from: r.versionBusinesses.businessId,
      to: r.businesses.id,
    }),
  },

  // Country relations
  countries: {
    organizations: r.many.organizations(),
    planPrices: r.many.planPrices(),
    plans: r.many.plans({
      from: r.countries.id.through(r.planPrices.countryId),
      to: r.plans.id.through(r.planPrices.planId),
    }),
  },

  // Deployment relations
  deployments: {
    organizations: r.many.organizations(),
    region: r.one.regions({
      from: r.deployments.regionId,
      to: r.regions.id,
    }),
    cloudProvider: r.one.cloudProviders({
      from: r.deployments.cloudProviderId,
      to: r.cloudProviders.id,
    }),
  },

  // Region relations
  regions: {
    cloudProviders: r.many.cloudProviders({
      from: r.regions.id.through(r.regionCloudProviders.regionId),
      to: r.cloudProviders.id.through(r.regionCloudProviders.providerId),
    }),
  },

  // Cloud provider relations
  cloudProviders: {
    regions: r.many.regions({
      from: r.cloudProviders.id.through(r.regionCloudProviders.providerId),
      to: r.regions.id.through(r.regionCloudProviders.regionId),
    }),
  },

  // Plan-Price relations
  planPrices: {
    plan: r.one.plans({
      from: r.planPrices.planId,
      to: r.plans.id,
    }),
    country: r.one.countries({
      from: r.planPrices.countryId,
      to: r.countries.id,
    }),
  },

  // Region-CloudProvider join table relations
  regionCloudProviders: {
    region: r.one.regions({
      from: r.regionCloudProviders.regionId,
      to: r.regions.id,
    }),
    cloudProvider: r.one.cloudProviders({
      from: r.regionCloudProviders.providerId,
      to: r.cloudProviders.id,
    }),
  },

  // Feature relations
  features: {
    appVersion: r.one.versions({
      from: r.features.versionId,
      to: r.versions.id,
    }),
    featurePermissions: r.many.featurePermissions(),
    businessAppFeatures: r.many.businessAppFeatures(),
  },

  // Microfrontend relations
  microfrontends: {
    appVersion: r.one.versions({
      from: r.microfrontends.versionId,
      to: r.versions.id,
    }),
  },

  // App relations
  businessApps: {
    appVersion: r.one.versions({
      from: r.businessApps.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({
      from: r.businessApps.businessId,
      to: r.businesses.id,
    }),
    businessAppFeatures: r.many.businessAppFeatures(),
  },

  // App-Feature junction relations
  businessAppFeatures: {
    appVersion: r.one.versions({
      from: r.businessAppFeatures.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({ from: r.businessAppFeatures.businessId, to: r.businesses.id }),
    app: r.one.businessApps({ from: r.businessAppFeatures.appId, to: r.businessApps.id }),
    feature: r.one.features({ from: r.businessAppFeatures.featureId, to: r.features.id }),
  },

  // Feature permission relations
  featurePermissions: {
    appVersion: r.one.versions({
      from: r.featurePermissions.versionId,
      to: r.versions.id,
    }),
    feature: r.one.features({
      from: r.featurePermissions.featureId,
      to: r.features.id,
    }),
    permissionBusinesses: r.many.permissionBusinesses(),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
  },

  // Permission-business junction relations
  permissionBusinesses: {
    appVersion: r.one.versions({
      from: r.permissionBusinesses.versionId,
      to: r.versions.id,
    }),
    featurePermission: r.one.featurePermissions({
      from: r.permissionBusinesses.featurePermissionId,
      to: r.featurePermissions.id,
    }),
    business: r.one.businesses({
      from: r.permissionBusinesses.businessId,
      to: r.businesses.id,
    }),
  },

  // Plan-Feature membership relations (the plan's included features, per platform)
  planFeatures: {
    appVersion: r.one.versions({ from: r.planFeatures.versionId, to: r.versions.id }),
    plan: r.one.plans({ from: r.planFeatures.planId, to: r.plans.id }),
    feature: r.one.features({ from: r.planFeatures.featureId, to: r.features.id }),
    planFeaturePermissions: r.many.planFeaturePermissions(),
  },

  // Plan-Feature-Permission junction relations (the plan's unlocked action permissions under a membership)
  planFeaturePermissions: {
    plan: r.one.plans({ from: r.planFeaturePermissions.planId, to: r.plans.id }),
    planFeature: r.one.planFeatures({
      from: r.planFeaturePermissions.planFeatureId,
      to: r.planFeatures.id,
    }),
    featurePermission: r.one.featurePermissions({
      from: r.planFeaturePermissions.featurePermissionId,
      to: r.featurePermissions.id,
    }),
  },

  // Role template relations
  roleTemplates: {
    appVersion: r.one.versions({
      from: r.roleTemplates.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({ from: r.roleTemplates.businessId, to: r.businesses.id }),
    roleTemplateFeatures: r.many.roleTemplateFeatures(),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
  },

  // Role-Template-Feature membership relations (the role's included features, per platform)
  roleTemplateFeatures: {
    appVersion: r.one.versions({ from: r.roleTemplateFeatures.versionId, to: r.versions.id }),
    roleTemplate: r.one.roleTemplates({ from: r.roleTemplateFeatures.roleTemplateId, to: r.roleTemplates.id }),
    feature: r.one.features({ from: r.roleTemplateFeatures.featureId, to: r.features.id }),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
  },

  // Role-Template-Feature-Permission junction relations (action grants under a membership)
  roleTemplateFeaturePermissions: {
    appVersion: r.one.versions({
      from: r.roleTemplateFeaturePermissions.versionId,
      to: r.versions.id,
    }),
    roleTemplate: r.one.roleTemplates({
      from: r.roleTemplateFeaturePermissions.roleTemplateId,
      to: r.roleTemplates.id,
    }),
    roleTemplateFeature: r.one.roleTemplateFeatures({
      from: r.roleTemplateFeaturePermissions.roleTemplateFeatureId,
      to: r.roleTemplateFeatures.id,
    }),
    featurePermission: r.one.featurePermissions({
      from: r.roleTemplateFeaturePermissions.featurePermissionId,
      to: r.featurePermissions.id,
    }),
  },
}));
