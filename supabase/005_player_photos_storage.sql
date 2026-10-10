-- ============================================================
-- GAME UP LEAGUE — Player photo storage bucket + security
-- Run in Supabase SQL Editor after 001-004.
--
-- Creates a PRIVATE storage bucket for player registration photos.
-- Private means: nobody can view a photo just by guessing/knowing its
-- URL. The public can only upload (so the registration form works);
-- only a logged-in admin can view photos, once the admin dashboard is
-- built. This matches the rule that player photos/profiles are only
-- shown publicly after GUL approves them - raw uploads stay private
-- until then.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', false)
on conflict (id) do nothing;

drop policy if exists "player_photos_public_upload" on storage.objects;
create policy "player_photos_public_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'player-photos');

drop policy if exists "player_photos_admin_read" on storage.objects;
create policy "player_photos_admin_read"
on storage.objects for select
to authenticated
using (bucket_id = 'player-photos' and is_admin());
