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
  const barn = type.needsBarnFree ? barnReason(day, input) : null;
  return barn ?? timeReason(candidate, input);
}

/** C1 and C8: a type that needs the Barn free is hidden all day on event days and Barn stay days. */
function barnReason(
  day: IsoDate,
  input: AvailabilityInput
): 'event-day' | 'barn-occupied' | null {
  if (
    input.events.some((event) => dayInRange(day, event.firstDay, event.lastDay))
  )
    return 'event-day';
  if (
    input.stays.some(
      (stay) =>
        stay.space === 'barn' && dayInRange(day, stay.checkIn, stay.checkOut)
    )
  )
    return 'barn-occupied';
  return null;
}

/** Blocked time and other bookings, counting the gap after this type. */
function timeReason(
  candidate: Candidate,
  input: AvailabilityInput
): 'blocked' | 'booked' | 'gap' | null {
  const occupiedUntil = candidate.endMs + input.type.gapAfterMin * MINUTE_MS;
  const { startMs, endMs } = candidate;
  if (
    input.blocks.some((b) =>
      overlaps(startMs, occupiedUntil, b.startMs, b.endMs)
    )
  )
    return 'blocked';
  if (
    input.appointments.some((a) => overlaps(startMs, endMs, a.startMs, a.endMs))
  )
    return 'booked';
  if (
    input.appointments.some((a) =>
      overlaps(startMs, occupiedUntil, a.startMs, a.blockedUntilMs)
    )
  )
    return 'gap';
  return null;
}
