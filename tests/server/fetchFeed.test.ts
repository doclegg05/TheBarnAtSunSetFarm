// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  FeedFetchError,
  fetchFeedText,
  isAllowedFeedUrl,
  MAX_FEED_BYTES,
} from '../../lib/server/fetchFeed';

const CALENDAR = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n';
const LINK = 'https://www.airbnb.com/calendar/ical/1.ics?s=made-up';

/** A fake fetch that answers each call from a list, recording the links it was asked for. */
function answers(...responses: (() => Response)[]) {
  const asked: string[] = [];
  const fetch = async (url: string | URL | Request) => {
    asked.push(String(url));
    const next = responses.shift();
    if (next === undefined) throw new Error('No more answers');
    return next();
  };
  return { asked, fetch };
}

const ok = (body: string) => () => new Response(body, { status: 200 });
const redirect = (to: string) => () =>
  new Response(null, { status: 302, headers: { location: to } });

describe('isAllowedFeedUrl', () => {
  it.each([
    [LINK, true],
    ['https://airbnb.com/calendar/ical/1.ics', true],
    ['https://www.vrbo.com/icalendar/abc.ics?nonTentative', true],
    ['http://www.airbnb.com/calendar/ical/1.ics', false],
    ['https://notairbnb.com/1.ics', false],
    ['https://airbnb.com.made-up.test/1.ics', false],
    ['https://user:pass@www.airbnb.com/1.ics', false],
    ['https://www.airbnb.com:8443/1.ics', false],
    ['not a link', false],
  ])('%s is allowed: %s', (link, allowed) => {
    expect(isAllowedFeedUrl(link)).toBe(allowed);
  });
});

describe('fetchFeedText', () => {
  it('returns a calendar, a leading byte-order mark included', async () => {
    const withMark = String.fromCharCode(0xfeff) + CALENDAR;
    const { fetch } = answers(ok(withMark));
    expect(await fetchFeedText(LINK, { timeoutMs: 1000, fetch })).toBe(
      withMark
    );
  });

  it('follows a redirect that stays on an allowed host', async () => {
    const next = 'https://www.airbnb.com/calendar/ical/2.ics';
    const { asked, fetch } = answers(redirect(next), ok(CALENDAR));
    expect(await fetchFeedText(LINK, { timeoutMs: 1000, fetch })).toBe(
      CALENDAR
    );
    expect(asked).toEqual([LINK, next]);
  });

  it('refuses a redirect to another host without fetching it', async () => {
    const { asked, fetch } = answers(
      redirect('https://made-up.test/steal'),
      ok(CALENDAR)
    );
    await expect(
      fetchFeedText(LINK, { timeoutMs: 1000, fetch })
    ).rejects.toThrow('not an Airbnb or VRBO https link');
    expect(asked).toEqual([LINK]);
  });

  it('gives up after three redirects', async () => {
    const loop = redirect(LINK);
    const { fetch } = answers(loop, loop, loop, loop, loop);
    await expect(
      fetchFeedText(LINK, { timeoutMs: 1000, fetch })
    ).rejects.toThrow('redirected too many times');
  });

  it.each([
    [
      'a server error',
      () => new Response('oops', { status: 500 }),
      'status 500',
    ],
    [
      'a sign-in page',
      ok('<!doctype html><title>Log in</title>'),
      'did not return a calendar',
    ],
    [
      'a redirect with no location',
      () => new Response(null, { status: 302 }),
      'redirected nowhere',
    ],
  ])('refuses %s', async (_label, answer, message) => {
    const { fetch } = answers(answer);
    await expect(
      fetchFeedText(LINK, { timeoutMs: 1000, fetch })
    ).rejects.toThrow(message);
  });

  it('stops reading a body larger than 2 MB', async () => {
    const huge = 'BEGIN:VCALENDAR\r\n' + 'X'.repeat(MAX_FEED_BYTES);
    const { fetch } = answers(ok(huge));
    await expect(
      fetchFeedText(LINK, { timeoutMs: 1000, fetch })
    ).rejects.toThrow('larger than 2 MB');
  });

  it('gives up when the host does not answer in time, without naming the link', async () => {
    const hang = (_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new Error(String(_url)))
        );
      });
    const error = await fetchFeedText(LINK, {
      timeoutMs: 50,
      fetch: hang,
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(FeedFetchError);
    expect(String(error)).toContain('took too long');
    expect(String(error)).not.toContain('airbnb');
  });
});
