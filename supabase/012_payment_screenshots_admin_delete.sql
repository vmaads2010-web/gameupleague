-- payment_screenshots had select/insert/update policies and grants, but no
-- delete — admin had no way to clean up test/duplicate screenshot rows from
-- the dashboard. Add the missing admin-only delete policy + grant, matching
-- the pattern already used for player_registrations/payments.

drop policy if exists "payment_screenshots_admin_delete" on payment_screenshots;
create policy "payment_screenshots_admin_delete"
on payment_screenshots for delete
to authenticated
using (is_admin());

grant delete on payment_screenshots to authenticated;
