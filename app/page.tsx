'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Medal, Minus } from 'lucide-react';
import {
  getPlayerData,
  getTodaysResult,
  hasSeenOnboarding,
} from '@/lib/storage';
import { getTodaysWords } from '@/lib/words';
import { formatLongDate, getTodayString } from '@/lib/utils';
import { ALLOW_REPLAY } from '@/lib/config';

interface DayCell {
  date: string;
  award: string | null;
}

function lastSevenDays(history: { date: string; award: string }[]): DayCell[] {
  const map = new Map(history.map((h) => [h.date, h.award]));
  const cells: DayCell[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = getTodayString(d);
    cells.push({ date: key, award: map.get(key) ?? null });
  }
  return cells;
}

function HistoryIcon({ award }: { award: string | null }) {
  if (award === 'gold') return <Trophy size={18} className="text-marigold" strokeWidth={2} />;
  if (award === 'silver') return <Medal size={18} style={{ color: '#9aa3ad' }} />;
  if (award === 'bronze') return <Medal size={18} style={{ color: 'var(--c-coral-deep)' }} />;
  if (award === 'participation') return <Minus size={18} className="text-muted" />;
  return <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--c-stone)' }} />;
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [streak, setStreak] = useState(0);
  const [cells, setCells] = useState<DayCell[]>([]);
  const [wordCount, setWordCount] = useState(5);

  useEffect(() => {
    if (!hasSeenOnboarding()) {
      router.replace('/onboarding');
      return;
    }
    if (!ALLOW_REPLAY && getTodaysResult()) {
      router.replace('/complete');
      return;
    }
    const player = getPlayerData();
    setStreak(player.streak);
    setCells(lastSevenDays(player.awardHistory));
    setWordCount(getTodaysWords().length);
    setReady(true);
  }, [router]);

  if (!ready) return <div className="flex-1" />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
      <motion.div
        className="flex w-full max-w-sm flex-col items-center text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="font-body text-sm text-muted">{formatLongDate(getTodayString())}</p>

        {streak > 0 && (
          <span
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-sm font-semibold"
            style={{ backgroundColor: 'var(--c-coral-soft)', color: 'var(--c-coral-deep)' }}
          >
            🔥 {streak} day streak
          </span>
        )}

        <div className="mt-8 flex items-center gap-3">
          {cells.map((c) => (
            <div key={c.date} className="flex h-7 w-7 items-center justify-center" title={c.date}>
              <HistoryIcon award={c.award} />
            </div>
          ))}
        </div>
        <p className="mt-2 font-body text-xs font-medium uppercase tracking-wider text-muted/80">
          Last 7 days
        </p>

        <p className="mt-10 font-body text-sm text-muted">
          Today: {wordCount} words · 5 letters each
        </p>

        <div className="mt-6 w-full">
          <button
            type="button"
            onClick={() => router.push('/play')}
            className="btn-play relative z-10 w-full px-6 py-4 text-lg"
          >
            Start today&apos;s session
          </button>
        </div>
      </motion.div>
    </div>
  );
}
