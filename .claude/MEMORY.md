# Project Memory

## Project Overview

- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, react-router-dom 7, Tailwind CSS v4 (`@tailwindcss/postcss`), Formspree
- **Repo**: github.com/doclegg05/TheBarnAtSunSetFarm (default branch `main`, served by Netlify)

## Current Status

Venue scheduler part 1 of 3 (engine and calendar feeds, no visitor-facing change) is in PR #29 on branch `feat/scheduler-engine`, worktree `TheBarnAtSunSetFarm-scheduler`. Parts 2 (database, sync, email, booking functions) and 3 (screens, rollout) follow after #29 merges.

Live site matches `main` at 68e4d3b (bundle names `index-DCr6DVc1.js` and `index-CD87pMC_.css` compared against a local build on 2026-10-13; #29's build keeps the same bundle name). On 2026-10-13 #25 (calendar removed, Tailwind 4, sharp 0.35.5) and #27 (no public price, Pricing section renamed Packages, promo video source) merged. 0 open Dependabot alerts; `npm audit` finds 0. Canonical barn pin: **38.1904268, -80.8917911** (owner-placed official Google listing pin, 2026-07-20); lib/venueLocation.ts is the single source of truth. Photo workflow is drop-in folders (`photos/gallery/*`, `photos/carousel/`) + `node optimize_images.js`; see photos/README.md.

## Last Session

- **Date**: 2026-10-14 (venue scheduler part 1, worktree `TheBarnAtSunSetFarm-scheduler`, branch `feat/scheduler-engine`)
- **What we worked on**:
  - Built `lib/scheduling/` (open showing and call times with a reason code for every hidden time; event conflicts; showing clashes; blocked lodging nights per space) and `lib/ical/` (reads Airbnb and VRBO feeds into stays; writes the Barn and Cabin blocking feeds). Pure functions: no network, no database.
  - Every test was written first and watched fail. `scripts/quality.sh` exits 0 with 102 tests; CI now also requires 80 percent coverage on each of `lib/scheduling` and `lib/ical`.
  - A whole-branch review found one bug, fixed in 756b171: a feed entry with `DURATION` and no `DTEND` was read as one night.
- **What we decided**: see the 2026-10-14 rows in the Key Decisions Log. The rules C1 to C11 and decisions D1 to D13 live in the private design spec named in Architecture Notes.
- **Where we left off**: #29 (https://github.com/doclegg05/TheBarnAtSunSetFarm/pull/29) is open with Auto-fix on; Britt approves the merge. Next: write the part 2 plan after #29 merges. The spec's "Part 2 inputs from the part 1 review" section lists what it must cover.

## Open Items

- [x] Removed "Starting at $3,800" from components/Pricing.tsx (2026-10-13); tests/noPublicPricing.test.tsx guards the home page. Rule lives in auto-memory `no-public-pricing`. The Pricing.tsx conflict with #25 is resolved in #27
- [ ] Review promo video renders; decide whether to put the 16:9 cut on the site (public/videos + poster). PR #27 itself merged 2026-10-13
- [ ] Owner: report unclaimed duplicate Google listing "86 Harper Ln" (maps.google.com/?cid=4489418448821586540) as duplicate of the main listing (cid 15081211618553277720, now also at 86 Harper Ln); afterwards verify removal and that Alan Nethery's review transferred
- [ ] Update address to 86 Harper Ln on The Knot, WeddingWire, and Facebook (NAP consistency)
- [ ] Test directions buttons on a phone from the live site
- [ ] Original un-optimized photos still sit untracked in the MAIN repo working tree at `photos/gallery/weddings/` (Barn.1, Wedding.13-17, Wedding_Design\*.jpg, etc.) — safe to delete (PR #16 merged)
- [ ] Testimonials section: component exists at components/Testimonials.tsx, unused — wire up when real couple quotes available
- [ ] 52MB walkthrough video could be re-encoded (~10-15MB at 1080p)
- [x] Set VITE_GOOGLE_API_KEY/VITE_GOOGLE_CALENDAR_ID in production env. Obsolete: #25 removed the calendar, and per #25 the Calendar API credential was revoked in Google Cloud on 2026-10-05
- [ ] Unused components: SocialProof.tsx, TheKnotHub.tsx, Map.tsx, Testimonials.tsx
- [ ] Merge #29 (scheduler part 1), then write the part 2 plan
- [ ] Phase 1 of the scheduler: after the owner's test import of our feeds, fetch the Airbnb and VRBO exports and check whether our blocked dates come back as entries (risk R9 in the spec), before part 2's alert emails go live

## Key Decisions Log

| Date       | Decision                         | Rationale                                                                                  |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 2026-06-10 | Tailwind v3 (not v4) via PostCSS | CDN was v3; v4 removed bg-opacity-\* utilities used throughout                             |
| 2026-06-10 | Keep scroll fade-in but guard it | Visible-on-mount check + reduced-motion + threshold 0 prevents invisible content           |
| 2026-06-10 | Keep original header per user    | User prefers the original nav with The Knot/WeddingWire logo links; sticky header reverted |
| 2026-07-20 | Maps by GPS coords, never address | "19 Boulder Trail" misgeocodes into Rivers Edge; real address 86 Harper Ln unmapped — lib/venueLocation.ts is the single source of truth |
| 2026-10-13 | Promo video built in HyperFrames, scenes shared by 16:9 and 9:16 roots via symlinked sibling project | A HyperFrames project allows one root composition; one scene set keeps both cuts in sync |
| 2026-10-13 | Tailwind v4 via `@tailwindcss/postcss` (#25), replacing the 2026-06-10 v3 decision | Tailwind 3's dependency chain (braces, postcss-selector-parser) carried npm advisories with no v3 fix; #25 migrated the renamed and opacity utilities |
| 2026-10-14 | Every event day's lodging night is blocked, the last day included; the Barn needs one guest-free setup day before and one cleanup day after each event (C9 to C11) | Britt's rule: a guest who checks out Sunday allows a Tuesday wedding at the earliest, and after a Saturday wedding the next Barn guest arrives Monday |
| 2026-10-14 | A second event on the same day is refused; an overlapping setup or cleanup day only warns (D13, built in part 2) | Two weddings cannot share a day, but a tight turnaround is the manager's call |
| 2026-10-14 | Scheduler tests run against a throwaway database in CI; no staging Supabase project (D11) | Test bookings never touch real data; deploy previews keep booking switched off |

## Architecture Notes

- Promo video: rebuild roots and re-carve music with `videos/meet-you-at-sunset/scripts/build.sh`; regenerate audio with `scripts/gen_audio.py`. ElevenLabs key location and the cloned-voice rule live in auto-memory (`elevenlabs-account`).
- Single-page app: HomePage sections (Hero/About/Packages/FAQ/Contact) + /gallery + /virtual-tour routes + 404. The Packages section lives in components/Pricing.tsx (`id="packages"`)
- Visitors ask about dates through the contact form. Header.tsx redirects old anchors: `#calendar` to `#contact` (#25) and `#pricing` to `#packages` (#27)
- Tailwind 4 needs Safari 16.4+, Chrome 111+ or Firefox 128+ (browser floor noted in #25)
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)
- Venue scheduler (in progress): the design spec lives in Britt's private workspace repo at `docs/specs/2026-10-13-barn-venue-scheduler-design.md`. The engine is in `lib/scheduling/`, calendar feeds in `lib/ical/`.

## Known Issues

- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
- Netlify can publish a deploy preview straight to production, so the live site may not match `main`. Compare the live `index-*.js` name with a local `npm run build` of main before assuming. Detail in auto-memory `netlify-production-source`
