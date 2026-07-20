# Project Memory

## Project Overview

- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, Tailwind CSS v3 (PostCSS build), react-calendar, Formspree, Google Calendar API (read-only availability)
- **Repo**: github.com/doclegg05 (branch: claude/wonderful-hopper-433bb0 worktree)

## Current Status

Site is on `main` (PRs #14/#15 merged; earlier codex-branch confusion resolved). PR #16 open: 18 new wedding gallery photos. Photo workflow is drop-in folders (`photos/gallery/*`, `photos/carousel/`) + `node optimize_images.js`; see photos/README.md.

## Last Session

- **Date**: 2026-07-20
- **What we worked on**: Added 18 new wedding photos the user dropped into `photos/gallery/weddings/` (main repo working tree). Fixed 10 files that had no extension (gallery glob filters on extension — they'd be invisible), renamed `Wedding_Decorations.1/.15/.16` → `Wedding_decorations.15-17` (avoided case-insensitive overwrite of existing `Wedding_decorations.1.webp`), `Wedding.Party.1` → `wedding_party.2`, `IMG_9059` → `Reception_Table_Centerpiece`. Ran optimize_images.js (JPEG→WebP, ~2MB saved). Verified /gallery shows all 112 images, none broken. Added macOS entry to .claude/launch.json (was Windows-only).
- **What we decided**: When new decoration/party photos arrive, continue the existing lowercase filename families and numbering — never reuse low numbers (case-insensitive FS overwrites on optimize).
- **Where we left off**: PR #16 (github.com/doclegg05/TheBarnAtSunSetFarm/pull/16) awaiting merge; after merge Netlify deploys from main.

## Open Items

- [ ] Merge PR #16 (18 new wedding gallery photos), then spot-check live /gallery
- [ ] Original un-optimized photos still sit untracked in the MAIN repo working tree at `photos/gallery/weddings/` (Barn.1, Wedding.13-17, Wedding_Design\*.jpg, etc.) — safe to delete once PR #16 merges
- [ ] Testimonials section: component exists at components/Testimonials.tsx, unused — wire up when real couple quotes available
- [ ] 52MB walkthrough video could be re-encoded (~10-15MB at 1080p)
- [ ] Set VITE_GOOGLE_API_KEY/VITE_GOOGLE_CALENDAR_ID in production env (calendar shows "temporarily offline" notice without them)
- [ ] Unused components: SocialProof.tsx, TheKnotHub.tsx, Map.tsx, Testimonials.tsx

## Key Decisions Log

| Date       | Decision                         | Rationale                                                                                  |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 2026-06-10 | Tailwind v3 (not v4) via PostCSS | CDN was v3; v4 removed bg-opacity-\* utilities used throughout                             |
| 2026-06-10 | Keep scroll fade-in but guard it | Visible-on-mount check + reduced-motion + threshold 0 prevents invisible content           |
| 2026-06-10 | Keep original header per user    | User prefers the original nav with The Knot/WeddingWire logo links; sticky header reverted |

## Architecture Notes

- Single-page app: HomePage sections (Hero/About/Pricing/Calendar/FAQ/Contact) + /gallery + /virtual-tour routes
- BookingContext carries calendar date selection → contact form prefill
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)

## Known Issues

- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
