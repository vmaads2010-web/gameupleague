-- ============================================================
-- GAME UP LEAGUE — Registration form v2 fields
-- Run in Supabase SQL Editor after 001-009.
--
-- Adds the fields from GUL's official registration form spec
-- (shared by Snedden, 19 Oct 2026): emergency contact, how-heard,
-- jersey/shorts size, and the two required consent checkboxes.
-- "position" stays a text column but now holds a comma-separated
-- list, since the new form allows selecting multiple positions
-- (checkboxes) instead of one.
-- ============================================================

alter table player_registrations
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_number text,
  add column if not exists emergency_contact_relationship text,
  add column if not exists heard_from text,
  add column if not exists jersey_size text,
  add column if not exists shorts_size text,
  add column if not exists declaration_accepted boolean not null default false,
  add column if not exists media_consent_accepted boolean not null default false;
