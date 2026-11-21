// audio.js — all sounds are synthesized with WebAudio. No audio files,
// no network, nothing to download. A tiny helper builds short tones and
// little melodies from them.

export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  ensureContext() {
    if (!this.context) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.context = new AC();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, startIn, dur, type, vol) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + startIn;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /** Bright two-note chime when a difference is found. */
  playFound(combo) {
    const base = 660 + Math.min(combo, 6) * 40;
    this.tone(base, 0, 0.14, 'sine', 0.22);
    this.tone(base * 1.5, 0.09, 0.22, 'sine', 0.2);
    this.tone(base * 2, 0.18, 0.3, 'triangle', 0.12);
  }

  /** Low buzz for a wrong click. */
  playWrong() {
    this.tone(140, 0, 0.18, 'sawtooth', 0.1);
    this.tone(110, 0.05, 0.2, 'sawtooth', 0.08);
  }

  /** Soft click for UI buttons. */
  playClick() {
    this.tone(880, 0, 0.05, 'square', 0.06);
  }

  /** Gentle chime when a hint is used. */
  playHint() {
    this.tone(523, 0, 0.15, 'sine', 0.15);
    this.tone(784, 0.12, 0.25, 'sine', 0.15);
  }

  /** Little fanfare when a level is cleared. */
  playLevelClear() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.11, 0.28, 'triangle', 0.18));
  }

  /** Longer fanfare for finishing the whole game. */
  playGameClear() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
      this.tone(f, i * 0.13, 0.32, 'triangle', 0.18),
    );
  }
}
