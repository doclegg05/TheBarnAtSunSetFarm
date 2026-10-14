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
      await discard(response);
      next = redirectTarget(response.headers.get('location'), next);
      continue;
    }
    if (response.status !== 200) {
      await discard(response);
      throw new FeedFetchError(
        `The feed answered with status ${response.status}`
      );
    }
    const text = await readCapped(response, signal);
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

/** Resolves a redirect. Node's URL errors quote the base, which is the secret link, so they are replaced. */
function redirectTarget(location: string | null, current: string): string {
  if (location === null)
    throw new FeedFetchError('The feed redirected nowhere');
  try {
    return new URL(location, current).toString();
  } catch {
    throw new FeedFetchError('The feed redirected to an unusable address');
  }
}

/** Frees a body we will not read. */
async function discard(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // The body was already closed; there is nothing left to free.
  }
}

/** Reads the body, stopping as soon as it passes MAX_FEED_BYTES. Only throws FeedFetchError. */
async function readCapped(
  response: Response,
  signal: AbortSignal
): Promise<string> {
  const reader = response.body?.getReader();
  if (reader === undefined) return '';
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (
      let part = await reader.read();
      !part.done;
      part = await reader.read()
    ) {
      total += part.value.byteLength;
      if (total > MAX_FEED_BYTES) {
        await reader.cancel();
        throw new FeedFetchError('The feed is larger than 2 MB');
      }
      chunks.push(part.value);
    }
  } catch (error) {
    if (error instanceof FeedFetchError) throw error;
    throw new FeedFetchError(
      signal.aborted
        ? 'The feed took too long to answer'
        : 'The feed could not be read'
    );
  }
  return Buffer.concat(chunks).toString('utf8');
}
