import type { DailyResult, GameResult } from '@/types';
import { evaluateGuess, formatShortDate } from './utils';

const EMOJI: Record<string, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬛',
};

const AWARD_LABEL: Record<string, string> = {
  gold: '🏆 Gold',
  silver: '🥈 Silver',
  bronze: '🥉 Bronze',
  participation: '📖 Participation',
};

/**
 * The representative emoji row for a word, width = word length (this is what
 * gives the share card its widening "staircase" shape). Shows the winning guess
 * when solved, otherwise the player's last attempt.
 */
export function emojiRowFor(game: GameResult): string {
  const len = game.word.length;
  if (game.guesses.length === 0) {
    return EMOJI.absent.repeat(len);
  }
  const row = game.solved
    ? game.word // winning guess === answer → all green
    : game.guesses[game.guesses.length - 1];
  return evaluateGuess(row, game.word)
    .map((s) => EMOJI[s] ?? EMOJI.absent)
    .join('');
}

export function emojiRows(result: DailyResult): string[] {
  return result.games.map(emojiRowFor);
}

export function buildShareText(result: DailyResult, streak: number): string {
  const date = formatShortDate(result.date);
  const award = AWARD_LABEL[result.award] ?? result.award;
  const lines = result.games.map(
    (g, i) => `Word ${i + 1}: ${emojiRowFor(g)}`
  );

  return [
    `Aword — ${date} ${award}`,
    '',
    ...lines,
    '',
    `Score: ${result.score}/5 | ${result.totalGuesses} guesses | 🔥 ${streak} day streak`,
    'aword.game',
  ].join('\n');
}
