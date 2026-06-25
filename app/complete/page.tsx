'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { DailyResult } from '@/types';
import { getPlayerData, getTodaysResult, clearSession } from '@/lib/storage';
import { buildShareText } from '@/lib/share';
import { ALLOW_REPLAY } from '@/lib/config';
import { AwardBadge } from '@/components/results/AwardBadge';
import { StaircaseCard } from '@/components/results/StaircaseCard';
import { ShareButton } from '@/components/results/ShareButton';
import { WordOfTheDayReveal } from '@/components/results/WordOfTheDayReveal';
import { getTodaysFeaturedWord } from '@/lib/words';
import { useCountdown } from '@/hooks/useCountdown';
import { playSessionComplete } from '@/lib/sounds';

export default function CompletePage() {
  const router = useRouter();
  const countdown = useCountdown();
  const [result, setResult] = useState<DailyResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const today = getTodaysResult();
    if (!today || !today.completed) {
      router.replace('/play');
      return;
    }
    let isCelebration = false;
    try {
      isCelebration = sessionStorage.getItem('aword:celebrate') === '1';
      if (isCelebration) {
        setTimeout(() => {
          try {
            sessionStorage.removeItem('aword:celebrate');
          } catch {
            /* ignore */
          }
        }, 2000);
      }
    } catch {
      /* ignore */
    }
    setResult(today);
    setStreak(getPlayerData().streak);
    setCelebrate(isCelebration);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (ready && celebrate) {
      const t = setTimeout(() => playSessionComplete(), 350);
      return () => clearTimeout(t);
    }
  }, [ready, celebrate]);

  if (!ready || !result) return <div className="flex-1" />;

  const shareText = buildShareText(result, streak);
  const stepDelay = (i: number) => (celebrate ? 0.25 + i * 0.18 : 0);
  const item = (i: number) => ({
    initial: celebrate ? { opacity: 0, y: 12 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { delay: stepDelay(i), type: 'spring' as const, stiffness: 240, damping: 24 },
  });

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-2">
      <div className="flex w-full max-w-sm flex-1 flex-col items-center">
        {!celebrate && (
          <p className="mb-4 font-body text-xs text-muted">
            You&apos;ve had your 5 words today
          </p>
        )}

        <motion.div {...item(0)} className="mt-4">
          <AwardBadge award={result.award} />
        </motion.div>

        <motion.p {...item(1)} className="mt-4 font-body text-[15px] text-muted">
          {result.score} of 5 words · {result.totalGuesses} guesses
        </motion.p>

        {streak > 0 && (
          <motion.span
            {...item(2)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-sm font-semibold"
            style={{ backgroundColor: 'var(--c-coral-soft)', color: 'var(--c-coral-deep)' }}
          >
            🔥 {streak} day streak
          </motion.span>
        )}

        <motion.div {...item(3)} className="mt-9">
          <StaircaseCard result={result} animate={celebrate} />
        </motion.div>

        <motion.div {...item(4)} className="mt-10 flex w-full flex-col gap-3">
          <WordOfTheDayReveal word={getTodaysFeaturedWord()} />
          <ShareButton text={shareText} />
          <Link
            href="/words/today"
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-edge bg-surface px-4 py-3.5 font-display text-base font-bold text-ink transition active:scale-[0.99]"
          >
            <BookOpen size={18} className="text-green" />
            See today&apos;s words
          </Link>

          {ALLOW_REPLAY && (
            <button
              type="button"
              onClick={() => {
                clearSession();
                router.push('/play');
              }}
              className="font-body text-xs text-muted underline-offset-2 hover:text-ink"
            >
              ↺ Play again (test mode)
            </button>
          )}
        </motion.div>

        <motion.p
          {...item(5)}
          className="mt-auto pt-10 text-center font-body text-xs text-muted"
        >
          Next session available tomorrow
          <br />
          <span className="font-mono tabular-nums">{countdown}</span>
        </motion.p>
      </div>
    </div>
  );
}
