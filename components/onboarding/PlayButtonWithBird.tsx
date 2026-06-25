'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playChirp } from '@/lib/sounds';

// Read the media query directly. Framer's useReducedMotion defaults to `true`
// on first render (SSR-safe) which can latch our flight/flap off; this starts
// motion-on and only switches off if the user actually prefers reduced motion.
function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

interface PlayButtonWithBirdProps {
  label: string;
  onClick: () => void;
  appearDelay?: number;
  /** When false, the bird is already perched (no fly-in). Used after the
   *  landing page, where the entrance has already played. */
  flyIn?: boolean;
}

type Phase = 'fly' | 'perch';

const BIRD_W = 80;
const FLAP_MS = 90;
// The folded-wing art fills its frame edge-to-edge, while the flying frames have
// padding around the body. Shrink the perched bird so its body reads the same
// size as it did mid-flight.
const PERCH_SCALE = 0.87;

export function PlayButtonWithBird({
  label,
  onClick,
  appearDelay = 0.6,
  flyIn = true,
}: PlayButtonWithBirdProps) {
  const reduce = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(flyIn ? 'fly' : 'perch');
  const [dipping, setDipping] = useState(false);

  // No fly-in for reduced motion — just show the perched bird.
  useEffect(() => {
    if (reduce) setPhase('perch');
  }, [reduce]);

  const land = () => {
    setPhase('perch');
    playChirp();
    setDipping(true);
  };

  return (
    <div className="relative w-full">
      <Bird phase={phase} reduce={!!reduce} appearDelay={appearDelay} onLand={land} />
      <motion.button
        type="button"
        onClick={onClick}
        className="btn-play relative z-10 w-full px-6 py-4 text-lg"
        style={{ transformOrigin: 'bottom center' }}
        animate={dipping ? { y: [0, 6, -1, 0], scaleY: [1, 0.94, 1.01, 1] } : { y: 0, scaleY: 1 }}
        transition={dipping ? { duration: 0.55, times: [0, 0.28, 0.6, 1], ease: 'easeOut' } : { duration: 0 }}
        onAnimationComplete={() => dipping && setDipping(false)}
      >
        {label}
      </motion.button>
    </div>
  );
}

function Bird({
  phase,
  reduce,
  appearDelay,
  onLand,
}: {
  phase: Phase;
  reduce: boolean;
  appearDelay: number;
  onLand: () => void;
}) {
  const perched = phase === 'perch';
  const flapping = !perched && !reduce;

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: BIRD_W,
    height: 'auto',
    display: 'block',
  };
  // Hard square-wave alternation between the two frames → a wingbeat.
  const flapTransition = {
    duration: (FLAP_MS * 2) / 1000,
    times: [0, 0.49, 0.5, 1],
    repeat: Infinity,
    ease: 'linear' as const,
  };

  return (
    <motion.div
      className="pointer-events-none absolute z-20"
      style={{ left: '52%', bottom: 'calc(100% - 18px)', width: BIRD_W, height: BIRD_W }}
      initial={
        perched ? { opacity: 0 } : reduce ? { opacity: 0 } : { x: 150, y: -130, opacity: 0, rotate: 10 }
      }
      animate={
        perched
          ? { x: 0, y: 0, opacity: 1, rotate: 0 }
          : { x: [150, 52, 0], y: [-130, -46, 0], opacity: [0, 1, 1], rotate: [10, -6, 0] }
      }
      transition={
        perched
          ? { duration: 0.3, ease: 'easeOut' }
          : { duration: 1.7, times: [0, 0.55, 1], ease: 'easeOut', delay: appearDelay }
      }
      onAnimationComplete={() => {
        if (phase === 'fly' && !reduce) onLand();
      }}
    >
      {perched ? (
        <PerchedBird reduce={reduce} imgStyle={imgStyle} />
      ) : (
        <div className="relative h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/bird-fly-up.png"
            alt=""
            draggable={false}
            style={imgStyle}
            animate={flapping ? { opacity: [1, 1, 0, 0] } : { opacity: 0 }}
            transition={flapping ? flapTransition : { duration: 0.1 }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/bird-fly-down.png"
            alt="A little bird"
            draggable={false}
            style={imgStyle}
            animate={flapping ? { opacity: [0, 0, 1, 1] } : { opacity: 1 }}
            transition={flapping ? flapTransition : { duration: 0.1 }}
          />
        </div>
      )}
    </motion.div>
  );
}

// The settled bird: wings folded (bird.png), sitting still and blinking now and
// then. No idle drift or head movement — it just rests on the button.
function PerchedBird({
  reduce,
  imgStyle,
}: {
  reduce: boolean;
  imgStyle: React.CSSProperties;
}) {
  return (
    <div
      className="relative h-full w-full"
      style={{ transformOrigin: 'bottom center', transform: `scale(${PERCH_SCALE})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bird.png" alt="A little bird" draggable={false} style={imgStyle} />

      {/* Eyelid: sits exactly over the eye and snaps shut for a blink. */}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            left: 21,
            top: 12,
            width: 9,
            height: 11,
            borderRadius: '45% 45% 50% 50%',
            background: 'linear-gradient(180deg, #f0834f 0%, #f0834f 60%, #e0703f 100%)',
            transformOrigin: 'top center',
          }}
          animate={{ scaleY: [0, 0, 1, 0, 0] }}
          transition={{
            duration: 4.4,
            times: [0, 0.86, 0.9, 0.95, 1],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}
