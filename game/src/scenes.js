// scenes.js — three original hand-drawn scenes for "Senja, Pasar & Pantai".
// Every scene is painted procedurally on a canvas (no images, no network).
// Each level lists 7 differences; drawScene(ctx, w, h, variantIds) paints the
// LEFT panel when variantIds is empty and the RIGHT panel when it holds the
// ids that must look different. Every differing element is drawn by one
// small helper that branches on its own variant flag, so the two panels
// share all geometry and only the seven chosen details change.

export const SCENE_W = 560;
export const SCENE_H = 480;

function sky(ctx, w, h, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h * 0.62);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function cloud(ctx, x, y, s, color, puffs) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 22 * s, 0, Math.PI * 2);
  if (puffs >= 3) ctx.arc(x + 42 * s, y, 17 * s, 0, Math.PI * 2);
  ctx.fill();
}

function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x - 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.95);
  ctx.arc(x + 7 * s, y, 7 * s, Math.PI * 1.05, Math.PI * 1.85);
  ctx.stroke();
}

function flower(ctx, x, y, petal) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6, petal);
  }
  circle(ctx, x, y, 5, '#ffd93b');
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x, y + 26);
  ctx.stroke();
}

// ---------------------------------------------------------------- level 1
// "Taman Senja" — a city park at dusk: sun, pond, bench, cat, flowers.
function drawPark(ctx, v) {
  const w = SCENE_W, h = SCENE_H;
  sky(ctx, w, h, '#ff9a5c', '#7b5ea7');
  // sun with (or without) rays
  circle(ctx, 90, 82, 30, '#ffd93b');
  if (!v.has('sun-rays')) {
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(90 + Math.cos(a) * 38, 82 + Math.sin(a) * 38);
      ctx.lineTo(90 + Math.cos(a) * 50, 82 + Math.sin(a) * 50);
      ctx.stroke();
    }
  }
  cloud(ctx, 450, 62, 1, '#ffe3c2', v.has('cloud') ? 2 : 3);
  cloud(ctx, 240, 46, 0.7, '#ffd9b0', 3);
  // birds: two always, a third only on the variant panel
  bird(ctx, 300, 72, 1, '#4a2c5a');
  bird(ctx, 342, 56, 1, '#4a2c5a');
  if (v.has('bird')) bird(ctx, 392, 92, 1, '#4a2c5a');
  // distant hills + trees
  ellipse(ctx, 90, 330, 190, 70, '#5b7a4a');
  ellipse(ctx, 480, 330, 200, 80, '#4e6e42');
  rect(ctx, 0, 300, w, 180, '#6fa055');
  // winding path
  ctx.fillStyle = '#d9b380';
  ctx.beginPath();
  ctx.moveTo(230, 480);
  ctx.lineTo(270, 300);
  ctx.lineTo(300, 300);
  ctx.lineTo(330, 480);
  ctx.closePath();
  ctx.fill();
  // pond
  ellipse(ctx, 440, 430, 105, 42, '#4db2e8');
  ellipse(ctx, 440, 428, 88, 32, '#7cc7ef');
  if (!v.has('duck')) {
    ellipse(ctx, 415, 428, 16, 10, '#fff3b0');
    circle(ctx, 428, 420, 8, '#fff3b0');
    circle(ctx, 431, 418, 1.8, '#222');
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(436, 420);
    ctx.lineTo(444, 422);
    ctx.lineTo(436, 424);
    ctx.closePath();
    ctx.fill();
  }
  // bench (slats: 3 base, 2 variant)
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(300, 348, 110, 10);
  ctx.fillRect(300, 366, 110, 10);
  if (!v.has('bench')) ctx.fillRect(300, 384, 110, 10);
  ctx.fillRect(306, 358, 8, 44);
  ctx.fillRect(396, 358, 8, 44);
  ctx.fillRect(300, 330, 8, 22);
  ctx.fillRect(402, 330, 8, 22);
  // cat sitting beside the bench, tail up or down
  ctx.fillStyle = '#3d3d3d';
  ellipse(ctx, 470, 408, 20, 16, '#3d3d3d');
  circle(ctx, 470, 388, 13, '#3d3d3d');
  ctx.beginPath();
  ctx.moveTo(460, 380); ctx.lineTo(458, 366); ctx.lineTo(466, 378);
  ctx.moveTo(480, 380); ctx.lineTo(482, 366); ctx.lineTo(474, 378);
  ctx.fill();
  ctx.strokeStyle = '#3d3d3d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (!v.has('cat-tail')) {
    ctx.moveTo(488, 412);
    ctx.quadraticCurveTo(508, 400, 502, 378);
  } else {
    ctx.moveTo(488, 412);
    ctx.quadraticCurveTo(506, 420, 500, 432);
  }
  ctx.stroke();
  // flowers along the path (one changes colour)
  flower(ctx, 140, 420, v.has('flower') ? '#3b82f6' : '#e63946');
  flower(ctx, 180, 440, '#e63946');
  flower(ctx, 110, 445, '#f4a259');
  flower(ctx, 520, 445, '#e63946');
  flower(ctx, 60, 400, '#f4a259');
  // big tree, left
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(48, 240, 18, 90);
  circle(ctx, 57, 215, 48, '#2f6b2f');
  circle(ctx, 28, 240, 30, '#357a35');
  circle(ctx, 88, 240, 30, '#357a35');
}

