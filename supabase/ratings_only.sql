-- Run in Supabase SQL Editor if your project was created before mutual ratings.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS where needed.

create table if not exists public.driver_ratings_by_employers (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles (id) on delete cascade,
  employer_id uuid not null references public.profiles (id) on delete cascade,
  score int not null check (score >= 1 and score <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (driver_id, employer_id)
);

create table if not exists public.employer_ratings_by_drivers (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles (id) on delete cascade,
  driver_id uuid not null references public.profiles (id) on delete cascade,
  score int not null check (score >= 1 and score <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (employer_id, driver_id)
);

create index if not exists idx_d_rbe_driver on public.driver_ratings_by_employers (driver_id);
create index if not exists idx_d_rbe_employer on public.driver_ratings_by_employers (employer_id);
create index if not exists idx_e_rbd_employer on public.employer_ratings_by_drivers (employer_id);
create index if not exists idx_e_rbd_driver on public.employer_ratings_by_drivers (driver_id);

alter table public.driver_ratings_by_employers enable row level security;
alter table public.employer_ratings_by_drivers enable row level security;

drop policy if exists "driver_ratings_select_all" on public.driver_ratings_by_employers;
drop policy if exists "driver_ratings_insert_eligible" on public.driver_ratings_by_employers;
drop policy if exists "driver_ratings_update_own" on public.driver_ratings_by_employers;
drop policy if exists "employer_ratings_select_all" on public.employer_ratings_by_drivers;
drop policy if exists "employer_ratings_insert_eligible" on public.employer_ratings_by_drivers;
drop policy if exists "employer_ratings_update_own" on public.employer_ratings_by_drivers;

create policy "driver_ratings_select_all"
  on public.driver_ratings_by_employers for select using (true);

create policy "driver_ratings_insert_eligible"
  on public.driver_ratings_by_employers for insert
  with check (
    employer_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer')
    and exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.driver_id = driver_id
        and j.employer_id = auth.uid()
        and a.status = 'accepted'
    )
  );

create policy "driver_ratings_update_own"
  on public.driver_ratings_by_employers for update
  using (employer_id = auth.uid());

create policy "employer_ratings_select_all"
  on public.employer_ratings_by_drivers for select using (true);

create policy "employer_ratings_insert_eligible"
  on public.employer_ratings_by_drivers for insert
  with check (
    driver_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'driver')
    and exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      where j.employer_id = employer_id
        and a.driver_id = auth.uid()
        and a.status = 'accepted'
    )
  );

create policy "employer_ratings_update_own"
  on public.employer_ratings_by_drivers for update
  using (driver_id = auth.uid());
