# GUL Prototype Audit — Phase 0
Date: 9 October 2026
Source files inspected: game-up-league-website-prototype-v2 (1).zip, game-up-league-admin-panel-prototype.zip, gul-season2-easy-edit-prototype.zip (all from C:\Users\Abcom\Downloads), plus GUL_Claude_Project_Pack knowledge files.
Status: audit only. No production code written yet. Nothing deployed, connected, or tested against a live backend.

## 1. Brand assets — CONFIRMED genuine, not altered
- `gul-logo.png`/`gul-logo.jpeg` — identical artwork, two formats (PNG transparent 768KB, JPEG white-bg 162KB). Same file reused correctly across all 3 prototypes.
- `gul-mascot.png`/`gul-mascot.jpeg` — identical grey wolf character (blue GUL jersey, football), two formats for the same reason (PNG for transparent hero placement using `mix-blend-mode:screen`, JPEG for flat-background placements like the admin sidebar).
- No prototype redraws, recolors or alters either asset. Rule is being respected so far.
- Minor, non-blocking: both PNGs are large for web (768KB logo, 390KB mascot) and should be compressed before go-live. Free tools exist (squoosh.app, tinypng.com). Not done yet — flagging only.

## 2. What exists and genuinely works today

**website-prototype-v2** (public site)
- Single static HTML+CSS file, clean responsive layout (breakpoint at 850px), dark navy/blue/gold theme matching brand direction.
- Sections: hero, leagues/tournaments, season standings, player profiles, Game Up Turf, events, about, join CTA, contact.
- Everything is static/hardcoded placeholder content (fake team names like "Game Up United", fake stats). Contact form submit just shows a JS `alert()` — nothing is sent anywhere.
- YouTube link points to a search-results URL, not a channel — matches your own Decision Log item #10 (unverified).
- **Reuse value: high.** ~90% of this CSS/layout is usable as-is for the real site shell.

**admin-panel-prototype**
- Single static HTML "app shell" with sidebar nav across 13 sections (Dashboard, Leagues, Teams, Players, Matches, Standings, Stats, Registrations, Turf, Events, Content, Users, Settings) and 6 modal forms.
- **Every button is fake.** "Create League", "Approve", "Save Settings" etc. only pop a toast message like `"League created — demo"`. Nothing persists — not even to the browser. Refreshing the page resets everything to the same hardcoded demo rows (e.g. "Mumbai Warriors", generic fake players). None of this is real GUL Season 1/2 data.
- Includes a **"Game Up Turf" booking/slot-pricing module** — this is hourly facility-rental booking (separate from league registration fees). This feature isn't mentioned in your product scope docs. Flagging it as a scope question, not assuming it's wanted in V1.
- **The single most valuable file in this whole pack: `supabase_schema.sql`.** A genuinely solid, production-oriented starter schema — UUID primary keys, foreign keys, status check-constraints, payments kept in their own table separate from registrations/bookings (matches your security rule exactly). Missing Row Level Security policies (the file says so itself) and isn't wired to anything yet, but it's a strong starting point, not a throwaway.
- **Reuse value for UI: medium** (good visual structure, but every data-handling part needs to be rebuilt for real). **Reuse value for schema: high.**

**gul-season2-easy-edit-prototype**
- Single HTML file combining public site + registration forms + admin tool for Season 2.
- **This is the only one of the three with real interactive logic**, not just a visual mockup:
  - Admin can edit every season date/price/rule field; changes save to the browser's `localStorage` and the public preview updates live.
  - Player/team registration forms actually append real entries to a stored list (in that browser only).
  - Admin can change payment status and review status per entry via dropdowns.
  - CSV export is real — it generates and downloads an actual `.csv` file client-side.
  - Pricing logic automatically picks "Early Bird / Referral / Regular" based on today's date vs. the configured windows — a genuinely useful pattern.
- **Important catch:** the default values baked into this prototype (Early Bird ₹1,500 for 1–5 Nov, Referral ₹1,500 min-3 for 6–10 Nov, Regular ₹1,800 by 30 Nov, old team ₹10,000/new ₹12,000) match your **August 2025 minutes**, not your **September 2026 announcement** (which has different dates and a ₹11,000 team figure). The prototype silently picked one side of your own documented conflict. I am not carrying this forward as correct — it stays an open decision per your Decision Log until you confirm it.
- **Reuse value: high for the settings/pricing *pattern*** (the shape of a configurable-fields object maps almost directly onto a future `fee_settings` database table). **Zero reuse value for the storage mechanism** — `localStorage` is single-browser, not shared, and must be replaced entirely.

## 3. What is demo-only, everywhere (cuts across all three)
- No shared database — either nothing persists at all (admin-panel) or it persists only inside one person's one browser (easy-edit).
- No real authentication — "admin" access is just opening the HTML file.
- No payment processing of any kind — no gateway, no verification, nothing.
- No email/WhatsApp sending — contact form just shows an alert.
- No image upload storage — file inputs exist in forms but don't upload anywhere; "Player photo" in easy-edit only records the filename as text.
- No real GUL historical data (teams, players, fixtures) anywhere — all sample/placeholder.

## 4. Decisions still open — not resolved by me, not resolved by the prototypes either
Carried over from your Decision Log, confirmed still unresolved by the prototype defaults:
1. Player registration window: 1 Nov–2 Dec 2026 vs ends 30 Nov 2026
2. Early Bird window: 1–7 Nov vs 1–5 Nov (prototype defaults to 1–5 Nov — not a resolution, just whichever the builder picked)
3. Referral pricing: ₹1,500/player min-3 vs "3 players for ₹1,500" total (prototype assumes per-player)
4. Team fee: ₹10,000/₹12,000 (old/new) vs ₹11,000 regular w/ possible ₹1,500 discount (prototype uses the ₹10,000/₹12,000 pair)
5. Nine-team playoff/knockout format — how team #9 fits top-4/bottom-4 split
6. Auction venue "Phaka Fast" — unconfirmed
7. Whether turf-slot facility booking is in scope for V1 at all (new question raised by this audit, not in your original docs)
8. Social Media lead (Mandar) and Marketing/PR spelling (Sheryans/Sheryaans)
9. Exhibition match + women's exhibition scope
10. Exact official YouTube channel URL
11. Final player registration form fields + refund policy text

Everything above will stay as an editable setting, never hardcoded, until you tell me which value is correct.

## 5. Proposed architecture (unchanged from earlier discussion, now grounded in what we actually have)
- Reuse website-prototype-v2's HTML/CSS as the visual base for the public site.
- Reuse admin-panel-prototype's `supabase_schema.sql` as the starting database schema (after adding RLS policies).
- Reuse easy-edit's "settings object" pattern as the shape for a `site_settings`/`fee_settings` table, not its localStorage mechanism.
- Hosting: Vercel or Netlify (free tier, to verify current limits when we get there).
- Database/Auth/Storage: Supabase (free tier, to verify current limits when we get there).
- Payment gateway: Razorpay or Cashfree — compared at Phase 3, not now.

## 6. First small task (proposed, not started)
Stand up the public website shell as a real, hosted (but still databaseless) site using the website-prototype-v2 HTML as the base, with the two confirmed asset files wired in correctly, and get it live on a free preview URL so you can see it on your phone. No registration, no admin, no database yet — just "does the real site look right on a real URL." This is reversible, free, and testable in one sitting.

## 7. Costs/free-tier claims in this document
None stated as certain. Vercel/Netlify/Supabase/Razorpay/Cashfree limits and prices will be checked at the point each is actually adopted, not assumed now.
