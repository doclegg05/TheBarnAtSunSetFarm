import { blockedNights, nightsOverlap, stayNights } from './nights';
import { dayInRange, rangesShareDay, venueDay } from './time';
import type { BookedAppointment, Stay, VenueEvent } from './types';

export interface EventConflicts {
  /** C1, C10 and C11: a Barn stay touches an event, setup or cleanup day, so it cannot be saved. */
  refused: boolean;
  barnStays: Stay[];
  /** C4: Cabin stays on the event's dates. The manager may override. */
  cabinStays: Stay[];
  /** Showings already booked on the event's dates, for the manager to move. */
  showingsToMove: BookedAppointment[];
}

export function checkEventConflicts(
  event: Pick<VenueEvent, 'firstDay' | 'lastDay'>,
  stays: readonly Stay[],
  appointments: readonly BookedAppointment[]
): EventConflicts {
  const barnNights = blockedNights(event, 'barn');
  const barnStays = stays.filter(
    (stay) =>
      stay.space === 'barn' && nightsOverlap(barnNights, stayNights(stay))
  );
  return {
    refused: barnStays.length > 0,
    barnStays,
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
    showingsToMove: appointments.filter(
      (booked) =>
        booked.kind === 'showing' &&
        dayInRange(venueDay(booked.startMs), event.firstDay, event.lastDay)
    ),
  };
}

/** C6: showings that now fall on a date a Barn stay covers (C8 counts turnover dates). */
export function findShowingClashes(
  appointments: readonly BookedAppointment[],
  stays: readonly Stay[]
): BookedAppointment[] {
  const barnStays = stays.filter((stay) => stay.space === 'barn');
  return appointments.filter(
    (booked) =>
      booked.kind === 'showing' &&
      barnStays.some((stay) =>
        dayInRange(venueDay(booked.startMs), stay.checkIn, stay.checkOut)
      )
  );
}

export interface EventStayConflict {
  event: VenueEvent;
  stay: Stay;
}

/** Stays that booked a night an event blocks, for example during the Airbnb sync delay (spec R1). */
export function findEventStayConflicts(
  events: readonly VenueEvent[],
  stays: readonly Stay[]
): EventStayConflict[] {
  return events.flatMap((event) =>
    stays
      .filter((stay) =>
        nightsOverlap(blockedNights(event, stay.space), stayNights(stay))
      )
      .map((stay) => ({ event, stay }))
  );
}
