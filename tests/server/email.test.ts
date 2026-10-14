// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  EmailError,
  idempotencyKey,
  logOnlyMailer,
  resendMailer,
} from '../../lib/server/email';

const MESSAGE = {
  to: 'manager@example.test',
  subject: 'Test subject',
  text: 'Body text',
  idempotencyKey: 'key-1',
};

describe('resendMailer', () => {
  it('posts the message with the key as a bearer token and an idempotency key', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetch = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response('{"id":"x"}', { status: 200 });
    };
    const result = await resendMailer({
      apiKey: 're_made_up',
      from: 'Venue <hi@example.test>',
      fetch,
    }).send(MESSAGE);
    expect(result).toBe('sent');
    expect(calls[0].url).toBe('https://api.resend.com/emails');
    const headers = new Headers(calls[0].init.headers);
    expect(headers.get('authorization')).toBe('Bearer re_made_up');
    expect(headers.get('idempotency-key')).toBe('key-1');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      from: 'Venue <hi@example.test>',
      to: ['manager@example.test'],
      subject: 'Test subject',
      text: 'Body text',
    });
  });

  it('throws an EmailError that carries only the status', async () => {
    const fetch = async () =>
      new Response('{"message":"Invalid from"}', { status: 422 });
    const error = await resendMailer({ apiKey: 'k', from: 'f', fetch })
      .send(MESSAGE)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(EmailError);
    expect(String(error)).toContain('422');
  });
});

describe('logOnlyMailer', () => {
  it('reports the email as skipped and logs nothing from it, since subjects can name a couple', async () => {
    const lines: string[] = [];
    expect(await logOnlyMailer((line) => lines.push(line)).send(MESSAGE)).toBe(
      'skipped'
    );
    expect(lines).toEqual(['Email not sent (no email settings)']);
  });
});

describe('idempotencyKey', () => {
  it('is stable, short, and changes with any part', () => {
    const key = idempotencyKey('event-stay', 'x'.repeat(500), 1);
    expect(key).toHaveLength(64);
    expect(idempotencyKey('event-stay', 'x'.repeat(500), 1)).toBe(key);
    expect(idempotencyKey('event-stay', 'x'.repeat(500), 2)).not.toBe(key);
  });
});
