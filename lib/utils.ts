import type { TileState } from '@/types';

/** Returns today's local date as YYYY-MM-DD. */
export function getTodayString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Deterministic string hash (djb2 variant) → non-negative integer. */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Force unsigned 32-bit.
  return hash >>> 0;
}

/** Difference in whole days between two YYYY-MM-DD strings (a - b). */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  const ms = da.getTime() - db.getTime();
  return Math.round(ms / 86400000);
}

/** Friendly short date, e.g. "Jun 23". */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Longer date, e.g. "Monday, June 23". */
export function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Evaluate a guess against the answer, returning per-letter tile states.
 * Handles duplicate letters correctly (two-pass: greens first, then yellows
 * limited by remaining letter counts).
 */
export function evaluateGuess(guess: string, answer: string): TileState[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const result: TileState[] = new Array(g.length).fill('absent');
  const counts: Record<string, number> = {};

  for (const ch of a) counts[ch] = (counts[ch] || 0) + 1;

  // Pass 1: exact matches.
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct';
      counts[g[i]]--;
    }
  }
  // Pass 2: present-but-misplaced, limited by remaining counts.
  for (let i = 0; i < g.length; i++) {
    if (result[i] === 'correct') continue;
    const ch = g[i];
    if (counts[ch] > 0) {
      result[i] = 'present';
      counts[ch]--;
    }
  }
  return result;
}

/** True when a guess fully matches the answer. */
export function isWinningGuess(guess: string, answer: string): boolean {
  return guess.toLowerCase() === answer.toLowerCase();
}

// Base64 helpers that work in both browser and SSR (Node) contexts.
export function encodeBase64(str: string): string {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, 'utf-8').toString('base64');
}

export function decodeBase64(str: string): string {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return decodeURIComponent(escape(window.atob(str)));
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}
