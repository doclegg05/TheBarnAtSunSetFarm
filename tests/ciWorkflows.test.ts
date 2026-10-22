// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const WORKFLOWS_DIR = fileURLToPath(
  new URL('../.github/workflows/', import.meta.url)
);

const workflows = readdirSync(WORKFLOWS_DIR)
  .filter((name) => name.endsWith('.yml'))
  .map((name) => ({
    name,
    text: readFileSync(`${WORKFLOWS_DIR}${name}`, 'utf8'),
  }));

describe.each(workflows)('.github/workflows/$name', ({ text }) => {
  it('gives the workflow token read-only access to the code', () => {
    expect(text).toMatch(/^permissions:\n {2}contents: read\n/m);
  });

  it('checks each downloaded release against a pinned SHA-256 before unpacking it', () => {
    expect(text).not.toMatch(/curl[^\n]*\|\s*tar/);
    const downloads = text.match(/releases\/download\//g) ?? [];
    const checks =
      text.match(/echo "[0-9a-f]{64} {2}\S+" \| sha256sum --check --strict/g) ??
      [];
    expect(checks).toHaveLength(downloads.length);
  });
});
