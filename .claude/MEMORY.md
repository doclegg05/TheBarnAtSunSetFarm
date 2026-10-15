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
- [ ] Testimonials section: component exists at components/Testimonials.tsx, unused — wire up when real couple quotes available
- [ ] 52MB walkthrough video could be re-encoded (~10-15MB at 1080p)
- [x] Set VITE_GOOGLE_API_KEY/VITE_GOOGLE_CALENDAR_ID in production env. Obsolete: #25 removed the calendar, and per #25 the Calendar API credential was revoked in Google Cloud on 2026-10-05
- [ ] Unused components: SocialProof.tsx, TheKnotHub.tsx, Map.tsx, Testimonials.tsx
- [x] Merge #29 (scheduler part 1), then write the part 2 plan (merged 2026-10-14; plans for 2b and 2c are written as each part starts)
- [x] Apply the 2a migration to the Barn's Supabase project (ran automatically when #31 merged, 2026-10-15)
- [ ] Merge the table rename (`fix/scheduler-table-names`, migration `20261015000050`) with Britt's yes
- [ ] Set SUPABASE_URL, SUPABASE_SECRET_KEY, EMAIL_API_KEY, EMAIL_FROM and ALERT_EMAIL in Netlify, then run the real-key smoke test
- [ ] Platform (`feat/foundation-db`): `20261014000000_inquiries.sql` is numbered below the applied `20261015000000`; renumber it before that branch merges, or Supabase may skip or refuse it
- [ ] Phase 1 of the scheduler: after the owner's test import of our feeds, fetch the Airbnb and VRBO exports and check whether our blocked dates come back as entries (risk R9 in the spec), before part 2's alert emails go live

## Key Decisions Log

| Date       | Decision                         | Rationale                                                                                  |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 2026-06-10 | Tailwind v3 (not v4) via PostCSS | CDN was v3; v4 removed bg-opacity-\* utilities used throughout                             |
| 2026-06-10 | Keep scroll fade-in but guard it | Visible-on-mount check + reduced-motion + threshold 0 prevents invisible content           |
| 2026-06-10 | Keep original header per user    | User prefers the original nav with The Knot/WeddingWire logo links; sticky header reverted |
| 2026-07-20 | Maps by GPS coords, never address | "19 Boulder Trail" misgeocodes into Rivers Edge; real address 86 Harper Ln unmapped — lib/venueLocation.ts is the single source of truth |
| 2026-07-20 | SPA fallback via public/\_redirects | One-line fix; Vite copies it to dist/ automatically, no netlify.toml needed |
| 2026-07-20 | New photos continue the existing lowercase filename families and numbering; never reuse low numbers | The case-insensitive filesystem overwrites files during optimize |
| 2026-10-13 | Promo video built in HyperFrames, scenes shared by 16:9 and 9:16 roots via symlinked sibling project | A HyperFrames project allows one root composition; one scene set keeps both cuts in sync |
| 2026-10-13 | Tailwind v4 via `@tailwindcss/postcss` (#25), replacing the 2026-06-10 v3 decision | Tailwind 3's dependency chain (braces, postcss-selector-parser) carried npm advisories with no v3 fix; #25 migrated the renamed and opacity utilities |
| 2026-10-14 | Every event day's lodging night is blocked, the last day included; the Barn needs one guest-free setup day before and one cleanup day after each event (C9 to C11) | Britt's rule: a guest who checks out Sunday allows a Tuesday wedding at the earliest, and after a Saturday wedding the next Barn guest arrives Monday |
| 2026-10-14 | A second event on the same day is refused; an overlapping setup or cleanup day only warns (D13, built in part 2) | Two weddings cannot share a day, but a tight turnaround is the manager's call |
| 2026-10-14 | Scheduler tests run against a throwaway database in CI; no staging Supabase project (D11) | Test bookings never touch real data; deploy previews keep booking switched off |
| 2026-10-14 | Couple tools get built into this site, not a separate site builder | The site already ranks on Google and converts visitors into inquiries |
| 2026-10-14 | Server code calls `sched_*` SQL functions through Supabase's REST API with the secret key; no direct database connection (D14) | Supabase warns postgres.js can hang or mix up results on its shared pooler; each API call is one transaction and keeps the free project awake |
| 2026-10-14 | A feed that suddenly loses all or most of its future stays is held for one sync, then accepted with an email (D15) | A provider glitch cannot wipe stays and open showings over a guest; a real cancellation waits at most 15 minutes |
| 2026-10-14 | D13 is also an exclusion constraint on `events` | Two same-day saves cannot both succeed, even if they race |
| 2026-10-15 | The scheduler's `settings` and `rate_limits` become `sched_settings` and `sched_rate_limits` (D18) | The platform's `feat/foundation-db` owns the plain names for its general settings and rate limits; both scheduler tables were still empty |

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
