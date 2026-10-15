import { hiddenReason } from './rules';
import { candidatesForDay } from './slots';
import { addDays, eachDay, venueDay } from './time';
import type { AvailabilityInput, Slot } from './types';

/** Every candidate time in the input's date range, open or hidden with a reason. */
export function computeSlots(input: AvailabilityInput): Slot[] {
  const lastBookableDay = addDays(venueDay(input.nowMs), input.type.windowDays);
  return eachDay(input.fromDay, input.toDay).flatMap((day) =>
    candidatesForDay(day, input.type, input.hours).map((candidate): Slot => {
      const reason = hiddenReason(candidate, day, input, lastBookableDay);
      return reason === null
        ? { status: 'open', startMs: candidate.startMs, endMs: candidate.endMs }
        : {
            status: 'hidden',
            startMs: candidate.startMs,
            endMs: candidate.endMs,
            reason,
          };
    })
  );
}

/** Only the times a visitor may book. */
export function openSlots(input: AvailabilityInput): Slot[] {
  return computeSlots(input).filter((slot) => slot.status === 'open');
}
