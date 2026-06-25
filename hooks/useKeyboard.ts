'use client';

import { useEffect } from 'react';

interface Options {
  onLetter: (ch: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  enabled: boolean;
}

/**
 * Hardware keyboard support. Active only while `enabled` (game in progress and
 * no modal open). Attaches a single keydown listener to window.
 */
export function useKeyboard({ onLetter, onBackspace, onEnter, enabled }: Options) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      if (key === 'Enter') {
        e.preventDefault();
        onEnter();
      } else if (key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        onLetter(key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onLetter, onBackspace, onEnter]);
}
