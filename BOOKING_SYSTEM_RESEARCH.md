# Automated Booking System — Research Report

_Researched 2026-07-15 via deep-research workflow (21 sources fetched, 104 claims extracted, 25 adversarially verified: 19 confirmed / 6 refuted)._

## The core finding: weddings aren't booked by checkout

**Confidence: high (unanimous across 8 verified claims).** Wedding venues are booked through a multi-step, human-in-the-loop workflow — research and in-person tours, then inquiry, proposal, contract e-signature, deposit at signing, and an installment payment schedule — typically 12–18 months in advance (3–9 months for off-peak dates). Instant online checkout is not the industry norm anywhere.

**Implication:** an "automated booking system" for The Barn should automate (1) tour scheduling and (2) the contract/deposit pipeline — not a "pick a date and pay" flow.

Sources: fullybookedvenue.com, nurturepro.io, brooksidepayments.com, circledfarm.com, herecomestheguide.com (corroborated against The Knot, WeddingWire, Here Comes the Guide).

## Recommended phased plan

### Phase 1 — Automated tour scheduling (days of work, low risk)

Embed **Cal.com** (or Calendly) in the existing React 19 + Vite SPA for "Schedule a Tour":

- **Cal.com** has official inline/popup/floating embeds with React examples; `@calcom/embed-react` explicitly declares React 19 peer-dependency support (`^18.2.0 || ^19.0.0`) — the slightly stronger first-party integration. (Confidence: high, 3-0 verified.)
- **Calendly**'s officially recommended React path is the community-maintained `react-calendly` package (InlineWidget, PopupWidget, PopupButton; v4.4.0, actively maintained, peer range covers React 19). Its `prefill` prop supports name, email, guests, custom answers, and **date** — so the existing pattern (react-calendar date selection pre-fills the form) carries over. Caveat: date prefill navigates the widget to that date rather than locking it. (Confidence: high, 3-0 verified.)
- Both render iframe-based booking UIs with limited styling control.
- Keep the Formspree form as the general-inquiry fallback.

### Phase 2 — Contracts + deposits via a clientflow platform (weeks)

Adopt **HoneyBook** (evaluate **Perfect Venue** as the venue-specific alternative):

- **HoneyBook** (confidence: high): all-in-one clientflow platform — client communication, scheduling, proposals, contracts, payments. Legally binding e-signatures; proposals combine invoice + contract + payment in one client-facing document with deposit/retainer payment schedules. Processing fees verified against HoneyBook's own fee explainer (Dec 2025): **2.9% + $0.25** Visa/MC, **1.5% ACH** (Amex/Discover and card-on-file: 3.4% + $0.09). Note: it's really a general clientflow CRM with wedding roots — no BEOs/floor plans, which this venue doesn't need anyway.
- **Perfect Venue** (confidence: medium): built-in proposal e-signature that locks and confirms bookings, online deposit and balance collection (verified against its own features page/help center). One fetched source claims a free tier with a 14-day trial, but its pricing claims did not survive verification — check directly.
- **Avoid Tripleseat**: custom quote-based pricing (~$149–$300+/mo starting) targeting large venues (~80+ events/year, multi-space operations).
- Sync the platform's calendar with the existing Google Calendar so the site's read-only availability view stays accurate (sync quality NOT directly verified — test during trial).

### Phase 3 — Lodging, separately

Handle overnight stays via channel listings/embeds (Airbnb/VRBO, or a direct-booking widget from Lodgify ~$14–62/mo or OwnerRez) rather than custom code. This angle produced few verified claims — needs its own evaluation when it becomes a priority.

### Do NOT custom-build (Google Calendar + Netlify Functions + Stripe)

The bottleneck isn't payment collection — it's the contract/deposit workflow, which platforms already solve. A custom build puts contract legality, payment schedules, webhook reliability, and ongoing maintenance on a non-technical owner. (Inference from verified workflow findings, not direct comparison evidence.)

## Refuted claims (do not rely on these)

All specific subscription-tier pricing was refuted 0-3 and must be checked on vendor pricing pages before committing:

- HoneyBook tiers at $19/$39/$79/mo or $29–$109/mo — refuted
- Perfect Venue at ~$79/mo, or "best for 50–150 weddings/year" — refuted
- "Tripleseat and Perfect Venue don't publish pricing" (as a pair) — refuted

Only HoneyBook's per-transaction processing fees survived verification.

## Open questions

1. Current HoneyBook / Perfect Venue subscription prices and which tier a single-owner venue needs.
2. Whether HoneyBook/Perfect Venue cover overnight-stay bookings at all, or lodging needs a separate channel — and how that calendar syncs with the venue's Google Calendar.
3. Whether HoneyBook, Perfect Venue, and Cal.com offer reliable two-way Google Calendar sync (double-booking prevention across weddings + lodging).
4. Cal.com free tier vs. Calendly paid tiers long-term cost, and intake-question support (guest count, event type) before a tour.

## Caveats

- Several workflow sources are vendor/content-marketing blogs (corroborated against The Knot / WeddingWire / Here Comes the Guide, but quantitative claims like "friction at the contract stage loses bookings" are uncited industry assertions).
- Lodging platforms, the custom-build option, and Acuity/Squarespace Scheduling produced no surviving verified claims — the anti-custom-build recommendation is inference.
- SaaS pricing, processing fees, and npm peer-dep ranges are current as of mid-2026 and change often; `react-calendly` is community-maintained.
