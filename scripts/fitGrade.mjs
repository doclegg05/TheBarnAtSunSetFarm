// Measures the colour grade a scroll film's published frames carry, so new
// frames cut from the same master can match it. Fits, per colour channel,
// published = gain * master + offset over a sample of frames.
//
//   node scripts/fitGrade.mjs path/to/master.mp4 <name> <fps>
//
// Prints a JSON grade for `node scripts/filmFrames.mjs ... --grade '<json>'`
// and the average error per channel before and after applying it.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const [source, name, fpsArg] = process.argv.slice(2);
const fps = Number(fpsArg);
const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..'
);
const framesDir = path.join(root, 'public', name, 'md');
if (!source || !fs.existsSync(framesDir) || !fps) {
  console.error('Usage: node scripts/fitGrade.mjs master.mp4 <name> <fps>');
  process.exit(1);
}

const published = fs.readdirSync(framesDir).filter((f) => f.endsWith('.avif'));
const samples = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((share) =>
  Math.round(share * (published.length - 1))
);
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'grade-'));
const SIZE = { width: 256, height: 144 };

const pixels = async (file) =>
  sharp(file).resize(SIZE.width, SIZE.height, { fit: 'fill' }).raw().toBuffer();

const pairs = [];
for (const index of samples) {
  const still = path.join(work, `${index}.png`);
  execFileSync('ffmpeg', [
    '-loglevel',
    'error',
    '-ss',
    String(index / fps),
    '-i',
    source,
    '-frames:v',
    '1',
    still,
  ]);
  const file = path.join(framesDir, String(index).padStart(3, '0') + '.avif');
  pairs.push([await pixels(still), await pixels(file)]);
}

const fit = [0, 1, 2].map((channel) => {
  let n = 0,
    sx = 0,
    sy = 0,
    sxx = 0,
    sxy = 0;
  for (const [master, graded] of pairs) {
    for (let i = channel; i < master.length; i += 3) {
      const x = master[i],
        y = graded[i];
      n += 1;
      sx += x;
      sy += y;
      sxx += x * x;
      sxy += x * y;
    }
  }
  const gain = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { gain, offset: (sy - gain * sx) / n };
});

const error = (apply) =>
  [0, 1, 2].map((channel) => {
    let total = 0,
      n = 0;
    for (const [master, graded] of pairs) {
      for (let i = channel; i < master.length; i += 3) {
        const x = apply
          ? fit[channel].gain * master[i] + fit[channel].offset
          : master[i];
        total += Math.abs(x - graded[i]);
        n += 1;
      }
    }
    return Math.round((total / n) * 10) / 10;
  });

fs.rmSync(work, { recursive: true, force: true });
console.log(
  JSON.stringify({
    grade: {
      gain: fit.map((c) => Math.round(c.gain * 1000) / 1000),
      offset: fit.map((c) => Math.round(c.offset * 10) / 10),
    },
    errorBefore: error(false),
    errorAfter: error(true),
  })
);
