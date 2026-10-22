// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readHeadersFile } from './headersFile';

describe('security headers in public/_headers', () => {
  const site = readHeadersFile().get('/*') ?? {};
  const policy = site['Content-Security-Policy-Report-Only'] ?? '';

  it('refuses to be shown inside another site', () => {
    expect(site['X-Frame-Options']).toBe('DENY');
  });

  it('stops browsers guessing file types', () => {
    expect(site['X-Content-Type-Options']).toBe('nosniff');
  });

  it('tells other sites only which domain a visitor came from', () => {
    expect(site['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('switches off the camera, microphone and location', () => {
    const permissions = site['Permissions-Policy'] ?? '';
    for (const feature of ['camera=()', 'microphone=()', 'geolocation=()']) {
      expect(permissions).toContain(feature);
    }
  });

  it('ships the content security policy in report-only mode', () => {
    expect(policy).not.toBe('');
    expect(site['Content-Security-Policy']).toBeUndefined();
  });

  it('limits the policy to this site plus the services it names', () => {
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).not.toContain("'unsafe-eval'");
  });
});
