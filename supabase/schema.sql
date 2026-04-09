-- DriverConnect — run in Supabase SQL Editor
-- Enables Auth-linked profiles, jobs, applications, chat, notifications, and storage for CVs.

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (app users; id matches auth.users.id)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null check (role in ('driver', 'employer')),
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.driver_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  phone text,
  location_name text,
  lat double precision,
  lng double precision,
  experience_years int default 0,
  license_type text,
  availability boolean default true,
  cv_url text,
  profile_views int default 0,
  updated_at timestamptz default now()
);

create table if not exists public.employer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  company_name text not null,
  company_description text,
  updated_at timestamptz default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  location text not null,
  pay_rate text not null,
  shift text not null check (shift in ('day', 'night', 'flexible')),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create type application_status as enum ('pending', 'accepted', 'rejected');

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  driver_id uuid not null references public.profiles (id) on delete cascade,
  status application_status not null default 'pending',
  created_at timestamptz default now(),
  unique (job_id, driver_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean default false,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_jobs_employer on public.jobs (employer_id);
create index if not exists idx_applications_job on public.applications (job_id);
create index if not exists idx_applications_driver on public.applications (driver_id);
create index if not exists idx_messages_pair on public.messages (sender_id, receiver_id);
create index if not exists idx_notifications_user on public.notifications (user_id, read);

-- Profile view counter (callable by any signed-in user viewing a driver)
create or replace function public.increment_driver_profile_views(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.driver_profiles
  set profile_views = coalesce(profile_views, 0) + 1
  where user_id = target;
end;
$$;

grant execute on function public.increment_driver_profile_views(uuid) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "profiles_select_own_or_public_driver"
  on public.profiles for select
  using (
    id = auth.uid()
    or role = 'driver'
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- Driver profiles
create policy "driver_profiles_select"
  on public.driver_profiles for select
  using (true);

create policy "driver_profiles_upsert_own"
  on public.driver_profiles for insert
  with check (user_id = auth.uid());

create policy "driver_profiles_update_own"
  on public.driver_profiles for update
  using (user_id = auth.uid());

-- Employer profiles
create policy "employer_profiles_select"
  on public.employer_profiles for select
  using (true);

create policy "employer_profiles_upsert_own"
  on public.employer_profiles for insert
  with check (user_id = auth.uid());

create policy "employer_profiles_update_own"
  on public.employer_profiles for update
  using (user_id = auth.uid());

-- Jobs: public read, employer CRUD own
create policy "jobs_select_all"
  on public.jobs for select
  using (true);

create policy "jobs_insert_employer"
  on public.jobs for insert
  with check (
    employer_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer')
  );

create policy "jobs_update_own"
  on public.jobs for update
  using (employer_id = auth.uid());

create policy "jobs_delete_own"
  on public.jobs for delete
  using (employer_id = auth.uid());

-- Applications
create policy "applications_select_involved"
  on public.applications for select
  using (
    driver_id = auth.uid()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.employer_id = auth.uid()
    )
  );

create policy "applications_insert_driver"
  on public.applications for insert
  with check (
    driver_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'driver')
  );

create policy "applications_update_employer"
  on public.applications for update
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and j.employer_id = auth.uid()
    )
  );

-- Messages: participants only
create policy "messages_select_participant"
  on public.messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "messages_insert_participant"
  on public.messages for insert
  with check (sender_id = auth.uid());

-- Notifications: own only
create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  using (user_id = auth.uid());

-- Optional: allow system/triggers to insert notifications — use service role in Edge Function,
-- or grant insert to authenticated with check (user_id = auth.uid()) for self-created only.
-- For app-driven inserts (e.g. after apply), use a SECURITY DEFINER function:
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_meta jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nid uuid;
begin
  insert into public.notifications (user_id, type, title, body, meta)
  values (p_user_id, p_type, p_title, p_body, p_meta)
  returning id into nid;
  return nid;
end;
$$;

grant execute on function public.create_notification(uuid, text, text, text, jsonb) to authenticated;

-- Notify employer when a driver applies
create or replace function public.on_application_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  emp uuid;
  jtitle text;
begin
  select j.employer_id, j.title into emp, jtitle
  from public.jobs j where j.id = new.job_id;
  perform public.create_notification(
    emp,
    'new_application',
    'New applicant',
    'A driver applied to ' || coalesce(jtitle, 'your job'),
    jsonb_build_object('application_id', new.id, 'job_id', new.job_id)
  );
  return new;
end;
$$;

drop trigger if exists trg_application_notify on public.applications;
create trigger trg_application_notify
  after insert on public.applications
  for each row execute function public.on_application_created();

-- Notify driver when application status changes
create or replace function public.on_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jtitle text;
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    select title into jtitle from public.jobs where id = new.job_id;
    perform public.create_notification(
      new.driver_id,
      'application_update',
      case new.status
        when 'accepted' then 'Application accepted'
        when 'rejected' then 'Application update'
        else 'Application status changed'
      end,
      case new.status
        when 'accepted' then 'You were accepted for ' || coalesce(jtitle, 'a role')
        when 'rejected' then 'Your application for ' || coalesce(jtitle, 'a role') || ' was not selected'
        else 'Status: ' || new.status::text
      end,
      jsonb_build_object('application_id', new.id, 'job_id', new.job_id, 'status', new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_application_status on public.applications;
create trigger trg_application_status
  after update on public.applications
  for each row execute function public.on_application_status_change();

-- Realtime: replicate messages and notifications (Dashboard Supabase → Realtime → enable)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

-- Storage bucket for CVs (create bucket "cvs" as public=false in Dashboard, then:)
-- insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false);
-- Policies for storage.objects on bucket cvs:
-- allow authenticated upload to folder matching their user id
-- allow public read optional — prefer signed URLs for employers only in production
