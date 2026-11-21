// differences.js — which differences exist, which are found, and hit-testing.
// A click counts when it lands inside a difference's circle on EITHER panel,
// so the player may hunt on the left picture or the right one.

import { LEVELS } from './scenes.js';

export const DIFFERENCES_PER_LEVEL = 7;

export function levelCount() {
  return LEVELS.length;
}

export function levelAt(index) {
  return LEVELS[index];
}

/** A fresh found-set for a level: a Set of difference ids already found. */
export function freshFoundSet() {
  return new Set();
}

/** The difference (if any) whose circle contains scene point (x, y). */
export function differenceAt(levelIndex, x, y) {
  const level = LEVELS[levelIndex];
  for (const d of level.differences) {
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}

/** Ids of the differences that must look different on the right panel. */
export function variantIdsFor(levelIndex) {
  return new Set(LEVELS[levelIndex].differences.map((d) => d.id));
}

export function remainingCount(levelIndex, found) {
  return DIFFERENCES_PER_LEVEL - found.size;
}

export function isLevelComplete(found) {
  return found.size >= DIFFERENCES_PER_LEVEL;
}

/** Pick a random difference the player has not found yet (for hints). */
export function randomUnfound(levelIndex, found) {
  const rest = LEVELS[levelIndex].differences.filter((d) => !found.has(d.id));
  if (rest.length === 0) return null;
  return rest[Math.floor(Math.random() * rest.length)];
}
