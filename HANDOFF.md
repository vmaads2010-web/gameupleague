# The Game Up League (GUL) — Project Handoff

Paste this whole file (or point Claude at it) in a new Claude Code session to pick up
exactly where this one left off.

## Project basics

- **Local path:** `C:\Users\Abcom\GUL`
- **GitHub repo:** `vmaads2010-web/gameupleague` — https://github.com/vmaads2010-web/gameupleague
- **Live site:** https://thegameupleague.com
- **Deploy:** push to `main` → GitHub Actions (`.github/workflows/deploy-pages.yml`) auto-deploys
  the `website/` folder to GitHub Pages. No build step, no manual deploy needed.
- **Stack:** plain static HTML/CSS/vanilla JS. No framework, no bundler, no npm.
- **Backend:** Supabase (Postgres + Storage + Auth), config in `website/admin/supabase-config.js`
  (the anon key in there is the public/safe one, fine to be in the repo).

## Key pages

| File | Purpose |
|---|---|
| `website/index.html` | Homepage — Journey hub, RELOADED section, Season 1 archive, leadership, trophy, etc. |
| `website/register.html` | Player registration form (gated: Submit disabled until payment screenshot attached) |
| `website/register-team.html` | Team owner registration form (same payment gate) |
| `website/admin/dashboard.html` | Admin dashboard — approve/reject, mark paid, WhatsApp reminder/confirm buttons, player trading-card generator (Canvas-based) |
| `website/content.json` | All editable site copy/pricing/dates — edit this instead of hunting through HTML for text changes |

## Current design system (as of this session)

- **Base palette:** deep maroon-black (`#1a0a0c` / `#2a0e12` / `#3d1216`), NOT navy, NOT pure black
  — chosen specifically to match the actual GUL logo (red/gold/white comic-star badge),
  after an earlier teal+pink direction was found to clash with the logo.
- **Primary accent:** gold `#ffc93c` (`--gold`), used for buttons/eyebrows/borders everywhere.
- **Reserved "prestige" gold:** `#f5b51b` (`--trophy`), used ONLY for champion/trophy/final-match/
  season-award elements — a deliberate hierarchy, don't reuse it for everyday UI.
- **Fonts:** Anton (display headings — h1/h2/h3, now set `font-style: italic` for a bold
  sports-broadcast slant), Archivo (body/UI), Barlow Condensed (stat/numeric labels —
  now loaded with a real italic weight via `ital,wght` axis, applied to countdown digits,
  prices, match dates — NOT synthetic/faux italic).
- **Direction reference:** UEFA / Premier League / La Liga official sites — bold italic
  condensed typography, broadcast-scoreboard numeric styling. (Their actual color/layout
  could not be inspected this session — no browser access — only structural info via text fetch.)

## What was built this session (reverse chronological-ish)

1. Full visual redesign from the original navy+gold theme → several iterations → settled on
   maroon-black+gold (see Design system above).
2. **Payment-screenshot gate**: both registration forms now show the UPI QR/payment section as
   part of the form itself (not a post-submit afterthought), and the Submit button is disabled
   until a screenshot is attached. Submission is atomic — photo + screenshot upload + DB insert
   all happen together.
3. **Live countdown timers** (scoreboard-style boxed D:H:M digits) on the homepage offer banner
   and on the registration page's price card, driven by a new `end` ISO timestamp field added to
   each offer in `content.json` (`registration.early_bird.end` etc.) — update that field if you
   change the offer window.
4. **"Deal card" treatment** on the RELOADED pricing card: crossed-out regular price, big
   discounted price, "Save ₹X" badge.
5. **Leadership section bug fix**: it was secretly an infinite auto-scrolling marquee (duplicated
   content for a seamless loop), which is why members kept "disappearing" — converted to a plain
   static grid, duplicate-content bug removed.
6. **OG/share image + meta tags**: `website/assets/og-share.jpg` (branded WhatsApp/Facebook link
   preview card) plus `og:*`/`twitter:*` meta tags on all 3 public pages — WhatsApp was previously
   showing random scraped images because no `og:image` was set at all.
