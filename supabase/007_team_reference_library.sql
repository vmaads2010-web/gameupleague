-- ============================================================
-- GAME UP LEAGUE — Team Reference Library (for Social Studio)
-- Run in Supabase SQL Editor after 001-006.
--
-- Stores team logos/jerseys that anyone (team managers, Vishal, etc.)
-- can view/download - these are branding assets, not private data, so
-- reading is public. Only an admin can upload/change them, to keep
-- quality controlled.
-- ============================================================

create table if not exists team_references (
  id uuid primary key default gen_random_uuid(),
  team_name text not null unique,
  logo_path text,
  jersey_path text,
  notes text,
  created_at timestamptz not null default now()
);

alter table team_references enable row level security;

drop policy if exists "team_references_public_read" on team_references;
create policy "team_references_public_read"
on team_references for select
to anon, authenticated
using (true);

drop policy if exists "team_references_admin_write" on team_references;
create policy "team_references_admin_write"
on team_references for all
to authenticated
using (is_admin()) with check (is_admin());

grant select on team_references to anon, authenticated;
grant insert, update, delete on team_references to authenticated;

-- Public bucket: logos/jerseys are viewable by direct URL (no login needed),
-- matching how team managers will use this tool without accounts.
insert into storage.buckets (id, name, public)
values ('team-references', 'team-references', true)
on conflict (id) do update set public = true;

drop policy if exists "team_references_public_view" on storage.objects;
create policy "team_references_public_view"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'team-references');

drop policy if exists "team_references_admin_upload" on storage.objects;
create policy "team_references_admin_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'team-references' and is_admin());

drop policy if exists "team_references_admin_update" on storage.objects;
create policy "team_references_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'team-references' and is_admin());

drop policy if exists "team_references_admin_delete" on storage.objects;
create policy "team_references_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'team-references' and is_admin());
