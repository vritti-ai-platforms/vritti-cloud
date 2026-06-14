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
    plan: r.one.plans({
      from: r.organizations.planId,
      to: r.plans.id,
    }),
    business: r.one.businesses({
      from: r.organizations.businessId,
      to: r.businesses.id,
    }),
    country: r.one.countries({
      from: r.organizations.countryId,
      to: r.countries.id,
    }),
    market: r.one.markets({
      from: r.organizations.marketId,
      to: r.markets.id,
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
    featureMicrofrontends: r.many.featureMicrofrontends(),
    apps: r.many.apps(),
    roleTemplates: r.many.roleTemplates(),
    roleTemplateApps: r.many.roleTemplateApps(),
    featurePermissions: r.many.featurePermissions(),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
    appFeatures: r.many.appFeatures(),
    versionBusinesses: r.many.versionBusinesses(),
  },

  // Plan relations
  plans: {
    organizations: r.many.organizations(),
    planPrices: r.many.planPrices(),
    planApps: r.many.planApps(),
    business: r.one.businesses({
      from: r.plans.businessId,
      to: r.businesses.id,
    }),
    markets: r.many.markets({
      from: r.plans.id.through(r.planPrices.planId),
      to: r.markets.id.through(r.planPrices.marketId),
    }),
    deployments: r.many.deployments({
      from: r.plans.id.through(r.deploymentPlans.planId),
      to: r.deployments.id.through(r.deploymentPlans.deploymentId),
    }),
  },

  // Business relations
  businesses: {
    organizations: r.many.organizations(),
    plans: r.many.plans(),
    apps: r.many.apps(),
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
    marketCountry: r.one.marketCountries({
      from: r.countries.id,
      to: r.marketCountries.countryId,
    }),
  },

  // Market relations
  markets: {
    organizations: r.many.organizations(),
    marketCountries: r.many.marketCountries(),
    planPrices: r.many.planPrices(),
    appPrices: r.many.appPrices(),
    plans: r.many.plans({
      from: r.markets.id.through(r.planPrices.marketId),
      to: r.plans.id.through(r.planPrices.planId),
    }),
  },

  // Market-Country join table relations
  marketCountries: {
    market: r.one.markets({
      from: r.marketCountries.marketId,
      to: r.markets.id,
    }),
    country: r.one.countries({
      from: r.marketCountries.countryId,
      to: r.countries.id,
    }),
  },

  // Deployment relations
  deployments: {
    organizations: r.many.organizations(),
    deploymentPlans: r.many.deploymentPlans(),
    plans: r.many.plans({
      from: r.deployments.id.through(r.deploymentPlans.deploymentId),
      to: r.plans.id.through(r.deploymentPlans.planId),
    }),
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
    market: r.one.markets({
      from: r.planPrices.marketId,
      to: r.markets.id,
    }),
  },

  // Deployment-Plan join table relations
  deploymentPlans: {
    deployment: r.one.deployments({
      from: r.deploymentPlans.deploymentId,
      to: r.deployments.id,
    }),
    plan: r.one.plans({
      from: r.deploymentPlans.planId,
      to: r.plans.id,
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
    featureMicrofrontends: r.many.featureMicrofrontends(),
    featurePermissions: r.many.featurePermissions(),
    appFeatures: r.many.appFeatures(),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
  },

  // Microfrontend relations
  microfrontends: {
    appVersion: r.one.versions({
      from: r.microfrontends.versionId,
      to: r.versions.id,
    }),
    featureMicrofrontends: r.many.featureMicrofrontends(),
  },

  // Feature-Microfrontend junction relations
  featureMicrofrontends: {
    appVersion: r.one.versions({
      from: r.featureMicrofrontends.versionId,
      to: r.versions.id,
    }),
    feature: r.one.features({
      from: r.featureMicrofrontends.featureId,
      to: r.features.id,
    }),
    microfrontend: r.one.microfrontends({
      from: r.featureMicrofrontends.microfrontendId,
      to: r.microfrontends.id,
    }),
  },

  // App relations
  apps: {
    appVersion: r.one.versions({
      from: r.apps.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({
      from: r.apps.businessId,
      to: r.businesses.id,
    }),
    appFeatures: r.many.appFeatures(),
    appPrices: r.many.appPrices(),
    roleTemplateApps: r.many.roleTemplateApps(),
  },

  // App-Feature junction relations
  appFeatures: {
    appVersion: r.one.versions({
      from: r.appFeatures.versionId,
      to: r.versions.id,
    }),
    app: r.one.apps({ from: r.appFeatures.appId, to: r.apps.id }),
    feature: r.one.features({ from: r.appFeatures.featureId, to: r.features.id }),
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
  },

  // App-Price relations
  appPrices: {
    app: r.one.apps({ from: r.appPrices.appId, to: r.apps.id }),
    market: r.one.markets({ from: r.appPrices.marketId, to: r.markets.id }),
  },

  // Plan-App junction relations
  planApps: {
    plan: r.one.plans({ from: r.planApps.planId, to: r.plans.id }),
  },

  // Role template relations
  roleTemplates: {
    appVersion: r.one.versions({
      from: r.roleTemplates.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({ from: r.roleTemplates.businessId, to: r.businesses.id }),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
    roleTemplateApps: r.many.roleTemplateApps(),
  },

  // Role-Template-App junction relations
  roleTemplateApps: {
    appVersion: r.one.versions({ from: r.roleTemplateApps.versionId, to: r.versions.id }),
    roleTemplate: r.one.roleTemplates({ from: r.roleTemplateApps.roleTemplateId, to: r.roleTemplates.id }),
    app: r.one.apps({ from: r.roleTemplateApps.appId, to: r.apps.id }),
  },

  // Role-Template-Feature-Permission junction relations
  roleTemplateFeaturePermissions: {
    appVersion: r.one.versions({
      from: r.roleTemplateFeaturePermissions.versionId,
      to: r.versions.id,
    }),
    roleTemplate: r.one.roleTemplates({
      from: r.roleTemplateFeaturePermissions.roleTemplateId,
      to: r.roleTemplates.id,
    }),
    feature: r.one.features({
      from: r.roleTemplateFeaturePermissions.featureId,
      to: r.features.id,
    }),
  },
}));
