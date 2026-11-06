-- ============================================================
-- GAME UP LEAGUE — Live bid tracking (the actual "war") + flexible
-- position flag on players. Already applied directly to the live
-- project; kept here so the repo's migration history matches.
-- ============================================================

alter table auction_state add column if not exists current_bid numeric;
alter table auction_state add column if not exists current_leading_team_id uuid references auction_teams(id) on delete set null;

alter table auction_players add column if not exists is_flexible boolean not null default false;
