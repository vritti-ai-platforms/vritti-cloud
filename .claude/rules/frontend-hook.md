---
description: Frontend hook file conventions
paths:
  - "src/hooks/**/*.ts"
  - "src/features/**/hooks/**/*.ts"
---

# Frontend Hook Files

Hooks are thin wrappers around services using TanStack Query.

## Use `AxiosError` for error type — not `Error`

All mutations and queries use axios under the hood. Use `AxiosError` so `error.response?.status` and `error.response?.data` are properly typed.

```typescript
// WRONG — error.response is untyped
useMutation<LoginResponse, Error, LoginDto>({ ... });

// CORRECT — error.response?.status works without casting
import type { AxiosError } from 'axios';
useMutation<LoginResponse, AxiosError, LoginDto>({ ... });
```

## Use `export function`, not `export const`

```typescript
// WRONG
export const useLogin = (options?: UseLoginOptions) => {
  return useMutation<LoginResponse, AxiosError, LoginDto>({ ... });
};

// CORRECT
export function useLogin(options?: UseLoginOptions) {
  return useMutation<LoginResponse, AxiosError, LoginDto>({ ... });
}
```

## Use direct function references for mutationFn/queryFn

When the service function signature matches what TanStack Query expects, pass it directly.

```typescript
// WRONG — redundant wrapper
mutationFn: (data: LoginDto) => login(data),
queryFn: () => getProfile(),

// CORRECT — direct reference
mutationFn: login,
queryFn: getProfile,
```

Exception: destructuring params or multi-step async logic:
```typescript
mutationFn: ({ email, otp }) => verifyResetOtp(email, otp),

mutationFn: async (sessionId) => {
  const { options } = await startPasskeyVerification(sessionId);
  const credential = await startAuthentication({ optionsJSON: options });
  return await verifyPasskeyMfa(sessionId, credential);
},
```

## Options type pattern

```typescript
type UseLoginOptions = Omit<UseMutationOptions<LoginResponse, AxiosError, LoginDto>, 'mutationFn'>;
```

## Create hooks use CreateResponse\<Entity\>

Create mutations return `{ success, message, data }` from the backend. Use `CreateResponse<T>` from quantum-ui.

```typescript
import type { CreateResponse } from '@vritti/quantum-ui/api-response';

type UseCreateFeatureOptions = Omit<UseMutationOptions<CreateResponse<Feature>, AxiosError, CreateFeatureData>, 'mutationFn'>;

export function useCreateFeature(options?: UseCreateFeatureOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Feature>, AxiosError, CreateFeatureData>({
    ...options,
    mutationFn: createFeature,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
```

## One hook per file

Each hook lives in its own file. The filename matches the function name.

```
hooks/account/useRequestEmailChange.ts → exports useRequestEmailChange()
hooks/account/useVerifyEmailIdentity.ts → exports useVerifyEmailIdentity()
hooks/account/useProfile.ts → exports useProfile() + PROFILE_QUERY_KEY
```

Never bundle multiple hooks in one file.

## Options spread order — `...options` BEFORE `onSuccess`

When a hook has internal `onSuccess` logic (cache invalidation), spread `...options` BEFORE `onSuccess` so the internal handler always runs:

```typescript
// CORRECT — internal onSuccess always fires
return useMutation({
  ...options,
  mutationFn: updateProfile,
  onSuccess: (data, ...args) => {
    queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    options?.onSuccess?.(data, ...args);
  },
});

// WRONG — caller's onSuccess overwrites internal cache update
return useMutation({
  mutationFn: updateProfile,
  onSuccess: (data, ...args) => {
    queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    options?.onSuccess?.(data, ...args);
  },
  ...options,  // ← overwrites onSuccess above!
});
```

## useTimer — countdown timer from quantum-ui

For OTP resend cooldowns or any countdown, use `useTimer` from quantum-ui (not a local hook):

```typescript
import { useTimer } from '@vritti/quantum-ui/hooks';

const { timer, startTimer } = useTimer();
// timer: current countdown value (0 = done)
// startTimer(45): start 45-second countdown
```

## Query keys — hierarchical arrays

```typescript
['auth', 'user']
['profile']
['sessions']
['mobile-verification', 'status']
['conversations']
```

## Constants as `export const`

```typescript
export const PROFILE_QUERY_KEY = ['profile'] as const;
export const SESSIONS_QUERY_KEY = ['sessions'] as const;
```
