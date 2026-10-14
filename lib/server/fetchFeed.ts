/** Hosts a lodging feed link may use, including their subdomains. */
export const FEED_HOSTS: readonly string[] = ['airbnb.com', 'vrbo.com'];
export const MAX_FEED_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/** Why a feed could not be fetched. Messages are fixed text: never the link, never the body. */
export class FeedFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedFetchError';
  }
}

/** An https link on an allowed host, with no user name, password or port. */
export function isAllowedFeedUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    return false;
  }
  const host = url.hostname.toLowerCase();
  return FEED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

/** Downloads a feed, checking the host again after every redirect. */
export async function fetchFeedText(
  link: string,
  options: { timeoutMs: number; fetch?: typeof fetch }
): Promise<string> {
  const send = options.fetch ?? fetch;
  const signal = AbortSignal.timeout(options.timeoutMs);
  let next = link;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isAllowedFeedUrl(next)) {
      throw new FeedFetchError(
        'The feed link is not an Airbnb or VRBO https link'
      );
    }
    const response = await request(send, next, signal);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location === null)
        throw new FeedFetchError('The feed redirected nowhere');
      next = new URL(location, next).toString();
      continue;
    }
    if (response.status !== 200) {
      throw new FeedFetchError(
        `The feed answered with status ${response.status}`
      );
    }
    const text = await readCapped(response);
    if (!text.trimStart().startsWith('BEGIN:VCALENDAR')) {
      throw new FeedFetchError('The feed did not return a calendar');
    }
    return text;
  }
  throw new FeedFetchError('The feed redirected too many times');
}

async function request(
  send: typeof fetch,
  link: string,
  signal: AbortSignal
): Promise<Response> {
  try {
    return await send(link, {
      redirect: 'manual',
      signal,
      headers: { Accept: 'text/calendar' },
    });
  } catch {
    throw new FeedFetchError(
      signal.aborted
        ? 'The feed took too long to answer'
        : 'The feed could not be reached'
    );
  }
}

/** Reads the body, stopping as soon as it passes MAX_FEED_BYTES. */
async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (reader === undefined) return '';
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (let part = await reader.read(); !part.done; part = await reader.read()) {
    total += part.value.byteLength;
    if (total > MAX_FEED_BYTES) {
      await reader.cancel();
      throw new FeedFetchError('The feed is larger than 2 MB');
    }
    chunks.push(part.value);
  }
  return Buffer.concat(chunks).toString('utf8');
}
