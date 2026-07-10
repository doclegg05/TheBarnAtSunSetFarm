import { createContext } from 'react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface BookingContextType {
  selectedDateRange: DateRange;
  setSelectedDateRange: (range: DateRange) => void;
}

export const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);
