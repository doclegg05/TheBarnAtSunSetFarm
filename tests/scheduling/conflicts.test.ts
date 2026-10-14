// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  checkEventConflicts,
  findEventStayConflicts,
  findShowingClashes,
} from '../../lib/scheduling/conflicts';
import type {
  AppointmentKind,
  BookedAppointment,
  Stay,
} from '../../lib/scheduling/types';
import { at, d, HOUR, MINUTE } from './helpers';

const event = { firstDay: d('2026-11-06'), lastDay: d('2026-11-08') };

function booking(
  id: string,
  kind: AppointmentKind,
  day: string
): BookedAppointment {
  const startMs = at(day, '10:00');
  const lengthMs = kind === 'showing' ? HOUR : 30 * MINUTE;
  return {
    id,
    kind,
    startMs,
    endMs: startMs + lengthMs,
    blockedUntilMs: startMs + lengthMs,
  };
}

describe('checkEventConflicts', () => {
  it('C1: refuses an event when a Barn stay shares any date, turnover dates included (C8)', () => {
    const stay = {
      space: 'barn' as const,
      checkIn: d('2026-11-03'),
      checkOut: d('2026-11-06'),
    };
    const result = checkEventConflicts(event, [stay], []);
    expect(result.refused).toBe(true);
    expect(result.barnStays).toEqual([stay]);
  });

  it('C4: lists a Cabin stay as a warning without refusing', () => {
    const stay = {
      space: 'cabin' as const,
      checkIn: d('2026-11-07'),
      checkOut: d('2026-11-09'),
    };
    const result = checkEventConflicts(event, [stay], []);
    expect(result.refused).toBe(false);
    expect(result.cabinStays).toEqual([stay]);
  });

  it('C10: refuses an event unless the Barn is guest-free the whole day before', () => {
    const outSunday = {
      space: 'barn' as const,
      checkIn: d('2026-11-06'),
      checkOut: d('2026-11-08'),
    };
    const monday = { firstDay: d('2026-11-09'), lastDay: d('2026-11-09') };
    const tuesday = { firstDay: d('2026-11-10'), lastDay: d('2026-11-10') };
    expect(checkEventConflicts(monday, [outSunday], []).refused).toBe(true);
    expect(checkEventConflicts(tuesday, [outSunday], []).refused).toBe(false);
  });

  it('C11: refuses an event when the next Barn guest arrives before a full cleanup day', () => {
    const saturday = { firstDay: d('2026-11-14'), lastDay: d('2026-11-14') };
    const inSunday = {
      space: 'barn' as const,
      checkIn: d('2026-11-15'),
      checkOut: d('2026-11-17'),
    };
    const inMonday = {
      space: 'barn' as const,
      checkIn: d('2026-11-16'),
      checkOut: d('2026-11-18'),
    };
    expect(checkEventConflicts(saturday, [inSunday], []).refused).toBe(true);
    expect(checkEventConflicts(saturday, [inMonday], []).refused).toBe(false);
  });

  it('lists showings on the event dates to move, but not calls or other dates', () => {
    const appointments = [
      booking('s1', 'showing', '2026-11-07'),
      booking('s2', 'showing', '2026-11-09'),
      booking('c1', 'call', '2026-11-07'),
    ];
    expect(
      checkEventConflicts(event, [], appointments).showingsToMove.map(
        (a) => a.id
      )
    ).toEqual(['s1']);
  });

  it('passes an event with nothing in the way', () => {
    expect(checkEventConflicts(event, [], [])).toEqual({
      refused: false,
      barnStays: [],
      cabinStays: [],
      showingsToMove: [],
    });
  });
});

describe('findShowingClashes', () => {
  it('C6: finds showings on Barn stay dates only, never calls or Cabin dates', () => {
    const stays = [
      {
        space: 'barn' as const,
        checkIn: d('2026-10-23'),
        checkOut: d('2026-10-25'),
      },
      {
        space: 'cabin' as const,
        checkIn: d('2026-10-27'),
        checkOut: d('2026-10-28'),
      },
    ];
    const appointments = [
      booking('s1', 'showing', '2026-10-25'),
      booking('s2', 'showing', '2026-10-27'),
      booking('c1', 'call', '2026-10-24'),
    ];
    expect(findShowingClashes(appointments, stays).map((a) => a.id)).toEqual([
      's1',
    ]);
  });
});

describe('findEventStayConflicts', () => {
  const conflictsFor = (stays: Stay[]) =>
    findEventStayConflicts([{ id: 'e1', ...event }], stays).map(
      (c) => `${c.stay.space}:${c.stay.checkIn}`
    );

  it('C9: finds stays in either space on any event night, the last day included', () => {
    expect(
      conflictsFor([
        { space: 'barn', checkIn: d('2026-11-07'), checkOut: d('2026-11-08') },
        { space: 'cabin', checkIn: d('2026-11-05'), checkOut: d('2026-11-07') },
        { space: 'cabin', checkIn: d('2026-11-08'), checkOut: d('2026-11-10') },
        { space: 'cabin', checkIn: d('2026-11-09'), checkOut: d('2026-11-11') },
      ])
    ).toEqual(['barn:2026-11-07', 'cabin:2026-11-05', 'cabin:2026-11-08']);
  });

  it('C10 and C11: finds Barn stays that touch the setup or cleanup day', () => {
    expect(
      conflictsFor([
        { space: 'barn', checkIn: d('2026-11-02'), checkOut: d('2026-11-04') },
        { space: 'barn', checkIn: d('2026-11-03'), checkOut: d('2026-11-05') },
        { space: 'barn', checkIn: d('2026-11-09'), checkOut: d('2026-11-11') },
        { space: 'barn', checkIn: d('2026-11-10'), checkOut: d('2026-11-12') },
      ])
    ).toEqual(['barn:2026-11-03', 'barn:2026-11-09']);
  });
});
