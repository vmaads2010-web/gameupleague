-- ============================================================
-- GAME UP LEAGUE — Co-owner jersey add-on (+Rs 500) and the actual
-- quoted/paid fee (base entry fee + co-owner jersey if requested).
-- Owner's own jersey stays free (already covered by jersey_size from
-- migration 023). Already applied directly to the live project; kept
-- here so the repo's migration history matches.
-- ============================================================

alter table public.team_registrations
  add column if not exists co_owner_jersey_requested boolean not null default false,
  add column if not exists co_owner_name text,
  add column if not exists co_owner_jersey_size text,
  add column if not exists quoted_fee_paise bigint;
