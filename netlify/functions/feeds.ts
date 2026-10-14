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

export const config = { path: '/feeds/:file' };
