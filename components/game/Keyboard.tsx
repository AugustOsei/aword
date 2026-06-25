'use client';

import { Delete, CornerDownLeft } from 'lucide-react';
import type { TileState } from '@/types';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

interface KeyboardProps {
  letterStates: Record<string, TileState>;
  onLetter: (ch: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

function keyStyle(state: TileState | undefined): { className: string; style: React.CSSProperties } {
  switch (state) {
    case 'correct':
      return { className: 'tile-correct', style: { color: 'var(--c-on-correct)' } };
    case 'present':
      return { className: '', style: { backgroundColor: 'var(--c-marigold)', color: 'var(--c-marigold-ink)' } };
    case 'absent':
      return { className: '', style: { backgroundColor: 'var(--c-stone)', color: 'var(--c-ink)', opacity: 0.7 } };
    default:
      return { className: 'bg-surface2 text-ink', style: {} };
  }
}

export function Keyboard({
  letterStates,
  onLetter,
  onBackspace,
  onEnter,
  disabled,
}: KeyboardProps) {
  return (
    <div
      className="mx-auto w-full max-w-[480px] select-none px-1.5 pb-[max(env(safe-area-inset-bottom),10px)] pt-2"
      aria-hidden={disabled}
    >
      {ROWS.map((row, i) => (
        <div key={i} className="mb-1.5 flex justify-center gap-1.5">
          {i === 2 && (
            <button
              type="button"
              onClick={onEnter}
              disabled={disabled}
              className="flex h-12 min-w-[44px] flex-[1.5] items-center justify-center rounded-[11px] bg-surface2 px-1 font-body text-[11px] font-semibold uppercase tracking-wide text-ink transition active:scale-95 disabled:opacity-50"
              aria-label="Enter"
            >
              <CornerDownLeft size={18} />
            </button>
          )}
          {row.split('').map((ch) => {
            const { className, style } = keyStyle(letterStates[ch]);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => onLetter(ch)}
                disabled={disabled}
                style={style}
                className={`flex h-12 flex-1 items-center justify-center rounded-[11px] font-body text-base font-semibold uppercase transition active:scale-95 disabled:opacity-60 ${className}`}
              >
                {ch}
              </button>
            );
          })}
          {i === 2 && (
            <button
              type="button"
              onClick={onBackspace}
              disabled={disabled}
              className="flex h-12 min-w-[44px] flex-[1.5] items-center justify-center rounded-[11px] bg-surface2 px-1 text-ink transition active:scale-95 disabled:opacity-50"
              aria-label="Backspace"
            >
              <Delete size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