// ---------------------------------------------------------------- level 2
// "Pasar Malam" — a night market: lanterns, stalls, string lights, moon.
function drawMarket(ctx, v) {
  const w = SCENE_W, h = SCENE_H;
  sky(ctx, w, h, '#0b1026', '#27355e');
  // moon: full base, crescent variant
  circle(ctx, 84, 56, 26, '#f5f0c8');
  if (v.has('moon')) circle(ctx, 96, 50, 24, '#27355e');
  // stars, one extra on the variant panel
  ctx.fillStyle = '#fff8d6';
  const stars = [[180, 40], [260, 70], [330, 36], [420, 80], [500, 44], [150, 110], [370, 110]];
  for (const [x, y] of stars) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (v.has('star')) {
    ctx.beginPath();
    ctx.arc(480, 52, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // string lights across the top
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(280, 150, 560, 96);
  ctx.stroke();
  const bulbs = [70, 140, 210, 280, 350, 420, 490];
  bulbs.forEach((x, i) => {
    const y = 96 + Math.sin((x / 560) * Math.PI) * 34;
    if (v.has('bulb') && i === 3) return; // one bulb dark on variant
    circle(ctx, x, y + 8, 7, i % 2 ? '#ffd93b' : '#ff6b6b');
  });
  // ground
  rect(ctx, 0, 330, w, 150, '#3a2b22');
  // stall 1 with sign: SATE base, SOTO variant
  rect(ctx, 60, 210, 180, 130, '#8b4513');
  rect(ctx, 50, 190, 200, 26, '#a0522d');
  rect(ctx, 130, 330, 10, 20, '#5d3a1a');
  rect(ctx, 220, 330, 10, 20, '#5d3a1a');
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(v.has('sign') ? 'SOTO' : 'SATE', 150, 210);
  ctx.font = '14px sans-serif';
  ctx.fillText('Rp 10rb', 150, 232);
  // lantern hanging by stall 1 (changes colour)
  ctx.strokeStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(90, 216);
  ctx.lineTo(90, 236);
  ctx.stroke();
  ellipse(ctx, 90, 252, 16, 20, v.has('lantern') ? '#2fbf71' : '#e63946');
  rect(ctx, 82, 230, 16, 6, '#ffd93b');
  // food cart with wheels: two base, one variant
  rect(ctx, 300, 280, 170, 70, '#4a6fa5');
  rect(ctx, 292, 268, 186, 16, '#35507a');
  circle(ctx, 330, 356, 14, '#222');
  circle(ctx, 330, 356, 6, '#999');
  if (!v.has('wheel')) {
    circle(ctx, 440, 356, 14, '#222');
    circle(ctx, 440, 356, 6, '#999');
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('ES TEH', 385, 312);
  // balloon tied to the cart: present base, gone variant
  if (!v.has('balloon')) {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(480, 268);
    ctx.quadraticCurveTo(500, 230, 505, 205);
    ctx.stroke();
    ellipse(ctx, 508, 186, 16, 20, '#ff6b9d');
    ctx.beginPath();
    ctx.moveTo(508, 206);
    ctx.lineTo(502, 214);
    ctx.lineTo(514, 214);
    ctx.closePath();
    ctx.fillStyle = '#ff6b9d';
    ctx.fill();
  }
  // vendor behind the cart
  circle(ctx, 385, 250, 16, '#f2c29b');
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.arc(385, 250, 16, Math.PI, 0);
  ctx.fill();
  rect(ctx, 362, 262, 46, 22, '#e63946');
  // string of flags
  ctx.strokeStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(560, 130);
  ctx.stroke();
  const flagColors = ['#e63946', '#ffd93b', '#2fbf71', '#3b82f6'];
  for (let i = 0; i < 8; i++) {
    const x = 30 + i * 68;
    const y = 148 - i * 2.5;
    ctx.fillStyle = flagColors[i % 4];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18, y - 1);
    ctx.lineTo(x + 9, y + 16);
    ctx.closePath();
    ctx.fill();
  }
}

// ---------------------------------------------------------------- level 3
// "Pantai Pagi" — a morning beach: umbrella, palm, boat, crab, shells.
function drawBeach(ctx, v) {
  const w = SCENE_W, h = SCENE_H;
  sky(ctx, w, h, '#aee7ff', '#e8f9ff');
  circle(ctx, 470, 70, 28, '#ffd93b');
  cloud(ctx, 120, 60, 0.9, '#ffffff', 3);
  cloud(ctx, 320, 44, 0.7, '#ffffff', 3);
  // sea
  rect(ctx, 0, 190, w, 130, '#2fa8d8');
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 230); ctx.quadraticCurveTo(90, 222, 150, 230);
  ctx.moveTo(330, 250); ctx.quadraticCurveTo(390, 242, 450, 250);
  ctx.moveTo(180, 290); ctx.quadraticCurveTo(240, 282, 300, 290);
  ctx.stroke();
  // boat with sail (sail changes colour)
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.moveTo(400, 250);
  ctx.lineTo(480, 250);
  ctx.lineTo(465, 272);
  ctx.lineTo(415, 272);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(440, 250);
  ctx.lineTo(440, 185);
  ctx.stroke();
  ctx.fillStyle = v.has('sail') ? '#ffd93b' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(440, 190);
  ctx.lineTo(440, 246);
  ctx.lineTo(478, 246);
  ctx.closePath();
  ctx.fill();
  // sand
  rect(ctx, 0, 320, w, 160, '#f2d8a0');
  ellipse(ctx, 280, 330, 200, 14, '#e8c88a');
  // footprints: present base, gone variant
  if (!v.has('footprints')) {
    ctx.fillStyle = '#c9a86a';
    for (let i = 0; i < 5; i++) {
      ellipse(ctx, 200 + i * 26, 380 + (i % 2) * 10, 7, 4, '#c9a86a');
    }
  }
  // palm with coconuts (3 base, 2 variant)
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(90, 330);
  ctx.quadraticCurveTo(80, 250, 95, 195);
  ctx.stroke();
  ctx.strokeStyle = '#2f8f3a';
  ctx.lineWidth = 8;
  for (const [dx, dy] of [[-38, -14], [-28, 6], [30, -18], [38, 2], [0, -30]]) {
    ctx.beginPath();
    ctx.moveTo(95, 195);
    ctx.quadraticCurveTo(95 + dx, 195 + dy, 95 + dx * 1.6, 195 + dy * 1.6);
    ctx.stroke();
  }
  circle(ctx, 88, 202, 9, '#6b4423');
  circle(ctx, 102, 206, 9, '#6b4423');
  if (!v.has('coconut')) circle(ctx, 96, 216, 9, '#6b4423');
  // umbrella (stripes change colour)
  const stripe = v.has('umbrella') ? '#3b82f6' : '#e63946';
  ctx.fillStyle = stripe;
  ctx.beginPath();
  ctx.arc(150, 300, 62, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(150, 300, 62, Math.PI, Math.PI * 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, 300, 62, Math.PI * 1.5, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = stripe;
  ctx.fill();
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(150, 300);
  ctx.lineTo(150, 400);
  ctx.stroke();
  // bucket (changes colour)
  ctx.fillStyle = v.has('bucket') ? '#2fbf71' : '#e63946';
  ctx.beginPath();
  ctx.moveTo(290, 410);
  ctx.lineTo(330, 410);
  ctx.lineTo(324, 448);
  ctx.lineTo(296, 448);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(310, 410, 18, Math.PI, 0);
  ctx.stroke();
  // shells (3 base, 2 variant)
  ctx.fillStyle = '#ff9f9f';
  ctx.beginPath(); ctx.arc(240, 440, 10, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(262, 444, 9, Math.PI, 0); ctx.fill();
  if (!v.has('shell')) {
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath(); ctx.arc(284, 440, 10, Math.PI, 0); ctx.fill();
  }
  // crab: present base, gone variant
  if (!v.has('crab')) {
    ctx.fillStyle = '#ff6b4a';
    ellipse(ctx, 420, 420, 24, 16, '#ff6b4a');
    circle(ctx, 406, 404, 4, '#222');
    circle(ctx, 434, 404, 4, '#222');
    ctx.strokeStyle = '#ff6b4a';
    ctx.lineWidth = 4;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(420 + 20 * sx, 412);
      ctx.lineTo(420 + 34 * sx, 400);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(420 + 20 * sx, 420);
      ctx.lineTo(420 + 36 * sx, 420);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(420 + 20 * sx, 428);
      ctx.lineTo(420 + 34 * sx, 438);
      ctx.stroke();
    }
  }
}

export const LEVELS = [
  {
    id: 'taman-senja',
    name: 'Level 1 — Taman Senja',
    hint: 'Taman kota saat matahari terbenam. Perhatikan matahari, langit, dan bangku.',
    draw: drawPark,
    differences: [
      { id: 'sun-rays', x: 90, y: 82, r: 42, label: 'Sinar matahari hilang' },
      { id: 'bird', x: 392, y: 92, r: 30, label: 'Burung tambahan' },
      { id: 'flower', x: 140, y: 420, r: 26, label: 'Warna bunga berubah' },
      { id: 'bench', x: 355, y: 366, r: 46, label: 'Papan bangku hilang' },
      { id: 'cloud', x: 462, y: 62, r: 42, label: 'Bentuk awan berubah' },
      { id: 'cat-tail', x: 482, y: 404, r: 34, label: 'Ekor kucing berubah' },
      { id: 'duck', x: 420, y: 426, r: 30, label: 'Bebek di kolam hilang' },
    ],
  },
  {
    id: 'pasar-malam',
    name: 'Level 2 — Pasar Malam',
    hint: 'Pasar malam yang ramai. Lampu, lampion, dan gerobak menyimpan rahasia.',
    draw: drawMarket,
    differences: [
      { id: 'lantern', x: 90, y: 252, r: 28, label: 'Warna lampion berubah' },
      { id: 'star', x: 480, y: 52, r: 26, label: 'Bintang tambahan' },
      { id: 'sign', x: 150, y: 205, r: 34, label: 'Tulisan papan berubah' },
      { id: 'balloon', x: 508, y: 186, r: 30, label: 'Balon hilang' },
      { id: 'moon', x: 84, y: 56, r: 34, label: 'Bulan jadi sabit' },
      { id: 'wheel', x: 440, y: 356, r: 26, label: 'Roda gerobak hilang' },
      { id: 'bulb', x: 280, y: 138, r: 24, label: 'Lampu gantung padam' },
    ],
  },
  {
    id: 'pantai-pagi',
    name: 'Level 3 — Pantai Pagi',
    hint: 'Pagi di pantai. Payung, perahu, dan kepiting — ada yang tidak sama.',
    draw: drawBeach,
    differences: [
      { id: 'umbrella', x: 150, y: 280, r: 50, label: 'Warna payung berubah' },
      { id: 'crab', x: 420, y: 420, r: 34, label: 'Kepiting hilang' },
      { id: 'sail', x: 458, y: 218, r: 32, label: 'Warna layar berubah' },
      { id: 'shell', x: 284, y: 440, r: 24, label: 'Kerang berkurang' },
      { id: 'coconut', x: 96, y: 216, r: 24, label: 'Kelapa berkurang' },
      { id: 'bucket', x: 310, y: 428, r: 30, label: 'Warna ember berubah' },
      { id: 'footprints', x: 260, y: 385, r: 40, label: 'Jejak kaki hilang' },
    ],
  },
];

export function drawScene(ctx, levelIndex, variantIds) {
  LEVELS[levelIndex].draw(ctx, variantIds);
}
