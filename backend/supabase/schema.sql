-- =========================================================
-- CloudType: schema lengkap (jalankan di Supabase SQL Editor)
-- Aman dijalankan ulang. Setelah ini jalankan seed_challenges.sql
-- =========================================================

-- ---------- 1. profiles ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'player'
               check (char_length(display_name) between 1 and 30),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'player'
    ), 30),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name)
select u.id, left(coalesce(nullif(split_part(u.email, '@', 1), ''), 'player'), 30)
from auth.users u
on conflict (id) do nothing;

-- ---------- 2. challenges + challenge_steps (kadai) ----------
create table if not exists public.challenges (
  id           bigint generated always as identity primary key,
  difficulty   text not null
               check (difficulty in ('beginner', 'intermediate', 'advanced')),
  title        text not null,
  description  text not null default '',
  icon         text not null default '📝',
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists challenges_diff_order_idx
  on public.challenges (difficulty, sort_order);

create table if not exists public.challenge_steps (
  id           bigint generated always as identity primary key,
  challenge_id bigint not null references public.challenges(id) on delete cascade,
  sort_order   int  not null default 0,
  command      text not null check (char_length(command) > 0),
  explanation  text not null default ''
);
create index if not exists challenge_steps_idx
  on public.challenge_steps (challenge_id, sort_order);

-- ---------- 3. results (riwayat) ----------
create table if not exists public.results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid()
                  references public.profiles(id) on delete cascade,
  challenge_id    bigint references public.challenges(id) on delete set null,
  challenge_title text not null,
  difficulty      text not null
                  check (difficulty in ('beginner', 'intermediate', 'advanced')),
  wpm             numeric not null check (wpm >= 0),
  accuracy        numeric not null check (accuracy between 0 and 100),
  mistakes        int     not null check (mistakes >= 0),
  time_seconds    numeric not null check (time_seconds >= 0),
  created_at      timestamptz not null default now()
);
create index if not exists results_user_created_idx
  on public.results (user_id, created_at desc);

-- ---------- 4. RLS ----------
alter table public.profiles        enable row level security;
alter table public.results         enable row level security;
alter table public.challenges      enable row level security;
alter table public.challenge_steps enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "results_select_own" on public.results;
drop policy if exists "results_insert_own" on public.results;
drop policy if exists "results_delete_own" on public.results;
create policy "results_select_own" on public.results
  for select to authenticated using (user_id = (select auth.uid()));
create policy "results_insert_own" on public.results
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "results_delete_own" on public.results
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "challenges_read" on public.challenges;
create policy "challenges_read" on public.challenges
  for select to anon, authenticated using (is_published);

drop policy if exists "challenge_steps_read" on public.challenge_steps;
create policy "challenge_steps_read" on public.challenge_steps
  for select to anon, authenticated
  using (exists (
    select 1 from public.challenges c
    where c.id = challenge_id and c.is_published
  ));

-- ---------- 5. Leaderboard (opsional) ----------
create or replace function public.get_leaderboard(p_limit int default 10)
returns table (display_name text, best_wpm numeric, plays bigint)
language sql stable security definer set search_path = '' as $$
  select p.display_name, max(r.wpm) as best_wpm, count(*) as plays
  from public.results r
  join public.profiles p on p.id = r.user_id
  group by p.id, p.display_name
  order by best_wpm desc
  limit least(greatest(p_limit, 1), 100);
$$;
revoke all on function public.get_leaderboard(int) from public, anon;
grant execute on function public.get_leaderboard(int) to authenticated;
