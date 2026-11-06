-- ============================================================
-- GAME UP LEAGUE — Player photo on the auction block
-- Already applied directly to the live project. Kept here so the
-- repo's migration history matches the live schema.
-- ============================================================

alter table auction_players add column if not exists photo_url text;
