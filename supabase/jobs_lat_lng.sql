-- Optional: map pins for jobs (run on existing DBs)
alter table public.jobs add column if not exists lat double precision;
alter table public.jobs add column if not exists lng double precision;
