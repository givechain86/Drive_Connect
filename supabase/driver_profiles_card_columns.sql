-- Run once on existing DBs that already have driver_profiles (adds card / directory fields).

alter table public.driver_profiles
  add column if not exists cdl_class text;

alter table public.driver_profiles
  add column if not exists endorsements text[] not null default '{}';

alter table public.driver_profiles
  add column if not exists miles_driven bigint;

alter table public.driver_profiles
  add column if not exists background_check_verified boolean not null default false;

alter table public.driver_profiles
  add column if not exists willing_to_relocate boolean not null default false;

alter table public.driver_profiles
  add column if not exists availability_starts_at date;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'driver_profiles_cdl_class_check'
  ) then
    alter table public.driver_profiles
      add constraint driver_profiles_cdl_class_check
      check (cdl_class is null or cdl_class in ('A', 'B', 'C'));
  end if;
end $$;
