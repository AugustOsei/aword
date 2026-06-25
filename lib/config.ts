// Test/dev configuration.
//
// ALLOW_REPLAY removes the once-a-day lock so we can replay today's session
// freely while testing. When true:
//   • Home no longer redirects to the completed screen.
//   • The play screen starts a fresh session even if today is already done.
//   • A "Play again" control appears on the results screen.
//
// Driven by env so production is locked by default while local dev stays
// replayable. Set NEXT_PUBLIC_AWORD_TEST_MODE to 'true'/'false' to force it;
// otherwise it's on in development and off in production.
export const TEST_MODE =
  process.env.NEXT_PUBLIC_AWORD_TEST_MODE === 'true' ||
  (process.env.NEXT_PUBLIC_AWORD_TEST_MODE !== 'false' &&
    process.env.NODE_ENV !== 'production');

export const ALLOW_REPLAY = TEST_MODE;

// Every word in a session is this length (test preference: 5-letter words only).
export const SESSION_WORD_LENGTH = 5;
export const SESSION_WORD_COUNT = 5;

// Canonical site origin (no trailing slash). Override per-environment with
// NEXT_PUBLIC_SITE_URL; used for metadata, sitemap, robots, and the manifest.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://aword.augustwheel.com'
).replace(/\/$/, '');
