do $test$
declare
 u1 uuid:=gen_random_uuid(); u2 uuid:=gen_random_uuid(); a1 uuid:=gen_random_uuid(); a2 uuid:=gen_random_uuid();
 c1 uuid:=gen_random_uuid(); c2 uuid:=gen_random_uuid(); s1 uuid:=gen_random_uuid(); t1 uuid:=gen_random_uuid(); cid uuid;
 d date:=(now() at time zone 'America/Manaus')::date+7; wd smallint[]; n integer;
begin
 begin
 insert into auth.users(id,email) values(u1,u1::text||'@example.invalid'),(u2,u2::text||'@example.invalid');
 insert into public.arenas(id,owner_id,slug,name,neighborhood) values(a1,u1,'test-'||a1,'Teste 1','Teste'),(a2,u2,'test-'||a2,'Teste 2','Teste');
 insert into public.courts(id,arena_id,name,sport) values(c1,a1,'Campo 1','society'),(c2,a1,'Campo 2','society');
 insert into public.arena_services(id,arena_id,name,sport,service_type,billing_type,price_cents) values(s1,a1,'Aulas teste','society','group','monthly',14000);
 insert into public.arena_teachers(id,arena_id,name) values(t1,a1,'Professor teste');
 wd:=array[extract(dow from d)::smallint];
 perform set_config('request.jwt.claim.sub',u1::text,true);
 execute 'set local role authenticated';
 cid:=public.create_arena_class(a1,s1,t1,c1,'Turma teste',12,'Iniciante',wd,d,d+14,'16:00','17:00');
 select count(*) into n from public.calendar_entries where class_id=cid;
 if n<>3 then raise exception 'Expected 3 occurrences'; end if;
 begin
  perform public.create_arena_class(a1,s1,t1,c2,'Conflito professor',12,'',wd,d,d+14,'16:30','17:30');
  raise exception 'Teacher overlap unexpectedly accepted';
 exception when exclusion_violation then null; end;
 begin
  insert into public.calendar_entries(arena_id,court_id,kind,starts_at,ends_at) values(a1,c1,'reservation',(d+'16:30'::time) at time zone 'America/Manaus',(d+'17:30'::time) at time zone 'America/Manaus');
  raise exception 'Court overlap unexpectedly accepted';
 exception when exclusion_violation then null; end;
 select count(*) into n from public.arena_classes where arena_id=a1;
 if n<>1 then raise exception 'Partial class persisted'; end if;
 perform set_config('request.jwt.claim.sub',u2::text,true);
 select count(*) into n from public.arena_classes where arena_id=a1;
 if n<>0 then raise exception 'Cross-tenant class read'; end if;
 begin
  perform public.create_arena_class(a1,s1,t1,c2,'Unauthorized',12,'',wd,d,d+14,'18:00','19:00');
  raise exception 'Cross-tenant create unexpectedly accepted';
 exception when insufficient_privilege then null; end;
 execute 'reset role';
 raise exception using errcode='ZX001',message='rollback successful fixture';
 exception when sqlstate 'ZX001' then
 raise notice 'PASS: recurrence, court/teacher conflict, atomicity and tenant isolation';
 end;
end $test$;
select 'PASS: class calendar checks completed; fixture rolled back' as result;