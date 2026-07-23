import type { OAuthTokens } from './oauth-tokens.interface';
import type { OAuthUserProfile } from './oauth-user-profile.interface';

export interface IOAuthProvider {
  getAuthorizationUrl(state: string, redirectUri: string, codeChallenge?: string): string;

  exchangeCodeForToken(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokens>;

  getUserProfile(accessToken: string): Promise<OAuthUserProfile>;
}
