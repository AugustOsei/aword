'use client';

import { useEffect, useState } from 'react';

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** Live HH:MM:SS countdown to local midnight, ticking every second. */
export function useCountdown(): string {
  const [label, setLabel] = useState('00:00:00');

  useEffect(() => {
    setLabel(format(msUntilMidnight()));
    const id = setInterval(() => setLabel(format(msUntilMidnight())), 1000);
    return () => clearInterval(id);
  }, []);

  return label;
}
