'use client';

import { motion } from 'framer-motion';

interface WordAnnouncementProps {
  index: number; // 0-based
  total: number;
  length: number;
}

export function WordAnnouncement({ index, total, length }: WordAnnouncementProps) {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.p
        className="font-body text-xs font-medium uppercase tracking-[0.25em] text-muted"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        {length} letters
      </motion.p>
      <motion.p
        className="mt-2 font-display text-4xl font-extrabold text-ink"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 22 }}
      >
        Word {index + 1}
        <span className="text-muted"> of {total}</span>
      </motion.p>
    </motion.div>
  );
}
