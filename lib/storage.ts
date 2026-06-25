import type {
  Award,
  DailyResult,
  PlayerData,
  SavedWord,
  SessionState,
} from '@/types';
import { decodeBase64, encodeBase64, daysBetween, getTodayString } from './utils';

const KEYS = {
  player: 'aword:player',
  results: 'aword:results', // map of date -> DailyResult
  session: 'aword:session', // base64-obfuscated in-progress SessionState
  theme: 'aword:theme', // 'light' | 'dark'
} as const;

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  if (!isBrowser()) return 'light';
  try {
    const t = localStorage.getItem(KEYS.theme);
    if (t === 'light' || t === 'dark') return t;
    return 'light';
  } catch {
    return 'light';
  }
}

export function setTheme(theme: Theme): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEYS.theme, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch {
    /* ignore */
  }
}

const DEFAULT_PLAYER: PlayerData = {
  streak: 0,
  lastPlayedDate: '',
  longestStreak: 0,
  totalGamesPlayed: 0,
  awardHistory: [],
  hasSeenOnboarding: false,
  hasSeenHowToPlay: false,
  savedWords: [],
  muted: false,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or serialization errors are non-fatal */
  }
}

/* ------------------------------- Player ------------------------------- */

export function getPlayerData(): PlayerData {
  return { ...DEFAULT_PLAYER, ...readJSON<PlayerData>(KEYS.player, DEFAULT_PLAYER) };
}

export function setPlayerData(data: PlayerData): void {
  writeJSON(KEYS.player, data);
}

function updatePlayer(patch: Partial<PlayerData>): PlayerData {
  const next = { ...getPlayerData(), ...patch };
  setPlayerData(next);
  return next;
}

export function getMuted(): boolean {
  return getPlayerData().muted;
}

export function setMuted(muted: boolean): void {
  updatePlayer({ muted });
}

export function hasSeenOnboarding(): boolean {
  return getPlayerData().hasSeenOnboarding;
}

export function setSeenOnboarding(): void {
  updatePlayer({ hasSeenOnboarding: true });
}

export function hasSeenHowToPlay(): boolean {
  return getPlayerData().hasSeenHowToPlay;
}

export function setSeenHowToPlay(): void {
  updatePlayer({ hasSeenHowToPlay: true });
}

/* ------------------------------ Saved words --------------------------- */

export function getSavedWords(): SavedWord[] {
  return getPlayerData().savedWords;
}

export function isWordSaved(word: string): boolean {
  return getPlayerData().savedWords.some(
    (w) => w.word.toLowerCase() === word.toLowerCase()
  );
}

export function saveWord(entry: Omit<SavedWord, 'savedAt'>): void {
  const player = getPlayerData();
  if (player.savedWords.some((w) => w.word.toLowerCase() === entry.word.toLowerCase())) {
    return;
  }
  const saved: SavedWord = { ...entry, savedAt: new Date().toISOString() };
  updatePlayer({ savedWords: [saved, ...player.savedWords] });
}

export function unsaveWord(word: string): void {
  const player = getPlayerData();
  updatePlayer({
    savedWords: player.savedWords.filter(
      (w) => w.word.toLowerCase() !== word.toLowerCase()
    ),
  });
}

/* ------------------------------- Results ------------------------------ */

type ResultsMap = Record<string, DailyResult>;

export function getAllResults(): ResultsMap {
  return readJSON<ResultsMap>(KEYS.results, {});
}

export function getDailyResult(date: string): DailyResult | null {
  return getAllResults()[date] ?? null;
}

export function getTodaysResult(): DailyResult | null {
  return getDailyResult(getTodayString());
}

export function awardForScore(score: number): Award {
  if (score >= 5) return 'gold';
  if (score === 4) return 'silver';
  if (score === 3) return 'bronze';
  return 'participation';
}

/**
 * Persist a completed daily session: stores the result, advances streak/award
 * history, clears the in-progress session. Streak only moves on completion.
 */
export function saveDailyResult(result: DailyResult): PlayerData {
  const results = getAllResults();
  results[result.date] = result;
  writeJSON(KEYS.results, results);

  const player = getPlayerData();

  // Streak: increment if yesterday was also completed; otherwise reset to 1.
  let streak = 1;
  if (player.lastPlayedDate) {
    const gap = daysBetween(result.date, player.lastPlayedDate);
    if (gap === 0) {
      // Re-saving the same day — preserve existing streak.
      streak = player.streak || 1;
    } else if (gap === 1) {
      streak = player.streak + 1;
    } else {
      streak = 1;
    }
  }

  const longestStreak = Math.max(player.longestStreak, streak);

  const awardHistory = [
    ...player.awardHistory.filter((h) => h.date !== result.date),
    { date: result.date, award: result.award },
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1)) // newest first
    .slice(0, 30);

  const alreadyCounted = player.lastPlayedDate === result.date;

  return updatePlayer({
    streak,
    longestStreak,
    lastPlayedDate: result.date,
    totalGamesPlayed: player.totalGamesPlayed + (alreadyCounted ? 0 : 1),
    awardHistory,
  });
}

/* --------------------------- In-progress session ---------------------- */

export function saveSession(session: SessionState): void {
  if (!isBrowser()) return;
  try {
    // Obfuscate so today's answers aren't trivially readable in dev tools.
    localStorage.setItem(KEYS.session, encodeBase64(JSON.stringify(session)));
  } catch {
    /* ignore */
  }
}

export function loadSession(): SessionState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.session);
    if (!raw) return null;
    return JSON.parse(decodeBase64(raw)) as SessionState;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(KEYS.session);
  } catch {
    /* ignore */
  }
}
