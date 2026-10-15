// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  bool,
  int,
  isoDate,
  ms,
  msOrNull,
  RowError,
  source,
  space,
  text,
} from '../../lib/server/rows';

describe('row parsers refuse rows the engine cannot trust', () => {
  it('reads well-formed values', () => {
    const row = {
      s: 'x',
      i: 3,
      b: true,
      t: 1.5,
      n: null,
      d: '2026-11-07',
      sp: 'barn',
      so: 'vrbo',
    };
    expect([
      text(row, 's'),
      int(row, 'i'),
      bool(row, 'b'),
      ms(row, 't'),
    ]).toEqual(['x', 3, true, 1.5]);
    expect(msOrNull(row, 'n')).toBeNull();
    expect([isoDate(row, 'd'), space(row, 'sp'), source(row, 'so')]).toEqual([
      '2026-11-07',
      'barn',
      'vrbo',
    ]);
  });

  it.each([
    [
      'a space spelled Barn, which would skip the Barn rules',
      () => space({ v: 'Barn' }, 'v'),
    ],
    [
      'a date with a time on it',
      () => isoDate({ v: '2026-11-07T00:00:00Z' }, 'v'),
    ],
    [
      'a date object from a different driver',
      () => isoDate({ v: new Date() }, 'v'),
    ],
    ['a fractional integer', () => int({ v: 1.5 }, 'v')],
    ['a missing time', () => ms({ v: null }, 'v')],
    ['a time that is not a number', () => msOrNull({ v: 'soon' }, 'v')],
    ['an unknown feed source', () => source({ v: 'booking' }, 'v')],
    ['a boolean stored as text', () => bool({ v: 'true' }, 'v')],
  ])('refuses %s', (_label, read) => {
    expect(read).toThrow(RowError);
  });
});
