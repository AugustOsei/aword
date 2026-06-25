'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { TileState } from '@/types';
import { FLIP_DURATION } from '@/hooks/useGameSession';
import { playTileFlip } from '@/lib/sounds';

interface TileProps {
  letter: string;
  state: TileState; // resolved color state for revealed tiles
  animateReveal?: boolean;
  delay?: number;
  bounce?: boolean;
  variant?: 'guess' | 'answer';
  size: number;
}

function resolvedStyle(state: TileState): React.CSSProperties {
  switch (state) {
    case 'present':
      return { backgroundColor: 'var(--c-marigold)', color: 'var(--c-marigold-ink)' };
    case 'absent':
      return { backgroundColor: 'var(--c-stone)', color: 'var(--c-ink)' };
    case 'correct':
      return { color: 'var(--c-on-correct)' };
    default:
      return {};
  }
}

export function Tile({
  letter,
  state,
  animateReveal = false,
  delay = 0,
  bounce = false,
  variant = 'guess',
  size,
}: TileProps) {
  const [revealed, setRevealed] = useState(!animateReveal);
  const fired = useRef(false);
  const radius = Math.round(size * 0.22);

  useEffect(() => {
    if (!animateReveal) {
      setRevealed(true);
      return;
    }
    fired.current = false;
    setRevealed(false);
    const mid = delay + FLIP_DURATION / 2;
    const t1 = setTimeout(() => {
      if (!fired.current) {
        fired.current = true;
        playTileFlip();
      }
      setRevealed(true);
    }, mid);
    return () => clearTimeout(t1);
  }, [animateReveal, delay, letter, state]);

  const filled = letter !== '';
  const showColor = revealed && state !== 'empty';

  if (variant === 'answer') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000, type: 'spring', stiffness: 240, damping: 22 }}
        className="flex items-center justify-center border-[2px] font-display font-extrabold uppercase"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          borderRadius: radius,
          borderColor: 'var(--c-green)',
          color: 'var(--c-green)',
        }}
      >
        {letter.toUpperCase()}
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={
        animateReveal
          ? { rotateX: [0, 90, 0] }
          : bounce
            ? { y: [0, -8, 0] }
            : {}
      }
      transition={
        animateReveal
          ? { duration: FLIP_DURATION / 1000, delay: delay / 1000, ease: 'easeInOut' }
          : bounce
            ? { duration: 0.32, delay: delay / 1000, ease: 'easeOut' }
            : {}
      }
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        borderRadius: radius,
        transformStyle: 'preserve-3d',
        ...(showColor ? resolvedStyle(state) : {}),
      }}
      className={[
        'flex select-none items-center justify-center font-display font-extrabold uppercase',
        showColor
          ? state === 'correct'
            ? 'tile-correct tile-filled'
            : 'tile-filled'
          : filled
            ? 'border-[2px] border-edge bg-surface text-ink'
            : 'border-[2px] border-edge bg-transparent text-ink',
      ].join(' ')}
    >
      {filled ? (
        <motion.span
          key={letter}
          initial={animateReveal ? false : { scale: 0.55, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          style={{ transform: 'translateZ(1px)' }}
        >
          {letter.toUpperCase()}
        </motion.span>
      ) : null}
    </motion.div>
  );
}