7. **Mobile nav fix**: `.navin` was a fixed-height flex row; the full brand name wrapping to 2
   lines on phone widths broke the layout. Fixed with `min-height`/auto-height instead of a fixed
   height (full brand name was kept — an earlier attempt to shorten it to "GUL" was explicitly
   rejected by the user).
8. **Admin dashboard additions** (all zero-cost, no paid API):
   - "💬 Remind" / "✅ Confirm" buttons per registration — open a `wa.me` link with a pre-filled
     WhatsApp message (admin still taps Send; no WhatsApp Business API).
   - "🪪 Card" button — generates a shareable player trading-card image entirely client-side via
     Canvas (player photo + name + position + season tag), downloadable as JPEG.
9. **GSAP entrance animation** (loaded from cdnjs, pure progressive enhancement — page works
   identically if the CDN is blocked): the Journey hub assembles on page load (logo scales in
   with a bounce, side panels slide in), the 3 main "Register" buttons get a magnetic lift hover,
   the trophy image gets a scale+glow scroll reveal. Built using guidance pulled from the newly
   installed `ui-ux-pro-max` skill's motion/GSAP preset reference (see below).
10. **Backup pipeline**: Supabase → Google Sheet auto-backup via a Database Webhook calling a
    Google Apps Script Web App (user set this up manually, not something a future session needs
    to redo — ask the user if it's still working rather than rebuilding it).

## Skills installed this session (`~/.claude/skills/`)

From 3 third-party GitHub repos (all inspected for safety before install — plain instruction/
reference files only, no auto-executing code was run):
- `apple-design-skill` (from `dickwu/apple-design-skill`) — Apple HIG-based UI review
- `impeccable` (from `pbakaus/impeccable`) — frontend design/redesign/critique. **Note:** its own
  "Setup" step wants to download-and-run a self-contained binary on first real use — that step
  was NOT executed this session; flag it to the user before ever running it.
- `ui-ux-pro-max`, `design`, `design-system`, `banner-design`, `brand`, `slides`, `ui-styling`
  (all from `nextlevelbuilder/ui-ux-pro-max-skill`) — searchable style/palette/font/motion
  database. The search script needs Python (`python scripts/search.py ...`), which was NOT
  available on this machine — the raw data was read directly from
  `~/.claude/skills/ui-ux-pro-max/data/*.csv` instead (e.g. `motion.csv` has the GSAP presets).

## Known gaps / things a browser-capable session should actually verify

This session had **no browser access at all** (not the desktop app's Browser pane, not Chrome
extension) — every change was shipped based on code-level validation (brace balance, Node JS
syntax check, HTTP fetch confirming deploy) and the user's own screenshots, never an actual
rendered-page look from Claude's side. A session with real browser access should, as a first
pass:
- Actually look at the live site across the GSAP entrance animation, italic typography, mobile
  nav, and countdown timers — all of this was written carefully but never visually confirmed.
- Check the Journey hub entrance animation timing feels right (currently: logo at 0.1s, panels at
  0.35s, items stagger at 0.6s — may need tuning).
- Exact Game Up Turf street address is still missing (only GPS coords were ever found:
  19.387811, 72.784168) — ask the user for it directly.
- The user wants the site to feel like a "₹100cr company" premium sports brand (explicit
  reference: UEFA Champions League, Premier League, La Liga, and the Indian creator-football
  league "Creators League" / claygrounds.com) — only the typography direction has been addressed
  so far; layout/diagonal-cut/live-match-center ideas were discussed but not built, pending a
  browser-capable session that can actually benchmark against those sites visually.

## Supabase schema (tables in use)

`player_registrations`, `team_registrations`, `payments`, `payment_screenshots`, `seasons`,
`team_references`. Storage buckets: `player-photos`, `payment-screenshots`, `team-logos`,
`team-references` (all private, accessed via signed URLs from the authenticated admin dashboard).
