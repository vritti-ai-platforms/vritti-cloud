# Authentication Flow Diagram

## Session Management Architecture

### Cookie-Based Session System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SESSION COOKIE & DATABASE                             │
└─────────────────────────────────────────────────────────────────────────┘

Cookie Name: 'session'
  • httpOnly: true (not accessible via JavaScript)
  • secure: true (production only, HTTPS)
  • sameSite: 'lax' (CSRF protection)
  • signed: true (tamper-proof with secret)
  • maxAge: 604800000 (7 days)
  • Value: session.id (UUID from database)

Database: Session Table
  ┌──────────────┬─────────────────────────────────────────────────┐
  │ Field        │ Description                                      │
  ├──────────────┼─────────────────────────────────────────────────┤
  │ id           │ UUID (stored in cookie)                          │
  │ userId       │ User reference                                   │
  │ type         │ ONBOARDING | CLOUD                               │
  │ accessToken  │ JWT token (onboarding or access token)           │
  │ refreshToken │ JWT refresh token (null for onboarding)          │
  │ isActive     │ Boolean (for invalidation)                       │
  │ ipAddress    │ Client IP (security tracking)                    │
  │ userAgent    │ Client browser (security tracking)               │
  │ accessTokenExpiresAt  │ Expiry timestamp                        │
  │ refreshTokenExpiresAt │ Expiry timestamp (null for onboarding)  │
  └──────────────┴─────────────────────────────────────────────────┘

Session Types:
  ONBOARDING:
    • accessToken: onboardingToken (7 days)
    • refreshToken: null
    • Used during signup → email verification → password setup

  CLOUD:
    • accessToken: JWT access token (15 minutes)
    • refreshToken: JWT refresh token (7 days)
    • Used after successful login (onboarding complete)
```

### Unified Token Recovery

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED TOKEN RECOVERY FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

  Browser              Frontend App           API (GET /auth/token)
    │                      │                           │
    │  Page Reload         │                           │
    │  (Lost tokens)       │                           │
    │                      │                           │
    │                      │  GET /auth/token          │
    │                      │  (session cookie sent)    │
    │                      │────────────────────────>  │
    │                      │                           │
    │                      │                           │  Read cookie
    │                      │                           │  session.id
    │                      │                           │
    │                      │                           │  Fetch from DB
    │                      │                           │  Check session.type
    │                      │                           │
    │                      │                           ▼
    │                      │                   ┌──────────────┐
    │                      │                   │ ONBOARDING?  │
    │                      │                   └──────┬───────┘
    │                      │                          │
    │                      │         ┌────────────────┴────────────────┐
    │                      │         │                                  │
    │                      │         ▼                                  ▼
    │                      │   IF type=ONBOARDING              IF type=CLOUD
    │                      │         │                                  │
    │                      │  Return {                         Return {
    │                      │    sessionType: 'onboarding'        sessionType: 'cloud'
    │                      │    onboardingToken: string          accessToken: string
    │                      │  }                                  refreshToken: string
    │                      │         │                           expiresIn: number
    │                      │         │                         }
    │                      │         └────────────┬──────────────┘
    │                      │                      │
    │                      │  ✓ Response          │
    │                      │ <─────────────────────┘
    │                      │  SessionTokenResponseDto
    │                      │
    │                      ▼
    │            Check sessionType
    │                      │
    │         ┌────────────┴────────────┐
    │         │                         │
    │         ▼                         ▼
    │  IF onboarding             IF cloud
    │         │                         │
    │  setToken('onboarding',    setToken('access', ...)
    │    onboardingToken)        setToken('refresh', ...)
    │         │                         │
    │  Navigate to onboarding    Navigate to dashboard
    │  step (verify-email, etc)
    │

Key Benefits:
  • Single endpoint for all token recovery
  • Frontend doesn't need to know session type
  • Automatic routing to correct flow
  • Secure: tokens stored server-side, only session ID in cookie
```

