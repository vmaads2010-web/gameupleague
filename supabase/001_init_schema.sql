-- ============================================================
-- GAME UP LEAGUE — Phase 2 database schema + Row Level Security
-- Run this ONCE in Supabase: Project -> SQL Editor -> New query -> paste all -> Run
-- Safe to re-run if something goes wrong partway (uses IF NOT EXISTS / DROP+CREATE for policies).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- ADMIN USERS & ROLES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer'
    check (role in ('super_admin','admin','viewer')),
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('super_admin','admin')
  );
$$;

-- ---------- SEASONS ----------
create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft'
    check (status in ('draft','upcoming','active','completed','archived')),
  start_date date,
  end_date date,
  team_count int,
  players_per_team int,
  created_at timestamptz not null default now()
);

-- ---------- FEE SETTINGS (prices/dates live here, never hardcoded in app code) ----------
create table if not exists fee_settings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  offer_name text not null,
  applies_to text not null check (applies_to in ('player','team_old','team_new')),
  amount_paise bigint not null,
  currency text not null default 'INR',
  window_start date,
  window_end date,
  min_group_size int,
  is_active boolean not null default true,
  confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- TEAMS & PLAYERS ----------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete set null,
  name text not null,
  short_name text,
  owner_name text,
  owner_mobile text,
  owner_email text,
  logo_url text,
  status text not null default 'pending'
    check (status in ('pending','active','suspended','inactive')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  player_code text unique,
  full_name text not null,
  dob date,
  mobile text,
  email text,
  city text,
  position text,
  photo_url text,
  status text not null default 'pending'
    check (status in ('pending','approved','active','suspended','inactive')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  season_id uuid references seasons(id) on delete set null,
  jersey_number int,
  allocation_method text check (allocation_method in ('auction','draft','pre_signing','renewal','retention','rtm')),
  joined_at timestamptz not null default now(),
  unique (team_id, player_id, season_id)
);

-- ---------- REGISTRATIONS (separate from teams/players until approved) ----------
create table if not exists player_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_code text unique,
  season_id uuid references seasons(id) on delete set null,
  full_name text not null,
  mobile text not null,
  email text,
  dob date,
  city text,
  position text,
  photo_url text,
  referral_code text,
  offer_applied text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists team_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_code text unique,
  season_id uuid references seasons(id) on delete set null,
  proposed_team_name text not null,
  owner_name text not null,
  mobile text not null,
  email text not null,
  team_type text not null check (team_type in ('old','new')),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- ---------- PAYMENTS (always separate from registration status; built in Phase 3) ----------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  player_registration_id uuid references player_registrations(id) on delete set null,
  team_registration_id uuid references team_registrations(id) on delete set null,
  amount_paise bigint not null,
  currency text not null default 'INR',
  provider text,
  provider_order_id text,
  provider_payment_id text unique,
  status text not null default 'pending'
    check (status in ('pending','paid','failed','refunded')),
  verified_via_webhook boolean not null default false,
  created_at timestamptz not null default now(),
  check (
    (player_registration_id is not null and team_registration_id is null) or
    (player_registration_id is null and team_registration_id is not null)
  )
);

-- ---------- MATCHES ----------
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete set null,
  home_team_id uuid references teams(id),
  away_team_id uuid references teams(id),
  scheduled_at timestamptz,
  venue text default 'Game Up Turf',
  home_score int,
  away_score int,
  status text not null default 'scheduled'
    check (status in ('scheduled','live','completed','postponed','cancelled')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check (home_team_id is null or away_team_id is null or home_team_id <> away_team_id)
);

