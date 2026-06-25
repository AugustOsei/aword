# Aword

A premium daily word game. The name is a play on **award** — every day you play
one session of **five sequential five-letter puzzles** and earn a daily medal
(gold / silver / bronze) based on how you do. After each word you see its
definition, pronunciation, and an example, and when you finish, the day's rarest
word rises in like a sunrise as your **word of the day**.

## Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | Next.js 16 (App Router) on React 19                 |
| Language     | TypeScript 5                                        |
| Styling      | Tailwind CSS v4 (via `@tailwindcss/postcss`)        |
| Animation    | Framer Motion 12                                    |
| Sound        | Tone.js (synthesised, no audio files)               |
| Icons        | lucide-react                                        |
| Tooling      | ESLint 9 (`eslint-config-next`)                     |
| Runtime      | Node 22                                             |
| Hosting      | Vercel (deploy from GitHub)                         |
| Backend      | None — all state lives in `localStorage`            |

> Note: this is a recent Next.js. APIs/conventions may differ from older
> versions — see `AGENTS.md` and the bundled docs in `node_modules/next/dist/docs`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # type-check
```

## How it works

- **Daily words** — `lib/words.ts` picks five distinct words per day from a
  date-seeded hash (`YYYY-MM-DD`), so every player worldwide gets the same set on
  the same day with no server. Picks step through the bank by a stride coprime to
  its size, so they fan out across the alphabet instead of clustering on a shared
  prefix. The answer pool (`lib/wordbank.ts`) is the curated official Wordle
  answers (~2,300); valid guesses are the official Wordle allowed-guess list
  (~14,800) — instant, local, offline-proof.
- **Word of the day** — `getFeaturedWord` (`lib/words.ts`) surfaces the rarest of
  the day's five, ranked by `lib/wordRarity.ts` (frequency rank; words absent
  from the common-word list are rarest). Revealed on the results screen by
  `components/results/WordOfTheDayReveal.tsx` over a generated looping sunrise
  video (`public/word-reveal.mp4`, poster `public/word-reveal-poster.jpg`).
  Respects `prefers-reduced-motion` (shows the still poster).
- **Definitions** — fetched from the free
  [dictionaryapi.dev](https://dictionaryapi.dev), pre-loaded while you guess so
  the card appears instantly. Failures degrade gracefully to the word alone.
- **Sound** — synthesised with Tone.js (`lib/sounds.ts`); respects a persisted
  mute toggle and reduced-motion.
- **Persistence** — `lib/storage.ts` handles results, streak/award history, saved
  words, and an obfuscated (base64) in-progress session so you can resume without
  leaking today's answers in dev tools.

## Awards & streaks

| Solved | Medal         |
| ------ | ------------- |
| 5 / 5  | Gold          |
| 4 / 5  | Silver        |
| 3 / 5  | Bronze        |
| ≤ 2    | Participation |

A streak grows on consecutive completed days and resets to 1 (not 0) after a
missed day.

## SEO & PWA

- Metadata, Open Graph + Twitter cards in `app/layout.tsx`; the share image is
  generated at `app/opengraph-image.tsx` (reused by `app/twitter-image.tsx`).
- `app/robots.ts`, `app/sitemap.ts`, and JSON-LD (`WebApplication`) in the layout.
- Installable PWA: `app/manifest.ts` + icons (`app/icon.svg`, `app/apple-icon.png`,
  `public/icon-{192,512,maskable}.png`).

## Configuration (`lib/config.ts`)

| Env var                       | Effect                                                        |
| ----------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`        | Canonical origin for metadata/sitemap/robots. Default `https://aword.augustwheel.com`. |
| `NEXT_PUBLIC_AWORD_TEST_MODE` | `true`/`false` to force replay mode. Unset → on in dev, off in production. |

Replay mode (`ALLOW_REPLAY`) removes the once-a-day lock for testing. It is
**off in production by default** — no manual flag to flip before shipping.

`SESSION_WORD_LENGTH` (5) and `SESSION_WORD_COUNT` (5) define the daily session.

## Deploy (Vercel + GitHub)

1. Push to GitHub and import the repo in Vercel (zero-config Next.js).
2. Vercel gives an immediate `*.vercel.app` URL to test on.
3. Custom domain: add `aword.augustwheel.com` in Vercel → Domains, then add the
   `CNAME` record it shows at your DNS provider. (Subdomain needs nothing from the
   augustwheel.com site itself.)
4. Set `NEXT_PUBLIC_SITE_URL=https://aword.augustwheel.com` in Vercel env vars.

## Curation

`/preview` (noindexed) lists the next 30 days of words with the ★ word of the
day — use it to eyeball upcoming sets. Hand-picking specific dates / themed days
(e.g. Earth Day, a product launch with a custom landing image) is not built yet;
the planned mechanism is a date-keyed overrides config.

## Project structure

```
app/
  layout.tsx, page.tsx              Root layout + home (stats)
  onboarding/                       Landing/hero (animated board + bird)
  play/                             The game session
  complete/                        Results + word-of-the-day reveal
  words/, words/today/             Saved words / today's words
  preview/                         Upcoming-words schedule (noindexed)
  manifest.ts, robots.ts, sitemap.ts
  opengraph-image.tsx, twitter-image.tsx, icon.svg, apple-icon.png
components/
  game/        Tile, TileGrid, Keyboard, WordCard, SessionProgress, announcements
  onboarding/  HeroBoard (slot-machine board), PlayButtonWithBird
  results/     AwardBadge, StaircaseCard, ShareButton, WordOfTheDayReveal
  ui/          Modal, HowToPlay, AboutModal
  layout/      Header
hooks/         useGameSession, useKeyboard, useCountdown
lib/           words, wordbank, wordRarity, dictionary, storage, sounds, share, config, utils
types/         Shared interfaces
```

Built by [August Wheel](https://augustwheel.com/). v1.0.0 · aword.augustwheel.com
