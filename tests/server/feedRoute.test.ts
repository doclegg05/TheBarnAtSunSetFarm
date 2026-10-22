// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { feedResponse } from '../../lib/server/feedRoute';
import type { Rpc } from '../../lib/server/rpc';
import feedsFunction, {
  config as feedsConfig,
} from '../../netlify/functions/feeds';
import { at } from '../scheduling/helpers';
import { freshDb, type TestDb } from './testDb';

const NOW = at('2026-10-14', '08:00');
const CODE = 'c0de'.repeat(10);
const LIVE = 'https://thebarnatsunsetfarm.com';
let db: TestDb;

beforeEach(async () => {
  db = await freshDb();
  await db.sql(
    `insert into sched_settings (key, value) values ('export_code_barn', $1)`,
    [CODE]
  );
  await db.sql(
    `insert into events (title, first_day, last_day, created_by)
     values ('PRIVATE-TITLE', '2026-11-10', '2026-11-10', 't')`
  );
});

const get = (url: string, method = 'GET') => new Request(url, { method });

describe('feedResponse', () => {
  it('serves the Barn feed with the setup and cleanup nights, and nothing private', async () => {
    const response = await feedResponse(
      get(`${LIVE}/feeds/barn-${CODE}.ics`),
      `barn-${CODE}.ics`,
      {
        rpc: db.rpc,
        nowMs: NOW,
      }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'text/calendar; charset=utf-8'
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const body = await response.text();
    expect(body).toContain('DTSTART;VALUE=DATE:20261108');
    expect(body).toContain('DTEND;VALUE=DATE:20261112');
    expect(body).not.toContain('PRIVATE');
  });

  it('answers HEAD with headers only', async () => {
    const response = await feedResponse(
      get(`${LIVE}/x`, 'HEAD'),
      `barn-${CODE}.ics`,
      {
        rpc: db.rpc,
        nowMs: NOW,
      }
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });

  it.each([
    ['a wrong code', LIVE, `barn-${'x'.repeat(40)}.ics`, 'GET'],
    ['a space with no code set', LIVE, `cabin-${CODE}.ics`, 'GET'],
    ['a short code', LIVE, 'barn-short.ics', 'GET'],
    ['another file name', LIVE, `barn-${CODE}.txt`, 'GET'],
    [
      'a deploy preview host',
      'https://deploy-preview-31--thebarnatsunsetfarm.netlify.app',
      `barn-${CODE}.ics`,
      'GET',
    ],
    ['a POST', LIVE, `barn-${CODE}.ics`, 'POST'],
  ])('gives the same 404 for %s', async (_label, origin, file, method) => {
    const response = await feedResponse(
      get(`${origin}/feeds/${file}`, method),
      file,
      {
        rpc: db.rpc,
        nowMs: NOW,
      }
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found');
  });

  it('answers 503 when the database call fails, so the importer retries', async () => {
    const broken: Rpc = {
      call: async () => {
        throw new Error('down');
      },
    };
    const response = await feedResponse(get(`${LIVE}/f`), `barn-${CODE}.ics`, {
      rpc: broken,
      nowMs: NOW,
    });
    expect(response.status).toBe(503);
  });
});

describe('the feeds Netlify function', () => {
  it('answers 404 when the server settings are missing', async () => {
    const response = await feedsFunction(
      get(`${LIVE}/feeds/barn-${CODE}.ics`),
      {
        params: { file: `barn-${CODE}.ics` },
      }
    );
    expect(response.status).toBe(404);
  });

  it('is rate-limited per caller, with a window Netlify accepts', () => {
    expect(feedsConfig).toMatchObject({
      rateLimit: { aggregateBy: ['ip', 'domain'] },
    });
    // Netlify skips a rule with a window over 180 seconds and still deploys.
    expect(feedsConfig.rateLimit.windowSize).toBeLessThanOrEqual(180);
    expect(feedsConfig.rateLimit.windowLimit).toBeGreaterThan(0);
  });
});
