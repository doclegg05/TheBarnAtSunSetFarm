import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type HeaderRules = ReadonlyMap<string, Readonly<Record<string, string>>>;

const HEADERS_FILE = fileURLToPath(
  new URL('../public/_headers', import.meta.url)
);

/**
 * Reads public/_headers the way Netlify does: an unindented line names a path,
 * the indented `Name: value` lines below it are that path's headers, and lines
 * starting with # are comments.
 */
export function readHeadersFile(): HeaderRules {
  const rules = new Map<string, Record<string, string>>();
  let current: Record<string, string> | null = null;
  for (const line of readFileSync(HEADERS_FILE, 'utf8').split('\n')) {
    const text = line.trim();
    if (text === '' || text.startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = {};
      rules.set(text, current);
      continue;
    }
    const colon = text.indexOf(':');
    if (current === null || colon < 1) {
      throw new Error(`public/_headers has a header outside a path: ${text}`);
    }
    current[text.slice(0, colon).trim()] = text.slice(colon + 1).trim();
  }
  return rules;
}
