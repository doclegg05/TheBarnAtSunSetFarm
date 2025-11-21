import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface BookingContextType {
    selectedDateRange: DateRange;
    setSelectedDateRange: (range: DateRange) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({ start: null, end: null });

    return (
        <BookingContext.Provider value={{ selectedDateRange, setSelectedDateRange }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
