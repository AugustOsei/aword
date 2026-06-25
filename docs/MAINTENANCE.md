# Aword — maintenance & operations

A plain-English reference for running Aword day to day.

## TL;DR — there is no backend

Aword is a fully static / serverless Next.js app on Vercel. There is **no
database and no server to maintain** — no patching, no cron jobs, no scaling.
Every player's state (streak, results, saved words) lives in **their own
browser** (`localStorage`). You can't see or manage individual players' data —
that's by design (no accounts, full privacy).

So "the backend" is really just: the deterministic word engine + Vercel hosting.

## Checking the words scheduled ahead

Visit the **preview page** on the live site:

```
https://aword.augustwheel.com/preview?key=YOUR_PREVIEW_KEY
```

- It lists the next 30 days with the ★ word of the day for each.
- The words are 100% deterministic from the calendar date, so what you see on
  prod is **exactly** what players will get.
- It's protected: without the correct `?key=` it returns 404 (see
  `AWORD_PREVIEW_KEY` below). Locally (`npm run dev`) it's open at
  `http://localhost:3000/preview` with no key.

## How the word engine works

| File                | Role                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| `lib/words.ts`      | Picks the 5 words for a date; `getFeaturedWord` picks the rarest.    |
| `lib/wordbank.ts`   | The pools: `ANSWER_WORDS` (~2,300 curated) + `VALID_GUESSES` (~14,800). |
| `lib/wordRarity.ts` | Frequency ranks used to choose the word of the day.                  |

Same date → same five words for everyone, worldwide, forever. Rotates daily on
its own. (Rollover is at each player's local midnight, not a single global time.)

## Environment variables (set in Vercel → Settings → Environment Variables)

| Var                          | Purpose                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | Canonical URL for metadata/sitemap/robots. Set to `https://aword.augustwheel.com`. |
| `AWORD_PREVIEW_KEY`          | Secret that unlocks `/preview?key=…` in production. Pick any random string. If unset, `/preview` stays 404 (safe). |
| `NEXT_PUBLIC_AWORD_TEST_MODE`| Leave **unset** in prod (replay lock on). `true` only for testing. |

## What actually needs occasional attention

1. **Word variety** — 2,315 answers ÷ 5/day ≈ ~460 days before combinations could
   start repeating. Long runway; refresh/expand the pool in ~a year if you like.
2. **Definitions** — fetched live from the free third-party
   [dictionaryapi.dev](https://dictionaryapi.dev). If it's ever slow or down, the
   game still works — the word just shows without a definition (graceful
   fallback). It's the only external dependency; nothing to maintain.
3. **Glance at `/preview`** now and then to catch a weak or awkward word group.

That's the whole list. No servers, backups, or uptime to babysit.

## Changing or curating words (today)

There's no override system yet, so to swap a weak group or set a themed day you
edit the data and redeploy:

1. Edit the relevant file (e.g. `lib/wordbank.ts`) — you can do this directly on
   github.com and commit from the browser.
2. Vercel auto-builds and deploys `main` in ~1 minute.

See "Better ways to manage" below for a cleaner approach.

## Deploy & rollback

- **Deploy:** push to GitHub `main` → Vercel auto-builds & deploys. That's the
  entire pipeline.
- **Rollback:** Vercel → Deployments → pick a previous one → **Promote**.

## Better ways to manage word scheduling

Ranked by effort:

1. **Date-keyed overrides file (recommended next step).** A small in-repo config
   like `{ "2026-04-22": { words: [...], theme: "Earth Day", landingImage: "/earth.jpg" } }`.
   The engine checks it first, else falls back to the auto-pick. Lets you swap
   groups, run themed days, and do product-launch days with a custom landing
   image — all by editing one file on GitHub (auto-deploys). Free, versioned, no
   new infrastructure. **One mechanism covers curation + themes.**
2. **Vercel Edge Config / hosted JSON.** Move that schedule out of the repo into
   Vercel Edge Config (editable in the dashboard, read at runtime). Change words
   **without a commit or redeploy**. Best if you'll curate frequently.
3. **A small password-protected admin page.** Most work; only worth it if you
   want a full UI for non-technical editing.

For an occasional-curation, solo-run game, option 1 is the sweet spot.
