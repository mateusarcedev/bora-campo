-- M01.3: private student records and enrollments with transactional capacity.
create table public.arena_students (
 id uuid primary key default gen_random_uuid(),arena_id uuid not null references public.arenas(id),
 name text not null check(char_length(trim(name)) between 2 and 120),
 guardian_name text not null default '' check(char_length(guardian_name)<=120),
 contact_phone text not null default '' check(contact_phone='' or contact_phone ~ '^[0-9]{10,13}$'),
 created_at timestamptz not null default now(),unique(arena_id,id)
);
create table public.arena_enrollments (
 id uuid primary key default gen_random_uuid(),arena_id uuid not null references public.arenas(id),
 class_id uuid not null,student_id uuid not null,
 enrolled_on date not null default ((now() at time zone 'America/Manaus')::date),
 monthly_price_cents integer not null check(monthly_price_cents between 0 and 99999999),
 due_day smallint not null check(due_day between 1 and 28),
 created_at timestamptz not null default now(),
 foreign key(arena_id,class_id) references public.arena_classes(arena_id,id),
 foreign key(arena_id,student_id) references public.arena_students(arena_id,id),
 unique(arena_id,class_id,student_id),unique(arena_id,class_id,id)
);
create index arena_students_arena_idx on public.arena_students(arena_id);
create index arena_enrollments_student_idx on public.arena_enrollments(arena_id,student_id);
alter table public.arena_students enable row level security;
alter table public.arena_enrollments enable row level security;
revoke all on public.arena_students,public.arena_enrollments from public,anon,authenticated;
grant select,insert,update on public.arena_students to authenticated;
grant select,insert on public.arena_enrollments to authenticated;
create policy students_owner on public.arena_students for all to authenticated using(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy enrollments_owner_read on public.arena_enrollments for select to authenticated using(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create policy enrollments_owner_insert on public.arena_enrollments for insert to authenticated with check(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create function public.guard_enrollment_capacity() returns trigger language plpgsql security invoker set search_path='' as $$
declare cap integer; p integer; today_local date:=(now() at time zone 'America/Manaus')::date;
begin
 if not exists(select 1 from public.arenas a where a.id=new.arena_id and a.owner_id=(select auth.uid())) then raise exception 'Arena not authorized' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(new.class_id::text,0));
 select c.capacity,s.price_cents into cap,p from public.arena_classes c join public.arena_services s on s.arena_id=c.arena_id and s.id=c.service_id where c.id=new.class_id and c.arena_id=new.arena_id and c.last_date>=today_local and s.active and s.billing_type in ('monthly','free');
 if cap is null then raise exception 'Class unavailable or not monthly'; end if;
 if (select count(*) from public.arena_enrollments e where e.arena_id=new.arena_id and e.class_id=new.class_id)>=cap then raise exception 'Class capacity reached' using errcode='23514'; end if;
 new.monthly_price_cents:=p;new.enrolled_on:=today_local;
 return new;
end $$;
revoke all on function public.guard_enrollment_capacity() from public,anon,authenticated;
create trigger guard_enrollment_capacity before insert on public.arena_enrollments for each row execute function public.guard_enrollment_capacity();
alter table public.calendar_entries add constraint calendar_arena_class_entry_unique unique(arena_id,class_id,id);
create table public.arena_attendance (
 arena_id uuid not null, class_id uuid not null,entry_id uuid not null,enrollment_id uuid not null,present boolean not null,
 recorded_at timestamptz not null default now(),
 primary key(entry_id,enrollment_id),
 foreign key(arena_id,class_id,entry_id) references public.calendar_entries(arena_id,class_id,id),
 foreign key(arena_id,class_id,enrollment_id) references public.arena_enrollments(arena_id,class_id,id)
);
create index arena_attendance_arena_entry_idx on public.arena_attendance(arena_id,class_id,entry_id);
create index arena_attendance_enrollment_idx on public.arena_attendance(arena_id,class_id,enrollment_id);
alter table public.arena_attendance enable row level security;
revoke all on public.arena_attendance from public,anon,authenticated;
grant select,insert,update on public.arena_attendance to authenticated;
create policy attendance_owner on public.arena_attendance for all to authenticated using(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create function public.guard_attendance() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.calendar_entries c join public.arena_enrollments e on e.arena_id=c.arena_id and e.class_id=c.class_id where c.id=new.entry_id and c.arena_id=new.arena_id and c.class_id=new.class_id and e.id=new.enrollment_id and c.status='confirmed' and (c.starts_at at time zone 'America/Manaus')::date between e.enrolled_on and (now() at time zone 'America/Manaus')::date) then raise exception 'Invalid attendance occurrence';end if;
 new.recorded_at:=now();return new;
end $$;
revoke all on function public.guard_attendance() from public,anon,authenticated;
create trigger guard_attendance before insert or update on public.arena_attendance for each row execute function public.guard_attendance();
create table public.arena_tuition (
 id uuid primary key default gen_random_uuid(),arena_id uuid not null,class_id uuid not null,enrollment_id uuid not null,
 competence date not null check(extract(day from competence)=1),due_date date not null,
 amount_cents integer not null check(amount_cents>=0),paid_at timestamptz,
 created_at timestamptz not null default now(),
 foreign key(arena_id,class_id,enrollment_id) references public.arena_enrollments(arena_id,class_id,id),
 unique(enrollment_id,competence)
);
create index arena_tuition_arena_month_idx on public.arena_tuition(arena_id,competence);
create index arena_tuition_enrollment_idx on public.arena_tuition(arena_id,class_id,enrollment_id);
alter table public.arena_tuition enable row level security;
revoke all on public.arena_tuition from public,anon,authenticated;
grant select,insert on public.arena_tuition to authenticated;
grant update(paid_at) on public.arena_tuition to authenticated;
create policy tuition_owner on public.arena_tuition for all to authenticated using(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid()))) with check(exists(select 1 from public.arenas a where a.id=arena_id and a.owner_id=(select auth.uid())));
create function public.guard_tuition_snapshot() returns trigger language plpgsql security invoker set search_path='' as $$
declare p integer; d smallint; start_date date; end_date date;
begin
 select e.monthly_price_cents,e.due_day,greatest(c.first_date,e.enrolled_on),c.last_date into p,d,start_date,end_date from public.arena_enrollments e join public.arena_classes c on c.arena_id=e.arena_id and c.id=e.class_id where e.id=new.enrollment_id and e.arena_id=new.arena_id and e.class_id=new.class_id;
 if p is null or p=0 or new.competence>end_date or (new.competence+interval '1 month')::date<=start_date then raise exception 'Invalid tuition competence';end if;
 new.amount_cents:=p;new.due_date:=greatest(new.competence+(d-1),start_date);new.paid_at:=null;return new;
