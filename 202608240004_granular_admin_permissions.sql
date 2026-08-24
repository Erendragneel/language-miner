-- Language Miner v6.4.179: owner-assigned, granular administrator privileges.
-- Existing administrators keep their prior abilities on migration. Every later
-- grant is created from the explicit owner-selected permission checklist.

alter table public.app_admins
  add column if not exists permissions jsonb not null default jsonb_build_object(
    'economy',true,
    'health',true,
    'progression',true,
    'cosmetics',true,
    'profile_resets',true,
    'player_management',true,
    'release_management',true,
    'privacy_management',true
  );

update public.app_admins
set permissions=jsonb_build_object(
  'economy',true,'health',true,'progression',true,'cosmetics',true,
  'profile_resets',true,'player_management',true,'release_management',true,
  'privacy_management',true
)
where permissions is null or jsonb_typeof(permissions)<>'object';

-- Existing admins were upgraded above. Future trusted inserts start with no
-- privileges until the owner explicitly selects them.
alter table public.app_admins alter column permissions set default '{}'::jsonb;

alter table public.app_admins drop constraint if exists app_admins_permissions_object_check;
alter table public.app_admins add constraint app_admins_permissions_object_check
  check (jsonb_typeof(permissions)='object');

alter table public.app_admin_access_events add column if not exists previous_permissions jsonb;
alter table public.app_admin_access_events add column if not exists new_permissions jsonb;
alter table public.app_admin_access_events drop constraint if exists app_admin_access_events_action_check;
alter table public.app_admin_access_events add constraint app_admin_access_events_action_check
  check (action in ('grant_admin','revoke_admin','update_permissions'));

create or replace function public.language_miner_admin_has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists (
    select 1
    from public.app_admins a
    where a.user_id=(select auth.uid())
      and (
        a.role='owner'
        or (
          a.role='admin'
          and p_permission in (
            'economy','health','progression','cosmetics','profile_resets',
            'player_management','release_management','privacy_management'
          )
          and coalesce(a.permissions->p_permission,'false'::jsonb)='true'::jsonb
        )
      )
  );
$$;

create or replace function public.get_my_language_miner_admin_identity()
returns table (role text, permissions jsonb)
language sql
stable
security definer
set search_path=public
as $$
  select a.role,
    case when a.role='owner' then jsonb_build_object(
      'economy',true,'health',true,'progression',true,'cosmetics',true,
      'profile_resets',true,'player_management',true,'release_management',true,
      'privacy_management',true
    ) else coalesce(a.permissions,'{}'::jsonb) end
  from public.app_admins a
  where a.user_id=(select auth.uid())
  limit 1;
$$;

create or replace function public.owner_search_accounts_with_permissions(p_search text default '',p_limit integer default 30)
returns table (
  user_id uuid,
  email text,
  display_name text,
  admin_role text,
  admin_permissions jsonb,
  account_created_at timestamptz
)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
declare
  v_search text:=lower(trim(coalesce(p_search,'')));
begin
  if not public.is_language_miner_owner() then raise exception 'Master owner access required' using errcode='42501'; end if;
  return query
    select u.id,coalesce(u.email,''),coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,''),'@',1),'Player'),a.role,coalesce(a.permissions,'{}'::jsonb),u.created_at
    from auth.users u
    left join public.player_saves s on s.user_id=u.id
    left join public.app_admins a on a.user_id=u.id
    where v_search='' or lower(coalesce(u.email,'')) like '%'||v_search||'%' or lower(coalesce(s.display_name,u.raw_user_meta_data->>'display_name','')) like '%'||v_search||'%'
    order by case when a.role='owner' then 0 when a.role='admin' then 1 else 2 end,coalesce(s.display_name,u.raw_user_meta_data->>'display_name',u.email,'')
    limit greatest(1,least(coalesce(p_limit,30),100));
end;
$$;

create or replace function public.owner_list_admins_with_permissions()
returns table (
  user_id uuid,
  email text,
  display_name text,
  admin_role text,
  admin_permissions jsonb,
  assigned_at timestamptz
)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
begin
  if not public.is_language_miner_owner() then raise exception 'Master owner access required' using errcode='42501'; end if;
  return query
    select a.user_id,coalesce(u.email,''),coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,''),'@',1),'Player'),a.role,coalesce(a.permissions,'{}'::jsonb),a.created_at
    from public.app_admins a
    join auth.users u on u.id=a.user_id
    left join public.player_saves s on s.user_id=a.user_id
    order by case when a.role='owner' then 0 else 1 end,a.created_at asc;
