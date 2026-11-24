alter table public.arenas add column address text not null default '' check (length(address)<=300), add column contact_phone text not null default '' check (contact_phone='' or contact_phone ~ '^[0-9]{10,13}$');
create table public.arena_photos (
 id uuid primary key default gen_random_uuid(),
 arena_id uuid not null references public.arenas(id) on delete cascade,
 path text not null unique,
 created_at timestamptz not null default now(),
 check (path ~ ('^'||arena_id::text||'/[0-9a-f-]{36}\.(jpg|png|webp)$'))
);
create index arena_photos_arena_idx on public.arena_photos(arena_id);
alter table public.arena_photos enable row level security;
revoke all on public.arena_photos from anon,authenticated;
grant select on public.arena_photos to anon,authenticated;
grant insert,delete on public.arena_photos to authenticated;
create policy photo_catalog on public.arena_photos for select to anon,authenticated using (exists(select 1 from public.arenas a where a.id=arena_id and a.published));
create policy photo_owner on public.arena_photos for all to authenticated using (exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check (exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('arena-photos','arena-photos',false,2097152,array['image/jpeg','image/png','image/webp']);
create policy arena_photo_upload on storage.objects for insert to authenticated with check (bucket_id='arena-photos' and exists(select 1 from public.arenas a where a.id::text=(storage.foldername(name))[1] and a.owner_id=(select auth.uid())) and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$');
create policy arena_photo_owner_read on storage.objects for select to authenticated using (bucket_id='arena-photos' and exists(select 1 from public.arenas a where a.id::text=(storage.foldername(name))[1] and a.owner_id=(select auth.uid())));
create policy arena_photo_public_read on storage.objects for select to anon,authenticated using (bucket_id='arena-photos' and exists(select 1 from public.arena_photos p join public.arenas a on a.id=p.arena_id where p.path=storage.objects.name and a.published));
create policy arena_photo_owner_delete on storage.objects for delete to authenticated using (bucket_id='arena-photos' and exists(select 1 from public.arenas a where a.id::text=(storage.foldername(name))[1] and a.owner_id=(select auth.uid())));
-- MVP: protect published arenas from missing required contact data.
alter table public.arenas add constraint published_contact_required check (not published or (length(trim(name))>=2 and length(trim(neighborhood))>=2 and length(trim(address))>=5 and contact_phone<>''));
