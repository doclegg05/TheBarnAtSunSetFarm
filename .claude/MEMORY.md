# Project Memory

## Project Overview

- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, Tailwind CSS v3 (PostCSS build), react-calendar, Formspree, Google Calendar API (read-only availability)
- **Repo**: github.com/doclegg05 (branch: claude/wonderful-hopper-433bb0 worktree)

## Current Status

Site is on `main` (PRs #14–#19 merged; all deployed and verified live 2026-07-20). Canonical barn pin: **38.1904268, -80.8917911** (owner-placed official Google listing pin, 2026-07-20) — lib/venueLocation.ts is the single source of truth. Photo workflow is drop-in folders (`photos/gallery/*`, `photos/carousel/`) + `node optimize_images.js`; see photos/README.md.

## Last Session

- **Date**: 2026-07-20 (three parallel workstreams)
- **What we worked on**:
  - Maps (PRs #18/#19): fixed inaccurate Google Maps directions. Root causes: site published "19 Boulder Trail" (geocodes into Rivers Edge development — venue's own Knot materials warn against it; real address is 86 Harper Ln) and JSON-LD geo was 38.1695,-80.8123 (~7 km off). Added `lib/venueLocation.ts` (single source of truth), coordinate-pinned embed + Google/Apple directions buttons + "Finding Us" gravel-road guidance on Contact, corrected JSON-LD (geo/streetAddress/hasMap), 7 new tests (44 total pass). Coords synced to the owner-placed official listing pin.
  - Photos (PR #16): added 18 new wedding photos. Fixed 10 files with no extension (gallery glob filters on extension), renamed `Wedding_Decorations.1/.15/.16` → `Wedding_decorations.15-17` (avoided case-insensitive overwrite), `Wedding.Party.1` → `wedding_party.2`, `IMG_9059` → `Reception_Table_Centerpiece`. Ran optimize_images.js (JPEG→WebP, ~2MB saved). Verified /gallery shows all 112 images. Added macOS entry to .claude/launch.json. Un-optimized originals deleted after merge.
  - Netlify SPA fallback (PR #17): direct loads of /gallery, /virtual-tour etc. hit Netlify's default 404 (BrowserRouter, no redirect rules). Added `public/_redirects`, verified it lands in dist/, merged, live-verified (/gallery returns 200).
- **What we decided**: All map links/embeds must be coordinate-based, never street-address queries; venue address displayed as 86 Harper Ln. New decoration/party photos continue the existing lowercase filename families and numbering — never reuse low numbers (case-insensitive FS overwrites on optimize). SPA fallback via `public/_redirects` rather than netlify.toml.
- **Where we left off**: All three workstreams merged, deployed, live-verified; PR #17 worktree branch cleaned up; local main synced. Next: owner reports the unclaimed duplicate Google listing (cid 4489418448821586540) via Suggest an edit → Close or remove → Duplicate; then re-verify removal + review transfer in a few days.

## Open Items

- [ ] Owner: report unclaimed duplicate Google listing "86 Harper Ln" (maps.google.com/?cid=4489418448821586540) as duplicate of the main listing (cid 15081211618553277720, now also at 86 Harper Ln); afterwards verify removal and that Alan Nethery's review transferred
- [ ] Update address to 86 Harper Ln on The Knot, WeddingWire, and Facebook (NAP consistency)
- [ ] Test directions buttons on a phone from the live site
- [x] [PR #16](https://github.com/doclegg05/TheBarnAtSunSetFarm/pull/16) (18 wedding photos) — merged 2026-07-20; un-optimized originals deleted from the working tree (all 18 verified to have tracked .webp counterparts first)
- [x] [PR #17](https://github.com/doclegg05/TheBarnAtSunSetFarm/pull/17) (SPA \_redirects) — merged 2026-07-20; live-verified: direct load of /gallery returns 200 (was Netlify 404)
- [x] Netlify now deploys from main (2026-07-20: confirmed). Note: user's Safari content filter strips brand-named logo files on localhost (fixed via generic filenames nav-img-1/2.webp)
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
| 2026-07-20 | SPA fallback via public/\_redirects | One-line fix; Vite copies it to dist/ automatically, no netlify.toml needed              |

## Architecture Notes

- Single-page app: HomePage sections (Hero/About/Pricing/Calendar/FAQ/Contact) + /gallery + /virtual-tour routes
- BookingContext carries calendar date selection → contact form prefill
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)

## Known Issues

- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
