// Draws videos/film/ground-floor.png, the ground-floor layout as Britt described it.
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
const LEG = 9.0; // reception hall and house are the same size     // how far the kitchen reaches into the hall
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
  text(KX / 2, 15.2, 'Kitchen', 16, 700) +
  text(KX / 2, 14.5, '+ island', 13, 400, '#555');
g +=
  text(8.1, 16.6, 'Living room', 16, 700) +
  text(8.1, 16.0, '+ stone fireplace', 13, 400, '#555') +
  text(8.1, 15.4, '+ dining (loft above)', 13, 400, '#555');
g += text(8.1, 14.3, 'THE HOUSE', 20, 800, '#34495e');
g += '';
// Staircase along the hall wall, just right of the door into the hall.
g += rect(4.6, LEG, 12.2, LEG + 1.2, '#f7f1e6', '#2b2b2b', 2);
for (let x = 5.0; x < 12.2; x += 0.4)
  g += `<line x1="${X(x)}" y1="${Y(LEG + 1.2)}" x2="${X(x)}" y2="${Y(LEG)}" stroke="#8a7a66" stroke-width="1"/>`;
g += text(8.4, LEG + 1.7, 'Staircase + coffee bar', 12, 700);

// Restrooms stacked on the hall's back wall.
// Bump-out on the right, one room deep: restrooms for the hall, bedroom and
// bathroom for the house. A clean wall separates the house and the hall.
const BX = 12.2,
  BW = 2.8;
// Restrooms side by side at the back of the hall, right up against the
// house's bathroom; bathroom and bedroom run on behind them.
const RD = 2.2,
  HW = BW / 2,
  HD = 1.3;
// Restrooms side by side against the house bathroom, then a hallway open to
// the reception hall, then two storage rooms the same size.
g +=
  rect(BX, LEG - RD, BX + HW, LEG, '#ffffff', '#2b2b2b', 2) +
  text(BX + HW / 2, LEG - 1.0, 'WC', 12, 700);
g +=
  rect(BX + HW, LEG - RD, BX + BW, LEG, '#ffffff', '#2b2b2b', 2) +
  text(BX + HW * 1.5, LEG - 1.0, 'WC', 12, 700);
g +=
  rect(BX, LEG - RD - HD, BX + BW, LEG - RD, '#fbfaf6', '#2b2b2b', 2) +
  text(BX + BW / 2, LEG - RD - 0.8, 'Hallway', 11, 700, '#777');
g +=
  rect(BX, LEG - 2 * RD - HD, BX + HW, LEG - RD - HD, '#f7f3ea', '#2b2b2b', 2) +
  text(BX + HW / 2, LEG - RD - HD - 1.0, 'Store', 11, 700, '#555');
g +=
  rect(
    BX + HW,
    LEG - 2 * RD - HD,
    BX + BW,
    LEG - RD - HD,
    '#f7f3ea',
    '#2b2b2b',
    2
  ) + text(BX + HW * 1.5, LEG - RD - HD - 1.0, 'Store', 11, 700, '#555');
// Opening from the hall into the hallway; doors off the hallway.
g += `<rect x="${X(BX) - 3}" y="${Y(LEG - RD)}" width="6" height="${HD * S}" fill="${PINE}"/>`;
for (const x of [BX + 0.3, BX + HW + 0.3]) {
  g += `<rect x="${X(x)}" y="${Y(LEG - RD) - 4}" width="${0.8 * S}" height="8" fill="#555"/>`;
  g += `<rect x="${X(x)}" y="${Y(LEG - RD - HD) - 4}" width="${0.8 * S}" height="8" fill="#555"/>`;
}
g +=
  rect(BX, LEG, BX + BW, 12.9, '#f1f3f6', '#2b2b2b', 2) +
  text(BX + BW / 2, 10.9, 'Bathroom', 13, 700);
g +=
  rect(BX, 12.9, BX + BW, 18, '#f1f3f6', '#2b2b2b', 2) +
  text(BX + BW / 2, 15.4, 'Bedroom', 13, 700);
g += `<rect x="${X(1.4)}" y="${Y(LEG) - 5}" width="${1.2 * S}" height="10" fill="#c8742e"/>`;
g += text(2.0, LEG - 0.75, 'Door to the hall', 11, 700, '#a0521a');
g +=
  text(6.1, 4.8, 'RECEPTION HALL', 22, 800) +
  text(6.1, 4.0, 'open, pine walls, posts', 14, 400, '#555');
for (const x of [4.0, 8.2])
  for (const y of [2.3, 6.8])
    g += `<rect x="${X(x) - 5}" y="${Y(y) - 5}" width="10" height="10" fill="#a7814f"/>`;
g += `<rect x="${X(4.15)}" y="${Y(0) - 6}" width="${3.9 * S}" height="12" fill="#c8742e"/>`;
g += `<rect x="${X(4.6)}" y="${Y(0) - 3}" width="${3.0 * S}" height="6" fill="#5dade2"/>`;
for (const x of [2.4, 8.6])
  g += `<rect x="${X(x)}" y="${Y(0) - 3}" width="${1.2 * S}" height="6" fill="#5dade2"/>`;
g += text(6.1, -1.0, '▲ Cedar sliding doors (front)', 16, 700, '#a0521a');
g += text(
  6.1,
  0.5,
  'White French doors inside, a window each side',
  12,
  700,
  '#2e86c1'
);
g += `<rect x="${X(5.0)}" y="${Y(18) - 6}" width="${3.4 * S}" height="12" fill="#5dade2"/>`;
g += text(6.7, 18.9, 'Big windows + sliding door', 13, 700, '#2e86c1');
const W = X(15.0) + 60,
  H = Y(-2.2) + 30;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="100%" height="100%" fill="#fffdf8"/>
<text x="${W / 2}" y="40" font-family="DejaVu Sans, Arial" font-size="26" font-weight="800" fill="#222" text-anchor="middle">Ground floor (from Britt, 2026-10-19)</text>
<text x="${W / 2}" y="68" font-family="DejaVu Sans, Arial" font-size="15" fill="#666" text-anchor="middle">Rooms to scale with each other, not measured</text>
${g}</svg>`;
await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL('ground-floor.png', import.meta.url).pathname);
