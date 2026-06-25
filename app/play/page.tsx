'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameSession } from '@/hooks/useGameSession';
import { useKeyboard } from '@/hooks/useKeyboard';
import { SessionProgress } from '@/components/game/SessionProgress';
import { WordAnnouncement } from '@/components/game/WordAnnouncement';
import { TileGrid } from '@/components/game/TileGrid';
import { Keyboard } from '@/components/game/Keyboard';
import { WordCard } from '@/components/game/WordCard';
import { evaluateGuess } from '@/lib/utils';
import type { TileState } from '@/types';

const ANNOUNCE_MS = 800;
const RANK: Record<TileState, number> = { correct: 3, present: 2, absent: 1, empty: 0 };

export default function PlayPage() {
  const router = useRouter();
  const {
    session,
    currentGame,
    currentIndex,
    phase,
    shakeKey,
    isLastGame,
    alreadyComplete,
    addLetter,
    removeLetter,
    submitGuess,
    nextWord,
    dismissAnnouncement,
  } = useGameSession();

  // Redirect out when the session is done (or was already done today).
  useEffect(() => {
    if (phase === 'complete') {
      // Signal the complete screen to play its celebration sequence.
      try {
        sessionStorage.setItem('aword:celebrate', '1');
      } catch {
        /* ignore */
      }
      router.replace('/complete');
    } else if (alreadyComplete) {
      router.replace('/complete');
    }
  }, [phase, alreadyComplete, router]);

  // Hold the word announcement for a beat, then drop into play.
  useEffect(() => {
    if (phase !== 'announce') return;
    const t = setTimeout(dismissAnnouncement, ANNOUNCE_MS);
    return () => clearTimeout(t);
  }, [phase, currentIndex, dismissAnnouncement]);

  useKeyboard({
    onLetter: addLetter,
    onBackspace: removeLetter,
    onEnter: submitGuess,
    enabled: phase === 'play',
  });

  // Aggregate keyboard letter colors from the current game's guesses.
  const letterStates = useMemo(() => {
    const map: Record<string, TileState> = {};
    if (!currentGame) return map;
    for (const guess of currentGame.guesses) {
      const states = evaluateGuess(guess, currentGame.word);
      guess.split('').forEach((ch, i) => {
        const s = states[i];
        if (!map[ch] || RANK[s] > RANK[map[ch]]) map[ch] = s;
      });
    }
    return map;
  }, [currentGame]);

  if (!session || !currentGame) {
    return <div className="flex-1" />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="pt-1">
        <SessionProgress games={session.games} currentIndex={currentIndex} />
      </div>

      <div className="relative flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {phase === 'announce' ? (
            <WordAnnouncement
              key={`ann-${currentIndex}`}
              index={currentIndex}
              total={session.games.length}
              length={currentGame.wordLength}
            />
          ) : (
            <motion.div
              key={`grid-${currentIndex}`}
              className="flex flex-1 flex-col items-center justify-center px-4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <TileGrid game={currentGame} phase={phase} shakeKey={shakeKey} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0">
        <Keyboard
          letterStates={letterStates}
          onLetter={addLetter}
          onBackspace={removeLetter}
          onEnter={submitGuess}
          disabled={phase !== 'play'}
        />
      </div>

      <AnimatePresence>
        {phase === 'wordcard' && (
          <WordCard
            key={`card-${currentIndex}`}
            game={currentGame}
            date={session.date}
            isLast={isLastGame}
            onNext={nextWord}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
