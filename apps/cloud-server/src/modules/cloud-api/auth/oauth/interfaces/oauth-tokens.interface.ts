export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  idToken?: string;
}

export interface OAuthTokenRequest {
  code: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  grantType: 'authorization_code';
  codeVerifier?: string;
}

export interface OAuthTokenExchangePayload {
  code: string;
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
  grant_type: 'authorization_code';
  code_verifier?: string;
}

export interface FacebookTokenParams {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  code_verifier?: string;
}

export interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email: string;
  email_verified?: boolean | string;
  is_private_email?: boolean | string;
  auth_time?: number;
  nonce_supported?: boolean;
}
