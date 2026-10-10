-- ============================================================
-- GAME UP LEAGUE — Add quoted fee tracking to player_registrations
-- Run in Supabase SQL Editor after 001-003.
-- Records what price was SHOWN to the player at registration time.
-- This is separate from actual payment (handled later in the payments
-- table, Phase 3) - GUL's own rules require payment to be verified
-- independently, never assumed from what was quoted.
-- Safe to re-run (IF NOT EXISTS).
-- ============================================================

alter table player_registrations
  add column if not exists quoted_fee_paise bigint;
