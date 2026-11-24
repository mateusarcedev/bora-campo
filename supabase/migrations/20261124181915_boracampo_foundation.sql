-- BoraCampo: foundation, deny by default.
create extension if not exists btree_gist with schema extensions;
set local search_path = public, extensions;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (length(trim(display_name)) between 1 and 120),
 created_at timestamptz not null default now()
);
create table public.arenas (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null,
 neighborhood text not null,
 city text not null default 'Manaus',
 description text not null default '',
 timezone text not null default 'America/Manaus',
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.courts (
 id uuid primary key default gen_random_uuid(),
 arena_id uuid not null references public.arenas(id),
 name text not null,
 sport text not null check (sport in ('society','volei','beach_tennis','futevolei','outro')),
 active boolean not null default true,
 unique (arena_id,id)
);
create table public.court_rates (
 id uuid primary key default gen_random_uuid(),
 court_id uuid not null references public.courts(id),
 weekday smallint not null check (weekday between 0 and 6),
 starts_at time not null,
 ends_at time not null,
 price_cents integer not null check (price_cents >= 0),
 check (starts_at < ends_at),
 exclude using gist (court_id with =, weekday with =, int4range(extract(epoch from starts_at)::int,extract(epoch from ends_at)::int,'[)') with &&)
);
create table public.calendar_entries (
 id uuid primary key default gen_random_uuid(),
 arena_id uuid not null,
 court_id uuid not null,
 customer_id uuid references auth.users(id) on delete set null,
 kind text not null check (kind in ('reservation','block')),
 status text not null default 'confirmed' check (status in ('pending','confirmed','cancelled')),
 payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded','not_applicable')),
 payment_method text check (payment_method in ('local','pix')),
 price_cents integer not null default 0 check (price_cents >= 0),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 created_at timestamptz not null default now(),
 foreign key (arena_id,court_id) references public.courts(arena_id,id),
 check (starts_at < ends_at),
 check ((kind='block' and payment_status='not_applicable' and payment_method is null and customer_id is null and price_cents=0) or (kind='reservation' and payment_status<>'not_applicable')),
 constraint calendar_no_overlap exclude using gist (court_id with =, tstzrange(starts_at,ends_at,'[)') with &&) where (status <> 'cancelled')
);
create index arenas_owner_idx on public.arenas(owner_id);
create index courts_arena_idx on public.courts(arena_id);
create index rates_court_idx on public.court_rates(court_id);
create index calendar_arena_idx on public.calendar_entries(arena_id,starts_at);
create index calendar_customer_idx on public.calendar_entries(customer_id);
alter table public.profiles enable row level security;
alter table public.arenas enable row level security;
alter table public.courts enable row level security;
alter table public.court_rates enable row level security;
alter table public.calendar_entries enable row level security;
revoke all on public.profiles,public.arenas,public.courts,public.court_rates,public.calendar_entries from anon,authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.arenas, public.courts, public.court_rates to anon, authenticated;
grant insert, update on public.arenas,public.courts,public.court_rates to authenticated;
grant delete on public.court_rates to authenticated;
grant select, insert, update on public.calendar_entries to authenticated;
create policy profile_self_read on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy profile_self_create on public.profiles for insert to authenticated with check (id=(select auth.uid()));
create policy profile_self_update on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy arena_public_read on public.arenas for select to anon,authenticated using (published);
create policy arena_owner_read on public.arenas for select to authenticated using (owner_id=(select auth.uid()));
create policy arena_owner_create on public.arenas for insert to authenticated with check (owner_id=(select auth.uid()));
create policy arena_owner_update on public.arenas for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
create policy court_public_read on public.courts for select to anon,authenticated using (active and exists (select 1 from public.arenas a where a.id=arena_id and a.published));
create policy court_owner_manage on public.courts for all to authenticated using (exists (select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check (exists (select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy rate_public_read on public.court_rates for select to anon,authenticated using (exists (select 1 from public.courts c join public.arenas a on a.id=c.arena_id where c.id=court_id and c.active and a.published));
create policy rate_owner_manage on public.court_rates for all to authenticated using (exists (select 1 from public.courts c join public.arenas a on a.id=c.arena_id where c.id=court_id and a.owner_id=(select auth.uid()))) with check (exists (select 1 from public.courts c join public.arenas a on a.id=c.arena_id where c.id=court_id and a.owner_id=(select auth.uid())));
create policy calendar_owner_read on public.calendar_entries for select to authenticated using (exists (select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy calendar_customer_read on public.calendar_entries for select to authenticated using (kind='reservation' and customer_id=(select auth.uid()));
create policy calendar_owner_create on public.calendar_entries for insert to authenticated with check (exists (select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy calendar_owner_update on public.calendar_entries for update to authenticated using (exists (select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check (exists (select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
