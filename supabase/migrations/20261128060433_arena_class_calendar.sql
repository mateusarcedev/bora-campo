-- M01.2: teachers, finite class series and atomic calendar materialization.
set local search_path=public,extensions;
create table public.arena_teachers (
 id uuid primary key default gen_random_uuid(), arena_id uuid not null references public.arenas(id),
 name text not null check(char_length(trim(name)) between 2 and 100),
 active boolean not null default true, created_at timestamptz not null default now(), unique(arena_id,id)
);
create table public.arena_classes (
 id uuid primary key default gen_random_uuid(), arena_id uuid not null references public.arenas(id),
 service_id uuid not null, teacher_id uuid not null, court_id uuid not null,
 name text not null check(char_length(trim(name)) between 2 and 100),
 capacity integer not null check(capacity between 1 and 500),
 level text not null default '' check(char_length(level)<=100),
 weekdays smallint[] not null check(cardinality(weekdays) between 1 and 7 and weekdays <@ array[0,1,2,3,4,5,6]::smallint[] and array_position(weekdays,null) is null),
 first_date date not null, last_date date not null,
 starts_at time not null, ends_at time not null,
 created_at timestamptz not null default now(),
 check(last_date>=first_date and last_date-first_date<=180),
 check(starts_at<ends_at),
 foreign key(arena_id,service_id) references public.arena_services(arena_id,id),
 foreign key(arena_id,teacher_id) references public.arena_teachers(arena_id,id),
 foreign key(arena_id,court_id) references public.courts(arena_id,id),
 unique(arena_id,id), unique(arena_id,id,teacher_id,court_id)
);
create index arena_teachers_arena_idx on public.arena_teachers(arena_id);
create index arena_classes_service_idx on public.arena_classes(arena_id,service_id);
create index arena_classes_teacher_idx on public.arena_classes(arena_id,teacher_id);
create index arena_classes_court_idx on public.arena_classes(arena_id,court_id);
alter table public.arena_teachers enable row level security;
alter table public.arena_classes enable row level security;
revoke all on public.arena_teachers,public.arena_classes from public,anon,authenticated;
grant select,insert,update on public.arena_teachers to authenticated;
grant select,insert on public.arena_classes to authenticated;
create policy teachers_owner on public.arena_teachers for all to authenticated using(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy classes_owner_read on public.arena_classes for select to authenticated using(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy classes_owner_insert on public.arena_classes for insert to authenticated with check(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
alter table public.calendar_entries add column class_id uuid, add column teacher_id uuid;
alter table public.calendar_entries add constraint calendar_class_fk foreign key(arena_id,class_id,teacher_id,court_id) references public.arena_classes(arena_id,id,teacher_id,court_id);
alter table public.calendar_entries add constraint calendar_class_shape check((class_id is null and teacher_id is null) or (class_id is not null and teacher_id is not null and kind='block' and status in ('confirmed','cancelled')));
alter table public.calendar_entries add constraint calendar_teacher_no_overlap exclude using gist(teacher_id with =,tstzrange(starts_at,ends_at,'[)') with &&) where(teacher_id is not null and status<>'cancelled');
create index calendar_class_idx on public.calendar_entries(arena_id,class_id,teacher_id,court_id);
create function public.guard_class_calendar() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' and old.class_id is not null then
   if (to_jsonb(new)-'status') is distinct from (to_jsonb(old)-'status') or (old.status='cancelled' and new.status<>'cancelled') then raise exception 'Class occurrences are immutable except cancellation'; end if;
 end if;
 if new.class_id is not null and (tg_op='INSERT' or old.class_id is null) then
   if not exists(select 1 from public.arena_classes c where c.id=new.class_id and c.arena_id=new.arena_id and (new.starts_at at time zone 'America/Manaus')::date between c.first_date and c.last_date and extract(dow from new.starts_at at time zone 'America/Manaus')::smallint=any(c.weekdays) and new.starts_at=((new.starts_at at time zone 'America/Manaus')::date+c.starts_at) at time zone 'America/Manaus' and new.ends_at=((new.starts_at at time zone 'America/Manaus')::date+c.ends_at) at time zone 'America/Manaus') then raise exception 'Invalid class occurrence'; end if;
 end if;
 return new;
end $$;
revoke all on function public.guard_class_calendar() from public,anon,authenticated;
create trigger guard_class_calendar before insert or update on public.calendar_entries for each row execute function public.guard_class_calendar();
create function public.create_arena_class(p_arena uuid,p_service uuid,p_teacher uuid,p_court uuid,p_name text,p_capacity integer,p_level text,p_days smallint[],p_first date,p_last date,p_start time,p_end time)
returns uuid language plpgsql security invoker set search_path='' as $$
declare cid uuid; n integer;
begin
 if not exists(select 1 from public.arenas a where a.id=p_arena and a.owner_id=(select auth.uid())) then raise exception 'Arena not authorized' using errcode='42501'; end if;
 if not exists(select 1 from public.arena_services s where s.arena_id=p_arena and s.id=p_service and s.active and s.service_type='group') or not exists(select 1 from public.arena_teachers t where t.arena_id=p_arena and t.id=p_teacher and t.active) or not exists(select 1 from public.courts c where c.arena_id=p_arena and c.id=p_court and c.active) then raise exception 'Inactive or invalid service, teacher or court'; end if;
 if p_first < (now() at time zone 'America/Manaus')::date then raise exception 'Start date must not be in the past'; end if;
 insert into public.arena_classes(arena_id,service_id,teacher_id,court_id,name,capacity,level,weekdays,first_date,last_date,starts_at,ends_at) values(p_arena,p_service,p_teacher,p_court,trim(p_name),p_capacity,p_level,p_days,p_first,p_last,p_start,p_end) returning id into cid;
 insert into public.calendar_entries(arena_id,court_id,kind,status,payment_status,price_cents,starts_at,ends_at,title,source,class_id,teacher_id)
 select p_arena,p_court,'block','confirmed','not_applicable',0,((p_first+i)+p_start) at time zone 'America/Manaus',((p_first+i)+p_end) at time zone 'America/Manaus',trim(p_name),'manual',cid,p_teacher
 from generate_series(0,p_last-p_first) i where extract(dow from p_first+i)::smallint=any(p_days);
 get diagnostics n=row_count;
 if n=0 then raise exception 'No occurrences in period'; end if;
 return cid;
end $$;
revoke all on function public.create_arena_class(uuid,uuid,uuid,uuid,text,integer,text,smallint[],date,date,time,time) from public,anon;
grant execute on function public.create_arena_class(uuid,uuid,uuid,uuid,text,integer,text,smallint[],date,date,time,time) to authenticated;
