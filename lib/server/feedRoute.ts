import { createHash, timingSafeEqual } from 'node:crypto';
import { buildBlockingFeed } from '../ical/export';
import { BARN_CLEANUP_DAYS } from '../scheduling/nights';
import { addDays, venueDay } from '../scheduling/time';
import type { Rpc } from './rpc';
import { getExportCode, loadEvents } from './store';

/** Feeds are served on the live site only, never on deploy previews. */
export const PRODUCTION_HOSTS: readonly string[] = [
  'thebarnatsunsetfarm.com',
  'www.thebarnatsunsetfarm.com',
];
const FILE_PATTERN = /^(barn|cabin)-([A-Za-z0-9_-]{32,128})\.ics$/;
const PRIVATE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
};

export interface FeedRouteDeps {
  /** Null when the server settings are missing. */
  rpc: Rpc | null;
  nowMs: number;
}

/**
 * GET /feeds/<space>-<code>.ics, imported by Airbnb and VRBO. Every refusal is
 * the same 404, so a wrong guess learns nothing.
 */
export async function feedResponse(
  request: Request,
  file: string,
  deps: FeedRouteDeps
): Promise<Response> {
  const match = FILE_PATTERN.exec(file);
  const allowed =
    (request.method === 'GET' || request.method === 'HEAD') &&
    PRODUCTION_HOSTS.includes(new URL(request.url).hostname);
  if (!allowed || match === null || deps.rpc === null) return notFound();
  const space = match[1] === 'barn' ? 'barn' : 'cabin';
  try {
    const expected = await getExportCode(deps.rpc, space);
    if (expected === null || !sameSecret(match[2], expected)) return notFound();
    const today = venueDay(deps.nowMs);
    const events = await loadEvents(
      deps.rpc,
      addDays(today, -(BARN_CLEANUP_DAYS + 1))
    );
    const body = buildBlockingFeed(
      space,
      events.map(({ id, firstDay, lastDay }) => ({ id, firstDay, lastDay })),
      deps.nowMs
    );
    return new Response(request.method === 'HEAD' ? null : body, {
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/calendar; charset=utf-8',
      },
    });
  } catch {
    // Airbnb and VRBO retry; the next sync of theirs gets the feed.
    return new Response('Try again later', {
      status: 503,
      headers: PRIVATE_HEADERS,
    });
  }
}

function notFound(): Response {
  return new Response('Not found', { status: 404, headers: PRIVATE_HEADERS });
}

/** Compares secrets in constant time; hashing first makes the lengths equal. */
function sameSecret(given: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}
