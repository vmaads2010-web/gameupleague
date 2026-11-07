-- ============================================================
-- GAME UP LEAGUE — Reusable WhatsApp message templates for the
-- admin's WhatsApp Campaign tool (old-player re-engagement, new
-- player welcome, and any future custom campaign). Already applied
-- directly to the live project; kept here so the repo's migration
-- history matches.
-- ============================================================

create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience text not null default 'old_players', -- 'old_players' / 'new_players' / 'custom'
  body text not null, -- supports {{first_name}}
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_templates enable row level security;

create policy "admin all whatsapp_templates" on public.whatsapp_templates
  for all to authenticated using (is_admin()) with check (is_admin());

-- Forgetting this grant (in addition to the RLS policy) caused the exact
-- same "permission denied" bug old_players_campaign had - Postgres checks
-- both, not just the policy.
grant select, insert, update, delete on public.whatsapp_templates to authenticated;
