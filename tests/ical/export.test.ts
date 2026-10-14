// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildBlockingFeed, fold } from '../../lib/ical/export';
import { parseLodgingFeed } from '../../lib/ical/parse';
import { at, d } from '../scheduling/helpers';

const NOW = at('2026-10-13', '08:00');
const weekend = {
  id: 'evt-1',
  firstDay: d('2026-11-06'),
  lastDay: d('2026-11-08'),
};
const oneDay = {
  id: 'evt-2',
  firstDay: d('2026-12-05'),
  lastDay: d('2026-12-05'),
};
const unfold = (folded: string) =>
  folded
    .split('\r\n')
    .map((part, index) => (index === 0 ? part : part.slice(1)))
    .join('');

describe('buildBlockingFeed', () => {
  it('is a calendar with CRLF line endings only', () => {
    const feed = buildBlockingFeed('barn', [weekend], NOW);
    expect(feed.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(feed.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(feed.replaceAll('\r\n', '')).not.toContain('\n');
  });

  it('C9: the Cabin feed blocks every event night, the last day included', () => {
    const feed = buildBlockingFeed('cabin', [weekend], NOW);
    expect(feed).toContain('DTSTART;VALUE=DATE:20261106\r\n');
    expect(feed).toContain('DTEND;VALUE=DATE:20261109\r\n');
  });

  it('C9: the Cabin feed blocks the night of a one-day event', () => {
    const feed = buildBlockingFeed('cabin', [oneDay], NOW);
    expect(feed).toContain('DTSTART;VALUE=DATE:20261205\r\n');
    expect(feed).toContain('DTEND;VALUE=DATE:20261206\r\n');
  });

  it('C10 and C11: the Barn feed adds two setup nights before and one cleanup night after', () => {
    const feed = buildBlockingFeed('barn', [weekend], NOW);
    expect(feed).toContain('DTSTART;VALUE=DATE:20261104\r\n');
    expect(feed).toContain('DTEND;VALUE=DATE:20261110\r\n');
  });

  it('C3 and C5: the Barn and Cabin feeds both carry the event, each with its own UID', () => {
    expect(buildBlockingFeed('barn', [weekend], NOW)).toContain(
      'UID:evt-1-barn@'
    );
    expect(buildBlockingFeed('cabin', [weekend], NOW)).toContain(
      'UID:evt-1-cabin@'
    );
  });

  it('titles every entry Blocked and never leaks event details', () => {
    const withPrivateText = {
      ...weekend,
      title: 'PRIVATE-TEST',
      notes: 'PRIVATE-NOTES',
    };
    const feed = buildBlockingFeed('barn', [withPrivateText], NOW);
    expect(feed).toContain('SUMMARY:Blocked\r\n');
    expect(feed).not.toContain('PRIVATE');
  });

  it('gives the same feed for the same events in any order, sorted by date', () => {
    const a = buildBlockingFeed('cabin', [oneDay, weekend], NOW);
    const b = buildBlockingFeed('cabin', [weekend, oneDay], NOW);
    expect(a).toBe(b);
    expect(a.indexOf('evt-1')).toBeLessThan(a.indexOf('evt-2'));
  });

  it('stamps entries with the build time in UTC', () => {
    expect(buildBlockingFeed('barn', [weekend], NOW)).toContain(
      'DTSTAMP:20261013T120000Z\r\n'
    );
  });

  it('round-trips through the feed reader', () => {
    const feed = buildBlockingFeed('barn', [weekend, oneDay], NOW);
    const nights = parseLodgingFeed(feed).stays.map(
      ({ checkIn, checkOut }) => ({
        checkIn,
        checkOut,
      })
    );
    expect(nights).toEqual([
      { checkIn: '2026-11-04', checkOut: '2026-11-10' },
      { checkIn: '2026-12-03', checkOut: '2026-12-07' },
    ]);
  });
});

describe('fold', () => {
  it('leaves short lines alone', () => {
    expect(fold('SUMMARY:Blocked')).toBe('SUMMARY:Blocked');
  });

  it('wraps long lines at 75 octets with a leading space on each continuation', () => {
    const line = 'X-WR-CALNAME:' + 'a'.repeat(120);
    const physical = fold(line).split('\r\n');
    expect(physical.length).toBeGreaterThan(1);
    expect(
      physical.every((part) => new TextEncoder().encode(part).length <= 75)
    ).toBe(true);
    expect(physical.slice(1).every((part) => part.startsWith(' '))).toBe(true);
    expect(unfold(fold(line))).toBe(line);
  });

  it('never splits a multi-byte character', () => {
    const line = 'X-WR-CALNAME:' + 'é'.repeat(60);
    expect(unfold(fold(line))).toBe(line);
  });
});
