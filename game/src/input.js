// input.js — mouse and keyboard controls for the hunt.
// Mouse: click either panel to mark a difference.
// Keyboard: arrow keys move the crosshair, Enter/Space clicks at it,
// H asks for a hint, M toggles sound, N goes to the next level when offered.

export const PANEL_GAP = 40;
export const PANEL_TOP = 0;

export class Crosshair {
  constructor() {
    this.panel = 0; // 0 = left panel, 1 = right panel
    this.x = 280;
    this.y = 240;
    this.visible = false;
  }

  move(dx, dy, sceneW, sceneH) {
    this.visible = true;
    this.x = Math.max(0, Math.min(sceneW, this.x + dx));
    this.y = Math.max(0, Math.min(sceneH, this.y + dy));
  }

  switchPanel() {
    this.panel = this.panel === 0 ? 1 : 0;
  }
}

/**
 * Convert a canvas click (offsetX/offsetY in CSS pixels) into a scene hit:
 * { panel: 0|1, x, y } in scene coordinates, or null when the click fell
 * in the gap between panels or outside them.
 */
export function canvasClickToScene(event, canvas, sceneW, sceneH) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (event.clientX - rect.left) * scaleX;
  const cy = (event.clientY - rect.top) * scaleY;
  if (cy < 0 || cy >= sceneH) return null;
  if (cx >= 0 && cx < sceneW) return { panel: 0, x: cx, y: cy };
  if (cx >= sceneW + PANEL_GAP && cx < sceneW * 2 + PANEL_GAP) {
    return { panel: 1, x: cx - sceneW - PANEL_GAP, y: cy };
  }
  return null;
}

export function attachPointer(canvas, onSceneClick, onHover) {
  canvas.addEventListener('click', (event) => {
    const hit = canvasClickToScene(event, canvas, 560, 480);
    if (hit) onSceneClick(hit);
  });
  canvas.addEventListener('mousemove', (event) => {
    const hit = canvasClickToScene(event, canvas, 560, 480);
    if (onHover) onHover(hit);
  });
}

/**
 * Wire the keyboard. Handlers receive plain intents so main.js stays the
 * only place that knows the game state.
 */
export function attachKeyboard(handlers) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' &&
        event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    switch (event.key) {
      case 'ArrowLeft': handlers.moveCrosshair(-18, 0); event.preventDefault(); break;
      case 'ArrowRight': handlers.moveCrosshair(18, 0); event.preventDefault(); break;
      case 'ArrowUp': handlers.moveCrosshair(0, -18); event.preventDefault(); break;
      case 'ArrowDown': handlers.moveCrosshair(0, 18); event.preventDefault(); break;
      case 'Tab': handlers.switchPanel(); event.preventDefault(); break;
      case 'Enter':
      case ' ': handlers.clickCrosshair(); event.preventDefault(); break;
      case 'h':
      case 'H': handlers.useHint(); break;
      case 'm':
      case 'M': handlers.toggleMute(); break;
      case 'n':
      case 'N': handlers.nextLevel(); break;
      case 'r':
      case 'R': handlers.restartLevel(); break;
      default: break;
    }
  });
}
