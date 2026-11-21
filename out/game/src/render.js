// render.js — paints the two panels, the found-markers, the hint pulse,
// the wrong-click flash, the floating score particles and the crosshair.
// The scene painters live in scenes.js; this file only composes the frame.

import { SCENE_W, SCENE_H, drawScene } from './scenes.js';
import { PANEL_GAP } from './input.js';

export const CANVAS_W = SCENE_W * 2 + PANEL_GAP;
export const CANVAS_H = SCENE_H;

export class ParticleBurst {
  constructor(x, y, panel) {
    this.x = x;
    this.y = y;
    this.panel = panel;
    this.age = 0;
    this.life = 0.7;
    this.dots = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 40 + Math.random() * 70;
      this.dots.push({ vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: 2 + Math.random() * 3 });
    }
  }

  update(dt) {
    this.age += dt;
  }

  get done() {
    return this.age >= this.life;
  }

  draw(ctx, panelOffsetX) {
    const alpha = 1 - this.age / this.life;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffd93b';
    for (const d of this.dots) {
      ctx.beginPath();
      ctx.arc(panelOffsetX + this.x + d.vx * this.age, this.y + d.vy * this.age, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** Draw a green ring + check mark over a found difference on one panel. */
export function drawFoundMarker(ctx, offsetX, diff, pulse) {
  const r = diff.r + 4 + Math.sin(pulse) * 1.5;
  ctx.save();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(offsetX + diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(offsetX + diff.x, diff.y, Math.max(6, r - 9), 0, Math.PI * 2);
  ctx.stroke();
  // check mark
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(offsetX + diff.x - 10, diff.y);
  ctx.lineTo(offsetX + diff.x - 3, diff.y + 8);
  ctx.lineTo(offsetX + diff.x + 11, diff.y - 8);
  ctx.stroke();
  ctx.restore();
}

export function drawHintRing(ctx, offsetX, diff, now) {
  const r = diff.r + 10 + Math.sin(now * 6) * 5;
  ctx.save();
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(offsetX + diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawWrongFlash(ctx, offsetX, x, y, age) {
  const alpha = Math.max(0, 1 - age / 0.5);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const s = 12;
  ctx.beginPath();
  ctx.moveTo(offsetX + x - s, y - s);
  ctx.lineTo(offsetX + x + s, y + s);
  ctx.moveTo(offsetX + x + s, y - s);
  ctx.lineTo(offsetX + x - s, y + s);
  ctx.stroke();
  ctx.restore();
}

export function drawCrosshair(ctx, offsetX, x, y) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(offsetX + x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(offsetX + x - 22, y);
  ctx.lineTo(offsetX + x - 8, y);
  ctx.moveTo(offsetX + x + 8, y);
  ctx.lineTo(offsetX + x + 22, y);
  ctx.moveTo(offsetX + x, y - 22);
  ctx.lineTo(offsetX + x, y - 8);
  ctx.moveTo(offsetX + x, y + 8);
  ctx.lineTo(offsetX + x, y + 22);
  ctx.stroke();
  ctx.restore();
}

/** Paint one full frame: both panels, markers, effects, crosshair. */
export function renderFrame(ctx, state) {
  const { levelIndex, found, variantIds, particles, wrongFlash, hint, crosshair, now } = state;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawScene(ctx, levelIndex, new Set());
  ctx.save();
  ctx.translate(SCENE_W + PANEL_GAP, 0);
  drawScene(ctx, levelIndex, variantIds);
  ctx.restore();

  const level = state.level;
  for (const diff of level.differences) {
    if (!found.has(diff.id)) continue;
    drawFoundMarker(ctx, 0, diff, now * 3);
    drawFoundMarker(ctx, SCENE_W + PANEL_GAP, diff, now * 3);
  }
  if (hint && now - hint.at < 2.2) {
    drawHintRing(ctx, 0, hint.diff, now);
    drawHintRing(ctx, SCENE_W + PANEL_GAP, hint.diff, now);
  }
  if (wrongFlash && now - wrongFlash.at < 0.5) {
    const off = wrongFlash.panel === 0 ? 0 : SCENE_W + PANEL_GAP;
    drawWrongFlash(ctx, off, wrongFlash.x, wrongFlash.y, now - wrongFlash.at);
  }
  for (const p of particles) p.draw(ctx, p.panel === 0 ? 0 : SCENE_W + PANEL_GAP);
  if (crosshair.visible) {
    const off = crosshair.panel === 0 ? 0 : SCENE_W + PANEL_GAP;
    drawCrosshair(ctx, off, crosshair.x, crosshair.y);
  }
}