-- ---------- CONTENT: LEADERSHIP, ANNOUNCEMENTS, SPONSORS, MEDIA ----------
create table if not exists leadership (
  id uuid primary key default gen_random_uuid(),
  role_title text not null,
  person_name text not null,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  album text,
  image_url text not null,
  caption text,
  season_id uuid references seasons(id) on delete set null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- AUDIT LOG ----------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table seasons enable row level security;
alter table fee_settings enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table team_players enable row level security;
alter table player_registrations enable row level security;
alter table team_registrations enable row level security;
alter table payments enable row level security;
alter table matches enable row level security;
alter table leadership enable row level security;
alter table announcements enable row level security;
alter table sponsors enable row level security;
alter table media enable row level security;
alter table audit_logs enable row level security;

-- profiles: a user can read their own row; admins can read/write all
drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read" on profiles for select using (id = auth.uid() or is_admin());
drop policy if exists "profiles_admin_write" on profiles;
create policy "profiles_admin_write" on profiles for all using (is_admin()) with check (is_admin());

-- seasons / fee_settings: public can read (so the website can show them), only admins can write
drop policy if exists "seasons_public_read" on seasons;
create policy "seasons_public_read" on seasons for select using (true);
drop policy if exists "seasons_admin_write" on seasons;
create policy "seasons_admin_write" on seasons for all using (is_admin()) with check (is_admin());

drop policy if exists "fee_settings_public_read" on fee_settings;
create policy "fee_settings_public_read" on fee_settings for select using (true);
drop policy if exists "fee_settings_admin_write" on fee_settings;
create policy "fee_settings_admin_write" on fee_settings for all using (is_admin()) with check (is_admin());

-- teams / players: public can read only published rows; admins see/write everything
drop policy if exists "teams_public_read" on teams;
create policy "teams_public_read" on teams for select using (published = true or is_admin());
drop policy if exists "teams_admin_write" on teams;
create policy "teams_admin_write" on teams for all using (is_admin()) with check (is_admin());

drop policy if exists "players_public_read" on players;
create policy "players_public_read" on players for select using (published = true or is_admin());
drop policy if exists "players_admin_write" on players;
create policy "players_admin_write" on players for all using (is_admin()) with check (is_admin());

drop policy if exists "team_players_public_read" on team_players;
create policy "team_players_public_read" on team_players for select using (true);
drop policy if exists "team_players_admin_write" on team_players;
create policy "team_players_admin_write" on team_players for all using (is_admin()) with check (is_admin());

-- registrations: anyone can submit (insert); only admins can read or change them
drop policy if exists "player_reg_public_insert" on player_registrations;
create policy "player_reg_public_insert" on player_registrations for insert with check (true);
drop policy if exists "player_reg_admin_select" on player_registrations;
create policy "player_reg_admin_select" on player_registrations for select using (is_admin());
drop policy if exists "player_reg_admin_update" on player_registrations;
create policy "player_reg_admin_update" on player_registrations for update using (is_admin()) with check (is_admin());
drop policy if exists "player_reg_admin_delete" on player_registrations;
create policy "player_reg_admin_delete" on player_registrations for delete using (is_admin());

drop policy if exists "team_reg_public_insert" on team_registrations;
create policy "team_reg_public_insert" on team_registrations for insert with check (true);
drop policy if exists "team_reg_admin_select" on team_registrations;
create policy "team_reg_admin_select" on team_registrations for select using (is_admin());
drop policy if exists "team_reg_admin_update" on team_registrations;
create policy "team_reg_admin_update" on team_registrations for update using (is_admin()) with check (is_admin());
drop policy if exists "team_reg_admin_delete" on team_registrations;
create policy "team_reg_admin_delete" on team_registrations for delete using (is_admin());

-- payments: admins only, full stop — no public access at all, ever
drop policy if exists "payments_admin_only" on payments;
create policy "payments_admin_only" on payments for all using (is_admin()) with check (is_admin());

-- matches: public can read published; admins full control
drop policy if exists "matches_public_read" on matches;
create policy "matches_public_read" on matches for select using (published = true or is_admin());
drop policy if exists "matches_admin_write" on matches;
create policy "matches_admin_write" on matches for all using (is_admin()) with check (is_admin());

-- leadership / announcements / sponsors / media: public reads published, admin writes
drop policy if exists "leadership_public_read" on leadership;
create policy "leadership_public_read" on leadership for select using (published = true or is_admin());
drop policy if exists "leadership_admin_write" on leadership;
create policy "leadership_admin_write" on leadership for all using (is_admin()) with check (is_admin());

drop policy if exists "announcements_public_read" on announcements;
create policy "announcements_public_read" on announcements for select using (published = true or is_admin());
drop policy if exists "announcements_admin_write" on announcements;
create policy "announcements_admin_write" on announcements for all using (is_admin()) with check (is_admin());

drop policy if exists "sponsors_public_read" on sponsors;
create policy "sponsors_public_read" on sponsors for select using (active = true or is_admin());
drop policy if exists "sponsors_admin_write" on sponsors;
create policy "sponsors_admin_write" on sponsors for all using (is_admin()) with check (is_admin());

drop policy if exists "media_public_read" on media;
create policy "media_public_read" on media for select using (published = true or is_admin());
drop policy if exists "media_admin_write" on media;
create policy "media_admin_write" on media for all using (is_admin()) with check (is_admin());

-- audit_logs: admins can read; writes happen only via trusted server-side code later
drop policy if exists "audit_logs_admin_read" on audit_logs;
create policy "audit_logs_admin_read" on audit_logs for select using (is_admin());
