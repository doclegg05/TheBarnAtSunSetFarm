import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RpcError, type Param, type Row, type Rpc } from '../../lib/server/rpc';

const MIGRATIONS = join(__dirname, '../../supabase/migrations');
const ARG_NAME = /^p_[a-z_]+$/;

/**
 * What a new Supabase project already has before any migration runs: the API
 * roles, and default privileges that hand every new table, sequence and
 * function in public to those roles. Recreating them here makes the schema
 * tests fail if a migration forgets to take those privileges back.
 */
const SUPABASE_DEFAULTS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges for role postgres in schema public
    grant all on tables to anon, authenticated, service_role;
  alter default privileges for role postgres in schema public
    grant all on sequences to anon, authenticated, service_role;
  alter default privileges for role postgres in schema public
    grant all on functions to anon, authenticated, service_role;
`;

export interface TestDb {
  /** The same calls production makes through Supabase's REST API, run in-process as service_role. */
  rpc: Rpc;
  /** Raw SQL for test setup and assertions only. */
  sql: (text: string, params?: readonly Param[]) => Promise<Row[]>;
}

/** A fresh in-memory Postgres with every migration applied. */
export async function freshDb(): Promise<TestDb> {
  const pg = await PGlite.create();
  await pg.exec(SUPABASE_DEFAULTS);
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql'));
  for (const file of files.sort()) {
    await pg.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
  }
  const sql = async (text: string, params: readonly Param[] = []) =>
    (await pg.query<Row>(text, [...params])).rows;
  const rpc: Rpc = {
    async call(fn, args = {}) {
      const names = Object.keys(args);
      if (!names.every((name) => ARG_NAME.test(name))) {
        throw new Error(`Bad argument name for ${fn}`);
      }
      const list = names.map((name, i) => `${name} => $${i + 1}`).join(', ');
      // Production calls run as service_role (the secret key), not as the owner.
      await pg.exec('set role service_role');
      try {
        return await sql(`select * from ${fn}(${list})`, Object.values(args));
      } catch (error) {
        throw new RpcError(pgCode(error));
      } finally {
        await pg.exec('reset role');
      }
    },
  };
  return { rpc, sql };
}

function pgCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String(error.code);
  }
  throw error;
}
