-- ============================================================
-- GAME UP LEAGUE — Social Studio generation usage + cost caps
-- Run in Supabase SQL Editor after 001-007.
--
-- Enforces, server-side (so no one can bypass from the browser):
--   - max 10 generations per day (combined image+video)
--   - max ₹500 (50000 paise) total spend per calendar month
-- The Edge Function checks this table before calling Google's API,
-- and logs every successful generation's real cost after it runs.
-- ============================================================

create table if not exists generation_usage (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  cost_paise integer not null,
  created_at timestamptz not null default now()
);

alter table generation_usage enable row level security;

-- No anon/authenticated access at all - only the Edge Function (service role)
-- reads/writes this table. This is usage/cost tracking, not public data.
revoke all on generation_usage from anon, authenticated;

-- Public bucket: generated images/videos are meant to be downloaded and
-- posted to Instagram, so a direct public URL is fine (not private data).
insert into storage.buckets (id, name, public)
values ('generated-media', 'generated-media', true)
on conflict (id) do update set public = true;

drop policy if exists "generated_media_public_view" on storage.objects;
create policy "generated_media_public_view"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'generated-media');

-- Only the Edge Function (service role) ever writes to this bucket - no
-- insert/update/delete policy for anon/authenticated means they're blocked.
