# Project Memory

## Project Overview

- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, Tailwind CSS v3 (PostCSS build), react-calendar, Formspree, Google Calendar API (read-only availability)
- **Repo**: github.com/doclegg05 (branch: claude/wonderful-hopper-433bb0 worktree)

## Current Status

Site is on `main` (PRs #14–#17 merged). PR #18 open: accurate Google Maps directions via exact GPS pin. Photo workflow is drop-in folders (`photos/gallery/*`, `photos/carousel/`) + `node optimize_images.js`; see photos/README.md.

## Last Session

- **Date**: 2026-07-20 (maps session)
- **What we worked on**: Fixed inaccurate Google Maps directions. Root causes: site published "19 Boulder Trail" (geocodes into Rivers Edge development — venue's own Knot materials warn against it; real address is 86 Harper Ln) and JSON-LD geo was 38.1695,-80.8123 (~7 km off). Added `lib/venueLocation.ts` (single source of truth: barn pin 38.1900676,-80.8911541 from the venue's 86 Harper Ln Google listing), coordinate-pinned embed + Google/Apple directions buttons + "Finding Us" gravel-road guidance on Contact, corrected JSON-LD (geo/streetAddress/hasMap), 7 new tests (44 total pass).
- **What we decided**: All map links/embeds must be coordinate-based, never street-address queries; venue address displayed as 86 Harper Ln.
- **Where we left off**: PR #18 (github.com/doclegg05/TheBarnAtSunSetFarm/pull/18) awaiting merge. Owner should verify pin lands on the barn (tweak the two numbers in lib/venueLocation.ts if needed).

## Open Items

- [ ] Merge PR #18 (GPS directions fix), then test directions buttons on a phone from the live site
- [ ] Owner action (not code): venue has TWO duplicate Google Business listings — "19 Boulder Tr" (photos/hours, pin 38.1923483,-80.8880726) and "86 Harper Ln" (pin 38.1900676,-80.8911541). Merge/remove one in Google Business Profile and mark the correct entrance, or Google keeps routing guests wrong
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

## Architecture Notes

- Single-page app: HomePage sections (Hero/About/Pricing/Calendar/FAQ/Contact) + /gallery + /virtual-tour routes
- BookingContext carries calendar date selection → contact form prefill
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)

## Known Issues

- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
