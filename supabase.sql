-- Enable required extension
create extension if not exists pgcrypto;

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null
);

-- Memories
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  date date not null,
  owner text not null,
  created_at timestamptz not null default now()
);

-- Gratitude Logs
create table if not exists gratitude_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  "from" text not null,
  "to" text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Journal Entries
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  owner text not null,
  content text not null,
  images text[] not null default '{}',
  stickers text not null default '[]',
  created_at timestamptz not null default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner text not null,
  completed boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

-- Habits
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner text not null,
  color text not null,
  created_at timestamptz not null default now()
);

-- Habit Checkins
create table if not exists habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

-- Enable RLS
alter table users enable row level security;
alter table memories enable row level security;
alter table gratitude_logs enable row level security;
alter table journal_entries enable row level security;
alter table tasks enable row level security;
alter table habits enable row level security;
alter table habit_checkins enable row level security;

-- Permissive policies for 'anon' role (adjust for production)
create policy "anon_select_users" on users for select using (true);
create policy "anon_insert_users" on users for insert with check (true);
create policy "anon_update_users" on users for update using (true) with check (true);
create policy "anon_delete_users" on users for delete using (true);

create policy "anon_select_memories" on memories for select using (true);
create policy "anon_insert_memories" on memories for insert with check (true);
create policy "anon_update_memories" on memories for update using (true) with check (true);
create policy "anon_delete_memories" on memories for delete using (true);

create policy "anon_select_gratitude_logs" on gratitude_logs for select using (true);
create policy "anon_insert_gratitude_logs" on gratitude_logs for insert with check (true);
create policy "anon_update_gratitude_logs" on gratitude_logs for update using (true) with check (true);
create policy "anon_delete_gratitude_logs" on gratitude_logs for delete using (true);

create policy "anon_select_journal_entries" on journal_entries for select using (true);
create policy "anon_insert_journal_entries" on journal_entries for insert with check (true);
create policy "anon_update_journal_entries" on journal_entries for update using (true) with check (true);
create policy "anon_delete_journal_entries" on journal_entries for delete using (true);

create policy "anon_select_tasks" on tasks for select using (true);
create policy "anon_insert_tasks" on tasks for insert with check (true);
create policy "anon_update_tasks" on tasks for update using (true) with check (true);
create policy "anon_delete_tasks" on tasks for delete using (true);

create policy "anon_select_habits" on habits for select using (true);
create policy "anon_insert_habits" on habits for insert with check (true);
create policy "anon_update_habits" on habits for update using (true) with check (true);
create policy "anon_delete_habits" on habits for delete using (true);

create policy "anon_select_habit_checkins" on habit_checkins for select using (true);
create policy "anon_insert_habit_checkins" on habit_checkins for insert with check (true);
create policy "anon_update_habit_checkins" on habit_checkins for update using (true) with check (true);
create policy "anon_delete_habit_checkins" on habit_checkins for delete using (true);

