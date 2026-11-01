-- ============================================================
-- GAME UP LEAGUE — Sponsorship Tracker + Expense Tracker
-- Run in Supabase SQL Editor after 001-012.
--
-- Anyone on the GUL leadership team can submit a new entry from a
-- plain link (no login needed - log-sponsor.html / log-expense.html),
-- same pattern as player_registrations/payment_screenshots: public
-- INSERT, admin-only SELECT/UPDATE/DELETE from the dashboard.
-- No cost beyond existing free-tier Supabase usage: two plain tables
-- plus two small private storage buckets for optional receipt/
-- agreement photos.
-- ============================================================

-- ---------- SPONSORSHIP TRACKER ----------
-- Tracks every sponsor conversation end to end: who they are, what
-- they're giving (cash, goods or services), who at GUL brought them
-- in, and where things stand right now.
create table if not exists sponsorship_tracker (
  id uuid primary key default gen_random_uuid(),

  sponsor_name text not null,
  contact_person text,
  contact_number text,
  contact_email text,

  -- What kind of sponsor this is, for the website's sponsor-tier display
  -- later (Title Sponsor, Kit Partner, etc.) - free text so new tiers
  -- don't need a schema change.
  category text,

  -- Cash vs goods vs a free service vs a discount - changes how
  -- "value" should be read.
  sponsorship_kind text not null default 'cash'
    check (sponsorship_kind in ('cash','in_kind','service','discount')),

  -- Free-text description of exactly what's being given, e.g.
  -- "20 jerseys" or "free turf hours for trials weekend" - kept
  -- separate from the estimated rupee value below.
  value_description text,
  estimated_value_paise bigint,

  -- Which season/event this sponsorship is for.
  purpose text,

  -- Who at GUL brought this sponsor in - free text name (e.g. a
  -- Gold Squad / leadership member), not a foreign key, since not
  -- every person who brings in a sponsor is in the leadership table.
  brought_by text,

  status text not null default 'lead'
    check (status in ('lead','in_talks','confirmed','received','fell_through')),

  agreement_date date,

  payment_status text not null default 'not_applicable'
    check (payment_status in ('not_applicable','pending','partial','received')),
  payment_received_date date,

  -- Optional scanned agreement / payment proof, uploaded from the
  -- dashboard. Private bucket - sponsor paperwork is not public.
  document_path text,

  -- Who on the GUL team actually logged this entry.
  logged_by text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sponsorship_tracker enable row level security;

-- Anyone with the link (leadership, no login) can log a new sponsor.
drop policy if exists "sponsorship_tracker_public_insert" on sponsorship_tracker;
create policy "sponsorship_tracker_public_insert"
on sponsorship_tracker for insert
to anon, authenticated
with check (true);

drop policy if exists "sponsorship_tracker_admin_select" on sponsorship_tracker;
create policy "sponsorship_tracker_admin_select"
on sponsorship_tracker for select
to authenticated
using (is_admin());

drop policy if exists "sponsorship_tracker_admin_update" on sponsorship_tracker;
create policy "sponsorship_tracker_admin_update"
on sponsorship_tracker for update
to authenticated
using (is_admin()) with check (is_admin());

drop policy if exists "sponsorship_tracker_admin_delete" on sponsorship_tracker;
create policy "sponsorship_tracker_admin_delete"
on sponsorship_tracker for delete
to authenticated
using (is_admin());

grant insert on sponsorship_tracker to anon, authenticated;
grant select, update, delete on sponsorship_tracker to authenticated;

insert into storage.buckets (id, name, public)
values ('sponsorship-documents', 'sponsorship-documents', false)
on conflict (id) do nothing;

drop policy if exists "sponsorship_documents_public_upload" on storage.objects;
create policy "sponsorship_documents_public_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'sponsorship-documents');

drop policy if exists "sponsorship_documents_admin_manage" on storage.objects;
create policy "sponsorship_documents_admin_manage"
on storage.objects for all
to authenticated
using (bucket_id = 'sponsorship-documents' and is_admin())
with check (bucket_id = 'sponsorship-documents' and is_admin());

-- ---------- EXPENSE TRACKER ----------
-- Tracks every GUL expense end to end: who filled it in, what it was
-- for, why, who was actually paid, who paid them, and whether it's
-- been reimbursed/approved.
create table if not exists expense_tracker (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  -- Free text so new expense categories don't need a schema change;
  -- the dashboard form offers a standard dropdown list plus "Other".
  category text,

  amount_paise bigint not null,

  paid_to text,   -- vendor / person who received the money
  paid_by text,   -- GUL team member who actually paid it

  payment_method text not null default 'cash'
    check (payment_method in ('cash','upi','bank_transfer','card','other')),

  expense_date date not null default current_date,

  -- Why this expense was needed - which match day / event / season.
  purpose text,

  -- Who on the GUL team logged this entry into the tracker (can
  -- differ from paid_by - e.g. someone else enters it later).
  filled_by text,

  -- Optional receipt/bill photo, uploaded from the dashboard.
  receipt_path text,

  status text not null default 'paid'
    check (status in ('paid','pending','reimbursement_needed')),
  approved_by text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table expense_tracker enable row level security;

-- Anyone with the link (leadership, no login) can log a new expense.
drop policy if exists "expense_tracker_public_insert" on expense_tracker;
create policy "expense_tracker_public_insert"
on expense_tracker for insert
to anon, authenticated
with check (true);

drop policy if exists "expense_tracker_admin_select" on expense_tracker;
create policy "expense_tracker_admin_select"
on expense_tracker for select
to authenticated
using (is_admin());

drop policy if exists "expense_tracker_admin_update" on expense_tracker;
create policy "expense_tracker_admin_update"
on expense_tracker for update
to authenticated
using (is_admin()) with check (is_admin());

drop policy if exists "expense_tracker_admin_delete" on expense_tracker;
create policy "expense_tracker_admin_delete"
on expense_tracker for delete
to authenticated
using (is_admin());

grant insert on expense_tracker to anon, authenticated;
grant select, update, delete on expense_tracker to authenticated;

insert into storage.buckets (id, name, public)
values ('expense-receipts', 'expense-receipts', false)
on conflict (id) do nothing;

drop policy if exists "expense_receipts_public_upload" on storage.objects;
create policy "expense_receipts_public_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'expense-receipts');

drop policy if exists "expense_receipts_admin_manage" on storage.objects;
create policy "expense_receipts_admin_manage"
on storage.objects for all
to authenticated
using (bucket_id = 'expense-receipts' and is_admin())
with check (bucket_id = 'expense-receipts' and is_admin());
