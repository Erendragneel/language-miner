-- Requires the existing parent_teacher_links and approval/progress RPCs.
begin;
create table public.learner_link_identities (
 user_id uuid primary key references auth.users(id) on delete cascade,
 gamer_tag text not null unique default ('Miner#' || substr(replace(gen_random_uuid()::text,'-',''),1,16)),
 code_hash text,
 expires_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.learner_link_attempts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_start timestamptz not null default now(),
 attempts integer not null default 0
);
alter table public.learner_link_identities enable row level security;
alter table public.learner_link_attempts enable row level security;
revoke all on public.learner_link_identities, public.learner_link_attempts from public, anon, authenticated;
insert into public.learner_link_identities(user_id)
select distinct student_user_id from public.parent_teacher_links;

create function public.create_learner_link_invitation()
returns table(gamer_tag text, invitation_code text, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
 v_user uuid := auth.uid();
 v_code text := replace(gen_random_uuid()::text,'-','');
 v_identity public.learner_link_identities%rowtype;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
 insert into public.learner_link_identities as identity(user_id,code_hash,expires_at)
 values(v_user,encode(sha256(convert_to(v_code,'UTF8')),'hex'),now()+interval '15 minutes')
 on conflict(user_id) do update set code_hash=excluded.code_hash,expires_at=excluded.expires_at
 returning * into v_identity;
 return query select v_identity.gamer_tag,v_code,v_identity.expires_at;
end;
$$;

create function public.cancel_learner_link_invitation()
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 update public.learner_link_identities set code_hash=null,expires_at=null where user_id=auth.uid();
end;
$$;

create function public.request_student_link_by_invitation(p_gamer_tag text,p_invitation_code text)
returns table(id uuid,adult_user_id uuid,student_user_id uuid,status text,requested_at timestamptz,responded_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
 v_adult uuid := auth.uid();
 v_identity public.learner_link_identities%rowtype;
 v_link public.parent_teacher_links%rowtype;
 v_attempts integer;
begin
 if v_adult is null then raise exception 'Authentication required' using errcode='42501'; end if;
 -- Return no rows for invalid requests so failed attempts remain committed.
 insert into public.learner_link_attempts as attempts(user_id,attempts) values(v_adult,1)
 on conflict(user_id) do update set
 attempts=case when attempts.window_start<=now()-interval '15 minutes' then 1 else least(attempts.attempts+1,21) end,
 window_start=case when attempts.window_start<=now()-interval '15 minutes' then now() else attempts.window_start end
 returning attempts.attempts into v_attempts;
 if v_attempts>20 then return; end if;
 select * into v_identity from public.learner_link_identities as identity
 where lower(identity.gamer_tag)=lower(trim(p_gamer_tag))
 and identity.code_hash=encode(sha256(convert_to(lower(trim(p_invitation_code)),'UTF8')),'hex')
 and identity.expires_at>now() and identity.user_id<>v_adult
 for update;
 if v_identity.user_id is null then return; end if;
 insert into public.parent_teacher_links as links(adult_user_id,student_user_id,status,requested_at,responded_at,updated_at)
 values(v_adult,v_identity.user_id,'pending',now(),null,now())
 on conflict on constraint parent_teacher_links_unique_pair do update set
 status=case when links.status='approved' then 'approved' else 'pending' end,
 requested_at=case when links.status='approved' then links.requested_at else now() end,
 responded_at=case when links.status='approved' then links.responded_at else null end,
 updated_at=now()
 returning * into v_link;
 update public.learner_link_identities set code_hash=null,expires_at=null where user_id=v_identity.user_id;
 return query select v_link.id,v_link.adult_user_id,v_link.student_user_id,v_link.status,v_link.requested_at,v_link.responded_at;
end;
$$;

-- Preserve the old result shape for older clients, but never return emails or
-- infer display names from email local parts. Retire email-based lookup entirely.
create or replace function public.list_parent_teacher_links()
returns table(id uuid,adult_user_id uuid,student_user_id uuid,status text,requested_at timestamptz,responded_at timestamptz,adult_display_name text,student_display_name text,adult_email text,student_email text)
language sql stable security definer set search_path = '' as $$
 select links.id,links.adult_user_id,links.student_user_id,links.status,links.requested_at,links.responded_at,
 coalesce(nullif(adult.raw_user_meta_data->>'display_name',''),'Parent or teacher'),
 coalesce(identity.gamer_tag,'Learner'),''::text,''::text
 from public.parent_teacher_links links
 join auth.users adult on adult.id=links.adult_user_id
 left join public.learner_link_identities identity on identity.user_id=links.student_user_id
 where auth.uid() in (links.adult_user_id,links.student_user_id)
 order by links.updated_at desc;
$$;
revoke all on function public.request_student_link(text) from public,anon,authenticated;
-- Preserve the deployed progress whitelist and approval checks while replacing
-- the legacy name expression, which could reveal an email-derived name.
do $privacy$
declare
 definition text;
 old_expression text := 'coalesce(nullif(saves.display_name, ''''), learner.raw_user_meta_data ->> ''display_name'', split_part(coalesce(learner.email, ''''), ''@'', 1), ''Learner'')';
 new_expression text := 'coalesce((select identity.gamer_tag from public.learner_link_identities identity where identity.user_id=learner.id), ''Learner'')';
begin
 select pg_get_functiondef('public.load_linked_learner_progress(uuid)'::regprocedure) into definition;
 if strpos(definition,old_expression)=0 then
   raise exception 'Unexpected learner progress name expression. Inspect the deployed function before applying this migration.';
 end if;
 execute replace(definition,old_expression,new_expression);
end;
$privacy$;
revoke all on function public.create_learner_link_invitation(),public.cancel_learner_link_invitation(),public.request_student_link_by_invitation(text,text),public.list_parent_teacher_links() from public,anon;
grant execute on function public.create_learner_link_invitation(),public.cancel_learner_link_invitation(),public.request_student_link_by_invitation(text,text),public.list_parent_teacher_links() to authenticated;
notify pgrst,'reload schema';
commit;
