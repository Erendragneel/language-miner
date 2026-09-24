BEGIN;
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
    select u.id,coalesce(u.email,'')::text,coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,'')::text,'@',1),'Player'),a.role,coalesce(a.permissions,'{}'::jsonb),u.created_at
    from auth.users u
    left join public.player_saves s on s.user_id=u.id
    left join public.app_admins a on a.user_id=u.id
    where v_search='' or lower(coalesce(u.email,'')::text) like '%'||v_search||'%' or lower(coalesce(s.display_name,u.raw_user_meta_data->>'display_name','')) like '%'||v_search||'%'
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
    select a.user_id,coalesce(u.email,'')::text,coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,'')::text,'@',1),'Player'),a.role,coalesce(a.permissions,'{}'::jsonb),a.created_at
    from public.app_admins a
    join auth.users u on u.id=a.user_id
    left join public.player_saves s on s.user_id=a.user_id
    order by case when a.role='owner' then 0 else 1 end,a.created_at asc;
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
    select e.id,coalesce(actor.email,'')::text,coalesce(target.email,'')::text,e.action,e.previous_role,e.new_role,e.previous_permissions,e.new_permissions,e.created_at
    from public.app_admin_access_events e
    left join auth.users actor on actor.id=e.actor_user_id
    left join auth.users target on target.id=e.target_user_id
    order by e.created_at desc
    limit greatest(1,least(coalesce(p_limit,40),100));
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
    'alpha_tester',coalesce(p_permissions->'alpha_tester','false'::jsonb)='true'::jsonb,
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
  if coalesce(p_permissions->'alpha_tester','false'::jsonb)='true'::jsonb then
    v_clean=jsonb_build_object('alpha_tester',true,'economy',false,'health',true,'progression',true,'cosmetics',true,'profile_resets',false,'player_management',false,'release_management',false,'privacy_management',false);
  end if;
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
      on conflict on constraint app_admins_pkey do update set role='admin',permissions=excluded.permissions;
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
    select v_target.id,coalesce(v_target.email,'')::text,coalesce(nullif(s.display_name,''),v_target.raw_user_meta_data->>'display_name',split_part(coalesce(v_target.email,'')::text,'@',1),'Player'),
      a.role,coalesce(a.permissions,'{}'::jsonb),v_changed
    from (select 1) x
    left join public.player_saves s on s.user_id=v_target.id
    left join public.app_admins a on a.user_id=v_target.id;
end;
$$;
NOTIFY pgrst,'reload schema';
COMMIT;
