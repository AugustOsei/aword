// Programmatic sound design with Tone.js — no audio files.
// All sounds respect prefers-reduced-motion and the persisted mute toggle.

import { getMuted } from './storage';

// Tone is imported lazily so it never runs during SSR and the AudioContext is
// only created on first real interaction (browsers block audio before that).
type ToneModule = typeof import('tone');

let TonePromise: Promise<ToneModule> | null = null;
let started = false;

let membrane: import('tone').MembraneSynth | null = null;
let synth: import('tone').PolySynth | null = null;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function soundsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion()) return false;
  if (getMuted()) return false;
  return true;
}

async function getTone(): Promise<ToneModule | null> {
  if (typeof window === 'undefined') return null;
  if (!TonePromise) TonePromise = import('tone');
  return TonePromise;
}

/** Must be called from a user gesture to unlock the AudioContext. */
export async function initAudio(): Promise<void> {
  if (started || typeof window === 'undefined') return;
  const Tone = await getTone();
  if (!Tone) return;
  try {
    await Tone.start();
    started = true;
  } catch {
    /* ignore — audio simply stays silent */
  }
}

async function ready(): Promise<ToneModule | null> {
  if (!soundsEnabled()) return null;
  const Tone = await getTone();
  if (!Tone) return null;
  if (!started) {
    try {
      await Tone.start();
      started = true;
    } catch {
      return null;
    }
  }
  return Tone;
}

function getMembrane(Tone: ToneModule) {
  if (!membrane) {
    membrane = new Tone.MembraneSynth({
      volume: -10,
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    }).toDestination();
  }
  return membrane;
}

function getSynth(Tone: ToneModule) {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      volume: -14,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.3 },
    }).toDestination();
  }
  return synth;
}

/** Very short soft click as a tile flips. */
export async function playTileFlip(): Promise<void> {
  const Tone = await ready();
  if (!Tone) return;
  try {
    getMembrane(Tone).triggerAttackRelease('C4', 0.08);
  } catch {
    /* ignore */
  }
}

/** Two-note ascending tone on a win. */
export async function playCorrectGuess(): Promise<void> {
  const Tone = await ready();
  if (!Tone) return;
  try {
    const s = getSynth(Tone);
    const now = Tone.now();
    s.triggerAttackRelease('E4', 0.2, now);
    s.triggerAttackRelease('G4', 0.2, now + 0.12);
  } catch {
    /* ignore */
  }
}

/** Subtle flat tone when a row resolves with only misplaced letters. */
export async function playWrongPosition(): Promise<void> {
  const Tone = await ready();
  if (!Tone) return;
  try {
    getSynth(Tone).triggerAttackRelease('D4', 0.15);
  } catch {
    /* ignore */
  }
}

/** Brief low pulse for an invalid word (row shake). */
export async function playInvalidWord(): Promise<void> {
  const Tone = await ready();
  if (!Tone) return;
  try {
    getSynth(Tone).triggerAttackRelease('A2', 0.1);
  } catch {
    /* ignore */
  }
}

/** Tiny two-note chirp — the bird landing on the Play button. */
export async function playChirp(): Promise<void> {
  const Tone = await ready();
  if (!Tone) return;
  try {
    const s = getSynth(Tone);
    const now = Tone.now();
    s.triggerAttackRelease('E6', 0.06, now);
    s.triggerAttackRelease('A6', 0.07, now + 0.085);
  } catch {
    /* ignore */
  }
}

/** Three-note ascending chord resolution on session complete. */
export async function playSessionComplete(): Promise<void> {
  const Tone = await ready();
  if (!Tone) return;
  try {
    const s = getSynth(Tone);
    s.triggerAttackRelease(['C4', 'E4', 'G4'], 0.6);
  } catch {
    /* ignore */
  }
}
