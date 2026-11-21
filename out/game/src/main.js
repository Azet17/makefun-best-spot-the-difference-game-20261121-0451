// main.js — game state, scoring, timer, HUD and the demo/screenshot mode.
// Screens: title -> playing -> level-clear -> (next level) -> game-clear.
// Demo mode (?shot=cover|play|level2|level3|end, or ?shot=1) stages a real
// mid-game frame so screenshots show markers, unfound differences and the
// remaining counter, rendered by the game code itself.

import { LEVELS, SCENE_W, SCENE_H } from './scenes.js';
import {
  freshFoundSet,
  differenceAt,
  variantIdsFor,
  remainingCount,
  isLevelComplete,
  randomUnfound,
} from './differences.js';
import { SoundBank } from './audio.js';
import { Crosshair, attachPointer, attachKeyboard } from './input.js';
import { CANVAS_W, CANVAS_H, ParticleBurst, renderFrame } from './render.js';

const LEVEL_TIME_SECONDS = 150;
const HINTS_PER_LEVEL = 3;
const POINTS_PER_FIND = 100;
const WRONG_CLICK_PENALTY = 25;
const HINT_COST = 50;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const el = (id) => document.getElementById(id);
const hudLevel = el('hud-level');
const hudRemaining = el('hud-remaining');
const hudTimer = el('hud-timer');
const hudTimerFill = el('hud-timer-fill');
const hudScore = el('hud-score');
const hudHints = el('hud-hints');
const hudCombo = el('hud-combo');
const toast = el('toast');
const overlay = el('overlay');
const overlayTitle = el('overlay-title');
const overlayBody = el('overlay-body');
const overlayButton = el('overlay-button');
const levelHint = el('level-hint');

const sounds = new SoundBank();

const state = {
  screen: 'title', // title | playing | level-clear | game-clear | time-up
  levelIndex: 0,
  level: LEVELS[0],
  found: freshFoundSet(),
  variantIds: variantIdsFor(0),
  score: 0,
  combo: 0,
  hintsLeft: HINTS_PER_LEVEL,
  timeLeft: LEVEL_TIME_SECONDS,
  particles: [],
  wrongFlash: null,
  hint: null,
  crosshair: new Crosshair(),
  now: 0,
  lastTick: 0,
  hover: null,
};

let toastTimer = 0;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function updateHud() {
  hudLevel.textContent = state.level.name;
  hudRemaining.textContent = `Sisa ${remainingCount(state.levelIndex, state.found)} dari 7`;
  const t = Math.max(0, Math.ceil(state.timeLeft));
  hudTimer.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  hudTimerFill.style.width = `${(state.timeLeft / LEVEL_TIME_SECONDS) * 100}%`;
  hudTimerFill.classList.toggle('low', state.timeLeft <= 30);
  hudScore.textContent = `Skor ${state.score}`;
  hudHints.textContent = `Hint ${state.hintsLeft}`;
  hudCombo.textContent = state.combo >= 2 ? `Combo x${state.combo}` : '';
  levelHint.textContent = state.level.hint;
}