end;
$$;

create or replace function public.owner_set_admin_permissions(p_user_id uuid,p_permissions jsonb,p_enabled boolean default true)
returns table (
  user_id uuid,
  email text,
  display_name text,
  admin_role text,
  admin_permissions jsonb,
  changed boolean
)
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_actor uuid:=(select auth.uid());
  v_target auth.users%rowtype;
  v_previous_role text;
  v_previous_permissions jsonb;
  v_clean jsonb:=jsonb_build_object(
    'economy',coalesce(p_permissions->'economy','false'::jsonb)='true'::jsonb,
    'health',coalesce(p_permissions->'health','false'::jsonb)='true'::jsonb,
    'progression',coalesce(p_permissions->'progression','false'::jsonb)='true'::jsonb,
    'cosmetics',coalesce(p_permissions->'cosmetics','false'::jsonb)='true'::jsonb,
    'profile_resets',coalesce(p_permissions->'profile_resets','false'::jsonb)='true'::jsonb,
    'player_management',coalesce(p_permissions->'player_management','false'::jsonb)='true'::jsonb,
    'release_management',coalesce(p_permissions->'release_management','false'::jsonb)='true'::jsonb,
    'privacy_management',coalesce(p_permissions->'privacy_management','false'::jsonb)='true'::jsonb
  );
  v_changed boolean:=false;
  v_action text;
begin
  if not public.is_language_miner_owner() then raise exception 'Master owner access required' using errcode='42501'; end if;
  if p_user_id is null then raise exception 'Select a player account' using errcode='22023'; end if;
  if p_user_id=v_actor then raise exception 'The master owner account cannot be changed here' using errcode='22023'; end if;
  if p_permissions is null or jsonb_typeof(p_permissions)<>'object' then raise exception 'Administrator permissions must be an object' using errcode='22023'; end if;
  select * into v_target from auth.users where id=p_user_id;
  if not found then raise exception 'Player account not found' using errcode='P0002'; end if;
  select a.role,a.permissions into v_previous_role,v_previous_permissions from public.app_admins a where a.user_id=p_user_id for update;
  if v_previous_role='owner' then raise exception 'The master owner account is protected' using errcode='42501'; end if;

  if coalesce(p_enabled,false) then
    if v_previous_role is distinct from 'admin' or coalesce(v_previous_permissions,'{}'::jsonb) is distinct from v_clean then
      insert into public.app_admins(user_id,role,permissions) values(p_user_id,'admin',v_clean)
      on conflict(user_id) do update set role='admin',permissions=excluded.permissions;
      v_changed:=true;
      v_action:=case when v_previous_role='admin' then 'update_permissions' else 'grant_admin' end;
      insert into public.app_admin_access_events(actor_user_id,target_user_id,action,previous_role,new_role,previous_permissions,new_permissions)
      values(v_actor,p_user_id,v_action,v_previous_role,'admin',v_previous_permissions,v_clean);
    end if;
  else
    if v_previous_role='admin' then
      delete from public.app_admins where app_admins.user_id=p_user_id and role='admin';
      v_changed:=true;
      insert into public.app_admin_access_events(actor_user_id,target_user_id,action,previous_role,new_role,previous_permissions,new_permissions)
      values(v_actor,p_user_id,'revoke_admin','admin',null,v_previous_permissions,null);
    end if;
  end if;

  return query
    select v_target.id,coalesce(v_target.email,''),coalesce(nullif(s.display_name,''),v_target.raw_user_meta_data->>'display_name',split_part(coalesce(v_target.email,''),'@',1),'Player'),
      a.role,coalesce(a.permissions,'{}'::jsonb),v_changed
    from (select 1) x
    left join public.player_saves s on s.user_id=v_target.id
    left join public.app_admins a on a.user_id=v_target.id;
end;
$$;

