import type { Candidate } from './slots';
import { dayInRange, type IsoDate } from './time';
import type { AvailabilityInput, HiddenReason } from './types';

const MINUTE_MS = 60_000;

/** Half-open intervals [start, end) overlap when each starts before the other ends. */
export function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** The first rule that hides a candidate, or null when it is open. The order decides which reason is reported. */
export function hiddenReason(
  candidate: Candidate,
  day: IsoDate,
  input: AvailabilityInput,
  lastBookableDay: IsoDate
): HiddenReason | null {
  const { type, nowMs } = input;
  if (candidate.startMs <= nowMs) return 'past';
  if (candidate.startMs < nowMs + type.noticeMin * MINUTE_MS) return 'too-soon';
  if (day > lastBookableDay) return 'out-of-window';
  if (candidate.endMs > candidate.windowEndMs) return 'too-short';
  if (
    type.needsBarnFree &&
    input.events.some((event) => dayInRange(day, event.firstDay, event.lastDay))
  )
    return 'event-day';
  if (
    type.needsBarnFree &&
    input.stays.some(
      (stay) =>
        stay.space === 'barn' && dayInRange(day, stay.checkIn, stay.checkOut)
    )
  )
    return 'barn-occupied';
  const occupiedUntil = candidate.endMs + type.gapAfterMin * MINUTE_MS;
  if (
    input.blocks.some((block) =>
      overlaps(candidate.startMs, occupiedUntil, block.startMs, block.endMs)
    )
  )
    return 'blocked';
  if (
    input.appointments.some((booked) =>
      overlaps(candidate.startMs, candidate.endMs, booked.startMs, booked.endMs)
    )
  )
    return 'booked';
  if (
    input.appointments.some((booked) =>
      overlaps(
        candidate.startMs,
        occupiedUntil,
        booked.startMs,
        booked.blockedUntilMs
      )
    )
  )
    return 'gap';
  return null;
}
