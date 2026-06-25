'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  HelpCircle,
  Info,
  Volume2,
  VolumeX,
  BookMarked,
  Sun,
  Moon,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { HowToPlay } from '@/components/ui/HowToPlay';
import { AboutModal } from '@/components/ui/AboutModal';
import {
  getMuted,
  setMuted as persistMuted,
  getTheme,
  setTheme as persistTheme,
  type Theme,
} from '@/lib/storage';
import { initAudio } from '@/lib/sounds';

export function Header() {
  const [muted, setMutedState] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');
  const [howOpen, setHowOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    setMutedState(getMuted());
    setThemeState(getTheme());
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    persistMuted(next);
    if (!next) initAudio();
  };

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    persistTheme(next);
  };

  const iconBtn =
    'rounded-full p-2 text-muted transition-colors hover:text-ink focus:outline-none focus-visible:text-ink';

  return (
    <>
      <header className="flex items-center justify-between px-5 py-4">
        <Link
          href="/onboarding"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
          aria-label="Aword home"
        >
          Aword
        </Link>

        <nav className="flex items-center gap-0.5">
          <Link href="/words" className={iconBtn} aria-label="My words">
            <BookMarked size={20} />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className={iconBtn}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className={iconBtn}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-pressed={muted}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setHowOpen(true)}
            className={iconBtn}
            aria-label="How to play"
          >
            <HelpCircle size={20} />
          </button>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className={iconBtn}
            aria-label="About Aword"
          >
            <Info size={20} />
          </button>
        </nav>
      </header>

      <Modal open={howOpen} onClose={() => setHowOpen(false)} title="How to play">
        <HowToPlay />
      </Modal>
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Aword">
        <AboutModal />
      </Modal>
    </>
  );
}