create or replace function public.owner_list_admin_permission_events(p_limit integer default 40)
returns table (
  id bigint,
  actor_email text,
  target_email text,
  action text,
  previous_role text,
  new_role text,
  previous_permissions jsonb,
  new_permissions jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
begin
  if not public.is_language_miner_owner() then raise exception 'Master owner access required' using errcode='42501'; end if;
  return query
    select e.id,coalesce(actor.email,''),coalesce(target.email,''),e.action,e.previous_role,e.new_role,e.previous_permissions,e.new_permissions,e.created_at
    from public.app_admin_access_events e
    left join auth.users actor on actor.id=e.actor_user_id
    left join auth.users target on target.id=e.target_user_id
    order by e.created_at desc
    limit greatest(1,least(coalesce(p_limit,40),100));
end;
$$;

-- Replace global player administration checks with the specific privilege.
create or replace function public.admin_search_players(p_search text default '', p_limit integer default 50)
returns table (user_id uuid,display_name text,email text,revision bigint,updated_at timestamptz,admin_reset_at timestamptz,admin_reset_target text,player_level integer,current_language text)
language plpgsql security definer set search_path=public,auth
as $$
begin
  if not public.language_miner_admin_has_permission('player_management') then raise exception 'Player-management privilege required' using errcode='42501'; end if;
  return query select u.id,coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,''),'@',1),'Player'),coalesce(nullif(s.email,''),u.email,''),coalesce(s.revision,0),s.updated_at,s.admin_reset_at,s.admin_reset_target,greatest(1,coalesce((s.game_state->>'level')::integer,1)),coalesce(nullif(s.course_settings->>'learning',''),'ja')
  from auth.users u left join public.player_saves s on s.user_id=u.id
  where u.id<>(select auth.uid()) and (nullif(trim(coalesce(p_search,'')),'') is null or coalesce(u.email,'') ilike '%'||trim(p_search)||'%' or coalesce(s.display_name,'') ilike '%'||trim(p_search)||'%' or u.id::text ilike '%'||trim(p_search)||'%')
  order by coalesce(s.updated_at,u.created_at) desc limit least(greatest(coalesce(p_limit,50),1),100);
end;
$$;

create or replace function public.admin_get_player_save(p_user_id uuid)
returns table (user_id uuid,display_name text,email text,game_state jsonb,course_settings jsonb,revision bigint,updated_at timestamptz,admin_reset_at timestamptz,admin_reset_target text)
language plpgsql security definer set search_path=public,auth
as $$
begin
  if not public.language_miner_admin_has_permission('player_management') then raise exception 'Player-management privilege required' using errcode='42501'; end if;
  return query select u.id,coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,''),'@',1),'Player'),coalesce(nullif(s.email,''),u.email,''),coalesce(s.game_state,'{}'::jsonb),coalesce(s.course_settings,'{}'::jsonb),coalesce(s.revision,0),s.updated_at,s.admin_reset_at,s.admin_reset_target
  from auth.users u left join public.player_saves s on s.user_id=u.id where u.id=p_user_id and u.id<>(select auth.uid());
end;
$$;

create or replace function public.admin_update_player_save(p_user_id uuid,p_game_state jsonb,p_course_settings jsonb,p_target text,p_base_revision bigint)
returns table (accepted boolean,user_id uuid,display_name text,email text,game_state jsonb,course_settings jsonb,revision bigint,updated_at timestamptz,admin_reset_at timestamptz,admin_reset_target text)
language plpgsql security definer set search_path=public,auth
as $$
declare
  v_admin_id uuid:=(select auth.uid());v_existing public.player_saves%rowtype;v_saved public.player_saves%rowtype;v_user auth.users%rowtype;
begin
  if not public.language_miner_admin_has_permission('player_management') then raise exception 'Player-management privilege required' using errcode='42501'; end if;
  if p_user_id is null or p_user_id=v_admin_id then raise exception 'Select another player' using errcode='22023'; end if;
  select * into v_user from auth.users where id=p_user_id;if not found then raise exception 'Player account not found' using errcode='P0002'; end if;
  select * into v_existing from public.player_saves where player_saves.user_id=p_user_id for update;
  if found and v_existing.revision<>greatest(coalesce(p_base_revision,0),0) then
    return query select false,v_existing.user_id,v_existing.display_name,v_existing.email,v_existing.game_state,v_existing.course_settings,v_existing.revision,v_existing.updated_at,v_existing.admin_reset_at,v_existing.admin_reset_target;return;
  end if;
  insert into public.player_saves as saves(user_id,display_name,email,game_state,course_settings,revision,updated_at,admin_reset_at,admin_reset_by,admin_reset_target)
  values(p_user_id,coalesce(v_user.raw_user_meta_data->>'display_name',split_part(coalesce(v_user.email,''),'@',1),'Player'),coalesce(v_user.email,''),coalesce(p_game_state,'{}'::jsonb),coalesce(p_course_settings,'{}'::jsonb),1,now(),now(),v_admin_id,left(coalesce(p_target,'selected'),80))
  on conflict(user_id) do update set game_state=excluded.game_state,course_settings=excluded.course_settings,revision=saves.revision+1,updated_at=now(),admin_reset_at=now(),admin_reset_by=v_admin_id,admin_reset_target=excluded.admin_reset_target returning * into v_saved;
  return query select true,v_saved.user_id,v_saved.display_name,v_saved.email,v_saved.game_state,v_saved.course_settings,v_saved.revision,v_saved.updated_at,v_saved.admin_reset_at,v_saved.admin_reset_target;
