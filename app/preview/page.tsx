import type { Metadata } from 'next';
import { getSameLengthWords, getFeaturedWord } from '@/lib/words';
import { getTodayString, formatLongDate } from '@/lib/utils';
import { SESSION_WORD_LENGTH, SESSION_WORD_COUNT } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Word schedule (preview)',
  robots: { index: false, follow: false },
};

const DAYS_AHEAD = 30;

export default function PreviewPage() {
  const today = new Date();
  const rows = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = getTodayString(d);
    const words = getSameLengthWords(dateStr, SESSION_WORD_LENGTH, SESSION_WORD_COUNT);
    const featured = getFeaturedWord(dateStr, words);
    return { dateStr, words, featured, offset: i };
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Word schedule</h1>
      <p className="mt-1 font-body text-sm text-muted">
        The next {DAYS_AHEAD} days, computed deterministically. ★ marks the word of the day.
        This page is private (noindexed).
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {rows.map(({ dateStr, words, featured, offset }) => (
          <div
            key={dateStr}
            className="flex flex-col gap-2 rounded-2xl border border-edge px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ backgroundColor: offset === 0 ? 'var(--c-coral-soft)' : 'transparent' }}
          >
            <div className="font-body text-sm text-muted">
              {offset === 0 ? 'Today · ' : ''}
              {formatLongDate(dateStr)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {words.map((w) => {
                const isFeatured = w === featured;
                return (
                  <span
                    key={w}
                    className="rounded-md px-2.5 py-1 font-mono text-sm font-semibold uppercase tracking-wide"
                    style={
                      isFeatured
                        ? { backgroundColor: 'var(--c-green)', color: 'var(--c-on-correct)' }
                        : { backgroundColor: 'var(--c-stone)', color: 'var(--c-ink)' }
                    }
                  >
                    {isFeatured ? '★ ' : ''}
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
