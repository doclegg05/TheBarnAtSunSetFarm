# Project Memory

## Project Overview

- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, react-router-dom 7, Tailwind CSS v4 (`@tailwindcss/postcss`), Formspree
- **Repo**: github.com/doclegg05/TheBarnAtSunSetFarm (default branch `main`, served by Netlify)

## Current Status

Live site matches `main` at 68e4d3b (bundle names `index-DCr6DVc1.js` and `index-CD87pMC_.css` compared against a local build on 2026-10-13). On 2026-10-13 #25 (calendar removed, Tailwind 4, sharp 0.35.5) and #27 (no public price, Pricing section renamed Packages, promo video source) merged. 0 open Dependabot alerts; `npm audit` finds 0. Canonical barn pin: **38.1904268, -80.8917911** (owner-placed official Google listing pin, 2026-07-20); lib/venueLocation.ts is the single source of truth. Photo workflow is drop-in folders (`photos/gallery/*`, `photos/carousel/`) + `node optimize_images.js`; see photos/README.md.

## Last Session

- **Date**: 2026-10-13 (two sessions: promo video in worktree `claude/venue-promotional-video-86ae5b`, Dependabot triage in worktree `modest-nobel-416987`)
- **What we worked on**:
  - Dependabot: triaged the 25 open alerts (13 high, 11 moderate, 1 low). The 5 runtime alerts were all react-router and needed RSC or SSR mode or link targets built from user input; this SPA has none of those. The other 20 were dev-only (vitest, jsdom's undici, eslint's js-yaml and brace-expansion, the PostCSS build chain, and sharp in `optimize_images.js`). `npm audit fix` without `--force` cleared 22 on a branch from main; the 3 sharp alerts needed 0.35.x.
  - Promo video: built a 47s promo video "Meet You at Sunset" with HyperFrames: one wedding day told by the clock (3:00 PM to 8:30 PM), brand fonts/palette/logo from the brand canvas (claude.ai/artifact/FNV5VF5DMynAVCvmnjJEMe), ElevenLabs narration (stock voice Jessica), music and SFX. Two cuts: `videos/meet-you-at-sunset/` (16:9, website) and `videos/meet-you-at-sunset-vertical/` (9:16, Reels/TikTok; its `compositions/` and `assets/` are symlinks to the 16:9 project). `*-social.mp4` copies are normalized to -14 LUFS.
- **What we decided**:
  - Dependabot: no separate dependency PR. #25's lockfile already cleared all 25 alerts, so a lockfile PR from main would only have conflicted with it. Once #25 merged, the 22-alert commit rebased to empty and was dropped.
  - Promo video: Britt picked concept "Meet You at Sunset" from five pitches. Surrounding-area photos (lake, gorge) left out (look like stock, rights unknown); AI "journey" clip left out (barn differs from the real one).
- **Where we left off**: #25 (calendar removal, Tailwind 4) and then #27 (https://github.com/doclegg05/TheBarnAtSunSetFarm/pull/27) merged into main on 2026-10-13. #25 had been live since 2026-10-05 through a published deploy preview (gotcha in auto-memory `netlify-production-source`); production now matches main at 68e4d3b. `CI=true scripts/quality.sh` on 68e4d3b exits 0 with 25 tests passing. Next: review the promo renders and decide on the 16:9 cut for the site.

## Open Items