end;
$$;

create or replace function public.admin_list_privacy_requests(p_status text default '',p_limit integer default 100)
returns table (id bigint,user_id uuid,email text,display_name text,request_type text,details text,status text,created_at timestamptz,updated_at timestamptz,admin_note text)
language plpgsql security definer set search_path=public,auth
as $$
begin
  if not public.language_miner_admin_has_permission('privacy_management') then raise exception 'Privacy-management privilege required' using errcode='42501'; end if;
  return query select r.id,r.user_id,coalesce(u.email,''),coalesce(s.display_name,u.raw_user_meta_data->>'display_name','Player'),r.request_type,r.details,r.status,r.created_at,r.updated_at,r.admin_note
  from public.privacy_requests r join auth.users u on u.id=r.user_id left join public.player_saves s on s.user_id=r.user_id
  where nullif(trim(coalesce(p_status,'')),'') is null or r.status=p_status order by r.created_at asc limit least(greatest(coalesce(p_limit,100),1),250);
end;
$$;

create or replace function public.admin_update_privacy_request(p_id bigint,p_status text,p_admin_note text default '')
returns table (id bigint,status text,updated_at timestamptz,completed_at timestamptz)
language plpgsql security definer set search_path=public
as $$
begin
  if not public.language_miner_admin_has_permission('privacy_management') then raise exception 'Privacy-management privilege required' using errcode='42501'; end if;
  if p_status not in ('received','in_review','completed','declined') then raise exception 'Invalid status' using errcode='22023'; end if;
  update public.privacy_requests r set status=p_status,admin_note=left(coalesce(p_admin_note,''),1200),updated_at=now(),completed_at=case when p_status in ('completed','declined') then now() else null end where r.id=p_id;
  return query select r.id,r.status,r.updated_at,r.completed_at from public.privacy_requests r where r.id=p_id;
end;
$$;

create or replace function public.admin_list_release_events(p_limit integer default 20)
returns table (id uuid,channel text,action text,version text,git_ref text,details jsonb,created_at timestamptz)
language plpgsql stable security definer set search_path=public
as $$
begin
  if not public.language_miner_admin_has_permission('release_management') then raise exception 'Release-management privilege required' using errcode='42501'; end if;
  return query select e.id,e.channel,e.action,e.version,e.git_ref,e.details,e.created_at from public.app_release_events e order by e.created_at desc limit greatest(1,least(coalesce(p_limit,20),100));
end;
$$;

revoke all on function public.language_miner_admin_has_permission(text) from public,anon;
revoke all on function public.get_my_language_miner_admin_identity() from public,anon;
revoke all on function public.owner_search_accounts_with_permissions(text,integer) from public,anon;
revoke all on function public.owner_list_admins_with_permissions() from public,anon;
revoke all on function public.owner_set_admin_permissions(uuid,jsonb,boolean) from public,anon;
revoke all on function public.owner_list_admin_permission_events(integer) from public,anon;
revoke all on function public.owner_set_admin_access(uuid,boolean) from authenticated;
grant execute on function public.language_miner_admin_has_permission(text) to authenticated;
grant execute on function public.get_my_language_miner_admin_identity() to authenticated;
grant execute on function public.owner_search_accounts_with_permissions(text,integer) to authenticated;
grant execute on function public.owner_list_admins_with_permissions() to authenticated;
grant execute on function public.owner_set_admin_permissions(uuid,jsonb,boolean) to authenticated;
grant execute on function public.owner_list_admin_permission_events(integer) to authenticated;

comment on column public.app_admins.permissions is
  'Owner-selected administrator privileges. The protected owner implicitly has every privilege.';

notify pgrst,'reload schema';
