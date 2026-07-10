import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { BookingProvider } from '../contexts/BookingContext';
import { useBooking } from '../contexts/useBooking';

const wrapper = ({ children }: { children: ReactNode }) => (
  <BookingProvider>{children}</BookingProvider>
);

describe('useBooking', () => {
  it('throws when used outside a BookingProvider', () => {
    expect(() => renderHook(() => useBooking())).toThrow(
      'useBooking must be used within a BookingProvider'
    );
  });

  it('starts with an empty date range inside the provider', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    expect(result.current.selectedDateRange).toEqual({
      start: null,
      end: null,
    });
  });

  it('updates the shared range via setSelectedDateRange', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    const start = new Date(2027, 5, 12);
    const end = new Date(2027, 5, 14);

    act(() => {
      result.current.setSelectedDateRange({ start, end });
    });

    expect(result.current.selectedDateRange).toEqual({ start, end });
  });
});
