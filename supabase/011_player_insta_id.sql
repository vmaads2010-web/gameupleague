-- ============================================================
-- GAME UP LEAGUE — Player Instagram ID field
-- Run in Supabase SQL Editor after 001-010.
-- ============================================================

alter table player_registrations
  add column if not exists player_insta_id text;
