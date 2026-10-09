# Game Up League (GUL) — Website & Operations Codebase

This is the single source-of-truth repository for the GUL public website, admin dashboard,
registration/payment system and AI Social Media Studio. GUL owns this repository, domain,
database, storage and payment accounts.

## What's in here

- `website/` — the live public website (currently a static HTML/CSS site, no backend yet).
- `docs/` — project audits and decision records.

## Status (updated 9 October 2026)

- Public website: early preview, static only. No database, no payment gateway, no registration
  backend yet. See `docs/AUDIT_PROTOTYPE_REVIEW.md` for the full prototype audit.
- Admin dashboard, registration/payment, AI Social Studio: not started yet.

## How to update the website

1. Edit `website/index.html` (all content is in one file for now — plain HTML/CSS).
2. Test locally by opening the file in a browser, or ask Claude to run a local preview.
3. Commit and push:
   ```
   git add .
   git commit -m "Describe what you changed"
   git push
   ```
4. If hosted on GitHub Pages, the live site updates automatically within a minute or two of pushing.

## Open decisions

Prices, dates, team rules and competition formats are intentionally kept editable and are
not final. See `docs/AUDIT_PROTOTYPE_REVIEW.md` section 4 for the full list of items still
pending confirmation from GUL leadership.
