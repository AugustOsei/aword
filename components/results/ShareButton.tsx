'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  text: string;
}

export function ShareButton({ text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    try {
      // Prefer the native share sheet on mobile when available.
      if (typeof navigator !== 'undefined' && navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Last-resort fallback.
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className="btn-play flex w-full items-center justify-center gap-2 px-4 py-3.5 text-base"
    >
      {copied ? (
        <>
          <Check size={18} /> Copied!
        </>
      ) : (
        <>
          <Share2 size={18} /> Share your award
        </>
      )}
    </button>
  );
}
