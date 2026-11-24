do $test$
declare u1 uuid:=gen_random_uuid();u2 uuid:=gen_random_uuid();a1 uuid:=gen_random_uuid();a2 uuid:=gen_random_uuid();c1 uuid:=gen_random_uuid();p1 text:=a1::text||'/'||gen_random_uuid()::text||'.jpg';p2 text:=a2::text||'/'||gen_random_uuid()::text||'.png';n int;blocked boolean:=false;
begin
begin
 insert into auth.users(id,email) values(u1,u1::text||'@example.invalid'),(u2,u2::text||'@example.invalid');
 insert into public.arenas(id,owner_id,slug,name,neighborhood,address,contact_phone,published) values(a1,u1,'test-'||a1,'Arena teste','Bairro','Rua teste 1','92999999999',true),(a2,u2,'test-'||a2,'Arena teste 2','Bairro','','',false);
 insert into public.courts(id,arena_id,name,sport) values(c1,a1,'Campo teste','society');
 insert into public.court_rates(court_id,weekday,starts_at,ends_at,price_cents) values(c1,1,'10:00','12:00',10000);
 begin
 insert into public.court_rates(court_id,weekday,starts_at,ends_at,price_cents) values(c1,1,'11:00','13:00',12000);
 exception when exclusion_violation then blocked:=true;
 end;
 if not blocked then raise exception 'Rate overlap accepted';end if;
 insert into public.arena_photos(arena_id,path) values(a1,p1),(a2,p2);
 blocked:=false;
 begin
 update public.arenas set published=true where id=a2;
 exception when check_violation then blocked:=true;
 end;
 if not blocked then raise exception 'Incomplete arena published';end if;
 perform set_config('request.jwt.claim.sub',u2::text,true);
 execute 'set local role authenticated';
 select count(*) into n from public.arena_photos where arena_id=a2;
 if n<>1 then raise exception 'Owner cannot see draft photo';end if;
 blocked:=false;
 begin
 insert into public.arena_photos(arena_id,path) values(a1,a1::text||'/'||gen_random_uuid()::text||'.jpg');
 exception when insufficient_privilege then blocked:=true;
 end;
 if not blocked then raise exception 'Foreign arena photo insertion accepted';end if;
 update public.arenas set name='unauthorized' where id=a1;
 get diagnostics n=row_count;
 if n<>0 then raise exception 'Foreign arena update accepted';end if;
 execute 'reset role';
 execute 'set local role anon';
 select count(*) into n from public.arena_photos where arena_id in (a1,a2);
 if n<>1 then raise exception 'Draft photo visible anonymously';end if;
 execute 'reset role';
 raise exception using errcode='ZX001',message='rollback fixture';
exception when sqlstate 'ZX001' then
 raise notice 'PASS: rate overlap, contact requirements, owner draft photo access, cross-arena write isolation, public photo visibility';
end;
end $test$;