# Project Memory

## Project Overview

- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, react-router-dom 7, Tailwind CSS v4 (`@tailwindcss/postcss`), Formspree
- **Repo**: github.com/doclegg05/TheBarnAtSunSetFarm (default branch `main`, served by Netlify)

## Current Status

Venue scheduler part 1 (engine, feeds) merged in #29. Part 2a (schema, database calls, lodging sync, blocking feeds) merged in #31 on 2026-10-15 and is live; its migration ran on the production database at merge. It runs nothing until the Netlify settings exist: the feeds answer 404 and the sync logs that it skipped. Branch `fix/scheduler-table-names` renames the scheduler's `settings` and `rate_limits` to `sched_settings` and `sched_rate_limits` (D18). Parts 2b (admin API), 2c (visitor booking) and 3 (screens) follow.

Live site matches `main` at 68e4d3b (bundle names `index-DCr6DVc1.js` and `index-CD87pMC_.css` compared against a local build on 2026-10-13; #29's build keeps the same bundle name). On 2026-10-13 #25 (calendar removed, Tailwind 4, sharp 0.35.5) and #27 (no public price, Pricing section renamed Packages, promo video source) merged. 0 open Dependabot alerts; `npm audit` finds 0. Canonical barn pin: **38.1904268, -80.8917911** (owner-placed official Google listing pin, 2026-07-20); lib/venueLocation.ts is the single source of truth. Photo workflow is drop-in folders (`photos/gallery/*`, `photos/carousel/`) + `node optimize_images.js`; see photos/README.md.

## Last Session

- **Date**: 2026-10-15 (venue scheduler part 2a merged; branch `fix/scheduler-table-names`)
- **What we worked on**:
  - 2026-10-15: #31 merged (11312bc) and deployed; the deploy preview and production feeds both answer 404 until the database settings exist. Supabase's GitHub link applied the 2a migration to production 35 seconds after the merge; it matches the merged file, and the Supabase advisors report only the known `search_path` warning (deferred minor F126) and info notes. The platform's `feat/foundation-db` also creates `public.settings` and `public.rate_limits`, so the scheduler's two tables are renamed in migration `20261015000050`, tested in PGlite and dry-run on production inside a rolled-back transaction.
  - Part 1 (#29) merged and deployed; production matches `main`. A security review of #29 led to fail-closed feed parsing (839e028).
  - Part 2a: the Supabase schema (`supabase/migrations/`), `lib/server/` (database calls through Supabase's REST API, a feed fetcher limited to Airbnb and VRBO hosts, the 15-minute lodging sync with alert emails through Resend, the Barn and Cabin blocking feeds) and two Netlify functions (`sync-lodging`, `feeds`). D13 is in the engine and the database. 215 tests pass; CI gates `lib/server` at 80 percent coverage too.
  - Separate sessions the same day, research only, no code: teardowns of the vendor dashboard (WeddingPro) and of The Knot's couple tools (wedding website, guest list and RSVP, registry), the latter in a throwaway account with a made-up wedding. Nothing was published or sent. Notes, evidence logs and build specs live outside this public repo in `../TheBarnAtSunSetFarm-weddingpro-teardown/` and `../TheBarnAtSunSetFarm-knot-teardown/`.
- **What we decided**: see the 2026-10-14 rows in the Key Decisions Log. The rules C1 to C11 and decisions D1 to D13 live in the private design spec named in Architecture Notes.
  - Teardowns: the couple tools (wedding page, guest list, RSVP, registry links) get built into this site, not a separate site builder. The Knot build spec's design choices (booked couples only, links-only registry, private by default, a staff headcount view) are proposals awaiting Britt's approval.
- **Where we left off**: the table rename waits for Britt's yes to push, open the PR and merge; merging it renames the tables in production. Then Britt sets the five Netlify settings and the real-key smoke test runs. Next: part 2b (admin API).
  - Teardowns: Britt reviews the Knot build spec. Two screenshots would close its last build-relevant gaps: the guest-import screen after pasting a sheet, and the account's email-preferences list. Britt decides whether to clear the marketplace listing's pricing fields, which feed a price estimate couples see there, and deletes the throwaway couple account when done with it.

## Open Items

- [x] Removed "Starting at $3,800" from components/Pricing.tsx (2026-10-13); tests/noPublicPricing.test.tsx guards the home page. Rule lives in auto-memory `no-public-pricing`. The Pricing.tsx conflict with #25 is resolved in #27
- [ ] Review promo video renders; decide whether to put the 16:9 cut on the site (public/videos + poster). PR #27 itself merged 2026-10-13
- [ ] Owner: report unclaimed duplicate Google listing "86 Harper Ln" (maps.google.com/?cid=4489418448821586540) as duplicate of the main listing (cid 15081211618553277720, now also at 86 Harper Ln); afterwards verify removal and that Alan Nethery's review transferred
- [ ] Update address to 86 Harper Ln on The Knot, WeddingWire, and Facebook (NAP consistency)
- [ ] Test directions buttons on a phone from the live site
- [ ] Original un-optimized photos still sit untracked in the MAIN repo working tree at `photos/gallery/weddings/` (Barn.1, Wedding.13-17, Wedding_Design\*.jpg, etc.) — safe to delete (PR #16 merged)
- [ ] Testimonials: "Love Notes" section is wired in (after Pricing) but hidden until lib/testimonials.ts has entries — owner collects real quotes with written permission (TESTIMONIALS.md); never invent or reword quotes
- [ ] 52MB walkthrough video could be re-encoded (~10-15MB at 1080p)
- [ ] Set VITE_GOOGLE_API_KEY/VITE_GOOGLE_CALENDAR_ID in production env (calendar shows "temporarily offline" notice without them)
- [ ] Unused components: SocialProof.tsx, TheKnotHub.tsx, Map.tsx
- [ ] Owner: answer the 10 hidden FAQ questions in lib/faq.ts (answer: null = hidden): deposit/payments, cancellation, rain plan, alcohol, caterer kitchen, setup/cleanup times, end time/music, decoration rules, lodging check-in/out, pets. Never guess policies
- [ ] Owner: create GA4 property and set VITE_GA_MEASUREMENT_ID in Netlify, then redeploy (steps in GOOGLE_ANALYTICS_SETUP.md)

## Key Decisions Log

| Date       | Decision                         | Rationale                                                                                  |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 2026-06-10 | Tailwind v3 (not v4) via PostCSS | CDN was v3; v4 removed bg-opacity-\* utilities used throughout                             |
| 2026-06-10 | Keep scroll fade-in but guard it | Visible-on-mount check + reduced-motion + threshold 0 prevents invisible content           |
| 2026-06-10 | Keep original header per user    | User prefers the original nav with The Knot/WeddingWire logo links; sticky header reverted |
| 2026-07-20 | Maps by GPS coords, never address | "19 Boulder Trail" misgeocodes into Rivers Edge; real address 86 Harper Ln unmapped — lib/venueLocation.ts is the single source of truth |
| 2026-10-12 | Contact form asks "How did you hear about us?" | Owner is cancelling paid Knot/WeddingWire plans; `heard_about` (options in lib/inquirySources.ts) measures lead sources before/after. Keep option wording stable |
| 2026-10-12 | GA4 via lib/analytics.ts, live domain only | Loads only when VITE_GA_MEASUREMENT_ID is set AND hostname is thebarnatsunsetfarm.com (previews/dev never send data). Page views come from GA enhanced measurement history events — never send page_view by hand. Events: generate_lead {heard_about}, click {link_url, link_domain, outbound} for header directory links. /privacy page discloses GA (required by GA terms) |

## Architecture Notes

- Promo video: rebuild roots and re-carve music with `videos/meet-you-at-sunset/scripts/build.sh`; regenerate audio with `scripts/gen_audio.py`. ElevenLabs key location and the cloned-voice rule live in auto-memory (`elevenlabs-account`).
- Single-page app: HomePage sections (Hero/About/Packages/FAQ/Contact) + /gallery + /virtual-tour routes + 404. The Packages section lives in components/Pricing.tsx (`id="packages"`)
- Visitors ask about dates through the contact form. Header.tsx redirects old anchors: `#calendar` to `#contact` (#25) and `#pricing` to `#packages` (#27)
- Tailwind 4 needs Safari 16.4+, Chrome 111+ or Firefox 128+ (browser floor noted in #25)
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)
- Venue scheduler (in progress): the design spec lives in Britt's private workspace repo at `docs/specs/2026-10-13-barn-venue-scheduler-design.md`. The engine is in `lib/scheduling/`, calendar feeds in `lib/ical/`.
- Planned couple tools (wedding page, guest list, RSVP, registry links) are specced in a teardown kept outside this public repo, in the sibling folder `../TheBarnAtSunSetFarm-knot-teardown/`; the decision and its constraints live in Claude's auto-memory (`barn-couple-tools-port`). Guest data never goes in this repo.

## Known Issues

- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
- Netlify can publish a deploy preview straight to production, so the live site may not match `main`. Compare the live `index-*.js` name with a local `npm run build` of main before assuming. Detail in auto-memory `netlify-production-source`
- Merging a PR to `main` runs its new `supabase/migrations/` files on the production database (Supabase's GitHub link), so Britt's yes for a migration comes before the merge. Detail in auto-memory `supabase-migrations-apply-on-merge`
- PGlite runs Postgres 18; production runs Postgres 17. Postgres 18 also lists NOT NULL constraints in `pg_constraint`, so catalog tests filter `contype <> 'n'`
