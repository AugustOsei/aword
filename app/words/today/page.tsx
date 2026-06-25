'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { DailyResult, WordData } from '@/types';
import { getTodaysResult } from '@/lib/storage';
import { getWordData } from '@/lib/dictionary';
import { StaticWordCard } from '@/components/game/StaticWordCard';

export default function TodaysWordsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DailyResult | null>(null);
  const [data, setData] = useState<Record<string, WordData | null>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const today = getTodaysResult();
    if (!today) {
      router.replace('/');
      return;
    }
    setResult(today);
    setReady(true);

    // Lazily fetch definitions for each of today's words.
    let cancelled = false;
    today.games.forEach((g) => {
      getWordData(g.word).then((d) => {
        if (cancelled) return;
        setData((prev) => ({ ...prev, [g.word]: d }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready || !result) return <div className="flex-1" />;

  return (
    <div className="flex flex-1 flex-col px-6 pb-12 pt-2">
      <Link
        href="/complete"
        className="mb-4 inline-flex items-center gap-1.5 font-body text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to results
      </Link>

      <h1 className="font-display text-3xl font-extrabold text-ink">
        Today&apos;s Words
      </h1>
      <p className="mt-1 font-body text-sm font-light text-muted">
        Everything you played today.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {result.games.map((g, i) => (
          <motion.div
            key={g.word}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <StaticWordCard
              word={g.word}
              data={data[g.word] ?? null}
              solved={g.solved}
              guessCount={g.guessCount}
              date={result.date}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
