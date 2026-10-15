import { toIsoDate, type IsoDate } from '../scheduling/time';
import type { SpaceSlug } from '../scheduling/types';
import type { Row } from './rpc';

/** A database row that does not have the shape the server expects. */
export class RowError extends Error {
  constructor(key: string, expected: string) {
    super(`Database column ${key} is not ${expected}`);
    this.name = 'RowError';
  }
}

export type FeedSource = 'airbnb' | 'vrbo';

export function text(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== 'string') throw new RowError(key, 'text');
  return value;
}

export function int(row: Row, key: string): number {
  const value = row[key];
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new RowError(key, 'an integer');
  }
  return value;
}

export function bool(row: Row, key: string): boolean {
  const value = row[key];
  if (typeof value !== 'boolean') throw new RowError(key, 'true or false');
  return value;
}

/** Epoch milliseconds, selected in SQL as `(extract(epoch from col) * 1000)::float8`. */
export function msOrNull(row: Row, key: string): number | null {
  const value = row[key];
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RowError(key, 'a time');
  }
  return value;
}

export function ms(row: Row, key: string): number {
  const value = msOrNull(row, key);
  if (value === null) throw new RowError(key, 'a time');
  return value;
}

/** A date column selected as `col::text`. */
export function isoDate(row: Row, key: string): IsoDate {
  try {
    return toIsoDate(text(row, key));
  } catch {
    throw new RowError(key, 'a YYYY-MM-DD date');
  }
}

/** Exactly `barn` or `cabin`; anything else would quietly skip the Barn rules. */
export function space(row: Row, key: string): SpaceSlug {
  const value = text(row, key);
  if (value !== 'barn' && value !== 'cabin') throw new RowError(key, 'a space');
  return value;
}

export function source(row: Row, key: string): FeedSource {
  const value = text(row, key);
  if (value !== 'airbnb' && value !== 'vrbo')
    throw new RowError(key, 'a feed source');
  return value;
}
