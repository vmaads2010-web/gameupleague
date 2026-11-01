-- ============================================================
-- GAME UP LEAGUE — Expense paid-from source (GUL account vs personal)
-- Run in Supabase SQL Editor after 001-013.
--
-- Lets an expense record whether it was paid from the official GUL
-- account (draws down GUL's own funds - tracked toward the fund
-- balance) or paid personally by a leadership member out of pocket
-- (does not touch GUL's funds until reimbursed - tracked as a
-- pending reimbursement instead). Both still count as a real GUL
-- expense for profit/loss purposes; this field is about cash flow,
-- not about whether it "counts".
-- ============================================================

alter table expense_tracker
  add column if not exists paid_source text not null default 'gul_account'
    check (paid_source in ('gul_account','personal'));
