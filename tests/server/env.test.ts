// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readServerEnv } from '../../lib/server/env';

const BASE = {
  SUPABASE_URL: 'https://madeupref.supabase.co',
  SUPABASE_SECRET_KEY: 'sb_secret_x',
};

describe('readServerEnv', () => {
  it('is null until both database settings are present', () => {
    expect(readServerEnv({})).toBeNull();
    expect(readServerEnv({ SUPABASE_URL: BASE.SUPABASE_URL })).toBeNull();
    expect(readServerEnv({ ...BASE, SUPABASE_SECRET_KEY: '  ' })).toBeNull();
  });

  it('enables email only when all three email settings are present', () => {
    expect(readServerEnv(BASE)?.email).toBeNull();
    expect(
      readServerEnv({ ...BASE, EMAIL_API_KEY: 're_x', EMAIL_FROM: 'f' })?.email
    ).toBeNull();
    expect(
      readServerEnv({
        ...BASE,
        EMAIL_API_KEY: 're_x',
        EMAIL_FROM: 'f',
        ALERT_EMAIL: 'a@example.test',
      })?.email
    ).toEqual({ apiKey: 're_x', from: 'f', alertTo: 'a@example.test' });
  });

  it('refuses a project link that is not a Supabase project, without echoing it', () => {
    const read = () =>
      readServerEnv({ ...BASE, SUPABASE_URL: 'https://evil.test/?secret' });
    expect(read).toThrow('SUPABASE_URL must look like');
    expect(read).not.toThrow('evil');
  });
});
