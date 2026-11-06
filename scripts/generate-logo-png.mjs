import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const W = 800;
const H = 800;
const buf = new Uint8Array(W * H * 4);

function blendPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= W || y < 0 || y >= H || a <= 0) return;
  const idx = (y * W + x) * 4;
  const alpha = Math.min(1, Math.max(0, a));
  const inv = 1 - alpha;
  buf[idx] = Math.round(r * alpha + buf[idx] * inv);
  buf[idx + 1] = Math.round(g * alpha + buf[idx + 1] * inv);
  buf[idx + 2] = Math.round(b * alpha + buf[idx + 2] * inv);
  buf[idx + 3] = 255;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// 1. Deep radial dark-emerald/obsidian background
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - 400, y - 360) / 480;
    const t = Math.min(1, d);
    const r = Math.round(15 * (1 - t) + 6 * t);
    const g = Math.round(42 * (1 - t) + 10 * t);
    const b = Math.round(45 * (1 - t) + 18 * t);
    const idx = (y * W + x) * 4;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = 255;
  }
}

function drawRing(cx, cy, radius, thickness, r, g, b, maxA = 1) {
  const minX = Math.max(0, Math.floor(cx - radius - thickness - 2));
  const maxX = Math.min(W - 1, Math.ceil(cx + radius + thickness + 2));
  const minY = Math.max(0, Math.floor(cy - radius - thickness - 2));
  const maxY = Math.min(H - 1, Math.ceil(cy + radius + thickness + 2));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.abs(Math.hypot(x - cx, y - cy) - radius);
      if (dist <= thickness + 1.5) {
        const a = Math.max(0, Math.min(1, thickness + 0.5 - dist)) * maxA;
        blendPixel(x, y, r, g, b, a);
      }
    }
  }
}

function drawDisc(cx, cy, radius, r, g, b, maxA = 1) {
  const minX = Math.max(0, Math.floor(cx - radius - 2));
  const maxX = Math.min(W - 1, Math.ceil(cx + radius + 2));
  const minY = Math.max(0, Math.floor(cy - radius - 2));
  const maxY = Math.min(H - 1, Math.ceil(cy + radius + 2));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist <= radius + 1.5) {
        const a = Math.max(0, Math.min(1, radius + 0.5 - dist)) * maxA;
        blendPixel(x, y, r, g, b, a);
      }
    }
  }
}

function drawSegment(x1, y1, x2, y2, radius, r1, g1, b1, r2, g2, b2, maxA = 1) {
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - radius - 3));
  const maxX = Math.min(W - 1, Math.ceil(Math.max(x1, x2) + radius + 3));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - radius - 3));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(y1, y2) + radius + 3));
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = distToSegment(x, y, x1, y1, x2, y2);
      if (dist <= radius + 1.5) {
        let t = ((x - x1) * dx + (y - y1) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        const r = r1 + (r2 - r1) * t;
        const g = g1 + (g2 - g1) * t;
        const b = b1 + (b2 - b1) * t;
        const a = Math.max(0, Math.min(1, radius + 0.5 - dist)) * maxA;
        blendPixel(x, y, r, g, b, a);
      }
    }
  }
}

// 2. Outer subtle rings
drawRing(400, 400, 340, 2.5, 16, 185, 129, 0.35);
drawRing(400, 400, 305, 1.5, 6, 182, 212, 0.22);

// 3. Hexagon shield outline & dark fill
const hexPts = [
  [400, 125],
  [628, 255],
  [628, 515],
  [400, 645],
  [172, 515],
  [172, 255],
];

// Fill inside hexagon with dark slate
for (let y = 125; y <= 645; y++) {
  for (let x = 172; x <= 628; x++) {
    let inside = true;
    for (let i = 0; i < 6; i++) {
      const [x1, y1] = hexPts[i];
      const [x2, y2] = hexPts[(i + 1) % 6];
      const cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
      if (cross < 0) {
        inside = false;
        break;
      }
    }
    if (inside) {
      blendPixel(x, y, 10, 17, 30, 0.78);
    }
  }
}

// Hexagon glowing border
for (let i = 0; i < 6; i++) {
  const [x1, y1] = hexPts[i];
  const [x2, y2] = hexPts[(i + 1) % 6];
  drawSegment(x1, y1, x2, y2, 10, 16, 185, 129, 6, 182, 212, 0.18);
  drawSegment(x1, y1, x2, y2, 4, 52, 211, 153, 6, 182, 212, 0.85);
}

// 4. Ascending 4-Milestone Path (with ambient glow)
const nodes = [
  [245, 480],
  [340, 385],
  [430, 425],
  [548, 272],
];

for (let i = 0; i < nodes.length - 1; i++) {
  const [x1, y1] = nodes[i];
  const [x2, y2] = nodes[i + 1];
  // Outer glow
  drawSegment(x1, y1, x2, y2, 24, 16, 185, 129, 6, 182, 212, 0.2);
  // Core line
  drawSegment(x1, y1, x2, y2, 11, 16, 185, 129, 6, 182, 212, 1);
}

// 5. Milestone Nodes 1, 2, 3
for (let i = 0; i < 3; i++) {
  const [nx, ny] = nodes[i];
  drawDisc(nx, ny, 28, 9, 13, 22, 1);
  drawDisc(nx, ny, 20, 16, 185, 129, 1);
  drawDisc(nx, ny, 8, 209, 250, 229, 0.9);
}

// 6. Final Launch Node 4 (Larger Checkmark Badge)
const [fx, fy] = nodes[3];
drawDisc(fx, fy, 62, 6, 182, 212, 0.22);
drawDisc(fx, fy, 52, 9, 13, 22, 1);
drawDisc(fx, fy, 43, 16, 185, 129, 1);
// Checkmark inside node 4
drawSegment(fx - 18, fy + 1, fx - 4, fy + 15, 5.5, 5, 8, 15, 5, 8, 15, 1);
drawSegment(fx - 4, fy + 15, fx + 21, fy - 12, 5.5, 5, 8, 15, 5, 8, 15, 1);

// 7. Bottom Verification Pill
drawSegment(320, 540, 480, 540, 22, 16, 185, 129, 6, 182, 212, 0.18);
drawSegment(320, 540, 480, 540, 19, 9, 15, 26, 9, 15, 26, 0.95);
// Small checkmark + progress bar inside bottom pill
drawSegment(330, 540, 338, 548, 3, 52, 211, 153, 52, 211, 153, 1);
drawSegment(338, 548, 353, 532, 3, 52, 211, 153, 52, 211, 153, 1);
drawSegment(372, 540, 465, 540, 5, 16, 185, 129, 6, 182, 212, 1);

// Encode as valid 32-bit RGBA PNG
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, combined, crcBuf]);
}

const rawData = Buffer.alloc(H * (W * 4 + 1));
for (let y = 0; y < H; y++) {
  rawData[y * (W * 4 + 1)] = 0; // filter type 0
  Buffer.from(buf.buffer, y * W * 4, W * 4).copy(rawData, y * (W * 4 + 1) + 1);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const idat = zlib.deflateSync(rawData, { level: 9 });
const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const png = Buffer.concat([
  pngSig,
  makeChunk('IHDR', ihdr),
  makeChunk('IDAT', idat),
  makeChunk('IEND', Buffer.alloc(0)),
]);

const outPath = path.resolve('public/milestonechain-logo.png');
fs.writeFileSync(outPath, png);
console.log(`Generated 800x800 Twitter PNG logo at: ${outPath} (${png.length} bytes)`);
