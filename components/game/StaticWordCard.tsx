'use client';

import { Bookmark, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { WordData } from '@/types';
import { isWordSaved, saveWord, unsaveWord } from '@/lib/storage';

interface StaticWordCardProps {
  word: string;
  data: WordData | null;
  solved: boolean;
  guessCount: number;
  date: string;
}

export function StaticWordCard({
  word,
  data,
  solved,
  guessCount,
  date,
}: StaticWordCardProps) {
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
    <div className="relative rounded-2xl border border-edge bg-surface p-5">
      <button
        type="button"
        onClick={toggleSave}
        aria-label={saved ? 'Unsave word' : 'Save word'}
        aria-pressed={saved}
        className="absolute right-4 top-4 rounded-full p-1.5"
      >
        <Bookmark
          size={20}
          className={saved ? 'text-marigold' : 'text-muted'}
          fill={saved ? 'var(--c-marigold)' : 'none'}
        />
      </button>

      <h3 className="pr-9 font-display text-2xl font-extrabold uppercase tracking-tight text-green">
        {word}
      </h3>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 font-body text-sm font-light text-muted">
        {data?.partOfSpeech && <span className="italic">{data.partOfSpeech}</span>}
        {data?.phonetic && <span>{data.phonetic}</span>}
      </div>

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
        <p className="mt-3 border-l-2 border-edge pl-3 font-body text-sm font-light italic text-muted">
          &ldquo;{data.example}&rdquo;
        </p>
      ) : null}

      <div className="mt-4 font-body text-sm">
        {solved ? (
          <span className="flex items-center gap-1.5 text-green">
            <Check size={15} /> Solved in {guessCount}{' '}
            {guessCount === 1 ? 'guess' : 'guesses'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-muted">
            <X size={15} /> Not solved
          </span>
        )}
      </div>
    </div>
  );
}
