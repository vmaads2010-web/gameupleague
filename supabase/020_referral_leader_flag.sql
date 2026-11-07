-- ============================================================
-- GAME UP LEAGUE — Referral group registration
-- Marks whether a player_registrations row is the "lead" of a
-- referral group of 3 (paid the combined Rs 4,800 and uploaded the
-- screenshot) or a "member" (registering under the same referral_code,
-- no separate payment screenshot required).
-- Already applied directly to the live project; kept here so the
-- repo's migration history matches.
-- ============================================================

alter table player_registrations add column if not exists is_referral_leader boolean;
