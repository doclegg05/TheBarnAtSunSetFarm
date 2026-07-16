import { Photo } from '../types';

const IMAGE_EXTENSION = /\.(avif|gif|jpe?g|png|webp)$/i;

/**
 * Turns the result of an eager `import.meta.glob(..., { query: '?url' })`
 * over a photo folder into a sorted Photo list. Non-image files (e.g.
 * Thumbs.db, README) are ignored. Sorting is filename-based and
 * number-aware, so "Barn 2" comes before "Barn 10" — prefix filenames
 * with numbers to control display order.
 */
export function photosFromFolder(files: Record<string, unknown>): Photo[] {
  return Object.entries(files)
    .filter(([path]) => IMAGE_EXTENSION.test(path))
    .sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    )
    .map(([path, url], index) => {
      const alt = (path.split('/').pop() ?? '')
        .replace(IMAGE_EXTENSION, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      return { id: index + 1, url: url as string, alt };
    });
}
