// main.ts — entrypoint for "Cari Perbedaannya!" (Node 22, standard library only).
//
// The game itself is plain static files under game/ (index.html plus ES
// modules, no build step, no network request). This program hands it in: it
// copies game/ and screenshots/ from beside this file into the output
// directory and writes /output/dossier.json with buildDossier from the
// vendored make.fun library, so the judge can read the game from one file.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output directory is never deleted by this program: the grader owns it
// and may already hold files there, so we only create what is missing and
// overwrite our own two folders and dossier.json.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(name) {
  const source = join(repoRoot, name);
  const target = join(outputDir, name);
  mkdirSync(target, { recursive: true });
  if (existsSync(source)) cpSync(source, target, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyFolder('game');
copyFolder('screenshots');

// Caps from the competition's gate (game_files, screenshots, dossier):
// game/ at most 993 entries / 48 MiB, index.html at most 1 MiB, at most 4
// screenshots of at most 256 KiB each, dossier text at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