## New Signup Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SIGNUP FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

  User                SignupPage              API                   Pages
    │                     │                    │                      │
    │  Fills form         │                    │                      │
    │──────────────────>  │                    │                      │
    │                     │                    │                      │
    │                     │  POST /auth/signup │                      │
    │                     │─────────────────>  │                      │
    │                     │                    │                      │
    │                     │                    │  Create User         │
    │                     │                    │  Create Session      │
    │                     │                    │  (type=ONBOARDING)   │
    │                     │                    │                      │
    │                     │  ✓ Success         │  Set Cookie          │
    │                     │ <─────────────────-│  'session'=sessionId │
    │                     │  onboardingToken   │                      │
    │                     │                    │                      │
    │                     │  setToken('onboarding', token)            │
    │                     │─────────────────────────────────────────> │
    │                     │                    │                      │
    │                     │  navigate('/signup-success', {state})    │
    │                     │─────────────────────────────────────────> │
    │                     │                    │                      │
    │                  SignupSuccessPage       │                      │
    │ <─────────────────────────────────────────────────────────────  │
    │  • Shows email                           │                      │
    │  • 5s countdown                          │                      │
    │  • "Begin Onboarding" button             │                      │
    │                     │                    │                      │
    │  After 5s or click  │                    │                      │
    │──────────────────>  │                    │                      │
    │                     │                    │                      │
    │                     │  navigate('/onboarding/verify-email')    │
    │                     │─────────────────────────────────────────> │
    │                     │                    │                      │
    │                  VerifyEmailPage         │                      │
    │ <─────────────────────────────────────────────────────────────  │
    │                     │                    │                      │
```

## Account Already Exists Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ACCOUNT EXISTS ERROR FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

  User                SignupPage              API                LoginPage
    │                     │                    │                      │
    │  Fills form         │                    │                      │
    │──────────────────>  │                    │                      │
    │                     │                    │                      │
    │                     │  POST /auth/signup │                      │
    │                     │─────────────────> │                      │
    │                     │                    │                      │
    │                     │  ✗ Error           │                      │
    │                     │ <─────────────────│                      │
    │                     │  "User Exists"     │                      │
    │                     │                    │                      │
    │  See error message  │                    │                      │
    │ <──────────────────│                    │                      │
    │  + "Login Instead" button appears        │                      │
    │                     │                    │                      │
    │  Click "Login       │                    │                      │
    │  Instead" button    │                    │                      │
    │──────────────────>  │                    │                      │
    │                     │                    │                      │
    │                     │  navigate('/login', {state: {email}})    │
    │                     │─────────────────────────────────────────> │
    │                     │                    │                      │
    │                  LoginPage (email pre-filled)                   │
    │ <─────────────────────────────────────────────────────────────  │
    │                     │                    │                      │
```

## New Login Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LOGIN FLOW                                      │
└─────────────────────────────────────────────────────────────────────────┘

  User                LoginPage               API                  Result
    │                     │                    │                      │
    │  Fills form         │                    │                      │
    │──────────────────>  │                    │                      │
    │                     │                    │                      │
    │                     │  POST /auth/login  │                      │
    │                     │─────────────────> │                      │
    │                     │                    │                      │
    │                     │                    │  IF onboarding       │
    │                     │                    │  incomplete:          │
    │                     │                    │    Create Session     │
    │                     │                    │    (type=ONBOARDING)  │
    │                     │                    │                      │
    │                     │                    │  IF complete:         │
    │                     │                    │    Create Session     │
    │                     │                    │    (type=CLOUD)       │
    │                     │                    │    Delete onboarding │
    │                     │                    │    sessions           │
    │                     │                    │                      │
    │                     │  ✓ Response        │  Set Cookie          │
    │                     │ <─────────────────│  'session'=sessionId │
    │                     │                    │                      │
    │                     │                    │                      │
    │                     ▼                    │                      │
    │           Check requiresOnboarding       │                      │
    │                     │                    │                      │
    │                     │                    │                      │
    ├─────────────────────┴────────────────────┴──────────────────────┤
    │                                                                  │
    │  IF requiresOnboarding = TRUE                                   │
    │  ────────────────────────────────────                           │
    │    setToken('onboarding', onboardingToken)                      │
    │                                                                  │
    │    Navigate based on onboardingStep:                            │
    │    • EMAIL_VERIFICATION → /onboarding/verify-email              │
    │    • PHONE_VERIFICATION → /onboarding/verify-mobile             │
    │    • SET_PASSWORD → /onboarding/set-password                    │
    │    • MFA_SETUP → /onboarding/mfa-setup                          │
    │                                                                  │
    └──────────────────────────────────────────────────────────────────┤
                                                                       │
    ┌──────────────────────────────────────────────────────────────────┤
    │                                                                  │
    │  IF requiresOnboarding = FALSE                                  │
    │  ─────────────────────────────────────                          │
    │    setToken('access', accessToken)                              │
    │    setToken('refresh', refreshToken)                            │
    │                                                                  │
    │    Navigate to dashboard:                                       │
    │    • /dashboard (or main app entry point)                       │
    │                                                                  │
    └──────────────────────────────────────────────────────────────────┘
