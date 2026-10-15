// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { partOfEvent } from '../../lib/server/alerts';
import type { StoredEvent, StoredStay } from '../../lib/server/store';
import { d } from '../scheduling/helpers';

const saturday: StoredEvent = {
  id: 'e',
  title: 'Wedding',
  firstDay: d('2026-11-14'),
  lastDay: d('2026-11-14'),
  cabinOverride: false,
};
const stay = (
  space: 'barn' | 'cabin',
  checkIn: string,
  checkOut: string
): StoredStay => ({
  feedId: 1,
  source: 'airbnb',
  uid: 'u',
  space,
  checkIn: d(checkIn),
  checkOut: d(checkOut),
});

describe('partOfEvent', () => {
  it.each([
    [
      'a Barn stay over the event day',
      stay('barn', '2026-11-13', '2026-11-15'),
      'the event itself',
    ],
    [
      'a Barn stay ending on the setup day',
      stay('barn', '2026-11-11', '2026-11-13'),
      'the setup day before it',
    ],
    [
      'a Barn stay starting on the cleanup day',
      stay('barn', '2026-11-15', '2026-11-17'),
      'the cleanup day after it',
    ],
    [
      'a Cabin stay',
      stay('cabin', '2026-11-14', '2026-11-16'),
      'one of its nights',
    ],
  ])('names %s', (_label, guest, part) => {
    expect(partOfEvent(saturday, guest)).toBe(part);
  });
});
