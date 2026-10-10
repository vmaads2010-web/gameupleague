-- ============================================================
-- GAME UP LEAGUE — Seed the Season 2 row
-- Run in Supabase SQL Editor AFTER 001_init_schema.sql and 002_grants.sql.
-- Only uses values already confirmed (no disputed pricing/dates included).
-- Safe to re-run: skips insert if a season with this name already exists.
-- ============================================================

insert into seasons (name, status, start_date, end_date, team_count, players_per_team)
select 'Season 2 — RE-LOADED', 'upcoming', '2027-01-16', '2027-03-13', 9, 8
where not exists (select 1 from seasons where name = 'Season 2 — RE-LOADED');