function showOverlay(title, body, buttonLabel, onButton) {
  overlayTitle.textContent = title;
  overlayBody.innerHTML = body;
  overlayButton.textContent = buttonLabel;
  overlay.classList.remove('hidden');
  overlayButton.onclick = () => {
    sounds.playClick();
    onButton();
  };
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function startLevel(index) {
  state.levelIndex = index;
  state.level = LEVELS[index];
  state.found = freshFoundSet();
  state.variantIds = variantIdsFor(index);
  state.hintsLeft = HINTS_PER_LEVEL;
  state.timeLeft = LEVEL_TIME_SECONDS;
  state.combo = 0;
  state.particles = [];
  state.wrongFlash = null;
  state.hint = null;
  state.screen = 'playing';
  hideOverlay();
  updateHud();
}

function startGame() {
  state.score = 0;
  startLevel(0);
  showToast('Temukan 7 perbedaan di setiap level!');
}

function onLevelClear() {
  const timeBonus = Math.round(state.timeLeft) * 2;
  state.score += timeBonus;
  sounds.playLevelClear();
  state.screen = 'level-clear';
  updateHud();
  const last = state.levelIndex === LEVELS.length - 1;
  showOverlay(
    last ? 'Semua Level Selesai!' : `Level ${state.levelIndex + 1} Selesai!`,
    last
      ? `Kamu menemukan semua perbedaan di 3 level.<br>Bonus waktu: <b>+${timeBonus}</b><br>Skor akhir: <b>${state.score}</b>`
      : `Semua 7 perbedaan ketemu!<br>Bonus waktu: <b>+${timeBonus}</b><br>Skor: <b>${state.score}</b>`,
    last ? 'Main Lagi' : 'Level Berikutnya (N)',
    () => (last ? startGame() : startLevel(state.levelIndex + 1)),
  );
}

function onTimeUp() {
  state.screen = 'time-up';
  sounds.playWrong();
  showOverlay(
    'Waktu Habis!',
    `Kamu menemukan <b>${state.found.size} dari 7</b> perbedaan di level ini.<br>Coba lagi — perbedaannya masih di tempat yang sama.`,
    'Ulangi Level (R)',
    () => startLevel(state.levelIndex),
  );
}

function handleSceneClick(hit) {
  if (state.screen !== 'playing') return;
  const diff = differenceAt(state.levelIndex, hit.x, hit.y);
  if (!diff) {
    state.combo = 0;
    state.score = Math.max(0, state.score - WRONG_CLICK_PENALTY);
    state.wrongFlash = { panel: hit.panel, x: hit.x, y: hit.y, at: state.now };
    sounds.playWrong();
    updateHud();
    return;
  }
  if (state.found.has(diff.id)) {
    showToast(`"${diff.label}" sudah ketemu!`);
    return;
  }
  state.found.add(diff.id);
  state.combo += 1;
  const gained = POINTS_PER_FIND + (state.combo - 1) * 25;
  state.score += gained;
  state.particles.push(new ParticleBurst(diff.x, diff.y, hit.panel));
  state.particles.push(new ParticleBurst(diff.x, diff.y, hit.panel === 0 ? 1 : 0));
  sounds.playFound(state.combo);
  showToast(`Ketemu! ${diff.label} (+${gained})`);
  updateHud();
  if (isLevelComplete(state.found)) {
    const last = state.levelIndex === LEVELS.length - 1;
    setTimeout(() => {
      if (last) {
        sounds.playGameClear();
        state.screen = 'game-clear';
      }
      onLevelClear();
    }, 650);
  }
}

function useHint() {
  if (state.screen !== 'playing') return;
  if (state.hintsLeft <= 0) {
    showToast('Hint habis di level ini!');
    return;
  }
  const diff = randomUnfound(state.levelIndex, state.found);
  if (!diff) return;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - HINT_COST);
  state.hint = { diff, at: state.now };
  sounds.playHint();
  showToast(`Hint: cari di sekitar "${diff.label}" (-${HINT_COST})`);
  updateHud();
}

function toggleMute() {
  const muted = sounds.toggleMute();
  showToast(muted ? 'Suara mati (M)' : 'Suara hidup (M)');
  el('mute-button').textContent = muted ? 'Suara: Mati' : 'Suara: Hidup';
}

function frame(timestamp) {
  const dt = Math.min(0.1, (timestamp - state.lastTick) / 1000 || 0);
  state.lastTick = timestamp;
  state.now = timestamp / 1000;
  if (state.screen === 'playing') {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      onTimeUp();
    } else {
      updateHud();
    }
  }
  for (const p of state.particles) p.update(dt);
  state.particles = state.particles.filter((p) => !p.done);
  renderFrame(ctx, state);
  requestAnimationFrame(frame);
}

