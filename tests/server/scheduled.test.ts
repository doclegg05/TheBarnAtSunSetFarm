// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { scheduledSync } from '../../lib/server/scheduled';

const ENV = {
  SUPABASE_URL: 'https://madeupref.supabase.co',
  SUPABASE_SECRET_KEY: 'sb_secret_x',
};

describe('scheduledSync', () => {
  it('does nothing and says why when the database settings are missing', async () => {
    const lines: string[] = [];
    expect(
      await scheduledSync({ env: {}, nowMs: 0, log: (l) => lines.push(l) })
    ).toBeNull();
    expect(lines).toEqual([
      'Lodging sync skipped: SUPABASE_URL and SUPABASE_SECRET_KEY are not set',
    ]);
  });

  it('calls the database through the REST API with the secret key and logs the outcome', async () => {
    const asked: string[] = [];
    const fetch = async (url: string | URL | Request, init?: RequestInit) => {
      asked.push(String(url));
      expect(new Headers(init?.headers).get('apikey')).toBe('sb_secret_x');
      return new Response('[]', { status: 200 });
    };
    const lines: string[] = [];
    const report = await scheduledSync({
      env: ENV,
      nowMs: 0,
      log: (l) => lines.push(l),
      fetch,
    });
    expect(report).toEqual({ feeds: [], emails: 0 });
    expect(asked[0]).toBe(
      'https://madeupref.supabase.co/rest/v1/rpc/sched_feed_health'
    );
    expect(lines).toEqual(['Lodging sync: no feeds configured; 0 emails']);
  });
});
