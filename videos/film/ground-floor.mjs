// Draws videos/film/ground-floor.png, the ground-floor layout Britt confirmed.
// Rough proportions only (not measured). Run: node videos/film/ground-floor.mjs
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');
// 1 m = 34 px. Front (cedar doors) at the bottom, back porch at the top.
const S = 34,
  ox = 270,
  oy = 300;
const X = (m) => ox + m * S,
  Y = (m) => oy + (18 - m) * S;
const rect = (x0, y0, x1, y1, fill, stroke = '#2b2b2b', w = 3, dash = '') =>
  `<rect x="${X(x0)}" y="${Y(y1)}" width="${(x1 - x0) * S}" height="${(y1 - y0) * S}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const poly = (pts, fill, stroke = '#2b2b2b', w = 3) =>
  `<polygon points="${pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
const text = (x, y, t, size = 17, weight = 600, fill = '#222') =>
  `<text x="${X(x)}" y="${Y(y)}" font-family="DejaVu Sans, Arial" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle">${t}</text>`;
const PINE = '#f2dfb8',
  HOUSE = '#e9edf0',
  PORCH = '#e3d2bd',
  KITCHEN = '#dfe8dc';
const WALL = 11.5; // back wall of the reception hall
const LEG = 7.0; // how far the kitchen reaches into the hall
const KX = 4.0; // kitchen's inner wall
let g = '';
g += `<polygon points="${[
  [-4.6, 0],
  [0, 0],
  [0, 18],
  [12.2, 18],
  [12.2, 22.6],
  [-4.6, 22.6],
]
  .map(([x, y]) => `${X(x)},${Y(y)}`)
  .join(
    ' '
  )}" fill="${PORCH}" stroke="#8a6a4a" stroke-width="2" stroke-dasharray="8 6"/>`;
g +=
  text(-2.3, 9.6, 'Covered', 16, 700, '#6b4b2b') +
  text(-2.3, 8.9, 'porch', 16, 700, '#6b4b2b');
g += text(-2.3, 8.0, '(wraps round the back)', 12, 400, '#6b4b2b');
g += text(
  6.1,
  20.6,
  'Covered porch (ends at the back-right corner)',
  15,
  700,
  '#6b4b2b'
);
// Reception hall fills the front; the house is an upside-down L over it.
g += rect(0, 0, 12.2, 18, PINE);
g += rect(0, LEG, 12.2, 18, HOUSE);
g += rect(0, LEG, KX, 18, KITCHEN, '#2b2b2b', 2);
g +=
  text(KX / 2, 14.2, 'Kitchen', 16, 700) +
  text(KX / 2, 13.5, '+ island', 13, 400, '#555');
g +=
  text(6.7, 16.6, 'Living room', 16, 700) +
  text(6.7, 16.0, '+ stone fireplace', 13, 400, '#555') +
  text(6.7, 15.4, '+ dining (loft above)', 13, 400, '#555');
g += text(6.7, 13.4, 'THE HOUSE', 20, 800, '#34495e');
g +=
  text(KX / 2, 9.4, 'Staircase', 14, 700) +
  text(KX / 2, 8.8, '+ coffee bar', 11, 400, '#555');
g +=
  rect(12.2 - 2.8, 14.6, 12.2, 18, '#f1f3f6', '#2b2b2b', 2) +
  text(10.8, 16.4, 'Bedroom', 13, 700);
g +=
  rect(12.2 - 2.8, WALL, 12.2, 14.6, '#f1f3f6', '#2b2b2b', 2) +
  text(10.8, 13.0, 'Bathroom', 13, 700);
// Restrooms stacked on the hall's back wall.
// Restrooms stacked against the kitchen wall; storage rooms the same size opposite.
const RW = 2.8,
  R1 = LEG,
  R2 = (LEG + WALL) / 2;
g +=
  rect(KX + RW, LEG, 12.2 - RW, WALL, '#fbfaf6', '#2b2b2b', 1) +
  text(8.1, LEG + 1.6, 'Hallway', 12, 700, '#777');
g +=
  rect(KX, R1, KX + RW, R2, '#ffffff', '#2b2b2b', 2) +
  text(KX + RW / 2, R1 + 1.0, 'Restroom', 12, 700);
g +=
  rect(KX, R2, KX + RW, WALL, '#ffffff', '#2b2b2b', 2) +
  text(KX + RW / 2, R2 + 1.0, 'Restroom', 12, 700);
g +=
  rect(12.2 - RW, R1, 12.2, R2, '#f7f3ea', '#2b2b2b', 2) +
  text(12.2 - RW / 2, R1 + 1.0, 'Storage', 12, 700, '#555');
g +=
  rect(12.2 - RW, R2, 12.2, WALL, '#f7f3ea', '#2b2b2b', 2) +
  text(12.2 - RW / 2, R2 + 1.0, 'Storage', 12, 700, '#555');
for (const [x, y] of [
  [KX + RW, R1 + 0.7],
  [KX + RW, R2 + 0.7],
  [12.2 - RW, R1 + 0.7],
  [12.2 - RW, R2 + 0.7],
])
  g += `<rect x="${X(x) - 4}" y="${Y(y + 0.8)}" width="8" height="${0.8 * S}" fill="#555"/>`;
g += `<rect x="${X(1.4)}" y="${Y(LEG) - 5}" width="${1.2 * S}" height="10" fill="#c8742e"/>`;
g += text(KX / 2, LEG - 0.75, 'Door under the stairs', 11, 700, '#a0521a');
g +=
  text(6.1, 3.9, 'RECEPTION HALL', 22, 800) +
  text(6.1, 3.1, 'open, pine walls, posts', 14, 400, '#555');
for (const x of [4.0, 8.2])
  for (const y of [1.8, 5.0])
    g += `<rect x="${X(x) - 5}" y="${Y(y) - 5}" width="10" height="10" fill="#a7814f"/>`;
g += `<rect x="${X(4.15)}" y="${Y(0) - 6}" width="${3.9 * S}" height="12" fill="#c8742e"/>`;
g += text(6.1, -1.0, '▲ Cedar sliding doors (front)', 16, 700, '#a0521a');
g += `<rect x="${X(5.0)}" y="${Y(18) - 6}" width="${3.4 * S}" height="12" fill="#5dade2"/>`;
g += text(6.7, 18.9, 'Big windows + sliding door', 13, 700, '#2e86c1');
const W = X(12.2) + 120,
  H = Y(-2.2) + 30;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="100%" height="100%" fill="#fffdf8"/>
<text x="${W / 2}" y="40" font-family="DejaVu Sans, Arial" font-size="26" font-weight="800" fill="#222" text-anchor="middle">Ground floor (from Britt, 2026-10-19)</text>
<text x="${W / 2}" y="68" font-family="DejaVu Sans, Arial" font-size="15" fill="#666" text-anchor="middle">Rooms to scale with each other, not measured</text>
${g}</svg>`;
await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL('ground-floor.png', import.meta.url).pathname);
