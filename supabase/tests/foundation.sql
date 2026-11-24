do $test$
declare
 u1 uuid := gen_random_uuid(); u2 uuid := gen_random_uuid();
 a1 uuid := gen_random_uuid(); a2 uuid := gen_random_uuid();
 c1 uuid := gen_random_uuid(); c2 uuid := gen_random_uuid();
 denied boolean := false; conflicting boolean := false; n integer;
begin
 begin
  insert into auth.users(id,email) values (u1,u1::text||'@example.invalid'),(u2,u2::text||'@example.invalid');
  insert into public.arenas(id,owner_id,slug,name,neighborhood,address,contact_phone,published) values (a1,u1,'test-'||a1,'Teste 1','Teste','Rua teste 1','92999999999',true),(a2,u2,'test-'||a2,'Teste 2','Teste','','',false);
  insert into public.courts(id,arena_id,name,sport) values(c1,a1,'Campo 1','society'),(c2,a2,'Campo 2','society');
  insert into public.calendar_entries(arena_id,court_id,kind,status,payment_status,starts_at,ends_at) values(a1,c1,'block','confirmed','not_applicable','2030-01-01 10:00+00','2030-01-01 11:00+00');
  begin
   insert into public.calendar_entries(arena_id,court_id,kind,starts_at,ends_at) values(a1,c1,'reservation','2030-01-01 10:30+00','2030-01-01 11:30+00');
  exception when exclusion_violation then conflicting:=true;
  end;
  if not conflicting then raise exception 'Overlap unexpectedly accepted'; end if;
  insert into public.calendar_entries(arena_id,court_id,kind,starts_at,ends_at) values(a1,c1,'reservation','2030-01-01 11:00+00','2030-01-01 12:00+00');
  insert into public.calendar_entries(arena_id,court_id,kind,starts_at,ends_at) values(a2,c2,'reservation','2030-01-01 10:30+00','2030-01-01 11:30+00');
  perform set_config('request.jwt.claim.sub',u2::text,true);
  execute 'set local role authenticated';
  select count(*) into n from public.calendar_entries where arena_id=a1;
  if n<>0 then raise exception 'Cross-arena read allowed'; end if;
  begin
   insert into public.calendar_entries(arena_id,court_id,kind,starts_at,ends_at) values(a1,c1,'reservation','2030-01-01 12:00+00','2030-01-01 13:00+00');
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'Cross-arena write allowed'; end if;
  select count(*) into n from public.calendar_entries where arena_id=a2;
  if n<>1 then raise exception 'Owner access failed'; end if;
  execute 'reset role';
  execute 'set local role anon';
  select count(*) into n from public.arenas where id in (a1,a2);
  if n<>1 then raise exception 'Public visibility check failed'; end if;
  execute 'reset role';
  raise exception using errcode='ZX001',message='rollback successful test fixture';
 exception when sqlstate 'ZX001' then
  raise notice 'PASS: overlap, adjacency, distinct courts, cross-arena read/write, owner access and public visibility';
 end;
end $test$;