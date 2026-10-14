import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RpcError, type Param, type Row, type Rpc } from '../../lib/server/rpc';

const MIGRATIONS = join(__dirname, '../../supabase/migrations');
const ARG_NAME = /^p_[a-z_]+$/;

export interface TestDb {
  /** The same calls production makes through Supabase's REST API, run in-process. */
  rpc: Rpc;
  /** Raw SQL for test setup and assertions only. */
  sql: (text: string, params?: readonly Param[]) => Promise<Row[]>;
}

/** A fresh in-memory Postgres with every migration applied. */
export async function freshDb(): Promise<TestDb> {
  const pg = await PGlite.create();
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
      try {
        return await sql(`select * from ${fn}(${list})`, Object.values(args));
      } catch (error) {
        throw new RpcError(pgCode(error));
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
