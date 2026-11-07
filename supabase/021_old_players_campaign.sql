-- ============================================================
-- GAME UP LEAGUE — Old Players (Season 1) WhatsApp re-engagement
-- campaign. Already applied directly to the live project; kept here
-- so the repo's migration history matches.
-- ============================================================

create table if not exists public.old_players_campaign (
  id uuid primary key default gen_random_uuid(),
  season_label text not null default 'Football Reimagined (Season 1)',
  full_name text not null,
  mobile text not null,
  mobile_valid boolean not null default true,
  duplicate_mobile boolean not null default false,
  dob date,
  emergency_contact text,
  instagram_id text,
  heard_from text,
  position text,
  photo_url text,
  medical_notes text,
  participation_type text,
  campaign_status text not null default 'pending', -- pending / sent / replied
  response text, -- '1' interested, '2' needs info, '3' not interested
  reregistered boolean not null default false,
  source_submission_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.old_players_campaign enable row level security;

create policy "admin all old_players_campaign" on public.old_players_campaign
  for all to authenticated using (is_admin()) with check (is_admin());
