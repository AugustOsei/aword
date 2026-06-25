'use client';

export function AboutModal() {
  return (
    <div className="space-y-4 font-body text-sm font-light leading-relaxed text-ink/90">
      <p>
        Aword is a premium daily word game. Every day you play a single session
        of five sequential five-letter puzzles, and earn a daily medal — gold,
        silver, or bronze — based on how you do.
      </p>
      <p>
        It&apos;s a play on <span className="text-green">award</span>. A 5-word
        daily session that teaches you something every day. After each word you
        see its definition, pronunciation, and an example — and you can save the
        ones worth remembering.
      </p>
      <p>
        When you finish, the day&apos;s standout word rises in like a sunrise,
        with its meaning — your word of the day.
      </p>
      <div className="space-y-1 border-t border-edge pt-4 text-muted">
        <p>
          Built by{' '}
          <a
            href="https://augustwheel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green underline-offset-2 hover:underline"
          >
            August Wheel
          </a>
          .
        </p>
        <p>No account needed. Your progress lives in your browser.</p>
        <p className="text-xs">
          We don&apos;t collect any data. Everything is stored locally on your
          device.
        </p>
        <p className="pt-2 text-xs">v1.0.0 · aword.augustwheel.com</p>
      </div>
    </div>
  );
}
