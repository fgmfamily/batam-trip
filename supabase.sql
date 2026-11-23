-- Batam Family Trip: database setup. Paste ALL of this into Supabase > SQL Editor > Run.
-- Safe to run twice.

create extension if not exists pgcrypto with schema extensions;

-- 1. Tables
create table if not exists public.site_docs (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.plans      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.orders     (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.admin_secret (id int primary key default 1 check (id = 1), hash text not null);

-- 2. Row Level Security (the lock on every table)
alter table public.site_docs enable row level security;
alter table public.plans enable row level security;
alter table public.orders enable row level security;
alter table public.admin_secret enable row level security;   -- no policy = nobody can read it directly

drop policy if exists site_read on public.site_docs;
create policy site_read on public.site_docs for select to authenticated using (true);

drop policy if exists plans_read on public.plans;
create policy plans_read on public.plans for select to authenticated using (true);
drop policy if exists plans_ins on public.plans;
create policy plans_ins on public.plans for insert to authenticated with check (id = auth.uid()::text and pg_column_size(data) < 60000);
drop policy if exists plans_upd on public.plans;
create policy plans_upd on public.plans for update to authenticated using (id = auth.uid()::text) with check (id = auth.uid()::text and pg_column_size(data) < 60000);

drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select to authenticated using (true);
drop policy if exists orders_ins on public.orders;
create policy orders_ins on public.orders for insert to authenticated with check (id = auth.uid()::text and pg_column_size(data) < 60000);
drop policy if exists orders_upd on public.orders;
create policy orders_upd on public.orders for update to authenticated using (id = auth.uid()::text) with check (id = auth.uid()::text and pg_column_size(data) < 60000);

-- 3. Organiser-only actions (checked against the secret passcode)
create or replace function public.admin_check(pass text) returns boolean
language sql security definer set search_path = public, extensions as
$$ select exists (select 1 from admin_secret where hash = crypt(pass, hash)) $$;

create or replace function public.admin_set_doc(pass text, doc_id text, doc jsonb) returns void
language plpgsql security definer set search_path = public, extensions as
$$ begin
  if not admin_check(pass) then raise exception 'Wrong passcode'; end if;
  if pg_column_size(doc) > 1500000 then raise exception 'Too big'; end if;
  insert into site_docs(id, data, updated_at) values (doc_id, doc, now())
  on conflict (id) do update set data = excluded.data, updated_at = now();
end $$;

create or replace function public.admin_delete_doc(pass text, doc_id text) returns void
language plpgsql security definer set search_path = public, extensions as
$$ begin
  if not admin_check(pass) then raise exception 'Wrong passcode'; end if;
  delete from site_docs where id = doc_id;
end $$;

revoke all on function public.admin_check(text), public.admin_set_doc(text,text,jsonb), public.admin_delete_doc(text,text) from public, anon;
grant execute on function public.admin_check(text), public.admin_set_doc(text,text,jsonb), public.admin_delete_doc(text,text) to authenticated;

-- 4. Set your organiser passcode: change CHANGE-ME-PASSCODE below to your own, then run.
insert into public.admin_secret(id, hash) values (1, extensions.crypt('CHANGE-ME-PASSCODE', extensions.gen_salt('bf')))
on conflict (id) do update set hash = excluded.hash;
