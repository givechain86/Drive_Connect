-- Run once in Supabase → SQL Editor if you already applied schema.sql without this block.
-- Fixes: "new row violates row-level security policy for table profiles" on sign-up
-- when email confirmation is enabled (no session / no auth.uid() on first insert).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
  fn text;
  co text;
begin
  r := coalesce(new.raw_user_meta_data->>'role', 'driver');
  if r not in ('driver', 'employer') then
    r := 'driver';
  end if;
  fn := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  co := nullif(trim(new.raw_user_meta_data->>'company_name'), '');

  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    r,
    fn
  );

  if r = 'driver' then
    insert into public.driver_profiles (user_id) values (new.id);
  else
    insert into public.employer_profiles (user_id, company_name)
    values (new.id, coalesce(co, fn, 'My company'));
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
