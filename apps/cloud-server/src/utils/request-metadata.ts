import type { FastifyRequest } from 'fastify';
import UAParser from 'ua-parser-js';

export interface RequestMetadata {
  ipAddress: string;
  userAgent: string;
  device: string;
  location: string;
}

// Extracts IP, device name, and location from request headers
export function extractRequestMetadata(request: FastifyRequest): RequestMetadata {
  const parser = new UAParser.UAParser(request.headers['user-agent'] || '');
  const browser = parser.getBrowser();
  const os = parser.getOS();

  const device =
    browser.name && os.name
      ? `${browser.name}${browser.major ? ` ${browser.major}` : ''} on ${os.name}`
      : request.headers['user-agent']?.substring(0, 100) || 'Unknown';

  // Cloudflare geo headers
  const city = (request.headers['cf-ipcity'] as string) || '';
  const country = (request.headers['cf-ipcountry'] as string) || '';
  const location = city ? `${city}, ${country}` : country || 'Unknown';

  // IP priority: Cloudflare > X-Forwarded-For > request.ip
  const ipAddress =
    (request.headers['cf-connecting-ip'] as string) ||
    (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    request.ip;

  return {
    ipAddress,
    userAgent: request.headers['user-agent'] || '',
    device,
    location,
  };
}
