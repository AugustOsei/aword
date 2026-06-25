// Shared TypeScript interfaces for Aword.

export type Award = 'gold' | 'silver' | 'bronze' | 'participation';

export type TileState = 'correct' | 'present' | 'absent' | 'empty';

export interface WordData {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

export interface GameResult {
  word: string;
  solved: boolean;
  guesses: string[];
  guessCount: number;
}

export interface DailyResult {
  date: string; // YYYY-MM-DD
  games: GameResult[];
  totalGuesses: number;
  score: number; // words solved (0-5)
  award: Award;
  completed: boolean;
}

export interface SavedWord {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  savedAt: string; // ISO date string
  date: string; // which daily session it came from
}

export interface PlayerData {
  streak: number;
  lastPlayedDate: string;
  longestStreak: number;
  totalGamesPlayed: number;
  awardHistory: { date: string; award: string }[]; // last 30 days
  hasSeenOnboarding: boolean;
  savedWords: SavedWord[];
  muted: boolean;
}

// Live, in-progress game state (one of the five in a session).
export interface ActiveGame {
  word: string; // the answer
  wordLength: number;
  guesses: string[]; // submitted guesses
  currentInput: string; // what's being typed now
  status: 'active' | 'won' | 'lost';
  wordData: WordData | null; // pre-fetched definition
}

export interface SessionState {
  date: string; // YYYY-MM-DD this session belongs to
  currentGameIndex: number; // 0-4
  games: ActiveGame[];
  sessionStarted: boolean;
  sessionComplete: boolean;
}

export const MAX_GUESSES = 5;
export const WORD_LENGTHS = [3, 4, 5, 6, 7] as const;
