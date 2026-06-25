'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

// A one-time hero: a 5x5 board where each column spins like a slot-machine reel
// and locks left-to-right, settling on five words that describe the loop. The
// reels fully settle (~1.3s) before the bird flies in, so the two never overlap.

const WORDS = ['GUESS', 'LEARN', 'WORDS', 'DAILY', 'ENJOY'];
const TILE = 38;
const GAP = 6;
const REEL_LEN = 16; // random letters that scroll past before the real one lands
const REST = -REEL_LEN * TILE;

const SPIN_DELAY = 0.15;
const SPIN_DUR = 0.55;
const COL_STAGGER = 0.16;

type Cell = { bg: string; fg: string };
const G: Cell = { bg: 'var(--c-green)', fg: 'var(--c-on-correct)' };
const Y: Cell = { bg: 'var(--c-marigold)', fg: 'var(--c-marigold-ink)' };
const S: Cell = { bg: 'var(--c-stone)', fg: 'var(--c-ink)' };

// Designed (not random) colour pattern: mostly green with a few marigold/stone
// accents so it reads like a near-solved board rather than visual noise.
const BOARD: Cell[][] = [
  [G, Y, G, G, G],
  [G, G, G, Y, G],
  [Y, G, G, G, S],
  [G, G, Y, G, G],
  [G, S, G, G, G],
];

// Deterministic "random-looking" filler letters — avoids SSR/client mismatch.
const POOL = 'AWORDGUESLNYIBCMPTKVH';
const reelChar = (r: number, c: number, k: number) =>
  POOL[(r * 31 + c * 17 + k * 7) % POOL.length];

export function HeroBoard() {
  const reduce = useReducedMotion();
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    if (reduce) {
      setLocked([true, true, true, true, true]);
      return;
    }
    const timers = COLS.map((c) =>
      window.setTimeout(
        () => setLocked((prev) => prev.map((v, i) => (i === c ? true : v))),
        (SPIN_DELAY + SPIN_DUR + c * COL_STAGGER) * 1000,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  return (
    <div
      role="img"
      aria-label="Aword board spelling guess, learn, words, daily, enjoy"
      style={{ display: 'grid', gridTemplateColumns: `repeat(5, ${TILE}px)`, gap: GAP }}
    >
      {BOARD.map((row, r) =>
        row.map((cell, c) => {
          const isLocked = locked[c];
          return (
            <motion.div
              key={`${r}-${c}`}
              style={{
                width: TILE,
                height: TILE,
                borderRadius: 9,
                overflow: 'hidden',
                position: 'relative',
                background: isLocked ? cell.bg : 'transparent',
                border: `2px solid ${isLocked ? 'transparent' : 'var(--c-edge)'}`,
                transition: 'background-color 0.16s ease, border-color 0.16s ease',
              }}
              animate={isLocked ? { scale: [1, 1.09, 1] } : { scale: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <motion.div
                style={{ display: 'flex', flexDirection: 'column' }}
                initial={{ y: 0 }}
                animate={{ y: REST }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        delay: SPIN_DELAY,
                        duration: SPIN_DUR + c * COL_STAGGER,
                        ease: [0.12, 0.7, 0.25, 1],
                      }
                }
              >
                {Array.from({ length: REEL_LEN }).map((_, k) => (
                  <Glyph key={k} color="var(--c-ink)">
                    {reelChar(r, c, k)}
                  </Glyph>
                ))}
                <Glyph color={isLocked ? cell.fg : 'var(--c-ink)'}>{WORDS[r][c]}</Glyph>
              </motion.div>
            </motion.div>
          );
        }),
      )}
    </div>
  );
}

const COLS = [0, 1, 2, 3, 4];

function Glyph({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        height: TILE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: TILE * 0.42,
        color,
        lineHeight: 1,
      }}
    >
      {children}
    </div>
  );
}
