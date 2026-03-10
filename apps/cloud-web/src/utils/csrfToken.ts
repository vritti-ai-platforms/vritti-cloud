import { axios } from '@vritti/quantum-ui/axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * In-memory CSRF token storage
 * Token is cached to avoid unnecessary API calls
 */
let csrfToken: string | null = null;

/**
 * Flag to prevent multiple simultaneous token fetch requests
 */
let tokenFetchInProgress = false;

/**
 * Queue for requests waiting for CSRF token
 */
let tokenFetchQueue: Array<(token: string) => void> = [];

/**
 * HTTP methods that require CSRF protection
 */
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Fetches a new CSRF token from the server
 *
 * @returns Promise resolving to the CSRF token string
 * @throws Error if token fetch fails
 *
 * @example
 * ```typescript
 * const token = await refreshCsrfToken();
 * console.log('New CSRF token:', token);
 * ```
 */
export async function refreshCsrfToken(): Promise<string> {
  try {
    // Prevent multiple simultaneous requests
    if (tokenFetchInProgress) {
      return new Promise((resolve) => {
        tokenFetchQueue.push(resolve);
      });
    }

    tokenFetchInProgress = true;

    const response = await axios.get<{ token: string }>('/csrf/token', {
      withCredentials: true,
    });

    const newToken = response.data.token;

    if (!newToken || typeof newToken !== 'string') {
      throw new Error('Invalid CSRF token received from server');
    }

    // Cache the token
    csrfToken = newToken;

    // Resolve all queued requests
    tokenFetchQueue.forEach((resolve) => {
      resolve(newToken);
    });
    tokenFetchQueue = [];

    return newToken;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('[CSRF] Failed to fetch CSRF token:', axiosError.message);
    throw new Error('Failed to obtain CSRF token. Please try again.');
  } finally {
    tokenFetchInProgress = false;
  }
}

/**
 * Gets the current CSRF token from cache or fetches a new one
 *
 * @returns Promise resolving to the CSRF token string
 *
 * @example
 * ```typescript
 * const token = await getCsrfToken();
 * // Use token in custom API call
 * ```
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }
  return refreshCsrfToken();
}

/**
 * Clears the cached CSRF token
 * Useful for testing or when token is known to be invalid
 *
 * @example
 * ```typescript
 * clearCsrfToken();
 * // Next request will fetch a new token
 * ```
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

/**
 * Checks if an error is a CSRF validation error
 *
 * @param error - The error to check
 * @returns True if error is CSRF-related, false otherwise
 */
function isCsrfError(error: unknown): boolean {
  const axiosError = error as AxiosError<{ message?: string }>;

  // Check for 403 status with CSRF in error message
  if (axiosError.response?.status === 403) {
    const errorMessage = axiosError.response.data?.message || '';
    return errorMessage.toLowerCase().includes('csrf');
  }

  return false;
}

/**
 * Initializes CSRF token management by:
 * 1. Fetching initial CSRF token
 * 2. Setting up axios request interceptor to add X-CSRF-Token header
 * 3. Setting up axios response interceptor to handle CSRF errors
 *
 * This should be called once during application initialization,
 * before any API requests are made.
 *
 * @returns Promise that resolves when initialization is complete
 *
 * @example
 * ```typescript
 * // In App.tsx or main entry file
 * import { initializeCsrf } from './utils/csrfToken';
 *
 * async function bootstrap() {
 *   await initializeCsrf();
 *   // Now safe to make API calls
 * }
 *
 * bootstrap();
 * ```
 */
export async function initializeCsrf(): Promise<void> {
  try {
    // Fetch initial CSRF token
    await refreshCsrfToken();

    // Request interceptor: Add CSRF token to protected requests
    axios.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const method = config.method?.toUpperCase();

        // Only add CSRF token to protected methods
        if (method && CSRF_PROTECTED_METHODS.includes(method)) {
          const token = await getCsrfToken();
          config.headers['X-CSRF-Token'] = token;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor: Handle CSRF errors
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _csrfRetry?: boolean;
        };

        // If CSRF error and haven't retried yet
        if (isCsrfError(error) && !originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true;

          try {
            // Refresh CSRF token
            const newToken = await refreshCsrfToken();

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers['X-CSRF-Token'] = newToken;
            }

            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // If token refresh fails, reject the original error
            console.error('[CSRF] Failed to refresh token on retry:', refreshError);
            return Promise.reject(error);
          }
        }

        // For all other errors, reject as-is
        return Promise.reject(error);
      },
    );

    console.log('[CSRF] Token management initialized successfully');
  } catch (error) {
    console.error('[CSRF] Initialization failed:', error);
    throw error;
  }
}
