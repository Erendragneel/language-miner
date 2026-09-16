begin;
do $repair$
declare definition text;
begin
 if not exists(select 1 from pg_constraint where conrelid='public.player_saves'::regclass and conname='player_saves_pkey' and contype='p') then raise exception 'Expected player save primary key missing'; end if;
 select pg_get_functiondef('public.save_player_state(jsonb,jsonb,text,text,bigint)'::regprocedure) into definition;
 if position('on conflict (user_id)' in definition)>0 then
 execute replace(definition,'on conflict (user_id)','on conflict on constraint player_saves_pkey');
 elsif position('on conflict on constraint player_saves_pkey' in definition)=0 then raise exception 'Unexpected conflict target; no changes applied';
 end if;
end;
$repair$;
notify pgrst, 'reload schema';
commit;