attachPointer(canvas, handleSceneClick, (hit) => {
  state.hover = hit;
  canvas.style.cursor = hit ? 'crosshair' : 'default';
});

attachKeyboard({
  moveCrosshair: (dx, dy) => state.crosshair.move(dx, dy, SCENE_W, SCENE_H),
  switchPanel: () => state.crosshair.switchPanel(),
  clickCrosshair: () => {
    if (state.screen === 'title') return startGame();
    if (state.screen === 'level-clear' || state.screen === 'game-clear' || state.screen === 'time-up') {
      overlayButton.click();
      return;
    }
    handleSceneClick({ panel: state.crosshair.panel, x: state.crosshair.x, y: state.crosshair.y });
  },
  useHint,
  toggleMute,
  nextLevel: () => {
    if (state.screen === 'level-clear') overlayButton.click();
  },
  restartLevel: () => {
    if (state.screen === 'time-up') overlayButton.click();
    else if (state.screen === 'playing') startLevel(state.levelIndex);
  },
});

el('start-button').addEventListener('click', (event) => {
  event.currentTarget.blur(); // keep Space/Enter for the crosshair, not the button
  sounds.ensureContext();
  sounds.playClick();
  startGame();
});
el('hint-button').addEventListener('click', (event) => {
  event.currentTarget.blur(); // keep Space/Enter for the crosshair, not the button
  sounds.ensureContext();
  useHint();
});
el('mute-button').addEventListener('click', (event) => {
  event.currentTarget.blur(); // keep Space/Enter for the crosshair, not the button
  sounds.ensureContext();
  toggleMute();
});
overlayButton.addEventListener('click', () => sounds.ensureContext());

// Demo / screenshot mode: stage a real mid-game frame through the URL.
// ?shot=cover (alias ?shot=1): level 1, 3 of 7 found — the cover shot.
// ?shot=play: level 1, 1 of 7 found. ?shot=level2: level 2, 2 found.
// ?shot=level3: level 3, 4 found. ?shot=end: the finished-game screen.
function applyDemoMode() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  const stage = (levelIndex, foundIds, timeLeft, score) => {
    state.score = score;
    startLevel(levelIndex);
    for (const id of foundIds) state.found.add(id);
    state.timeLeft = timeLeft;
    state.combo = foundIds.length;
    updateHud();
  };
  if (shot === 'cover' || shot === '1') {
    stage(0, ['sun-rays', 'flower', 'duck'], 142, 350);
  } else if (shot === 'play') {
    stage(0, ['sun-rays'], 128, 100);
  } else if (shot === 'level2') {
    stage(1, ['lantern', 'moon'], 121, 480);
  } else if (shot === 'level3') {
    stage(2, ['umbrella', 'crab', 'sail', 'shell'], 96, 920);
  } else if (shot === 'end') {
    state.score = 2450;
    startLevel(2);
    for (const d of LEVELS[2].differences) state.found.add(d.id);
    state.timeLeft = 88;
    updateHud();
    state.screen = 'game-clear';
    sounds.playGameClear();
    showOverlay(
      'Semua Level Selesai!',
      'Kamu menemukan semua perbedaan di 3 level.<br>Skor akhir: <b>2450</b>',
      'Main Lagi',
      () => startGame(),
    );
  } else {
    return false;
  }
  return true;
}

if (!applyDemoMode()) {
  showOverlay(
    'Cari Perbedaannya!',
    'Dua gambar nyaris identik — temukan <b>7 perbedaan</b> di setiap level.<br>' +
      'Klik gambar kiri atau kanan, pakai <b>Hint</b> kalau mentok.<br>' +
      'Keyboard: panah = gerakkan bidikan, <b>Enter</b> = klik, <b>H</b> = hint, <b>M</b> = suara.',
    'Mulai Main',
    () => startGame(),
  );
  // The start button on the title screen mirrors the overlay button.
  el('start-button').style.display = 'inline-block';
}
updateHud();
requestAnimationFrame(frame);
