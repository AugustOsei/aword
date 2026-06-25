'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sunrise, X } from 'lucide-react';
import type { WordData } from '@/types';
import { getWordData } from '@/lib/dictionary';

// A one-time cinematic moment: tapping the button raises a full-screen sunrise
// (the generated loop video) while the day's rarest word rises in with the
// light and its meaning fades in beneath. Holds on the warm final frame.
export function WordOfTheDayReveal({ word }: { word: string }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<WordData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => setMounted(true), []);

  const openReveal = () => {
    setOpen(true);
    // Fetch the meaning in the background — the word shows immediately either way.
    getWordData(word).then(setData);
  };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const v = videoRef.current;
    if (v && !reduce) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, reduce]);

  // Timed to the sunrise: word lifts in as the light grows, meaning follows.
  const t = (delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
        };

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => setOpen(false)}
        >
          {/* sunrise backdrop */}
          {reduce ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/word-reveal-poster.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src="/word-reveal.mp4"
              poster="/word-reveal-poster.jpg"
              muted
              playsInline
              preload="auto"
            />
          )}
          {/* soft scrim so text stays legible over the brightest light */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,248,235,0.35) 0%, rgba(255,245,230,0.05) 38%, rgba(74,46,20,0.10) 78%, rgba(74,46,20,0.28) 100%)',
            }}
          />

          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#5a3d18] transition active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}
          >
            <X size={20} />
          </button>

          {/* the reveal */}
          <div
            className="absolute inset-x-0 flex flex-col items-center px-8 text-center"
            style={{ top: '20%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.p
              {...t(0.5)}
              className="font-body text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: '#9a6a2e' }}
            >
              Word of the day
            </motion.p>

            <motion.h2
              {...t(1.3)}
              className="mt-3 font-display font-extrabold leading-none"
              style={{ fontSize: 'clamp(2.4rem, 12vw, 4rem)', color: '#3a2510' }}
            >
              {word.toUpperCase()}
            </motion.h2>

            {data?.phonetic || data?.partOfSpeech ? (
              <motion.p
                {...t(2.3)}
                className="mt-3 font-body text-[15px]"
                style={{ color: '#6b4a24' }}
              >
                {data.phonetic && <span className="font-mono">{data.phonetic}</span>}
                {data.phonetic && data.partOfSpeech ? '  ·  ' : ''}
                {data.partOfSpeech && <span className="italic">{data.partOfSpeech}</span>}
              </motion.p>
            ) : null}

            <motion.p
              {...t(2.8)}
              className="mt-5 max-w-[300px] font-body text-[17px] leading-relaxed"
              style={{ color: '#4a3018' }}
            >
              {data
                ? data.definition || 'Meaning unavailable right now — look it up later.'
                : '…'}
            </motion.p>

            {data?.example ? (
              <motion.p
                {...t(3.2)}
                className="mt-4 max-w-[300px] font-body text-[14px] italic"
                style={{ color: '#7a5631' }}
              >
                “{data.example}”
              </motion.p>
            ) : null}
          </div>

          <motion.button
            type="button"
            {...t(reduce ? 0 : 3.6)}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute inset-x-0 bottom-10 mx-auto w-fit rounded-full px-6 py-2.5 font-display text-sm font-bold active:scale-95"
            style={{ backgroundColor: 'rgba(58,37,16,0.88)', color: '#fff6ea' }}
          >
            Done
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={openReveal}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] px-4 py-3.5 font-display text-base font-bold text-white transition active:scale-[0.99]"
        style={{ background: 'linear-gradient(180deg, var(--c-marigold) 0%, var(--c-coral) 100%)' }}
      >
        <Sunrise size={18} />
        Reveal today&apos;s word
      </button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
