// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  PG_EXCLUSION_VIOLATION,
  restRpc,
  RpcError,
} from '../../lib/server/rpc';

const URL_BASE = 'https://made-up-ref.supabase.co';
const KEY = 'sb_secret_made_up_for_tests';

function fakeFetch(status: number, body: string) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetch = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(status === 204 ? null : body, { status });
  };
  return { calls, rpc: restRpc({ url: URL_BASE, secretKey: KEY, fetch }) };
}

describe('restRpc', () => {
  it('posts named arguments to the function, with the secret key on the apikey header only', async () => {
    const { calls, rpc } = fakeFetch(200, '[{"n":2}]');
    expect(
      await rpc.call('sched_count_future_stays', {
        p_feed_id: 1,
        p_today: '2026-10-14',
      })
    ).toEqual([{ n: 2 }]);
    expect(calls[0].url).toBe(
      `${URL_BASE}/rest/v1/rpc/sched_count_future_stays`
    );
    expect(calls[0].init.method).toBe('POST');
    const headers = new Headers(calls[0].init.headers);
    expect(headers.get('apikey')).toBe(KEY);
    expect(headers.get('authorization')).toBeNull();
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      p_feed_id: 1,
      p_today: '2026-10-14',
    });
  });

  it.each([
    ['an empty 204 response', 204, ''],
    ['a null body', 200, 'null'],
  ])(
    'reads %s from a void function as no rows',
    async (_label, status, body) => {
      const { rpc } = fakeFetch(status, body);
      expect(
        await rpc.call('sched_mark_drop_seen', { p_feed_id: 1, p_now_ms: 1 })
      ).toEqual([]);
    }
  );

  it('keeps the Postgres error code and drops the message, which can quote row data', async () => {
    const body = JSON.stringify({
      code: PG_EXCLUSION_VIOLATION,
      message: 'conflicting key value violates exclusion constraint',
      details:
        'Key (tstzrange(starts_at, blocked_until))=(...) conflicts with existing key',
    });
    const { rpc } = fakeFetch(409, body);
    const error = await rpc.call('sched_feed_health').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RpcError);
    expect(error).toMatchObject({ code: PG_EXCLUSION_VIOLATION });
    expect(String(error)).not.toContain('Key (');
  });

  it('falls back to the HTTP status when the error body is not JSON', async () => {
    const { rpc } = fakeFetch(502, '<html>Bad gateway</html>');
    await expect(rpc.call('sched_feed_health')).rejects.toMatchObject({
      code: 'http-502',
    });
  });

  it('refuses a response that is not a list of rows', async () => {
    const { rpc } = fakeFetch(200, '{"n":1}');
    await expect(rpc.call('sched_feed_health')).rejects.toMatchObject({
      code: 'unexpected-response',
    });
  });
});
