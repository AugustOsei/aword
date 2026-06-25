'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { Award as AwardType } from '@/types';

interface AwardBadgeProps {
  award: AwardType;
}

const CONFIG: Record<
  AwardType,
  { label: string; ring: string; kind: 'check' | 'book' }
> = {
  gold: { label: 'Gold award!', ring: '#f5b72e', kind: 'check' },
  silver: { label: 'Silver award', ring: '#aeb4bb', kind: 'check' },
  bronze: { label: 'Bronze award', ring: '#d98a5b', kind: 'check' },
  participation: { label: 'Good effort', ring: '#9bbf9e', kind: 'book' },
};

export function AwardBadge({ award }: AwardBadgeProps) {
  const { label, ring, kind } = CONFIG[award];
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ scale: 0.85, opacity: 0, y: 6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 16 }}
    >
      <div className="relative h-[116px] w-[116px]">
        <svg width="116" height="116" viewBox="0 0 118 118" aria-hidden="true">
          <circle cx="59" cy="59" r="46" fill={ring} />
          <circle cx="59" cy="59" r="36" fill="var(--c-surface)" />
          <circle cx="59" cy="59" r="36" fill="none" stroke={ring} strokeWidth="3" />
          {kind === 'check' && (
            <motion.path
              d="M44 60 l10 11 21 -24"
              fill="none"
              stroke="var(--c-green)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
            />
          )}
        </svg>
        {kind === 'book' && (
          <BookOpen
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
            size={34}
            strokeWidth={2}
          />
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink">
        {label}
      </p>
    </motion.div>
  );
}
