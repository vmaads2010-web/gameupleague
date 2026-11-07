-- ============================================================
-- GAME UP LEAGUE — Team Owner Registration form overhaul: owner
-- photo, Instagram IDs, jersey size, manager details, and explicit
-- consent fields. Already applied directly to the live project; kept
-- here so the repo's migration history matches.
-- ============================================================

insert into storage.buckets (id, name, public) values ('owner-photos','owner-photos', false)
on conflict (id) do nothing;

create policy "owner_photos_public_upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'owner-photos');
create policy "owner_photos_admin_read" on storage.objects for select to authenticated
  using (bucket_id = 'owner-photos' and is_admin());

alter table public.team_registrations
  add column if not exists owner_photo_url text,
  add column if not exists owner_instagram_id text,
  add column if not exists team_instagram_id text,
  add column if not exists jersey_size text,
  add column if not exists manager_name text,
  add column if not exists manager_contact text,
  add column if not exists terms_accepted boolean not null default false,
  add column if not exists name_logo_lock_ack boolean not null default false;
