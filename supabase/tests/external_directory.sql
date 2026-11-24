do $test$
declare n int; a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); denied boolean:=false;
begin
begin
 insert into public.external_arenas(id,name,address,collected_at,source_urls) values(a,'Teste externo pendente','Rua teste 1',current_date,array['https://example.invalid']);
 insert into public.external_arenas(id,name,address,collected_at,verified_at,source_urls,status) values(b,'Teste externo aprovado','Rua teste 2',current_date,current_date,array['https://example.invalid'],'approved');
 execute 'set local role anon';
 select count(id) into n from public.external_arenas where id in(a,b);
 if n<>1 then raise exception 'Incorrect public visibility'; end if;
 begin
 insert into public.external_arenas(name,collected_at) values('Unauthorized',current_date);
 exception when insufficient_privilege then denied:=true;
 end;
 if not denied then raise exception 'Public write allowed';end if;
 execute 'reset role';
 raise exception using errcode='ZX001',message='rollback fixtures';
exception when sqlstate 'ZX001' then raise notice 'PASS approved-only and public writes denied';
end;
end $test$;