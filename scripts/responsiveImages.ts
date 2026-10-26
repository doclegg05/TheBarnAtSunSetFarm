import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Plugin } from 'vite';

/**
 * `import photo from './x.webp?responsive'` gives `{ src, srcSet, width,
 * height }`: the photo re-encoded at a few widths so phones download a
 * fraction of what desktops do. Uses the sharp already in devDependencies;
 * resized files are cached in node_modules/.cache so rebuilds stay fast.
 */

const QUERY = '?responsive';
const WIDTHS = [480, 960, 1600];
const QUALITY = 78;

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

export const responsiveImages = (): Plugin => {
  let isBuild = false;
  let cacheDir = '';

  const variant = async (file: string, input: Buffer, width: number) => {
    const key = createHash('sha1')
      .update(input)
      .update(`${width}:${QUALITY}`)
      .digest('hex')
      .slice(0, 16);
    const cached = path.join(cacheDir, `${key}.webp`);
    try {
      return { file: cached, data: await fs.readFile(cached) };
    } catch {
      const data = await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cached, data);
      return { file: cached, data };
    }
  };

  return {
    name: 'responsive-images',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
      cacheDir = path.join(
        config.root,
        'node_modules/.cache/responsive-images'
      );
    },
    async resolveId(id, importer) {
      if (!id.endsWith(QUERY)) return null;
      const resolved = await this.resolve(
        id.slice(0, -QUERY.length),
        importer,
        {
          skipSelf: true,
        }
      );
      return resolved ? `${resolved.id}${QUERY}` : null;
    },
    async load(id) {
      if (!id.endsWith(QUERY)) return null;
      const file = id.slice(0, -QUERY.length);
      this.addWatchFile(file);
      const input = await fs.readFile(file);
      const { width = 0, height = 0 } = await sharp(input).metadata();
      const widths = [
        ...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 1920)]),
      ];
      const base = path
        .basename(file)
        .replace(/\.[^.]+$/, '')
        .replace(/[^\w-]+/g, '-');

      const urls: Array<{ width: number; url: string }> = [];
      for (const w of widths) {
        const { file: cached, data } = await variant(file, input, w);
        if (isBuild) {
          const ref = this.emitFile({
            type: 'asset',
            name: `${base}-${w}.webp`,
            source: data,
          });
          urls.push({ width: w, url: `import.meta.ROLLUP_FILE_URL_${ref}` });
        } else {
          urls.push({ width: w, url: JSON.stringify(`/@fs${cached}`) });
        }
      }
      const largest = urls[urls.length - 1];
      const middle = urls.find((u) => u.width >= 960) ?? largest;
      return [
        `const srcSet = [${urls.map((u) => `${u.url} + ' ${u.width}w'`).join(', ')}].join(', ');`,
        `export default { src: ${middle.url}, srcSet, width: ${width}, height: ${height} };`,
      ].join('\n');
    },
  };
};
