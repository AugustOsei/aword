'use client';

import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ActiveGame, TileState } from '@/types';
import { MAX_GUESSES } from '@/types';
import { evaluateGuess } from '@/lib/utils';
import { Tile } from './Tile';
import { FLIP_STAGGER } from '@/hooks/useGameSession';
import type { Phase } from '@/hooks/useGameSession';

interface TileGridProps {
  game: ActiveGame;
  phase: Phase;
  shakeKey: number;
}

const GAP = 6;
const MIN = 40;
const MAX = 62;

export function TileGrid({ game, phase, shakeKey }: TileGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(56);
  const len = game.wordLength;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      const raw = (w - (len - 1) * GAP) / len;
      setSize(Math.max(MIN, Math.min(MAX, Math.floor(raw))));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [len]);

  const submitted = game.guesses;
  const lastIndex = submitted.length - 1;
  const revealing = phase === 'reveal';
  const winning = phase === 'won';
  const losing = phase === 'lost' || phase === 'wordcard';

  // The current-input row index (only while there's room and the game is live).
  const inputRowIndex =
    game.status === 'active' && submitted.length < MAX_GUESSES
      ? submitted.length
      : -1;

  // On a loss, render the answer as an extra outlined row beneath the guesses.
  const showAnswerRow = game.status === 'lost' && losing;

  const rows = Array.from({ length: MAX_GUESSES }, (_, r) => r);

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[420px]">
      <div className="flex flex-col items-center gap-1.5">
        {rows.map((r) => {
          const isSubmitted = r < submitted.length;
          const isInput = r === inputRowIndex;
          const guess = isSubmitted ? submitted[r] : '';
          const states: TileState[] = isSubmitted
            ? evaluateGuess(guess, game.word)
            : [];
          const animateThisRow = r === lastIndex && (revealing || winning);

          const letters = Array.from({ length: len }, (_, c) => {
            if (isSubmitted) return guess[c] ?? '';
            if (isInput) return game.currentInput[c] ?? '';
            return '';
          });

          const rowContent = (
            <div className="flex gap-1.5" style={{ height: size }}>
              {letters.map((ch, c) => (
                <Tile
                  key={c}
                  letter={ch}
                  state={isSubmitted ? states[c] : 'empty'}
                  size={size}
                  animateReveal={animateThisRow && revealing}
                  bounce={r === lastIndex && winning}
                  delay={animateThisRow ? c * FLIP_STAGGER : (winning && r === lastIndex ? c * 80 : 0)}
                />
              ))}
            </div>
          );

          if (isInput) {
            return (
              <motion.div
                key={`${r}-${shakeKey}`}
                animate={
                  shakeKey > 0
                    ? { x: [0, -8, 8, -5, 5, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.4 }}
              >
                {rowContent}
              </motion.div>
            );
          }
          return <div key={r}>{rowContent}</div>;
        })}

        {showAnswerRow && (
          <div className="mt-1 flex gap-1.5" style={{ height: size }}>
            {Array.from({ length: len }, (_, c) => (
              <Tile
                key={`ans-${c}`}
                letter={game.word[c]}
                state="empty"
                variant="answer"
                size={size}
                delay={c * 70}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
