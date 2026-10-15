import { createHash } from 'node:crypto';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  /** Resend sends a message once per key within 24 hours, so a retried run cannot double-send. */
  idempotencyKey: string;
}

/** 'skipped' means nothing went out, so the caller must not record the alert as sent. */
export type SendResult = 'sent' | 'skipped';

export interface Mailer {
  send(message: EmailMessage): Promise<SendResult>;
}

export class EmailError extends Error {
  constructor(status: number) {
    super(`The email service answered with status ${status}`);
    this.name = 'EmailError';
  }
}

export interface ResendConfig {
  apiKey: string;
  /** For example "The Barn at Sunset Farm <bookings@thebarnatsunsetfarm.com>". */
  from: string;
  fetch?: typeof fetch;
}

export function resendMailer(config: ResendConfig): Mailer {
  const send = config.fetch ?? fetch;
  return {
    async send(message) {
      const response = await send('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': message.idempotencyKey,
        },
        body: JSON.stringify({
          from: config.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new EmailError(response.status);
      return 'sent';
    },
  };
}

/**
 * For a deploy with no email settings. Logs one fixed line per message: subjects
 * can name a couple, so nothing from the message is logged.
 */
export function logOnlyMailer(log: (line: string) => void): Mailer {
  return {
    async send() {
      log('Email not sent (no email settings)');
      return 'skipped';
    },
  };
}

/** A key under Resend's 256-character limit, whatever the parts hold. */
export function idempotencyKey(...parts: (string | number)[]): string {
  return createHash('sha256').update(parts.join('\u0000')).digest('hex');
}
