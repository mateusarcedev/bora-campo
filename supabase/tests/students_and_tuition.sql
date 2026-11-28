do $test$
declare u1 uuid:=gen_random_uuid();u2 uuid:=gen_random_uuid();a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();c uuid:=gen_random_uuid();s uuid:=gen_random_uuid();t uuid:=gen_random_uuid();st uuid:=gen_random_uuid();st2 uuid:=gen_random_uuid();cl uuid;en uuid;entry uuid;d date:=(now() at time zone 'America/Manaus')::date;m date;n integer;
begin
 begin
 insert into auth.users(id,email) values(u1,u1::text||'@example.invalid'),(u2,u2::text||'@example.invalid');
 insert into public.arenas(id,owner_id,slug,name,neighborhood) values(a,u1,'test-'||a,'Teste A','Teste'),(b,u2,'test-'||b,'Teste B','Teste');
 insert into public.courts(id,arena_id,name,sport) values(c,a,'Campo','society');
 insert into public.arena_services(id,arena_id,name,sport,service_type,billing_type,price_cents) values(s,a,'Aula','society','group','monthly',14000);
 insert into public.arena_teachers(id,arena_id,name) values(t,a,'Professor');
 perform set_config('request.jwt.claim.sub',u1::text,true);execute 'set local role authenticated';
 cl:=public.create_arena_class(a,s,t,c,'Turma',1,'',array[extract(dow from d)::smallint],d,d+14,'16:00','17:00');
 insert into public.arena_students(id,arena_id,name) values(st,a,'Aluno teste'),(st2,a,'Outro aluno');
 insert into public.arena_enrollments(arena_id,class_id,student_id,monthly_price_cents,due_day) values(a,cl,st,0,10) returning id into en;
 if (select monthly_price_cents from public.arena_enrollments where id=en)<>14000 then raise exception 'Wrong price snapshot';end if;
 begin insert into public.arena_enrollments(arena_id,class_id,student_id,monthly_price_cents,due_day) values(a,cl,st2,0,10);raise exception 'Capacity bypass';exception when check_violation then null;end;
 select id into entry from public.calendar_entries where class_id=cl and (starts_at at time zone 'America/Manaus')::date=d;
 insert into public.arena_attendance(arena_id,class_id,entry_id,enrollment_id,present) values(a,cl,entry,en,true);
 m:=date_trunc('month',d)::date;
 n:=public.generate_arena_tuition(a,m);if n<>1 then raise exception 'Expected one tuition';end if;
 n:=public.generate_arena_tuition(a,m);if n<>0 then raise exception 'Duplicate tuition';end if;
 if (select amount_cents from public.arena_tuition where enrollment_id=en)<>14000 then raise exception 'Wrong tuition';end if;
 perform set_config('request.jwt.claim.sub',u2::text,true);
 if exists(select 1 from public.arena_students where arena_id=a) or exists(select 1 from public.arena_enrollments where arena_id=a) or exists(select 1 from public.arena_tuition where arena_id=a) or exists(select 1 from public.arena_attendance where arena_id=a) then raise exception 'Cross tenant leak';end if;
 begin perform public.generate_arena_tuition(a,m);raise exception 'Unauthorized generation';exception when insufficient_privilege then null;end;
 execute 'reset role';
 raise exception using errcode='ZX001',message='rollback test fixture';
 exception when sqlstate 'ZX001' then raise notice 'PASS: capacity, snapshot, attendance, idempotency, isolation';end;
end $test$;
select 'PASS: students, attendance, tuition and isolation; fixture rolled back' as result;