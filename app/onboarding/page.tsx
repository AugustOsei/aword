'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { setSeenOnboarding } from '@/lib/storage';
import { initAudio } from '@/lib/sounds';
import { PlayButtonWithBird } from '@/components/onboarding/PlayButtonWithBird';
import { HeroBoard } from '@/components/onboarding/HeroBoard';

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The landing/hero page doubles as the app's home, reachable any time via
    // the "Aword" logo — so we no longer redirect returning visitors away.
    setReady(true);
  }, [router]);

  const start = () => {
    initAudio();
    setSeenOnboarding();
    router.replace('/');
  };

  if (!ready) return <div className="flex-1" />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-7 pb-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HeroBoard />
      </motion.div>

      <motion.h1
        className="mt-9 max-w-[340px] font-display text-3xl font-bold leading-[1.12] text-ink"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        Five words a day — and what they mean.
      </motion.h1>
      <motion.p
        className="mt-3 max-w-[280px] font-body text-[15px] text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.47 }}
      >
        Guess each word, learn what it means, and earn a daily medal.
      </motion.p>

      <motion.div
        className="mt-[4.5rem] w-full max-w-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <PlayButtonWithBird label="Play today →" onClick={start} appearDelay={1.7} />
      </motion.div>
      <motion.p
        className="mt-3.5 font-body text-xs text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15 }}
      >
        No login. Your streak lives on your device.
      </motion.p>
    </div>
  );
}
