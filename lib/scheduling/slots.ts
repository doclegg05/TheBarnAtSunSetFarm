import { venueWallTime, wallMinutes, weekday, type IsoDate } from './time';
import type { AppointmentType, WeeklyHours } from './types';

const MINUTE_MS = 60_000;

/** A possible start time before any rule is applied. */
export interface Candidate {
  startMs: number;
  endMs: number;
  /** Closing time of the open-hours window this start falls in. */
  windowEndMs: number;
}

interface MinuteWindow {
  start: number;
  end: number;
}

/** Joins overlapping or touching hour blocks for one weekday, so 9-12 plus 11-14 becomes 9-14. */
export function mergeWindows(
  hours: readonly WeeklyHours[],
  isoWeekday: number
): MinuteWindow[] {
  const windows = hours
    .filter((block) => block.weekday === isoWeekday)
    .map((block) => ({
      start: wallMinutes(block.start),
      end: wallMinutes(block.end),
    }))
    .filter((window) => window.end > window.start)
    .sort((a, b) => a.start - b.start);
  return windows.reduce<MinuteWindow[]>((merged, window) => {
    const last = merged[merged.length - 1];
    if (last && window.start <= last.end) {
      return [
        ...merged.slice(0, -1),
        { start: last.start, end: Math.max(last.end, window.end) },
      ];
    }
    return [...merged, window];
  }, []);
}

/** Every start time the weekly hours allow on one date, in time order. */
export function candidatesForDay(
  day: IsoDate,
  type: AppointmentType,
  hours: readonly WeeklyHours[]
): Candidate[] {
  const candidates: Candidate[] = [];
  for (const window of mergeWindows(hours, weekday(day))) {
    const windowEndMs = venueWallTime(day, window.end);
    if (windowEndMs === null) continue;
    for (
      let minute = window.start;
      minute < window.end;
      minute += type.stepMin
    ) {
      const startMs = venueWallTime(day, minute);
      if (startMs === null) continue;
      candidates.push({
        startMs,
        endMs: startMs + type.durationMin * MINUTE_MS,
        windowEndMs,
      });
    }
  }
  return candidates;
}
