'use client';

import { motion } from 'framer-motion';
import type { DailyResult, TileState } from '@/types';
import { evaluateGuess } from '@/lib/utils';

interface StaircaseCardProps {
  result: DailyResult;
  /** Stagger rows in on appear. */
  animate?: boolean;
}

function blockColor(state: TileState): string {
  if (state === 'correct') return 'var(--c-green)';
  if (state === 'present') return 'var(--c-marigold)';
  return 'var(--c-stone)';
}

function rowStates(word: string, guess: string | null): TileState[] {
  if (!guess) return Array.from({ length: word.length }, () => 'absent' as TileState);
  return evaluateGuess(guess, word);
}

export function StaircaseCard({ result, animate = true }: StaircaseCardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {result.games.map((game, i) => {
        const guess = game.solved
          ? game.word
          : game.guesses[game.guesses.length - 1] ?? null;
        const states = rowStates(game.word, guess);
        return (
          <motion.div
            key={i}
            className="flex gap-1"
            initial={animate ? { opacity: 0, x: -8 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animate ? 0.2 * i : 0, type: 'spring', stiffness: 260, damping: 24 }}
          >
            {states.map((s, c) => (
              <span
                key={c}
                className="h-5 w-5 rounded-[3px]"
                style={{ backgroundColor: blockColor(s) }}
              />
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}
