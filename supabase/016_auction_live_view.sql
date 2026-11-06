-- ============================================================
-- GAME UP LEAGUE — Public live-view for the Auction Dashboard
-- Run in Supabase SQL Editor after 015_auction_system.sql.
--
-- Lets anyone with the link watch the auction live on their phone,
-- no login needed - same idea as cricauction.live's spectator view,
-- but free. Read-only: only SELECT is opened to the public; every
-- write stays admin-only exactly as before.
-- ============================================================

-- Singleton row the admin dashboard updates to say "this player is
-- on the block right now" - the public page polls it to show the
-- live player without needing a realtime subscription.
create table if not exists auction_state (
  id int primary key default 1,
  current_block_player_id uuid references auction_players(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint auction_state_singleton check (id = 1)
);
insert into auction_state (id) values (1) on conflict (id) do nothing;

alter table auction_state enable row level security;

drop policy if exists "auction_state_admin_write" on auction_state;
create policy "auction_state_admin_write"
on auction_state for all
to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "auction_state_public_read" on auction_state;
create policy "auction_state_public_read"
on auction_state for select
to anon, authenticated using (true);

grant select on auction_state to anon;
grant select, insert, update, delete on auction_state to authenticated;

-- Open read access on teams/players/bid log so the public live page
-- can show purses, squads and sold players. Writes remain untouched
-- (still admin-only, from the existing 015 policies).
drop policy if exists "auction_teams_public_read" on auction_teams;
create policy "auction_teams_public_read"
on auction_teams for select
to anon, authenticated using (true);
grant select on auction_teams to anon;

drop policy if exists "auction_players_public_read" on auction_players;
create policy "auction_players_public_read"
on auction_players for select
to anon, authenticated using (true);
grant select on auction_players to anon;

drop policy if exists "auction_bid_log_public_read" on auction_bid_log;
create policy "auction_bid_log_public_read"
on auction_bid_log for select
to anon, authenticated using (true);
grant select on auction_bid_log to anon;
