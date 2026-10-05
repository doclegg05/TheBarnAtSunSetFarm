import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Contact from '../components/Contact';
import {
  APPLE_MAPS_DIRECTIONS_URL,
  GOOGLE_MAPS_DIRECTIONS_URL,
  GOOGLE_MAPS_EMBED_URL,
} from '../lib/venueLocation';

const form = vi.hoisted(() => ({
  state: { succeeded: false, submitting: false, errors: null as unknown },
  submit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
}));

vi.mock('@formspree/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@formspree/react')>()),
  useForm: () => [form.state, form.submit],
}));

const renderContact = () => render(<Contact />);

beforeEach(() => {
  form.state = { succeeded: false, submitting: false, errors: null };
  form.submit.mockClear();
});

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

  it('accepts a manually entered date range without a calendar provider', () => {
    renderContact();
    const date = screen.getByLabelText(
      'Prospective Event Date(s)'
    ) as HTMLInputElement;
    expect(date.value).toBe('');
    fireEvent.change(date, { target: { value: '06/12/2027 - 06/14/2027' } });
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Test Guest' },
    });
    expect(date.value).toBe('06/12/2027 - 06/14/2027');
    const fields = new FormData(date.form!);
    expect(fields.get('date')).toBe('06/12/2027 - 06/14/2027');
  });

  it('shows general submission errors and preserves the inquiry for retry', () => {
    const view = renderContact();
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'A test inquiry' },
    });
    form.state.errors = {
      getFormErrors: () => [{ message: 'Unable to send. Please try again.' }],
      getFieldErrors: () => [],
    };
    view.rerender(<Contact />);
    expect(screen.getByRole('alert').textContent).toContain(
      'Unable to send. Please try again.'
    );
    expect(
      (screen.getByLabelText('Message') as HTMLTextAreaElement).value
    ).toBe('A test inquiry');
  });

  it('disables resubmission while sending and announces success', () => {
    form.state.submitting = true;
    const view = renderContact();
    expect(
      (screen.getByRole('button', { name: 'Sending...' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    form.state = { succeeded: true, submitting: false, errors: null };
    view.rerender(<Contact />);
    expect(screen.getByRole('status').textContent).toContain(
      'Your inquiry has been sent'
    );
    expect(screen.queryByRole('button', { name: 'Send Inquiry' })).toBeNull();
  });

  it('accepts an oversized message without crashing or truncating state', () => {
    renderContact();
    const message = screen.getByLabelText('Message') as HTMLTextAreaElement;
    const huge = 'x'.repeat(10_000);

    fireEvent.change(message, { target: { value: huge } });

    expect(message.value).toHaveLength(10_000);
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
