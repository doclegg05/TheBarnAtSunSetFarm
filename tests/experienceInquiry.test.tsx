import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import InquiryForm from '../components/experience/InquiryForm';

const form = vi.hoisted(() => ({
  state: { succeeded: false, submitting: false, errors: null as unknown },
  submit: vi.fn((event: { preventDefault: () => void }) =>
    event.preventDefault()
  ),
}));

vi.mock('@formspree/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@formspree/react')>()),
  useForm: () => [form.state, form.submit],
}));

beforeEach(() => {
  form.state = { succeeded: false, submitting: false, errors: null };
  form.submit.mockClear();
});
afterEach(() => cleanup());

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillFirstStep = () => {
  type('Your date, or a range', 'June 2027');
  type('Your name', 'Sam Rivers');
  type('Email', 'sam@example.com');
};

describe('experience inquiry form', () => {
  it('asks only for a date, a name and an email first', () => {
    render(<InquiryForm />);
    expect(
      (screen.getByLabelText('Your name') as HTMLInputElement).required
    ).toBe(true);
    expect((screen.getByLabelText('Email') as HTMLInputElement).required).toBe(
      true
    );
    expect(screen.queryByLabelText('Phone')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
  });

  it('stays on the first step until the required fields are filled', () => {
    render(<InquiryForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.queryByLabelText('Phone')).toBeNull();
    expect(form.submit).not.toHaveBeenCalled();
  });

  it('moves on to optional details, then sends every field', () => {
    render(<InquiryForm />);
    fillFirstStep();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    type('Phone', '304-555-0100');
    type('Anything we should know?', 'About 120 guests.');
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));

    expect(form.submit).toHaveBeenCalledTimes(1);
    const sent = new FormData(
      screen.getByRole('form', { name: 'Inquiry' }) as HTMLFormElement
    );
    expect(Object.fromEntries(sent)).toEqual({
      date: 'June 2027',
      name: 'Sam Rivers',
      email: 'sam@example.com',
      phone: '304-555-0100',
      message: 'About 120 guests.',
    });
  });

  it('goes back to the first step without losing what was typed', () => {
    render(<InquiryForm />);
    fillFirstStep();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe(
      'Sam Rivers'
    );
  });

  it('thanks the couple once the inquiry is sent', () => {
    form.state = { succeeded: true, submitting: false, errors: null };
    render(<InquiryForm />);
    expect(screen.getByRole('status').textContent).toMatch(/thank you/i);
  });

  it('shows no price', () => {
    const { container } = render(<InquiryForm />);
    expect(container.textContent ?? '').not.toMatch(/\$\s?\d/);
  });
});
