# The Barn at Sunset Farm — Agent Briefing

Marketing site for an event venue. React + Vite + TypeScript,
originally generated from Google AI Studio and since developed by hand.

## THIS REPO IS PUBLIC

`doclegg05/TheBarnAtSunSetFarm` is a **public** GitHub repo — the only public
one in this workspace. Everything committed here is world-readable, including
git history.

**Known issue:** a real `VITE_GOOGLE_API_KEY` was committed in `b25e9dd` and
removed from the working tree in `3e59ee4`. It is **still present in git
history** and therefore still public. Deleting a secret from the tree does not
remove it from history. `GOOGLE_CALENDAR_SETUP.md` records that the venue's
Google Calendar API credential was revoked on 2026-10-05 and that the venue's
Google Cloud project had no active API keys afterwards.

Note also that any `VITE_`-prefixed variable is inlined into the client bundle
by Vite, so it reaches every visitor's browser by design. A Google key used
this way must be restricted (HTTP referrer / API restrictions in Google Cloud),
never treated as a secret.

Before any commit here: no keys, no personal data, no client contact details,
no prices. `.env` and `.env.local` are gitignored. Keep it that way, and add
new secrets to `.env.example` as empty placeholders only.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
npm run preview    # serve the build
```

The site needs no environment variables (see `.env.example`). If one is ever
added, set it in `.env.local` and never commit that file.

## Before you call it done

```bash
scripts/quality.sh
```

It runs the typecheck, the tests, lint and the production build. CI runs the
same script after a gitleaks scan. Run it rather than asserting the change
works. `npm run format` is available for formatting.

## Layout

| Path | What |
|---|---|
| `App.tsx`, `index.tsx` | entry |
| `components/` | UI |
| `hooks/`, `lib/` | shared logic (`lib/venueLocation.ts` holds the venue coordinates) |
| `event_manager_info/` | venue/business reference material |
| `GOOGLE_CALENDAR_SETUP.md` | record of the retired availability calendar |

## Rules

- Public repo — assume anything you write here will be read by strangers.
- The contact form reaches real customers. Do not change contact routing
  (Formspree) without Britt asking.
- Never show prices on the site. Pricing is quoted directly, and
  `tests/noPublicPricing.test.tsx` guards the home page.
- Workspace rules: `/Users/brittlegg/MacDev/AGENTS.md`.

## Definition of done

- The quality gate passes (the same steps `scripts/quality.sh` runs).
  - Check: `npm run typecheck && npm test -- --run && npm run lint && npm run build`
    Expected: exit code 0.
- No secrets in staged changes. This repo is public.
  - Check: `git diff --cached | grep -nE 'AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|BEGIN [A-Z ]*PRIVATE KEY'`
    Expected: no output.
- No `.env` file is staged.
  - Check: `git diff --cached --name-only | grep -E '(^|/)\.env' | grep -v '\.example$'`
    Expected: no output.
- No prices appear on the site.
  - Check: `git grep -nE '\$[0-9]' -- components/ App.tsx index.html`
    Expected: no output.
