import { ANSWER_WORDS, VALID_GUESSES } from './wordbank';
import { FREQ_RANK } from './wordRarity';
import { getTodayString, hashString } from './utils';
import { WORD_LENGTHS } from '@/types';
import { SESSION_WORD_COUNT, SESSION_WORD_LENGTH } from './config';

// Pre-built Sets for O(1) valid-guess lookups, keyed by length.
const validSets: Record<number, Set<string>> = {};
for (const len of WORD_LENGTHS) {
  validSets[len] = new Set([
    ...(VALID_GUESSES[len] || []),
    ...(ANSWER_WORDS[len] || []),
  ]);
}

/**
 * Returns the five words for a given date (default: today), one per length
 * 3,4,5,6,7. Deterministic — every player worldwide gets the same words on the
 * same date. A per-length salt keeps the five picks independent.
 */
export function getWordsForDate(dateStr: string): string[] {
  return WORD_LENGTHS.map((len) => {
    const bank = ANSWER_WORDS[len];
    const seed = hashString(`${dateStr}:${len}`);
    return bank[seed % bank.length];
  });
}

/**
 * Returns the session's words for a date — `count` distinct words all of the
 * same `length`. Deterministic per date; a linear probe avoids duplicates.
 */
function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function getSameLengthWords(
  dateStr: string,
  length: number,
  count: number
): string[] {
  const bank = ANSWER_WORDS[length] ?? [];
  const n = bank.length;
  if (n === 0) return [];
  if (n <= count) return [...bank];

  const base = hashString(`${dateStr}:${length}`) % n;
  // Walk the bank in steps of a stride that's coprime to its size, so the day's
  // picks fan out across the whole (alphabetical) list instead of landing on
  // neighbours — otherwise every day's words share a prefix (AROSE, ARMOR, …).
  let stride = (hashString(`${dateStr}:${length}:stride`) % (n - 1)) + 1;
  while (gcd(stride, n) !== 1) stride = (stride % (n - 1)) + 1;

  const words: string[] = [];
  const used = new Set<number>();
  let k = 0;
  while (words.length < count && used.size < n) {
    let idx = (base + k * stride) % n;
    while (used.has(idx)) idx = (idx + 1) % n;
    used.add(idx);
    words.push(bank[idx]);
    k++;
  }
  return words;
}

export function getTodaysWords(): string[] {
  return getSameLengthWords(
    getTodayString(),
    SESSION_WORD_LENGTH,
    SESSION_WORD_COUNT
  );
}

/**
 * Picks the "word of the day" — the rarest (most worth learning) of the day's
 * words. Words absent from the frequency list are rarer than any listed word;
 * ties among those are broken deterministically by the date so it still varies.
 */
export function getFeaturedWord(dateStr: string, words: string[]): string {
  const RARE = Number.MAX_SAFE_INTEGER;
  let best = words[0];
  let bestRank = -1;
  words.forEach((w, i) => {
    const base = FREQ_RANK[w.toLowerCase()] ?? RARE;
    // tiny date-seeded jitter so all-rare days don't always pick the first word
    const rank = base === RARE ? RARE - (hashString(`${dateStr}:${w}`) % 1000) : base;
    if (rank > bestRank) {
      bestRank = rank;
      best = w;
    }
  });
  return best;
}

export function getTodaysFeaturedWord(): string {
  return getFeaturedWord(getTodayString(), getTodaysWords());
}

/** Checks whether a guess is a real word of the expected length. */
export function isValidWord(word: string, length: number): boolean {
  const w = word.toLowerCase();
  if (w.length !== length) return false;
  const set = validSets[length];
  return set ? set.has(w) : false;
}
