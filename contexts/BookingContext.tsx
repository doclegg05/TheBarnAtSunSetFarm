import React, { useState, ReactNode } from 'react';
import { BookingContext, DateRange } from './bookingContextValue';

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  return (
    <BookingContext.Provider
      value={{ selectedDateRange, setSelectedDateRange }}
    >
      {children}
    </BookingContext.Provider>
  );
};
