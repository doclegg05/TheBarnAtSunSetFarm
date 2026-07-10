import { addDays, format, parseISO, startOfDay } from 'date-fns';

export interface GoogleCalendarEvent {
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  status: string;
}

/**
 * Expand Google Calendar events into the set of booked 'YYYY-MM-DD' day
 * strings. Only confirmed events count. Days are computed in LOCAL time,
 * not UTC: an evening event (e.g. 6-11pm Eastern) converted via
 * toISOString() would mark the wrong day as booked.
 */
export const expandEventsToBookedDates = (
  events: GoogleCalendarEvent[]
): string[] => {
  const dates: Set<string> = new Set();

  events.forEach((event) => {
    // Only count confirmed events
    if (event.status !== 'confirmed') {
      return;
    }

    if (event.start.date && event.end.date) {
      // All-day event: end date is exclusive per the API.
      let current = parseISO(event.start.date);
      const endExclusive = parseISO(event.end.date);
      while (current < endExclusive) {
        dates.add(format(current, 'yyyy-MM-dd'));
        current = addDays(current, 1);
      }
    } else if (event.start.dateTime && event.end.dateTime) {
      // Timed event: mark every local day it touches.
      // Subtract 1ms so an event ending exactly at midnight
      // doesn't spill into the next day.
      let current = startOfDay(new Date(event.start.dateTime));
      const lastDay = startOfDay(
        new Date(new Date(event.end.dateTime).getTime() - 1)
      );
      while (current <= lastDay) {
        dates.add(format(current, 'yyyy-MM-dd'));
        current = addDays(current, 1);
      }
    }
  });

  return Array.from(dates);
};

/**
 * True when the given local date matches one of the booked 'YYYY-MM-DD'
 * strings. Compared as formatted strings to avoid timezone issues.
 */
export const isDateBooked = (bookedDates: string[], date: Date): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return bookedDates.some((bookedDateStr) => bookedDateStr === dateStr);
};

/** True when the date is before the start of "today" relative to now. */
export const isPastDate = (date: Date, now: Date = new Date()): boolean => {
  return date < new Date(new Date(now).setHours(0, 0, 0, 0));
};

/**
 * Human-readable label for a selected date range, e.g.
 * "Jan 5, 2027 - Jan 7, 2027". A single-day selection (no end yet, or
 * end === start) yields just the start date; no start yields ''.
 */
export const formatDateRangeLabel = (
  start: Date | null,
  end: Date | null
): string => {
  if (!start) {
    return '';
  }

  const formattedStart = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // A single-day selection arrives as start === end (or no end yet).
  if (!end || end.getTime() === start.getTime()) {
    return formattedStart;
  }

  const formattedEnd = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formattedStart} - ${formattedEnd}`;
};
