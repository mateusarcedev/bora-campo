create table public.external_arenas (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 2 and 160),
 neighborhood text,
 address text,
 city text not null default 'Manaus' check(city='Manaus'),
 sports text[] not null default '{}' check(sports <@ array['society','volei','beach_tennis','futevolei','outro']::text[]),
 phone text check(phone ~ '^[0-9]{10,13}$'),
 whatsapp text check(whatsapp ~ '^55[0-9]{10,11}$'),
 instagram text check(instagram ~ '^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$'),
 website text check(website ~ '^https://'),
 latitude double precision check(latitude between -90 and 90),
 longitude double precision check(longitude between -180 and 180),
 google_place_id text,
 source_urls text[] not null default '{}',
 collected_at date not null,
 verified_at date,
 status text not null default 'pending_review' check(status in ('pending_review','approved','rejected','closed')),
 linked_arena_id uuid references public.arenas(id),
 created_at timestamptz not null default now(),
 check((latitude is null)=(longitude is null)),
 check(status<>'approved' or (verified_at is not null and cardinality(source_urls)>0 and (address is not null or google_place_id is not null)))
);
create index external_arenas_status_idx on public.external_arenas(status);
create index external_arenas_link_idx on public.external_arenas(linked_arena_id);
create unique index external_arenas_place_unique on public.external_arenas(google_place_id) where google_place_id is not null;
alter table public.external_arenas enable row level security;
revoke all on public.external_arenas from anon,authenticated;
grant select(id,name,neighborhood,address,city,sports,phone,whatsapp,instagram,website,latitude,longitude,google_place_id,verified_at,status,linked_arena_id) on public.external_arenas to anon,authenticated;
create policy external_directory_approved_read on public.external_arenas for select to anon,authenticated using(status='approved' and linked_arena_id is null);
comment on table public.external_arenas is 'Public business directory, distinct from registered owners. No booking or availability. Candidates must be reviewed before publication; no client writes.';
