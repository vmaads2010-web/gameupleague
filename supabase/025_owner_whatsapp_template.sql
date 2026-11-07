-- ============================================================
-- GAME UP LEAGUE — Seeds a default WhatsApp template for the
-- "Team Owners" audience in the WhatsApp Campaign dashboard tool.
-- Already applied directly to the live project; kept here so the
-- repo's migration history matches.
-- ============================================================

insert into public.whatsapp_templates (name, audience, body, is_default) values
('Owner Welcome / Confirmation', 'owners', 'Hey {{first_name}}! 👋🏆

Thank you for registering your team for *THE GAME UP LEAGUE: RELOADED*! 🔥⚽ We''re excited to have you on board as a team owner this season.

Your team entry is confirmed — we''ll be in touch soon with the player trials, auction date, and everything else you need to know as an owner.

Meanwhile, follow us on Instagram @thegameupleague for all the latest updates.

See you pitch-side! ⚽🐺
*THE GAME UP LEAGUE: RELOADED*', true);
