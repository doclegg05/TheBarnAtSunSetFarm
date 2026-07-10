import { format } from 'date-fns';

export interface GoogleCalendarEvent {
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  status: string;
}

/**
 * Expand Google Calendar events into the set of booked 'YYYY-MM-DD' day
 * strings. Only confirmed events count; all-day events have an exclusive
 * end date, so the loop marks days while current < endDate.
 */
export const expandEventsToBookedDates = (
  events: GoogleCalendarEvent[]
): string[] => {
  const dates: Set<string> = new Set();

  events.forEach((event) => {
    // Only count confirmed events
    if (event.status === 'confirmed') {
      const start = event.start.date || event.start.dateTime;
      const end = event.end.date || event.end.dateTime;

      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Loop through each day of the event
        // Note: handling 'all day' events correctly where end date is exclusive
        const current = new Date(startDate);
        while (current < endDate) {
          // If it's a specific time event (dateTime), endDate might be same day.
          // If it's all day (date), endDate is next day midnight.
          // We just mark the 'current' day as busy.
          dates.add(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
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
 * "Jan 5, 2027 - Jan 7, 2027". Empty string when either end is missing.
 */
export const formatDateRangeLabel = (
  start: Date | null,
  end: Date | null
): string => {
  if (!start || !end) {
    return '';
  }

  const formattedStart = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedEnd = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formattedStart} - ${formattedEnd}`;
};
