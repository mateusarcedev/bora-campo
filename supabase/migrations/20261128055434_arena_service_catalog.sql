-- M01.1: private service catalog, arena-scoped. Public publication is a later slice.
create table public.arena_services (
 id uuid primary key default gen_random_uuid(),
 arena_id uuid not null references public.arenas(id) on delete cascade,
 name text not null check (char_length(trim(name)) between 2 and 100),
 sport text not null check (sport in ('society','volei','beach_tennis','futevolei','outro')),
 service_type text not null check (service_type in ('group','individual','drop_in','trial')),
 billing_type text not null check (billing_type in ('monthly','per_session','package','free')),
 price_cents integer not null default 0 check (price_cents between 0 and 99999999),
 description text not null default '' check (char_length(description)<=1000),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(arena_id,id),
 check (billing_type <> 'free' or price_cents=0)
);
create index arena_services_arena_idx on public.arena_services(arena_id);
alter table public.arena_services enable row level security;
revoke all on public.arena_services from public,anon,authenticated;
grant select,insert,update on public.arena_services to authenticated;
create policy service_owner_read on public.arena_services for select to authenticated using (exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy service_owner_insert on public.arena_services for insert to authenticated with check (exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy service_owner_update on public.arena_services for update to authenticated using (exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check (exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
