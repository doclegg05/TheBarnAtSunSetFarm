import { logOnlyMailer, resendMailer } from './email';
import { readServerEnv } from './env';
import { fetchFeedText } from './fetchFeed';
import { restRpc } from './rpc';
import { runSync, type SyncReport } from './sync';

/** The spec's 10-second limit per feed. Feeds download in parallel inside the 30-second run. */
export const FEED_TIMEOUT_MS = 10_000;

export interface ScheduledSyncInput {
  env: Readonly<Record<string, string | undefined>>;
  nowMs: number;
  log: (line: string) => void;
  /** The network. Tests pass a fake; production uses the global fetch. */
  fetch?: typeof fetch;
}

/** Wires the real services to runSync. Logs outcomes only: no links, no feed text. */
export async function scheduledSync(
  input: ScheduledSyncInput
): Promise<SyncReport | null> {
  const config = readServerEnv(input.env);
  if (config === null) {
    input.log(
      'Lodging sync skipped: SUPABASE_URL and SUPABASE_SECRET_KEY are not set'
    );
    return null;
  }
  const report = await runSync({
    rpc: restRpc({
      url: config.supabaseUrl,
      secretKey: config.supabaseSecretKey,
      fetch: input.fetch,
    }),
    mailer:
      config.email === null
        ? logOnlyMailer(input.log)
        : resendMailer({
            apiKey: config.email.apiKey,
            from: config.email.from,
            fetch: input.fetch,
          }),
    alertTo: config.email?.alertTo ?? '',
    fetchFeed: (link) =>
      fetchFeedText(link, { timeoutMs: FEED_TIMEOUT_MS, fetch: input.fetch }),
    nowMs: input.nowMs,
    log: input.log,
  });
  const feeds = report.feeds
    .map((feed) => `feed ${feed.id} ${feed.outcome}`)
    .join(', ');
  input.log(
    `Lodging sync: ${feeds || 'no feeds configured'}; ${report.emails} emails`
  );
  return report;
}
