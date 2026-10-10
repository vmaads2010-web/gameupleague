-- ============================================================
-- GAME UP LEAGUE — Team logos storage + payment screenshot uploads
-- Run in Supabase SQL Editor after 001-005.
-- ============================================================

-- team_registrations was missing a column to store the uploaded logo's path
-- (found via live testing before this ever reached a real user).
alter table team_registrations
  add column if not exists team_logo_url text;

-- ---------- TEAM LOGOS (private bucket, same pattern as player-photos) ----------
insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', false)
on conflict (id) do nothing;

drop policy if exists "team_logos_public_upload" on storage.objects;
create policy "team_logos_public_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'team-logos');

drop policy if exists "team_logos_admin_read" on storage.objects;
create policy "team_logos_admin_read"
on storage.objects for select
to authenticated
using (bucket_id = 'team-logos' and is_admin());

-- ---------- PAYMENT SCREENSHOTS ----------
-- Separate table (not a column on player_registrations/team_registrations) because
-- the public can only INSERT their own registration, never UPDATE it afterward -
-- that's deliberate, so a stranger can never edit someone else's registration data.
-- A screenshot upload is matched to a registration by its registration_code instead,
-- and admin reviews/matches them manually in the dashboard.
create table if not exists payment_screenshots (
  id uuid primary key default gen_random_uuid(),
  registration_code text not null,
  image_path text not null,
  notes text,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table payment_screenshots enable row level security;

drop policy if exists "payment_screenshots_public_insert" on payment_screenshots;
create policy "payment_screenshots_public_insert"
on payment_screenshots for insert
to anon, authenticated
with check (true);

drop policy if exists "payment_screenshots_admin_select" on payment_screenshots;
create policy "payment_screenshots_admin_select"
on payment_screenshots for select
to authenticated
using (is_admin());

drop policy if exists "payment_screenshots_admin_update" on payment_screenshots;
create policy "payment_screenshots_admin_update"
on payment_screenshots for update
to authenticated
using (is_admin()) with check (is_admin());

grant select, insert, update on payment_screenshots to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

drop policy if exists "payment_screenshots_upload" on storage.objects;
create policy "payment_screenshots_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'payment-screenshots');

drop policy if exists "payment_screenshots_admin_read" on storage.objects;
create policy "payment_screenshots_admin_read"
on storage.objects for select
to authenticated
using (bucket_id = 'payment-screenshots' and is_admin());
