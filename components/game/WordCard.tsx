'use client';

import { motion } from 'framer-motion';
import { Bookmark, Check, X, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ActiveGame } from '@/types';
import { isWordSaved, saveWord, unsaveWord } from '@/lib/storage';

interface WordCardProps {
  game: ActiveGame;
  date: string;
  isLast: boolean;
  onNext: () => void;
}

export function WordCard({ game, date, isLast, onNext }: WordCardProps) {
  const data = game.wordData;
  const word = game.word;
  const solved = game.status === 'won';
  const guessCount = game.guesses.length;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isWordSaved(word));
  }, [word]);

  const toggleSave = () => {
    if (saved) {
      unsaveWord(word);
      setSaved(false);
    } else {
      saveWord({
        word,
        phonetic: data?.phonetic ?? '',
        partOfSpeech: data?.partOfSpeech ?? '',
        definition: data?.definition ?? '',
        example: data?.example ?? '',
        date,
      });
      setSaved(true);
    }
  };

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:inset-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md"
        style={{ perspective: 1000 }}
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      >
        <motion.div
          className="relative rounded-2xl border border-edge bg-surface p-6 shadow-2xl"
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center' }}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <button
            type="button"
            onClick={toggleSave}
            aria-label={saved ? 'Unsave word' : 'Save word'}
            aria-pressed={saved}
            className="absolute right-5 top-5 rounded-full p-1.5 transition-colors"
          >
            <Bookmark
              size={22}
              className={saved ? 'text-marigold' : 'text-muted'}
              fill={saved ? 'var(--c-marigold)' : 'none'}
            />
          </button>

          <h2 className="pr-10 font-display text-3xl font-extrabold uppercase tracking-tight text-ink">
            {word}
          </h2>

          {data?.phonetic ? (
            <p className="mt-1 font-body text-sm font-light text-muted">
              {data.phonetic}
            </p>
          ) : null}

          {data?.partOfSpeech ? (
            <p className="mt-2 font-body text-sm font-semibold italic text-green">
              {data.partOfSpeech}
            </p>
          ) : null}

          {data?.definition ? (
            <p className="mt-3 font-body text-base font-light leading-relaxed text-ink/90">
              {data.definition}
            </p>
          ) : (
            <p className="mt-3 font-body text-sm font-light italic text-muted">
              A definition wasn&apos;t available for this word.
            </p>
          )}

          {data?.example ? (
            <p className="mt-4 border-l-2 border-edge pl-3 font-body text-sm font-light italic text-muted">
              &ldquo;{data.example}&rdquo;
            </p>
          ) : null}

          <div className="mt-5 flex items-center gap-2 font-body text-sm">
            {solved ? (
              <span className="flex items-center gap-1.5 text-green">
                <Check size={16} /> Solved in {guessCount}{' '}
                {guessCount === 1 ? 'guess' : 'guesses'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted">
                <X size={16} /> Not solved
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="btn-play mt-6 flex w-full items-center justify-center gap-2 px-4 py-3.5 text-base"
          >
            {isLast ? 'See my results' : 'Next word'}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
