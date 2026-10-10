-- ============================================================
-- GAME UP LEAGUE — Fix: grant base table privileges
-- Run this in Supabase SQL Editor AFTER 001_init_schema.sql.
--
-- Why this is needed: enabling Row Level Security (RLS) restricts access,
-- but it does NOT by itself grant anyone permission to touch a table.
-- Postgres requires both: a GRANT (can this role even attempt the action)
-- AND a passing RLS policy (is this specific row allowed). Testing found
-- the anon role had no GRANT at all, so every request was blocked before
-- RLS was even checked (error 42501 "permission denied for table X").
-- ============================================================

grant usage on schema public to anon, authenticated;

-- Public website visitors (not logged in): read-only on public content,
-- plus the ability to submit the two registration forms.
grant select on
  seasons, fee_settings, teams, players, team_players,
  matches, leadership, announcements, sponsors, media
to anon;

grant insert on player_registrations, team_registrations to anon;

-- Logged-in users (admins and any future authenticated role): broad grant.
-- The actual fine-grained restriction still comes from the RLS policies
-- in 001_init_schema.sql (is_admin() checks) — this grant alone does not
-- let a non-admin logged-in user do anything the policies don't allow.
grant select, insert, update, delete on
  profiles, seasons, fee_settings, teams, players, team_players,
  player_registrations, team_registrations, payments, matches,
  leadership, announcements, sponsors, media, audit_logs
to authenticated;

grant usage on all sequences in schema public to anon, authenticated;