end $$;
revoke all on function public.guard_tuition_snapshot() from public,anon,authenticated;
create trigger guard_tuition_snapshot before insert on public.arena_tuition for each row execute function public.guard_tuition_snapshot();
create function public.generate_arena_tuition(p_arena uuid,p_month date) returns integer language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 if not exists(select 1 from public.arenas a where a.id=p_arena and a.owner_id=(select auth.uid())) then raise exception 'Arena not authorized' using errcode='42501';end if;
 if extract(day from p_month)<>1 then raise exception 'Invalid competence';end if;
 insert into public.arena_tuition(arena_id,class_id,enrollment_id,competence,due_date,amount_cents)
 select e.arena_id,e.class_id,e.id,p_month,p_month,e.monthly_price_cents from public.arena_enrollments e join public.arena_classes c on c.arena_id=e.arena_id and c.id=e.class_id where e.arena_id=p_arena and e.monthly_price_cents>0 and c.last_date>=p_month and greatest(c.first_date,e.enrolled_on)<(p_month+interval '1 month')::date
 on conflict(enrollment_id,competence) do nothing;
 get diagnostics n=row_count;return n;
end $$;
revoke all on function public.generate_arena_tuition(uuid,date) from public,anon;
grant execute on function public.generate_arena_tuition(uuid,date) to authenticated;