- [x] Removed "Starting at $3,800" from components/Pricing.tsx (2026-10-13); tests/noPublicPricing.test.tsx guards the home page. Rule lives in auto-memory `no-public-pricing`. The Pricing.tsx conflict with #25 is resolved in #27
- [ ] Review promo video renders; decide whether to put the 16:9 cut on the site (public/videos + poster). PR #27 itself merged 2026-10-13
- [ ] Owner: report unclaimed duplicate Google listing "86 Harper Ln" (maps.google.com/?cid=4489418448821586540) as duplicate of the main listing (cid 15081211618553277720, now also at 86 Harper Ln); afterwards verify removal and that Alan Nethery's review transferred
- [ ] Update address to 86 Harper Ln on The Knot, WeddingWire, and Facebook (NAP consistency)
- [ ] Test directions buttons on a phone from the live site
- [x] PR #16 (18 wedding photos) merged 2026-07-20. The un-optimized originals were then deleted from the main checkout's `photos/gallery/weddings/`; none were left untracked on 2026-10-13
- [x] PR #17 (SPA fallback in `public/_redirects`) merged 2026-07-20. A direct load of /gallery returns 200 instead of Netlify's 404 (rechecked live 2026-10-13)
- [x] Netlify deploys from `main` (confirmed 2026-07-20). Exception: a deploy preview was published to production on 2026-10-05; see Known Issues
- [ ] Testimonials section: component exists at components/Testimonials.tsx, unused — wire up when real couple quotes available
- [ ] 52MB walkthrough video could be re-encoded (~10-15MB at 1080p)
- [x] Set VITE_GOOGLE_API_KEY/VITE_GOOGLE_CALENDAR_ID in production env. Obsolete: #25 removed the calendar, and per #25 the Calendar API credential was revoked in Google Cloud on 2026-10-05
- [ ] Unused components: SocialProof.tsx, TheKnotHub.tsx, Map.tsx, Testimonials.tsx

## Key Decisions Log

| Date       | Decision                         | Rationale                                                                                  |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 2026-06-10 | Tailwind v3 (not v4) via PostCSS | CDN was v3; v4 removed bg-opacity-\* utilities used throughout                             |
| 2026-06-10 | Keep scroll fade-in but guard it | Visible-on-mount check + reduced-motion + threshold 0 prevents invisible content           |
| 2026-06-10 | Keep original header per user    | User prefers the original nav with The Knot/WeddingWire logo links; sticky header reverted |
| 2026-07-20 | Maps by GPS coords, never address | "19 Boulder Trail" misgeocodes into Rivers Edge; real address 86 Harper Ln unmapped — lib/venueLocation.ts is the single source of truth |
| 2026-07-20 | SPA fallback via public/\_redirects | One-line fix; Vite copies it to dist/ automatically, no netlify.toml needed |
| 2026-07-20 | New photos continue the existing lowercase filename families and numbering; never reuse low numbers | macOS's case-insensitive filesystem let `optimize_images.js` overwrite files whose names differed only by case |
| 2026-10-13 | Promo video built in HyperFrames, scenes shared by 16:9 and 9:16 roots via symlinked sibling project | A HyperFrames project allows one root composition; one scene set keeps both cuts in sync |
| 2026-10-13 | Tailwind v4 via `@tailwindcss/postcss` (#25), replacing the 2026-06-10 v3 decision | Tailwind 3's dependency chain (braces, postcss-selector-parser) carried npm advisories with no v3 fix; #25 migrated the renamed and opacity utilities |

## Architecture Notes

- Promo video: rebuild roots and re-carve music with `videos/meet-you-at-sunset/scripts/build.sh`; regenerate audio with `scripts/gen_audio.py`. ElevenLabs key location and the cloned-voice rule live in auto-memory (`elevenlabs-account`).
- Single-page app: HomePage sections (Hero/About/Packages/FAQ/Contact) + /gallery + /virtual-tour routes + 404. The Packages section lives in components/Pricing.tsx (`id="packages"`)
- Visitors ask about dates through the contact form. Header.tsx redirects old anchors: `#calendar` to `#contact` (#25) and `#pricing` to `#packages` (#27)
- Tailwind 4 needs Safari 16.4+, Chrome 111+ or Firefox 128+ (browser floor noted in #25)
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)
- Nav logos use generic filenames (`public/nav-img-1.webp`, `nav-img-2.webp`) because a Safari content filter on the dev Mac blocked brand-named logo files on localhost

## Known Issues

- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
- Netlify can publish a deploy preview straight to production, so the live site may not match `main`. Compare the live `index-*.js` name with a local `npm run build` of main before assuming. Detail in auto-memory `netlify-production-source`
