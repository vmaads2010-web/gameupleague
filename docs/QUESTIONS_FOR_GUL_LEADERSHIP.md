# GUL — Questions for Leadership Confirmation
Prepared 9 October 2026, updated 10 October 2026. These decisions are currently conflicting or unconfirmed across GUL's own notes/announcements. Nothing below has been assumed or guessed in the website/app — please confirm each one with a date and source so it can be locked in and marked final.

## ✅ Confirmed (resolved, no longer open)
- **YouTube channel**: https://www.youtube.com/@gameupleague — confirmed by Vishal in chat, 10 Oct 2026. Website updated.
- **Instagram**: confirmed as https://www.instagram.com/thegameupleague/ (handle `@thegameupleague`) by Vishal in chat, 10 Oct 2026. **Note:** this is a different handle than `gameup.league`, which is what the original knowledge pack documented — flagging in case `gameup.league` is also a real, separate GUL-affiliated account that should be linked too.
- **Team count**: confirmed as **9 teams** by Vishal in chat, 10 Oct 2026 (the earlier "10 Teams" on the live site was a test edit, reverted). The 9-vs-top4/bottom4 playoff math question below is still open.
- **Team entry fee**: confirmed as **₹11,000 Regular Team Entry**, with **₹1,500 off for Early Bird & Referral renewal** (so ₹9,500 during that window) — from Vishal's "Team Rules & Auction Policy" note pasted in chat, 10 Oct 2026. This matches the "₹11,000 + discount" version of the old conflict, not the "₹10,000/₹12,000 old/new team" version — that older version is now superseded.
- **Player registration window**: confirmed as **1 Nov – 2 Dec 2026** — from the official "SEASON 2: RE-LOADED" announcement text Vishal pasted in chat, 10 Oct 2026. Matches the Sept 2026 announcement version (the "ends 30 Nov" version is superseded). Also matches the team window from the same day's other note, so this is now the confirmed window for both tracks.
- **Early Bird window**: confirmed as **1–7 Nov 2026**, ₹1,500/player — from the same official announcement. The "1–5 Nov" version is superseded.
- **Referral offer**: confirmed as **₹1,500 per player** (not a total-for-group figure), window **8–14 Nov 2026**, minimum 3 players must register together to qualify — from the same official announcement.
- **Regular player fee**: confirmed as **₹1,800/player**, applies after the Referral window closes.
- **Rollout strategy (operational, not a data conflict)**: Vishal explained in chat, 10 Oct 2026 that tiers are deliberately shown one at a time, not all at once — Early Bird is shown first; once Vishal decides, he manually activates the Referral tier on the website; then later the Regular tier. This is a marketing/urgency tactic (like phased event-ticket pricing), not a scheduling bug. The website's `content.json` now has an `activeOffer` field Vishal can change himself (see note below) to control which tier is live, independent of the calendar date.

## Season 2 format
1. With **9 teams** (confirmed), the "top 4 Champions playoff + bottom 4 knockout" format only covers 8 teams. How is the 9th team handled (bye, play-in match, different group size)?
2. Auction venue — is **"Phaka Fast"** confirmed, or still pending?
3. Exhibition match: is it fully free for players, and are there any other details to confirm?
4. Women's exhibition (4 teams, 3 matches, min. 24 players, knockout 5+3) — confirm this is actually happening, or drop it from planning for now?

## People & roles
5. Social Media lead — is it confirmed as **Mandar**?
6. Marketing/PR name spelling — **Sheryans** or **Sheryaans**?

## Scope question (new, raised during technical review)
7. The admin panel prototype included a **turf hourly-slot booking/payment module** (separate from league registration — booking the ground itself by the hour). This wasn't in the original product brief. Is this a feature GUL wants built, and if so, in V1 or later? (Currently excluded from V1 scope per your instruction.)

## Still needed, not yet drafted
8. Final player registration form fields (which details are actually required at signup).
9. Refund policy wording.

## Notes & ideas (not decisions — just logging for later)
- **Team owner appreciation**: Vishal's 10 Oct 2026 note says "We need to do something special to make owners feel valued" — a product/marketing idea for team owner retention, not a data decision. Worth revisiting when planning sponsor/owner-facing features.

---
**How to answer:** For each item, a short reply with the final value and who confirmed it (e.g. "#1: 1–5 Nov 2026, confirmed by Ansel, 10 Oct 2026") is enough. Once confirmed, it gets locked into the website/admin settings and removed from this list.
