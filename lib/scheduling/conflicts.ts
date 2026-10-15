import {
  BARN_CLEANUP_DAYS,
  BARN_SETUP_DAYS,
  blockedNights,
  nightsOverlap,
  stayNights,
} from './nights';
import { addDays, dayInRange, rangesShareDay, venueDay } from './time';
import type { BookedAppointment, Stay, VenueEvent } from './types';

type EventDays = Pick<VenueEvent, 'firstDay' | 'lastDay'>;

/** Results keep the caller's own record types, so ids and feed details survive. */
export interface EventConflicts<
  S extends Stay,
  A extends BookedAppointment,
  E extends VenueEvent,
> {
  /** C1, C10, C11 and D13: a Barn stay or another event is in the way, so it cannot be saved. */
  refused: boolean;
  barnStays: S[];
  /** D13: other events that share a day with this one. */
  sameDayEvents: E[];
  /** C4: Cabin stays on the event's dates. The manager may override. */
  cabinStays: S[];
  /** D13: other events on this event's setup or cleanup day, or the reverse. The manager may override. */
  turnaroundEvents: E[];
  /** Showings already booked on the event's dates, for the manager to move. */
  showingsToMove: A[];
}

/** `otherEvents` may include the event itself when it is being edited; it is matched by id and skipped. */
export function checkEventConflicts<
  S extends Stay,
  A extends BookedAppointment,
  E extends VenueEvent,
>(
  event: EventDays & { id?: string },
  stays: readonly S[],
  appointments: readonly A[],
  otherEvents: readonly E[]
): EventConflicts<S, A, E> {
  const barnNights = blockedNights(event, 'barn');
  const barnStays = stays.filter(
    (stay) =>
      stay.space === 'barn' && nightsOverlap(barnNights, stayNights(stay))
  );
  const others = otherEvents.filter((other) => other.id !== event.id);
  const sameDayEvents = others.filter((other) => sharesDay(event, other));
  return {
    refused: barnStays.length > 0 || sameDayEvents.length > 0,
    barnStays,
    sameDayEvents,
    cabinStays: stays.filter(
      (stay) =>
        stay.space === 'cabin' &&
        rangesShareDay(
          stay.checkIn,
          stay.checkOut,
          event.firstDay,
          event.lastDay
        )
    ),
    turnaroundEvents: others.filter(
      (other) =>
        !sharesDay(event, other) &&
        (turnaroundTouches(event, other) || turnaroundTouches(other, event))
    ),
    showingsToMove: appointments.filter(
      (booked) =>
        booked.kind === 'showing' &&
        dayInRange(venueDay(booked.startMs), event.firstDay, event.lastDay)
    ),
  };
}

function sharesDay(a: EventDays, b: EventDays): boolean {
  return rangesShareDay(a.firstDay, a.lastDay, b.firstDay, b.lastDay);
}

/** True when the Barn's setup or cleanup days around `event` (C10, C11) land on one of `other`'s days. */
function turnaroundTouches(event: EventDays, other: EventDays): boolean {
  return rangesShareDay(
    addDays(event.firstDay, -BARN_SETUP_DAYS),
    addDays(event.lastDay, BARN_CLEANUP_DAYS),
    other.firstDay,
    other.lastDay
  );
}

/** C6: showings that now fall on a date a Barn stay covers (C8 counts turnover dates). */
export function findShowingClashes<A extends BookedAppointment>(
  appointments: readonly A[],
  stays: readonly Stay[]
): A[] {
  const barnStays = stays.filter((stay) => stay.space === 'barn');
  return appointments.filter(
    (booked) =>
      booked.kind === 'showing' &&
      barnStays.some((stay) =>
        dayInRange(venueDay(booked.startMs), stay.checkIn, stay.checkOut)
      )
  );
}

export interface EventStayConflict<
  E extends VenueEvent = VenueEvent,
  S extends Stay = Stay,
> {
  event: E;
  stay: S;
}

/** Stays that booked a night an event blocks, for example during the Airbnb sync delay (spec R1). */
export function findEventStayConflicts<E extends VenueEvent, S extends Stay>(
  events: readonly E[],
  stays: readonly S[]
): EventStayConflict<E, S>[] {
  return events.flatMap((event) =>
    stays
      .filter((stay) =>
        nightsOverlap(blockedNights(event, stay.space), stayNights(stay))
      )
      .map((stay) => ({ event, stay }))
  );
}
