# Project Memory

## Project Overview

- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, Tailwind CSS v3 (PostCSS build), react-calendar, Formspree, Google Calendar API (read-only availability)
- **Repo**: github.com/doclegg05 (branch: claude/wonderful-hopper-433bb0 worktree)

## Current Status

Site is on `main` (PRs #14–#18 merged; #18 = GPS directions fix, deployed and verified live). Canonical barn pin: **38.1904268, -80.8917911** (owner-placed official Google listing pin, 2026-07-20) — lib/venueLocation.ts is the single source of truth. Photo workflow is drop-in folders (`photos/gallery/*`, `photos/carousel/`) + `node optimize_images.js`; see photos/README.md.

## Last Session

- **Date**: 2026-10-13 (promo video session, worktree `claude/venue-promotional-video-86ae5b`)
- **What we worked on**: Built a 47s promo video "Meet You at Sunset" with HyperFrames: one wedding day told by the clock (3:00 PM to 8:30 PM), brand fonts/palette/logo from the brand canvas (claude.ai/artifact/FNV5VF5DMynAVCvmnjJEMe), ElevenLabs narration (stock voice Jessica), music and SFX. Two cuts: `videos/meet-you-at-sunset/` (16:9, website) and `videos/meet-you-at-sunset-vertical/` (9:16, Reels/TikTok; its `compositions/` and `assets/` are symlinks to the 16:9 project). `*-social.mp4` copies are normalized to -14 LUFS.
- **What we decided**: Britt picked concept "Meet You at Sunset" from five pitches. Surrounding-area photos (lake, gorge) left out (look like stock, rights unknown); AI "journey" clip left out (barn differs from the real one).
- **Where we left off**: Renders done and verified (narration transcribes word for word from the final mix). Nothing committed; renders are gitignored. Price removed from the video close card and from the site's Pricing section on Britt's instruction (no public pricing); both cuts re-rendered; 48/48 tests pass. Next: Britt reviews; then optionally place the 16:9 on the site (public/videos + poster) and commit the video projects.

## Open Items

- [x] Removed "Starting at $3,800" from components/Pricing.tsx (2026-10-13); tests/noPublicPricing.test.tsx guards the home page. Rule lives in auto-memory `no-public-pricing`. Expect a merge conflict with codex/remove-availability-calendar, which also edits Pricing.tsx
- [ ] Review promo video renders (videos/meet-you-at-sunset/renders/, videos/meet-you-at-sunset-vertical/renders/); decide on site placement and whether to commit the video projects
- [ ] Owner: report unclaimed duplicate Google listing "86 Harper Ln" (maps.google.com/?cid=4489418448821586540) as duplicate of the main listing (cid 15081211618553277720, now also at 86 Harper Ln); afterwards verify removal and that Alan Nethery's review transferred
- [ ] Update address to 86 Harper Ln on The Knot, WeddingWire, and Facebook (NAP consistency)
- [ ] Test directions buttons on a phone from the live site
- [ ] Original un-optimized photos still sit untracked in the MAIN repo working tree at `photos/gallery/weddings/` (Barn.1, Wedding.13-17, Wedding_Design\*.jpg, etc.) — safe to delete (PR #16 merged)
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
| 2026-07-20 | Maps by GPS coords, never address | "19 Boulder Trail" misgeocodes into Rivers Edge; real address 86 Harper Ln unmapped — lib/venueLocation.ts is the single source of truth |
| 2026-10-13 | Promo video built in HyperFrames, scenes shared by 16:9 and 9:16 roots via symlinked sibling project | A HyperFrames project allows one root composition; one scene set keeps both cuts in sync |

## Architecture Notes

- Promo video: rebuild roots and re-carve music with `videos/meet-you-at-sunset/scripts/build.sh`; regenerate audio with `scripts/gen_audio.py`. ElevenLabs key location and the cloned-voice rule live in auto-memory (`elevenlabs-account`).
- Single-page app: HomePage sections (Hero/About/Pricing/Calendar/FAQ/Contact) + /gallery + /virtual-tour routes
- BookingContext carries calendar date selection → contact form prefill
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)

## Known Issues

- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
