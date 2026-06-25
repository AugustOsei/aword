'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookOpen } from 'lucide-react';
import type { SavedWord } from '@/types';
import { getSavedWords, unsaveWord } from '@/lib/storage';
import { formatShortDate } from '@/lib/utils';

export default function MyWordsPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWords(getSavedWords());
    setReady(true);
  }, []);

  const remove = (word: string) => {
    unsaveWord(word);
    setWords((prev) => prev.filter((w) => w.word !== word));
  };

  if (!ready) return <div className="flex-1" />;

  return (
    <div className="flex flex-1 flex-col px-6 pb-12 pt-2">
      <h1 className="font-display text-3xl font-extrabold text-ink">My Words</h1>
      <p className="mt-1 font-body text-sm font-light text-muted">
        {words.length} {words.length === 1 ? 'word' : 'words'} collected
      </p>

      {words.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-muted">
          <BookOpen size={40} strokeWidth={1.5} className="text-edge" />
          <p className="mt-4 max-w-xs font-body text-sm font-light">
            Words you save during play will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {words.map((w) => (
              <motion.div
                key={w.word + w.savedAt}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="relative rounded-xl border border-edge bg-surface p-4"
              >
                <button
                  type="button"
                  onClick={() => remove(w.word)}
                  aria-label={`Remove ${w.word}`}
                  className="absolute right-3 top-3 rounded-full p-1.5"
                >
                  <Bookmark size={18} className="text-marigold" fill="var(--c-marigold)" />
                </button>

                <h2 className="pr-8 font-display text-xl font-bold uppercase tracking-tight text-green">
                  {w.word}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 font-body text-xs font-light text-muted">
                  {w.partOfSpeech && <span className="italic">{w.partOfSpeech}</span>}
                  {w.phonetic && <span>{w.phonetic}</span>}
                </div>
                {w.definition && (
                  <p className="mt-2 font-body text-sm font-light leading-relaxed text-ink/90">
                    {w.definition}
                  </p>
                )}
                <p className="mt-2 font-body text-[11px] font-light text-muted/70">
                  Saved {formatShortDate(w.date)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
