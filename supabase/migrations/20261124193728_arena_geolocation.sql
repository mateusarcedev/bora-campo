alter table public.arenas add column latitude double precision check(latitude between -90 and 90), add column longitude double precision check(longitude between -180 and 180), add constraint arena_coordinate_pair check((latitude is null)=(longitude is null));
comment on column public.arenas.latitude is 'Optional public business location, never player location';
comment on column public.arenas.longitude is 'Optional public business location, never player location';
