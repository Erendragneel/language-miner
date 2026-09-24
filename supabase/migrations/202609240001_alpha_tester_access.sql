-- Alpha Tester is an owner-assigned access preset on a protected admin record.
-- No existing account is enrolled by this migration. No subscription is created.
BEGIN;

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
    select v_target.id,coalesce(v_target.email,''),coalesce(nullif(s.display_name,''),v_target.raw_user_meta_data->>'display_name',split_part(coalesce(v_target.email,''),'@',1),'Player'),
      a.role,coalesce(a.permissions,'{}'::jsonb),v_changed
    from (select 1) x
    left join public.player_saves s on s.user_id=v_target.id
    left join public.app_admins a on a.user_id=v_target.id;
end;
$$;


create or replace function public.owner_set_alpha_tester_access(p_user_id uuid,p_enabled boolean default true)
returns table(user_id uuid,email text,display_name text,admin_role text,admin_permissions jsonb,changed boolean)
language sql security definer set search_path=public,auth
as $$
 select * from public.owner_set_admin_permissions(p_user_id,jsonb_build_object('alpha_tester',true),p_enabled);
$$;
revoke all on function public.owner_set_alpha_tester_access(uuid,boolean) from public,anon;
grant execute on function public.owner_set_alpha_tester_access(uuid,boolean) to authenticated;

-- Enforce the fixed allow-list even if a future service-side edit adds other flags.
create or replace function public.language_miner_admin_has_permission(p_permission text)
returns boolean language sql stable security definer set search_path=public
as $$
 select exists(select 1 from public.app_admins a where a.user_id=(select auth.uid()) and
 (a.role='owner' or (a.role='admin' and
 case when coalesce(a.permissions->'alpha_tester','false'::jsonb)='true'::jsonb
 then p_permission in ('health','progression','cosmetics')
 else p_permission in ('economy','health','progression','cosmetics','profile_resets','player_management','release_management','privacy_management')
 and coalesce(a.permissions->p_permission,'false'::jsonb)='true'::jsonb end)));
$$;
NOTIFY pgrst, 'reload schema';
COMMIT;
