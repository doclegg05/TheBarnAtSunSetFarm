import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import Contact from '../components/Contact';
import { BookingProvider } from '../contexts/BookingContext';
import { useBooking } from '../contexts/useBooking';

vi.mock('@formspree/react', () => ({
  useForm: () => [
    { succeeded: false, submitting: false, errors: null },
    vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
  ],
  ValidationError: () => null,
}));

const SetRange = ({ start, end }: { start: Date; end: Date }) => {
  const { setSelectedDateRange } = useBooking();
  useEffect(() => {
    setSelectedDateRange({ start, end });
  }, [setSelectedDateRange, start, end]);
  return null;
};

const renderContact = (range?: { start: Date; end: Date }) =>
  render(
    <BookingProvider>
      {range && <SetRange start={range.start} end={range.end} />}
      <Contact />
    </BookingProvider>
  );

describe('Contact form validation', () => {
  beforeEach(() => cleanup());

  it('blocks empty submissions: name, email, and message are required', () => {
    renderContact();
    expect(
      (screen.getByLabelText('Full Name') as HTMLInputElement).required
    ).toBe(true);
    expect(
      (screen.getByLabelText('Email Address') as HTMLInputElement).required
    ).toBe(true);
    expect(
      (screen.getByLabelText('Message') as HTMLTextAreaElement).required
    ).toBe(true);
  });

  it('rejects malformed email addresses via the email input type', () => {
    renderContact();
    const email = screen.getByLabelText('Email Address') as HTMLInputElement;
    expect(email.type).toBe('email');
  });

  it('pre-fills a single date when the calendar selection is one day', () => {
    renderContact({
      start: new Date(2027, 0, 5),
      end: new Date(2027, 0, 5),
    });
    const date = screen.getByLabelText(
      'Prospective Event Date(s)'
    ) as HTMLInputElement;
    expect(date.value).toBe('Jan 5, 2027');
  });

  it('pre-fills the date field from the calendar selection', () => {
    renderContact({
      start: new Date(2027, 0, 5),
      end: new Date(2027, 0, 7),
    });
    const date = screen.getByLabelText(
      'Prospective Event Date(s)'
    ) as HTMLInputElement;
    expect(date.value).toBe('Jan 5, 2027 - Jan 7, 2027');
  });

  it('lets a manual edit override the calendar selection', () => {
    renderContact({
      start: new Date(2027, 0, 5),
      end: new Date(2027, 0, 7),
    });
    const date = screen.getByLabelText(
      'Prospective Event Date(s)'
    ) as HTMLInputElement;

    fireEvent.change(date, { target: { value: '06/12/2027' } });

    expect(date.value).toBe('06/12/2027');
  });

  it('accepts an oversized message without crashing or truncating state', () => {
    renderContact();
    const message = screen.getByLabelText('Message') as HTMLTextAreaElement;
    const huge = 'x'.repeat(10_000);

    fireEvent.change(message, { target: { value: huge } });

    expect(message.value).toHaveLength(10_000);
  });
});
