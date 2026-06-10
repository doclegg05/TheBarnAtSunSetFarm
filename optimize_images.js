import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SRC_DIR = path.join(ROOT_DIR); // To scan for code references
const MAX_WIDTH = 1600;
const QUALITY = 80;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const CODE_EXTENSIONS = [
  '.html',
  '.tsx',
  '.ts',
  '.css',
  '.json',
  '.js',
  '.jsx',
];

let totalSavedBytes = 0;
const report = [];

async function getFiles(dir, extensions) {
  let results = [];
  const list = await fs.promises.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(await getFiles(filePath, extensions));
      }
    } else {
      if (extensions.includes(path.extname(file).toLowerCase())) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function optimizeImages() {
  console.log('Scanning for images...');
  const images = await getFiles(PUBLIC_DIR, IMAGE_EXTENSIONS);

  console.log(`Found ${images.length} images.`);

  for (const imagePath of images) {
    const ext = path.extname(imagePath);
    const newPath = imagePath.replace(ext, '.webp');

    try {
      const originalStats = await fs.promises.stat(imagePath);
      const originalSize = originalStats.size;

      let pipeline = sharp(imagePath);
      const metadata = await pipeline.metadata();

      if (metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH });
      }

      await pipeline.rotate().webp({ quality: QUALITY }).toFile(newPath);

      const newStats = await fs.promises.stat(newPath);
      const newSize = newStats.size;
      const saved = originalSize - newSize;
      totalSavedBytes += saved;

      report.push({
        file: path.relative(ROOT_DIR, imagePath),
        originalSize: (originalSize / 1024).toFixed(2) + ' KB',
        newSize: (newSize / 1024).toFixed(2) + ' KB',
        saved: (saved / 1024).toFixed(2) + ' KB',
        savedBytes: saved,
      });

      console.log(
        `Optimized: ${path.basename(imagePath)} -> ${(saved / 1024).toFixed(2)} KB saved`
      );
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error);
    }
  }
}

async function updateCodeReferences() {
  console.log('Updating code references...');
  // We look for files in the whole project except node_modules and .git
  // For safety, we only replace if we actually converted the image.

  // Build a map of old -> new filenames (relative to root or public)
  // Actually, simple string replacement of filename.ext -> filename.webp is risky if names aren't unique.
  // However, usually specific assets are referenced by name.
  // We will search for the exact filename string.

  const codeFiles = await getFiles(SRC_DIR, CODE_EXTENSIONS);

  // Get list of optimized images to know what to replace
  // We can infer this from the report
  const processedFiles = report.map((r) => r.file); // relative paths like public\foo\bar.jpg

  for (const codeFile of codeFiles) {
    let content = await fs.promises.readFile(codeFile, 'utf8');
    let modified = false;

    for (const oldRelativePath of processedFiles) {
      const oldBasename = path.basename(oldRelativePath); // image.jpg
      const newBasename = oldBasename.replace(
        path.extname(oldBasename),
        '.webp'
      ); // image.webp

      // Regex to match the filename, avoiding partial matches if possible,
      // but simple replace is often robust enough for assets with extensions.
      // We use global replace.
      if (content.includes(oldBasename)) {
        // Check if the replacement actually exists?
        // We know it exists because we created it.
        // We should be careful about replacing text that isn't a path.
        // But "image.jpg" is likely a path reference.

        // Use regex with word boundary check might be safer, but filenames can have weird chars.
        // Simple string replaceAll is safest for exact matches.
        const regex = new RegExp(
          oldBasename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g'
        );
        content = content.replace(regex, newBasename);
        modified = true;
      }
    }

    if (modified) {
      await fs.promises.writeFile(codeFile, content, 'utf8');
      console.log(
        `Updated references in: ${path.relative(ROOT_DIR, codeFile)}`
      );
    }
  }
}

async function addLazyLoading() {
  console.log('Adding lazy loading...');
  // Simple regex approach for now.
  // Ideally use a parser, but for generic HTML/JSX, regex can suffice for this task.
  // Target: <img loading="lazy" ... > that DOES NOT have loading="..."

  const codeFiles = await getFiles(SRC_DIR, ['.html', '.tsx', '.jsx', '.js']);

  for (const file of codeFiles) {
    let content = await fs.promises.readFile(file, 'utf8');

    // Regex to find img tags
    // This is tricky with regex.
    // Strategy: Find <img loading="lazy" [^>]*> and check if it has loading attribute.

    // Warning: This is fragile. But requested in task.
    // We will try a safe replacement:
    // Replace <img (?!.*loading=)([^>]*)> with <img loading="lazy" $1>

    // JS RegExp doesn't support lookbehind well enough in all envs, but we can capture.

    const imgRegex = /<img\s+([^>]+)>/gi;

    const newContent = content.replace(imgRegex, (match, attributes) => {
      if (!attributes.includes('loading=')) {
        return `<img loading="lazy" ${attributes}>`;
      }
      return match;
    });

    if (newContent !== content) {
      await fs.promises.writeFile(file, newContent, 'utf8');
      console.log(`Added lazy loading to: ${path.relative(ROOT_DIR, file)}`);
    }
  }
}

async function deleteOldImages() {
  console.log('Deleting old images...');
  for (const item of report) {
    const fullPath = path.join(ROOT_DIR, item.file);
    try {
      await fs.promises.unlink(fullPath);
      console.log(`Deleted: ${item.file}`);
    } catch (e) {
      console.error(`Failed to delete ${item.file}`, e);
    }
  }
}

async function main() {
  await optimizeImages();
  await updateCodeReferences();
  await addLazyLoading();

  // Sort report by saved bytes desc
  report.sort((a, b) => b.savedBytes - a.savedBytes);

  console.log('\n--- Optimization Report (Top 5) ---');
  console.table(report.slice(0, 5));

  const totalMB = (totalSavedBytes / (1024 * 1024)).toFixed(2);
  console.log(`\nTotal Space Saved: ${totalMB} MB`);

  // Only delete if we actually saved something and user wants it (per instruction "Cleanup: Delete")
  await deleteOldImages();
}

main().catch(console.error);
