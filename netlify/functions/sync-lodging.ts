import { scheduledSync } from '../../lib/server/scheduled';

/** Every 15 minutes on the live site: Airbnb and VRBO stays in, alerts out. */
export default async (): Promise<void> => {
  await scheduledSync({
    env: process.env,
    nowMs: Date.now(),
    log: console.log,
  });
};

export const config = { schedule: '*/15 * * * *' };
