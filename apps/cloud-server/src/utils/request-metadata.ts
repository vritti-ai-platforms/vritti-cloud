import type { FastifyRequest } from 'fastify';
import UAParser from 'ua-parser-js';

export interface DeviceInfo {
  device: string;
  userAgent: string;
}

// Extracts device name and user agent from the request
export function extractDeviceInfo(request: FastifyRequest): DeviceInfo {
  const parser = new UAParser.UAParser(request.headers['user-agent'] || '');
  const browser = parser.getBrowser();
  const os = parser.getOS();

  const device =
    browser.name && os.name
      ? `${browser.name}${browser.major ? ` ${browser.major}` : ''} on ${os.name}`
      : request.headers['user-agent']?.substring(0, 100) || 'Unknown';

  return {
    device,
    userAgent: request.headers['user-agent'] || '',
  };
}

// Extracts client IP from request headers
export function extractIpAddress(request: FastifyRequest): string {
  return (
    (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    request.ip
  );
}
