# Project Memory

## Project Overview
- **Name**: The Barn at Sunset Farm
- **Description**: Marketing website for a rustic wedding venue in Mount Nebo, WV (weddings, events, lodging)
- **Tech stack**: React 19 + TypeScript + Vite 6, Tailwind CSS v3 (PostCSS build), react-calendar, Formspree, Google Calendar API (read-only availability)
- **Repo**: github.com/doclegg05 (branch: claude/wonderful-hopper-433bb0 worktree)

## Current Status
Site reviewed by Fable 5 (full design critique, scored 23/40 on Nielsen heuristics) and all findings fixed. Build + typecheck green, fixes verified visually with scripted browser tests. Changes are **uncommitted** in the worktree.

## Last Session
- **Date**: 2026-06-10
- **What we worked on**: Full critique of the Opus 4.6-built site, then fixed everything:
  - Bugs: package prices never rendered (now shown + "Most Popular" badge); FAQ built but never displayed (now on homepage); fade-in left content invisible on mid-page loads (fixed in useScrollAnimation); calendar date selection now pre-fills contact form (was dead plumbing); Google Calendar timezone bug for timed events (UTC→local); visible notice when calendar API unconfigured
  - Efficiency: replaced Tailwind CDN with proper v3 PostCSS build (~6KB gzip CSS); removed AI Studio importmap + GEMINI_API_KEY define from vite.config; hero parallax now rAF + refs (no re-render per scroll); video preload="none"; first carousel image fetchPriority="high"
  - Design: hero CTA buttons (Check Available Dates / Schedule a Tour); amenities last row centered; lightbox keyboard support (Esc/arrows) + aria-labels
- **What we decided**: Skip testimonials for now (component exists unused — user choice); keep Tailwind v3 (matches CDN classes, v4 would break bg-opacity-* utilities); USER PREFERENCE: keep the ORIGINAL header (absolute, with The Knot/WeddingWire logos in nav) — sticky header + footer logos were reverted; no "calendar offline" warning (API is connected in production)
- **Where we left off**: All fixes verified; awaiting commit/PR decision from user

## Open Items
- [ ] Commit + PR the review fixes (uncommitted in worktree)
- [ ] Testimonials section: component exists at components/Testimonials.tsx, unused — wire up when real couple quotes available
- [ ] 52MB walkthrough video could be re-encoded (~10-15MB at 1080p)
- [ ] Set VITE_GOOGLE_API_KEY/VITE_GOOGLE_CALENDAR_ID in production env (calendar shows "temporarily offline" notice without them)
- [ ] Unused components: SocialProof.tsx, TheKnotHub.tsx, Map.tsx, Testimonials.tsx

## Key Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-10 | Tailwind v3 (not v4) via PostCSS | CDN was v3; v4 removed bg-opacity-* utilities used throughout |
| 2026-06-10 | Keep scroll fade-in but guard it | Visible-on-mount check + reduced-motion + threshold 0 prevents invisible content |
| 2026-06-10 | Keep original header per user | User prefers the original nav with The Knot/WeddingWire logo links; sticky header reverted |

## Architecture Notes
- Single-page app: HomePage sections (Hero/About/Pricing/Calendar/FAQ/Contact) + /gallery + /virtual-tour routes
- BookingContext carries calendar date selection → contact form prefill
- Brand palette: cream #FDF8F5, blush #EAD1DC, sage #A2B29F, charcoal #4a4a4a, gold #D4AF37; Cormorant Garamond headings / Raleway body
- Contact form posts to Formspree (id: mdkjokdw)

## Known Issues
- Full-page screenshot bots still capture below-fold sections mid-fade (scroll-reveal limitation; human UX unaffected)
- Carousel auto-advances with no pause control (WCAG 2.2.2 nit)
