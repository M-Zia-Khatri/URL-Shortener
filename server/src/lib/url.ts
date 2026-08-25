import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';
import { env } from '../config/env.js';
import { BadRequestError } from './errors.js';

function ipv4ToInt(ip: string) {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function ipv4InRange(ip: string, cidr: string, bits: number) {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(cidr) & mask);
}

function isPrivateIp(address: string) {
  if (isIP(address) === 4) {
    return (
      ipv4InRange(address, '10.0.0.0', 8) ||
      ipv4InRange(address, '127.0.0.0', 8) ||
      ipv4InRange(address, '172.16.0.0', 12) ||
      ipv4InRange(address, '192.168.0.0', 16) ||
      ipv4InRange(address, '169.254.0.0', 16) ||
      ipv4InRange(address, '0.0.0.0', 8)
    );
  }

  const normalized = address.toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd')
  );
}

export async function validateUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new BadRequestError('originalUrl must be a valid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new BadRequestError('originalUrl must use http or https');
  }

  if (env.BLOCK_PRIVATE_URLS) {
    const addresses = isIP(parsed.hostname)
      ? [{ address: parsed.hostname }]
      : await lookup(parsed.hostname, { all: true, verbatim: true }).catch(() => {
          throw new BadRequestError('originalUrl hostname could not be resolved');
        });

    if (addresses.some(({ address }) => isPrivateIp(address))) {
      throw new BadRequestError('originalUrl cannot point to a private or internal address');
    }
  }

  return parsed.toString();
}