```

## OAuth Flow (Updated)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          OAUTH FLOW                                      │
└─────────────────────────────────────────────────────────────────────────┘

  User            SocialAuthButtons         Backend                Provider
    │                     │                    │                      │
    │  Click Google       │                    │                      │
    │──────────────────>  │                    │                      │
    │                     │                    │                      │
    │                     │  Redirect to       │                      │
    │                     │  /auth/oauth/google                       │
    │                     │─────────────────> │                      │
    │                     │                    │                      │
    │                     │                    │  Redirect to Google  │
    │                     │                    │───────────────────> │
    │                     │                    │                      │
    │  Google Auth Screen │                    │                      │
    │ <──────────────────────────────────────────────────────────────│
    │                     │                    │                      │
    │  Authorize          │                    │                      │
    │──────────────────────────────────────────────────────────────> │
    │                     │                    │                      │
    │                     │                    │  Callback with code  │
    │                     │                    │ <────────────────────│
    │                     │                    │                      │
    │                     │  Backend processes │                      │
    │                     │  OAuth callback    │                      │
    │                     │ <─────────────────│                      │
    │                     │                    │                      │
    │                     │  Redirect to:      │                      │
    │                     │  /oauth-success or                       │
    │                     │  /oauth-error                            │
    │                     │ <─────────────────│                      │
    │                     │                    │                      │

Note: OAuth endpoints have been updated:
  • Backend: /auth/oauth/{provider}
  • Callback redirects: /oauth-success or /oauth-error
```

## Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SESSION LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────────┘

 SIGNUP                   ONBOARDING                  LOGIN
    │                         │                         │
    ▼                         │                         ▼
┌─────────┐                   │                   ┌─────────┐
│Session  │ ─────────────────▶│◄──────────────────│Session  │
│Type:    │     Continue       │                   │Type:    │
│ONBOARD  │     onboarding     │                   │CLOUD    │
│         │                    │                   │         │
│Token:   │                    │                   │Token:   │
│onboard  │                    │                   │access + │
│         │                    │                   │refresh  │
└─────────┘                    │                   └─────────┘
    │                          │                         │
    │                          │                         │
    ▼                          │                         ▼
 7 days                        │                    7 days
 expires                       │                    refresh
    │                          │                         │
    ▼                          │                         ▼
  Cleanup ◄────────────────────┘                   Cleanup
                         Delete onboarding
                         when login complete

Token Recovery on Page Reload:
  1. Read 'session' cookie (contains session.id)
  2. GET /auth/token (unified endpoint)
  3. Database lookup by session.id
  4. Return tokens based on session.type:
     • ONBOARDING → { sessionType: 'onboarding', onboardingToken }
     • CLOUD → { sessionType: 'cloud', accessToken, refreshToken }
  5. Frontend routes based on sessionType
```

## Key Changes Summary

### Endpoints Changed:
1. **Signup**: `/onboarding/register` → `/auth/signup`
2. **Login**: New endpoint → `/auth/login`
3. **OAuth**: `/onboarding/oauth/{provider}` → `/auth/oauth/{provider}`
4. **Token Recovery**: NEW → `GET /auth/token` (replaces `/auth/onboarding-token`)

### New Pages:
1. **SignupSuccessPage**: Intermediate step between signup and email verification
   - Shows success message
   - 5-second countdown
   - Manual "Begin Onboarding" button

### Enhanced Features:
1. **Login with Onboarding**: Smart redirect based on completion status
2. **Account Exists Error**: "Login Instead" button for better UX
3. **Email Pre-fill**: Seamless transition from signup error to login
4. **Unified Token Recovery**: Single endpoint for both onboarding and cloud token recovery

### Session Management:
- **Cookie-based**: 'session' cookie with httpOnly, signed, 7-day expiry
- **Database-backed**: Session table tracks both onboarding and cloud sessions
- **Secure**: Only session.id in cookie, tokens stored server-side
- **Type-aware**: Session type determines token structure returned

### Token Management:
- **Onboarding Token**: Used during signup/onboarding flow (7 days, no refresh)
- **Access Token**: Used after complete authentication (15 minutes)
- **Refresh Token**: Used to refresh access token (7 days)

All tokens stored using `setToken()` from `@vritti/quantum-ui/axios`

### API Response Formats:

**GET /auth/token Response (Onboarding):**
```json
{
  "sessionType": "onboarding",
  "onboardingToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**GET /auth/token Response (Cloud):**
```json
{
  "sessionType": "cloud",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```
