-- ============================================================
-- GAME UP LEAGUE — fix: generation_usage needs an explicit GRANT
-- for service_role too (the Edge Function uses the service role
-- key, which still needs a base GRANT just like anon/authenticated
-- did back in 002_grants.sql - RLS alone isn't enough).
-- Run in Supabase SQL Editor after 008.
-- ============================================================

grant select, insert on generation_usage to service_role;
