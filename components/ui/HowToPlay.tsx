'use client';

import { Trophy, Medal, Award, BookOpen } from 'lucide-react';

function MiniTile({ letter, kind }: { letter: string; kind: 'correct' | 'present' | 'absent' }) {
  const style: React.CSSProperties =
    kind === 'correct'
      ? { color: 'var(--c-on-correct)' }
      : kind === 'present'
        ? { backgroundColor: 'var(--c-marigold)', color: 'var(--c-marigold-ink)' }
        : { backgroundColor: 'var(--c-stone)', color: 'var(--c-ink)' };
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] font-display text-base font-extrabold ${kind === 'correct' ? 'tile-correct' : ''}`}
      style={style}
    >
      {letter}
    </span>
  );
}

export function HowToPlay() {
  return (
    <div className="space-y-6 font-body text-sm text-ink/90">
      <ul className="space-y-3">
        <li className="flex gap-2">
          <span className="text-green">•</span>
          You get five new words a day, one at a time — each a five-letter word.
        </li>
        <li className="flex gap-2">
          <span className="text-green">•</span>
          Guess each word in up to 5 tries. The tiles tell you how close you are.
        </li>
        <li className="flex gap-2">
          <span className="text-green">•</span>
          After each word, you&apos;ll see its definition. Save the ones you want
          to remember.
        </li>
        <li className="flex gap-2">
          <span className="text-green">•</span>
          At the end, reveal the day&apos;s featured word — a little sunrise
          moment with its meaning.
        </li>
      </ul>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <MiniTile letter="A" kind="correct" />
          <span>Right letter, right spot</span>
        </div>
        <div className="flex items-center gap-3">
          <MiniTile letter="B" kind="present" />
          <span>Right letter, wrong spot</span>
        </div>
        <div className="flex items-center gap-3">
          <MiniTile letter="C" kind="absent" />
          <span>Not in the word</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-edge pt-4">
        <p className="mb-1 font-body text-xs font-medium uppercase tracking-wider text-muted">
          Awards
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="flex items-center gap-2">
            <Trophy size={16} className="text-marigold" /> Gold — 5/5
          </span>
          <span className="flex items-center gap-2">
            <Medal size={16} style={{ color: '#9aa3ad' }} /> Silver — 4/5
          </span>
          <span className="flex items-center gap-2">
            <Medal size={16} style={{ color: 'var(--c-coral-deep)' }} /> Bronze — 3/5
          </span>
          <span className="flex items-center gap-2">
            <BookOpen size={16} className="text-green" /> Participation
          </span>
        </div>
      </div>

      <p className="border-t border-edge pt-4 text-sm text-muted">
        Complete a session every day to build your streak.
      </p>
    </div>
  );
}
