import { MfaModule } from '@domain/mfa/mfa.module';
import { OAuthDomainModule } from '@domain/oauth/oauth.module';
import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { VerificationModule } from '@domain/verification/verification.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigFactory } from '@vritti/api-sdk';
import { MediaDomainModule } from '@domain/media/media.module';
// MFA verification submodule
import { MfaVerificationController } from './mfa-verification/controllers/mfa-verification.controller';
import { MfaChallengeStore } from './mfa-verification/services/mfa-challenge.store';
import { MfaVerificationService } from './mfa-verification/services/mfa-verification.service';
// OAuth submodule
import { OAuthController } from './oauth/controllers/oauth.controller';
import { AppleOAuthProvider } from './oauth/providers/apple-oauth.provider';
import { FacebookOAuthProvider } from './oauth/providers/facebook-oauth.provider';
import { GoogleOAuthProvider } from './oauth/providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from './oauth/providers/microsoft-oauth.provider';
import { TwitterOAuthProvider } from './oauth/providers/twitter-oauth.provider';
import { OAuthService } from './oauth/services/oauth.service';
import { OAuthCryptoService } from './oauth/services/oauth-crypto.service';
import { OAuthStateService } from './oauth/services/oauth-state.service';
// Passkey submodule
import { PasskeyAuthController } from './passkey/controllers/passkey-auth.controller';
import { PasskeyAuthService } from './passkey/services/passkey-auth.service';
// Root submodule
import { AuthController } from './root/controllers/auth.controller';
import { AuthStatusEventListener } from './root/listeners/auth-status-event.listener';
import { AuthService } from './root/services/auth.service';
import { AuthStatusSseService } from './root/services/auth-status-sse.service';
import { PasswordResetService } from './root/services/password-reset.service';

@Module({
  imports: [
    JwtModule.registerAsync({ inject: [ConfigService], useFactory: jwtConfigFactory }),
    SessionModule,
    UserDomainModule,
    VerificationModule,
    MfaModule,
    MediaDomainModule,
    OAuthDomainModule,
  ],
  controllers: [AuthController, OAuthController, PasskeyAuthController, MfaVerificationController],
  providers: [
    // Root
    AuthService,
    AuthStatusSseService,
    AuthStatusEventListener,
    PasswordResetService,
    // Passkey
    PasskeyAuthService,
    // OAuth
    OAuthCryptoService,
    OAuthService,
    OAuthStateService,
    GoogleOAuthProvider,
    MicrosoftOAuthProvider,
    AppleOAuthProvider,
    FacebookOAuthProvider,
    TwitterOAuthProvider,
    // MFA verification
    MfaVerificationService,
    MfaChallengeStore,
  ],
  exports: [AuthService, SessionModule, MfaVerificationService, MfaChallengeStore],
})
export class AuthModule {}
