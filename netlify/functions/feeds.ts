import { readServerEnv } from '../../lib/server/env';
import { feedResponse } from '../../lib/server/feedRoute';
import { restRpc } from '../../lib/server/rpc';

/** The Barn and Cabin blocking feeds that Airbnb and VRBO import. */
export default async (
  request: Request,
  context: { params: Record<string, string | undefined> }
): Promise<Response> => {
  const env = readServerEnv(process.env);
  const rpc =
    env === null
      ? null
      : restRpc({ url: env.supabaseUrl, secretKey: env.supabaseSecretKey });
  return feedResponse(request, context.params.file ?? '', {
    rpc,
    nowMs: Date.now(),
  });
};

/**
 * Each caller gets 30 feed requests a minute; after that Netlify answers 429.
 * Airbnb and VRBO poll far less often. The free plan allows two code-based
 * rules per project and this is one. Netlify skips an invalid rule without
 * failing the deploy, so check the deploy log after changing it.
 */
export const config = {
  path: '/feeds/:file',
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
