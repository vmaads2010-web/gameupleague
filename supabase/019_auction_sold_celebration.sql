-- ============================================================
-- GAME UP LEAGUE — SOLD celebration state
-- Already applied directly to the live project; kept here so the
-- repo's migration history matches.
-- ============================================================

alter table auction_state add column if not exists last_sold_player_name text;
alter table auction_state add column if not exists last_sold_team_name text;
alter table auction_state add column if not exists last_sold_price numeric;
alter table auction_state add column if not exists last_sold_at timestamptz;
