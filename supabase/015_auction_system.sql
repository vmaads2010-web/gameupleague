-- ============================================================
-- GAME UP LEAGUE — RELOADED Auction System
-- Run in Supabase SQL Editor after 001-014.
--
-- Fully admin-only (one operator runs this live during the actual
-- auction event) - every table is gated by is_admin(), same pattern
-- as sponsorship_tracker/expense_tracker. Amounts are stored as
-- plain whole rupees (not paise) since every auction amount in this
-- league is always a round lakh - no sub-rupee precision is ever
-- needed here, so paise would just add noise.
-- ============================================================

create table if not exists auction_teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null unique,
  owner_name text,
  total_purse numeric not null default 13000000,     -- Rs 1.30 Cr
  remaining_purse numeric not null default 13000000,
  squad_target int not null default 8,
  squad_count int not null default 0,
  presign_count int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists auction_players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text,

  -- presign players never go through pools/sets - they are allotted
  -- directly to a team at a fixed cost, outside the live auction.
  pool text not null check (pool in ('presign', 'flagship', 'blockbuster')),
  set_number int check (set_number between 1 and 6), -- null for presign; up to 6 to cover the overflow sets

  base_price numeric not null,

  status text not null default 'available'
    check (status in ('available', 'sold', 'unsold', 'recalled', 'presigned')),

  sold_to_team_id uuid references auction_teams(id) on delete set null,
  sold_price numeric,
  sold_at timestamptz,

  -- true once this player has already been through one unsold ->
  -- recall cycle, so the dashboard knows not to recall it twice.
  recall_used boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_auction_players_pool_set on auction_players(pool, set_number);
create index if not exists idx_auction_players_status on auction_players(status);

-- Full audit trail - every bid placed, win or lose, with who and when.
-- Nothing is ever deleted from here, so a dispute can always be traced.
create table if not exists auction_bid_log (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auction_players(id) on delete cascade,
  team_id uuid not null references auction_teams(id) on delete cascade,
  bid_amount numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists auction_replacements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references auction_teams(id) on delete cascade,
  original_player_id uuid references auction_players(id) on delete set null,
  original_player_name text,
  replacement_player_name text not null,
  source text not null check (source in ('own_pick', 'unsold_pool', 'external_approved')),
  reason text,
  approved_by text,
  created_at timestamptz not null default now()
);

alter table auction_teams enable row level security;
alter table auction_players enable row level security;
alter table auction_bid_log enable row level security;
alter table auction_replacements enable row level security;

drop policy if exists "auction_teams_admin_all" on auction_teams;
create policy "auction_teams_admin_all" on auction_teams for all
to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "auction_players_admin_all" on auction_players;
create policy "auction_players_admin_all" on auction_players for all
to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "auction_bid_log_admin_all" on auction_bid_log;
create policy "auction_bid_log_admin_all" on auction_bid_log for all
to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "auction_replacements_admin_all" on auction_replacements;
create policy "auction_replacements_admin_all" on auction_replacements for all
to authenticated using (is_admin()) with check (is_admin());

grant select, insert, update, delete on auction_teams to authenticated;
grant select, insert, update, delete on auction_players to authenticated;
grant select, insert, update, delete on auction_bid_log to authenticated;
grant select, insert, update, delete on auction_replacements to authenticated;
