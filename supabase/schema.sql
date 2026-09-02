-- NMRH Room Cleanliness Ledger — database schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Access model:
--   - Anyone with the link can VIEW all rooms, scores, cycle averages and
--     monthly points. No login needed for that.
--   - Only Admin accounts can log in, and only Admins can add grading
--     rounds. There is no public sign-up — admin accounts are created
--     directly in Supabase (see the bottom of this file).

-- ---------------------------------------------------------------------
-- 1. Rooms
-- ---------------------------------------------------------------------
create table if not exists rooms (
  id serial primary key,
  room_number text unique not null,
  created_at timestamptz not null default now()
);

-- Seed the rooms shown in your original sheet. Edit / add more as needed.
insert into rooms (room_number) values
  ('1'), ('2'), ('3'), ('4A'), ('4B'), ('5'), ('6'), ('8')
on conflict (room_number) do nothing;

-- ---------------------------------------------------------------------
-- 2. Admin profiles (one row per admin login)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Grading sessions (one per date + checker) and entries (one per room)
-- ---------------------------------------------------------------------
create table if not exists grading_sessions (
  id serial primary key,
  session_date date not null,
  checker_name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists grading_entries (
  id serial primary key,
  session_id integer not null references grading_sessions(id) on delete cascade,
  room_id integer not null references rooms(id) on delete cascade,
  cleanliness integer not null default 0 check (cleanliness between 0 and 40),
  orderliness integer not null default 0 check (orderliness between 0 and 30),
  conduciveness integer not null default 0 check (conduciveness between 0 and 20),
  overall_appearance integer not null default 0 check (overall_appearance between 0 and 10),
  created_at timestamptz not null default now(),
  unique (session_id, room_id)
);

-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------
alter table rooms enable row level security;
alter table profiles enable row level security;
alter table grading_sessions enable row level security;
alter table grading_entries enable row level security;

-- Helper: is the current user a logged-in admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid()
  );
$$ language sql security definer stable;

-- Rooms, sessions and entries: anyone (including visitors with no
-- account) can read. Only admins can insert/update/delete.
create policy "rooms_public_read" on rooms
  for select using (true);
create policy "rooms_admin_write" on rooms
  for insert with check (public.is_admin());
create policy "rooms_admin_update" on rooms
  for update using (public.is_admin());
create policy "rooms_admin_delete" on rooms
  for delete using (public.is_admin());

create policy "sessions_public_read" on grading_sessions
  for select using (true);
create policy "sessions_admin_write" on grading_sessions
  for insert with check (public.is_admin());
create policy "sessions_admin_update" on grading_sessions
  for update using (public.is_admin());
create policy "sessions_admin_delete" on grading_sessions
  for delete using (public.is_admin());

create policy "entries_public_read" on grading_entries
  for select using (true);
create policy "entries_admin_write" on grading_entries
  for insert with check (public.is_admin());
create policy "entries_admin_update" on grading_entries
  for update using (public.is_admin());
create policy "entries_admin_delete" on grading_entries
  for delete using (public.is_admin());

-- Profiles: an admin can read their own row (to load their name after
-- login). Only admins can see the list of other admins.
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Create your admin account
-- ---------------------------------------------------------------------
-- There is no public sign-up form. Create the login directly:
-- 1. In the Supabase dashboard: Authentication -> Users -> Add user.
--    Set an email and password, and toggle "Auto Confirm User" on.
-- 2. Copy the new user's ID (shown in the Users list), then run:
--
--    insert into profiles (id, full_name)
--    values ('paste-the-user-id-here', 'Your Name');
--
--    (You can also look the id up by email:
--     insert into profiles (id, full_name)
--     select id, 'Your Name' from auth.users where email = 'you@example.com';)
