import { HttpException } from '@nestjs/common';
import { ServiceUnavailableException } from '@vritti/api-sdk';
import { isAxiosError } from 'axios';

// Rethrows a failed core-server webhook call: when core responded with an HTTP error, its RFC 9457 problem
// body passes through verbatim (original status + detail); only transport failures become a 503.
export function rethrowCoreError(error: unknown, detail: string): never {
  if (isAxiosError(error) && error.response) {
    throw new HttpException(error.response.data as Record<string, unknown>, error.response.status);
  }
  throw new ServiceUnavailableException({ label: 'Deployment Unreachable', detail });
}
