'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ActiveGame,
  DailyResult,
  GameResult,
  SessionState,
} from '@/types';
import { MAX_GUESSES, WORD_LENGTHS } from '@/types';
import { getTodaysWords, isValidWord } from '@/lib/words';
import { getWordData } from '@/lib/dictionary';
import {
  awardForScore,
  clearSession,
  getTodaysResult,
  loadSession,
  saveDailyResult,
  saveSession,
} from '@/lib/storage';
import { getTodayString } from '@/lib/utils';
import { evaluateGuess, isWinningGuess } from '@/lib/utils';
import { ALLOW_REPLAY } from '@/lib/config';
import {
  playCorrectGuess,
  playInvalidWord,
  playWrongPosition,
} from '@/lib/sounds';

// Animation timing (kept in sync with the Tile component).
export const FLIP_STAGGER = 60;
export const FLIP_DURATION = 280;
const WIN_CARD_DELAY = 600;
const LOSS_CARD_DELAY = 800;

function revealDuration(len: number): number {
  return (len - 1) * FLIP_STAGGER + FLIP_DURATION + 40;
}

export type Phase =
  | 'loading'
  | 'announce'
  | 'play'
  | 'reveal'
  | 'won'
  | 'lost'
  | 'wordcard'
  | 'complete';

function createSession(): SessionState {
  const words = getTodaysWords();
  const games: ActiveGame[] = words.map((word) => ({
    word,
    wordLength: word.length,
    guesses: [],
    currentInput: '',
    status: 'active',
    wordData: null,
  }));
  return {
    date: getTodayString(),
    currentGameIndex: 0,
    games,
    sessionStarted: true,
    sessionComplete: false,
  };
}

export function useGameSession() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [shakeKey, setShakeKey] = useState(0);
  const [alreadyComplete, setAlreadyComplete] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sessionRef = useRef<SessionState | null>(null);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const persist = useCallback((s: SessionState) => {
    sessionRef.current = s;
    setSession(s);
    saveSession(s);
  }, []);

  // ----------------------------- init -----------------------------------
  useEffect(() => {
    // If today's session is already finished, signal the page to redirect.
    // During testing (ALLOW_REPLAY) we skip this lock and start fresh.
    if (!ALLOW_REPLAY && getTodaysResult()) {
      setAlreadyComplete(true);
      setPhase('complete');
      return;
    }

    const today = getTodayString();
    const saved = loadSession();
    let s: SessionState;
    if (saved && saved.date === today && !saved.sessionComplete) {
      s = saved;
    } else {
      // New day or no session: start fresh and drop any stale session.
      clearSession();
      s = createSession();
    }
    sessionRef.current = s;
    setSession(s);
    saveSession(s);
    setPhase('announce');

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const currentGame: ActiveGame | null = session
    ? session.games[session.currentGameIndex]
    : null;

  // ----------------------- prefetch definitions -------------------------
  useEffect(() => {
    if (!session || !currentGame) return;
    if (currentGame.wordData) return;
    let cancelled = false;
    getWordData(currentGame.word).then((data) => {
      if (cancelled) return;
      const s = sessionRef.current;
      if (!s) return;
      const idx = s.currentGameIndex;
      if (s.games[idx].word !== currentGame.word) return;
      const games = s.games.slice();
      games[idx] = { ...games[idx], wordData: data };
      persist({ ...s, games });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentGameIndex, currentGame?.word]);

  // --------------------------- input handlers ---------------------------
  const canType = phase === 'play';

  const addLetter = useCallback(
    (ch: string) => {
      if (!canType) return;
      const s = sessionRef.current;
      if (!s) return;
      const idx = s.currentGameIndex;
      const game = s.games[idx];
      if (game.currentInput.length >= game.wordLength) return;
      const games = s.games.slice();
      games[idx] = { ...game, currentInput: game.currentInput + ch.toLowerCase() };
      persist({ ...s, games });
    },
    [canType, persist]
  );

  const removeLetter = useCallback(() => {
    if (!canType) return;
    const s = sessionRef.current;
    if (!s) return;
    const idx = s.currentGameIndex;
    const game = s.games[idx];
    if (game.currentInput.length === 0) return;
    const games = s.games.slice();
    games[idx] = { ...game, currentInput: game.currentInput.slice(0, -1) };
    persist({ ...s, games });
  }, [canType, persist]);

  const submitGuess = useCallback(() => {
    if (!canType) return;
    const s = sessionRef.current;
    if (!s) return;
    const idx = s.currentGameIndex;
    const game = s.games[idx];
    const guess = game.currentInput.toLowerCase();

    if (guess.length !== game.wordLength || !isValidWord(guess, game.wordLength)) {
      setShakeKey((k) => k + 1);
      playInvalidWord();
      return;
    }

    const guesses = [...game.guesses, guess];
    const won = isWinningGuess(guess, game.word);
    const outOfGuesses = guesses.length >= MAX_GUESSES;
    const nextStatus: ActiveGame['status'] = won
      ? 'won'
      : outOfGuesses
        ? 'lost'
        : 'active';

    const games = s.games.slice();
    games[idx] = { ...game, guesses, currentInput: '', status: nextStatus };
    persist({ ...s, games });
    setPhase('reveal');

    const revealMs = revealDuration(game.wordLength);
    schedule(() => {
      // Row-resolve sound.
      if (won) {
        playCorrectGuess();
      } else {
        const states = evaluateGuess(guess, game.word);
        const hasGreen = states.includes('correct');
        const hasYellow = states.includes('present');
        if (outOfGuesses || (!hasGreen && hasYellow)) playWrongPosition();
      }

      if (won) {
        setPhase('won');
        schedule(() => setPhase('wordcard'), WIN_CARD_DELAY);
      } else if (outOfGuesses) {
        setPhase('lost');
        schedule(() => setPhase('wordcard'), LOSS_CARD_DELAY);
      } else {
        setPhase('play');
      }
    }, revealMs);
  }, [canType, persist, schedule]);

  // ----------------------------- advance --------------------------------
  const isLastGame = session
    ? session.currentGameIndex >= session.games.length - 1
    : false;

  const finalize = useCallback((s: SessionState): DailyResult => {
    const games: GameResult[] = s.games.map((g) => ({
      word: g.word,
      solved: g.status === 'won',
      guesses: g.guesses,
      guessCount: g.guesses.length,
    }));
    const score = games.filter((g) => g.solved).length;
    const totalGuesses = games.reduce((sum, g) => sum + g.guessCount, 0);
    const result: DailyResult = {
      date: s.date,
      games,
      totalGuesses,
      score,
      award: awardForScore(score),
      completed: true,
    };
    saveDailyResult(result);
    clearSession();
    return result;
  }, []);

  const nextWord = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.currentGameIndex >= s.games.length - 1) {
      const done = { ...s, sessionComplete: true };
      sessionRef.current = done;
      setSession(done);
      finalize(done);
      setPhase('complete');
      return;
    }
    const next = { ...s, currentGameIndex: s.currentGameIndex + 1 };
    persist(next);
    setPhase('announce');
  }, [finalize, persist]);

  const dismissAnnouncement = useCallback(() => {
    setPhase((p) => (p === 'announce' ? 'play' : p));
  }, []);

  return {
    session,
    currentGame,
    currentIndex: session?.currentGameIndex ?? 0,
    phase,
    shakeKey,
    isLastGame,
    alreadyComplete,
    lengths: WORD_LENGTHS,
    addLetter,
    removeLetter,
    submitGuess,
    nextWord,
    dismissAnnouncement,
  };
}
