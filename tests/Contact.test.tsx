import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import Contact from '../components/Contact';
import { BookingProvider } from '../contexts/BookingContext';
import { useBooking } from '../contexts/useBooking';
import { HEARD_ABOUT_OPTIONS } from '../lib/inquirySources';
import {
  APPLE_MAPS_DIRECTIONS_URL,
  GOOGLE_MAPS_DIRECTIONS_URL,
  GOOGLE_MAPS_EMBED_URL,
} from '../lib/venueLocation';

const formspree = vi.hoisted(() => ({
  state: { succeeded: false, submitting: false, errors: null },
}));

vi.mock('@formspree/react', () => ({
  useForm: () => [
    formspree.state,
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

describe('Contact form lead source', () => {
  beforeEach(() => cleanup());

  it('requires "How did you hear about us?" and submits it as heard_about', () => {
    renderContact();
    const source = screen.getByLabelText(
      'How did you hear about us?'
    ) as HTMLSelectElement;
    expect(source.required).toBe(true);
    expect(source.name).toBe('heard_about');
    expect(source.value).toBe('');
  });

  it('offers every lead-source option, including both wedding directories', () => {
    renderContact();
    const source = screen.getByLabelText(
      'How did you hear about us?'
    ) as HTMLSelectElement;
    const values = Array.from(source.options)
      .map((option) => option.value)
      .filter(Boolean);
    expect(values).toEqual([...HEARD_ABOUT_OPTIONS]);
    expect(values).toContain('The Knot');
    expect(values).toContain('WeddingWire');
  });

  it('asks for details only when "Other" is chosen', () => {
    renderContact();
    const source = screen.getByLabelText(
      'How did you hear about us?'
    ) as HTMLSelectElement;
    expect(screen.queryByLabelText('Where did you hear about us?')).toBeNull();

    fireEvent.change(source, { target: { value: 'Other' } });
    const details = screen.getByLabelText(
      'Where did you hear about us?'
    ) as HTMLInputElement;
    expect(details.name).toBe('heard_about_other');

    fireEvent.change(source, { target: { value: 'Google Maps' } });
    expect(screen.queryByLabelText('Where did you hear about us?')).toBeNull();
  });

  it('records one Google Analytics lead, tagged with the source, when an inquiry is sent', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    try {
      const { rerender } = render(
        <BookingProvider>
          <Contact />
        </BookingProvider>
      );
      fireEvent.change(screen.getByLabelText('How did you hear about us?'), {
        target: { value: 'Google Maps' },
      });
      expect(gtag).not.toHaveBeenCalled();

      formspree.state = { ...formspree.state, succeeded: true };
      rerender(
        <BookingProvider>
          <Contact />
        </BookingProvider>
      );

      expect(gtag).toHaveBeenCalledTimes(1);
      expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {
        heard_about: 'Google Maps',
      });
    } finally {
      formspree.state = { ...formspree.state, succeeded: false };
      delete window.gtag;
    }
  });
});

describe('Contact location and directions', () => {
  beforeEach(() => cleanup());

  it('embeds the map by exact GPS coordinates, not street address', () => {
    renderContact();
    const map = screen.getByTitle(
      'Map showing the exact location of The Barn at Sunset Farm'
    ) as HTMLIFrameElement;
    expect(map.src).toBe(GOOGLE_MAPS_EMBED_URL);
  });

  it('offers coordinate-pinned directions for Google Maps and Apple Maps', () => {
    renderContact();
    const google = screen.getByRole('link', {
      name: 'Directions in Google Maps',
    }) as HTMLAnchorElement;
    const apple = screen.getByRole('link', {
      name: 'Directions in Apple Maps',
    }) as HTMLAnchorElement;
    expect(google.href).toBe(GOOGLE_MAPS_DIRECTIONS_URL);
    expect(apple.href).toBe(APPLE_MAPS_DIRECTIONS_URL);
  });

  it('shows the venue address on Harper Ln with arrival guidance', () => {
    renderContact();
    expect(screen.getByText(/86 Harper Ln/)).toBeTruthy();
    expect(screen.getByText(/Rivers Edge/)).toBeTruthy();
  });
});
