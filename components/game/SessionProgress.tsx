'use client';

import { motion } from 'framer-motion';
import type { ActiveGame } from '@/types';

interface SessionProgressProps {
  games: ActiveGame[];
  currentIndex: number;
}

function segmentColor(game: ActiveGame, isCurrent: boolean): string {
  if (game.status === 'won') return 'var(--c-green)';
  if (game.status === 'lost') return 'var(--c-stone)';
  if (isCurrent) return 'var(--c-marigold)';
  return 'var(--c-edge)';
}

export function SessionProgress({ games, currentIndex }: SessionProgressProps) {
  return (
    <div className="mx-auto flex w-full max-w-[300px] items-center gap-1.5 px-4">
      {games.map((g, i) => {
        const isCurrent = i === currentIndex;
        return (
          <motion.div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            animate={{ backgroundColor: segmentColor(g, isCurrent) }}
            transition={{ duration: 0.4 }}
            style={{ opacity: i > currentIndex && g.status === 'active' ? 0.55 : 1 }}
          />
        );
      })}
    </div>
  );
}
