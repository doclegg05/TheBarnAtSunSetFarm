import type { IsoDate } from './time';

export type AppointmentKind = 'showing' | 'call';
export type SpaceSlug = 'barn' | 'cabin';

export interface AppointmentType {
  kind: AppointmentKind;
  durationMin: number;
  gapAfterMin: number;
  noticeMin: number;
  windowDays: number;
  stepMin: number;
  needsBarnFree: boolean;
}

/** Open hours for one weekday. ISO weekday: 1 is Monday. Times are venue wall clock, HH:mm. */
export interface WeeklyHours {
  weekday: number;
  start: string;
  end: string;
}

/** A lodging stay. Covers every date from checkIn to checkOut, both included (C8). */
export interface Stay {
  space: SpaceSlug;
  checkIn: IsoDate;
  checkOut: IsoDate;
}

/** A wedding or other event the manager entered. Both dates included. */
export interface VenueEvent {
  id: string;
  firstDay: IsoDate;
  lastDay: IsoDate;
}

/** Time the manager marked unavailable. Half-open: [startMs, endMs). */
export interface TimeBlock {
  startMs: number;
  endMs: number;
}

/** An active booking. blockedUntilMs is endMs plus the type's gap. */
export interface BookedAppointment {
  id: string;
  kind: AppointmentKind;
  startMs: number;
  endMs: number;
  blockedUntilMs: number;
}

export type HiddenReason =
  | 'past'
  | 'too-soon'
  | 'out-of-window'
  | 'too-short'
  | 'event-day'
  | 'barn-occupied'
  | 'blocked'
  | 'booked'
  | 'gap';

export type Slot =
  | { status: 'open'; startMs: number; endMs: number }
  | { status: 'hidden'; startMs: number; endMs: number; reason: HiddenReason };

export interface AvailabilityInput {
  type: AppointmentType;
  hours: readonly WeeklyHours[];
  blocks: readonly TimeBlock[];
  events: readonly VenueEvent[];
  stays: readonly Stay[];
  appointments: readonly BookedAppointment[];
  nowMs: number;
  fromDay: IsoDate;
  toDay: IsoDate;
}

export const DEFAULT_TYPES: Readonly<Record<AppointmentKind, AppointmentType>> =
  {
    showing: {
      kind: 'showing',
      durationMin: 60,
      gapAfterMin: 30,
      noticeMin: 24 * 60,
      windowDays: 60,
      stepMin: 30,
      needsBarnFree: true,
    },
    call: {
      kind: 'call',
      durationMin: 30,
      gapAfterMin: 0,
      noticeMin: 4 * 60,
      windowDays: 60,
      stepMin: 30,
      needsBarnFree: false,
    },
  };
