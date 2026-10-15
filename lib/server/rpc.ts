/** Arguments travel as plain JSON values. Dates are YYYY-MM-DD text and times are epoch milliseconds. */
export type Param = string | number | boolean | null;
export type Row = Record<string, unknown>;

/** The database functions in supabase/migrations that server code may call. */
export type RpcName =
  | 'sched_configured_feeds'
  | 'sched_feed_health'
  | 'sched_count_future_stays'
  | 'sched_replace_feed_stays'
  | 'sched_record_feed_failure'
  | 'sched_mark_drop_seen'
  | 'sched_mark_outage_alerted'
  | 'sched_stays_from'
  | 'sched_events_from'
  | 'sched_future_showings'
  | 'sched_mark_clash_alerted'
  | 'sched_has_event_stay_alert'
  | 'sched_record_event_stay_alert'
  | 'sched_export_code';

/** Calls one database function with named arguments. Each call is its own transaction. */
export interface Rpc {
  call(fn: RpcName, args?: Readonly<Record<string, Param>>): Promise<Row[]>;
}

/** Postgres exclusion_violation: an overlapping booking or a second event on the same day. */
export const PG_EXCLUSION_VIOLATION = '23P01';

/** A failed database call. Carries the Postgres error code only, never row data. */
export class RpcError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(`Database call failed (${code})`);
    this.name = 'RpcError';
    this.code = code;
  }
}

export interface RestRpcConfig {
  /** The project URL, https://<ref>.supabase.co */
  url: string;
  /** The secret key (sb_secret_...). Runs as service_role; Supabase refuses it from browsers. */
  secretKey: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

/** Calls database functions through Supabase's REST API. */
export function restRpc(config: RestRpcConfig): Rpc {
  const send = config.fetch ?? fetch;
  const base = new URL('/rest/v1/rpc/', config.url);
  return {
    async call(fn, args = {}) {
      const response = await send(new URL(fn, base), {
        method: 'POST',
        headers: {
          apikey: config.secretKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(config.timeoutMs ?? 8000),
      });
      const body = await response.text();
      if (!response.ok) throw new RpcError(errorCode(body, response.status));
      return rowsOf(body);
    },
  };
}

function errorCode(body: string, status: number): string {
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'code' in parsed &&
      typeof parsed.code === 'string'
    ) {
      return parsed.code;
    }
  } catch {
    // Not JSON, for example a gateway error page. The HTTP status is all we keep.
  }
  return `http-${status}`;
}

/** Table functions return a JSON array; void functions return an empty body or null. */
function rowsOf(body: string): Row[] {
  const trimmed = body.trim();
  if (trimmed === '' || trimmed === 'null') return [];
  const parsed: unknown = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) throw new RpcError('unexpected-response');
  return parsed.filter(isRow);
}

function isRow(value: unknown): value is Row {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
