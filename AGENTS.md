# The Barn at Sunset Farm — Agent Briefing

Marketing and booking site for an event venue. React + Vite + TypeScript,
originally generated from Google AI Studio and since developed by hand.

## THIS REPO IS PUBLIC

`doclegg05/TheBarnAtSunSetFarm` is a **public** GitHub repo — the only public
one in this workspace. Everything committed here is world-readable, including
git history.

**Known issue:** a real `VITE_GOOGLE_API_KEY` was committed in `b25e9dd` and
removed from the working tree in `3e59ee4`. It is **still present in git
history** and therefore still public. Deleting a secret from the tree does not
remove it from history. Treat that key as compromised until Britt confirms it
has been rotated.

Note also that any `VITE_`-prefixed variable is inlined into the client bundle
by Vite, so it reaches every visitor's browser by design. A Google key used
this way must be restricted (HTTP referrer / API restrictions in Google Cloud),
never treated as a secret.

Before any commit here: no keys, no personal data, no client contact details,
no unreleased pricing. `.env` and `.env.local` are gitignored — keep it that
way, and add new secrets to `.env.example` as empty placeholders only.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
npm run preview    # serve the build
```

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` there. Never
commit that file.

## Before you call it done

```bash
npm run typecheck
npm run lint
npm run test
```

All three exist and are cheap — run them rather than asserting the change works.
`npm run format` is available for formatting.

## Layout

| Path | What |
|---|---|
| `App.tsx`, `index.tsx` | entry |
| `components/` | UI |
| `contexts/`, `hooks/`, `lib/` | state, shared logic |
| `event_manager_info/` | venue/business reference material |
| `GOOGLE_CALENDAR_SETUP.md` | calendar integration setup |

## Rules

- Public repo — assume anything you write here will be read by strangers.
- Booking and calendar behaviour affects real customers. Do not change
  availability logic, pricing, or contact routing without Britt asking.
- Workspace rules: `/Users/brittlegg/MacDev/AGENTS.md`.
