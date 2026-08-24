-- Language Miner v6.4.178: one protected owner and owner-only admin assignment.
-- The earliest existing owner remains the master owner; other legacy owner rows
-- are safely downgraded to regular administrators before uniqueness is enforced.

alter table public.app_admins alter column role set default 'admin';

do $$
declare
  v_owner uuid;
begin
  select a.user_id into v_owner
  from public.app_admins a
  order by case when a.role='owner' then 0 else 1 end, a.created_at asc, a.user_id asc
  limit 1;

  if v_owner is not null then
    update public.app_admins set role='admin' where role='owner' and user_id<>v_owner;
    update public.app_admins set role='owner' where user_id=v_owner;
  end if;
end;
$$;

create unique index if not exists app_admins_single_owner_idx
  on public.app_admins ((role)) where role='owner';

create table if not exists public.app_admin_access_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('grant_admin','revoke_admin')),
  previous_role text,
  new_role text,
  created_at timestamptz not null default now()
);

create index if not exists app_admin_access_events_created_idx
  on public.app_admin_access_events(created_at desc);

alter table public.app_admin_access_events enable row level security;
revoke all on public.app_admin_access_events from public,anon,authenticated;

create or replace function public.is_language_miner_owner()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists (
    select 1 from public.app_admins
    where user_id=(select auth.uid()) and role='owner'
  );
$$;

create or replace function public.get_my_language_miner_admin_role()
returns table (role text)
language sql
stable
security definer
set search_path=public
as $$
  select a.role from public.app_admins a where a.user_id=(select auth.uid()) limit 1;
$$;

create or replace function public.owner_search_accounts(p_search text default '',p_limit integer default 30)
returns table (
  user_id uuid,
  email text,
  display_name text,
  admin_role text,
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
    select u.id,coalesce(u.email,''),coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,''),'@',1),'Player'),a.role,u.created_at
    from auth.users u
    left join public.player_saves s on s.user_id=u.id
    left join public.app_admins a on a.user_id=u.id
    where v_search='' or lower(coalesce(u.email,'')) like '%'||v_search||'%' or lower(coalesce(s.display_name,u.raw_user_meta_data->>'display_name','')) like '%'||v_search||'%'
    order by case when a.role='owner' then 0 when a.role='admin' then 1 else 2 end,coalesce(s.display_name,u.raw_user_meta_data->>'display_name',u.email,'')
    limit greatest(1,least(coalesce(p_limit,30),100));
end;
$$;

create or replace function public.owner_list_admins()
returns table (
  user_id uuid,
  email text,
  display_name text,
  admin_role text,
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
    select a.user_id,coalesce(u.email,''),coalesce(nullif(s.display_name,''),u.raw_user_meta_data->>'display_name',split_part(coalesce(u.email,''),'@',1),'Player'),a.role,a.created_at
    from public.app_admins a
    join auth.users u on u.id=a.user_id
    left join public.player_saves s on s.user_id=a.user_id
    order by case when a.role='owner' then 0 else 1 end,a.created_at asc;
end;
$$;

create or replace function public.owner_set_admin_access(p_user_id uuid,p_enabled boolean)
returns table (
  user_id uuid,
  email text,
  display_name text,
  admin_role text,
  changed boolean
)
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_actor uuid:=(select auth.uid());
  v_target auth.users%rowtype;
  v_previous text;
  v_changed boolean:=false;
begin
  if not public.is_language_miner_owner() then raise exception 'Master owner access required' using errcode='42501'; end if;
  if p_user_id is null then raise exception 'Select a player account' using errcode='22023'; end if;
  if p_user_id=v_actor then raise exception 'The master owner account cannot be changed here' using errcode='22023'; end if;
  select * into v_target from auth.users where id=p_user_id;
  if not found then raise exception 'Player account not found' using errcode='P0002'; end if;
  select a.role into v_previous from public.app_admins a where a.user_id=p_user_id for update;
  if v_previous='owner' then raise exception 'The master owner account is protected' using errcode='42501'; end if;

  if coalesce(p_enabled,false) then
    if v_previous is distinct from 'admin' then
      insert into public.app_admins(user_id,role) values(p_user_id,'admin')
      on conflict(user_id) do update set role='admin';
      v_changed:=true;
      insert into public.app_admin_access_events(actor_user_id,target_user_id,action,previous_role,new_role)
      values(v_actor,p_user_id,'grant_admin',v_previous,'admin');
    end if;
  else
    if v_previous='admin' then
      delete from public.app_admins where app_admins.user_id=p_user_id and role='admin';
      v_changed:=true;
      insert into public.app_admin_access_events(actor_user_id,target_user_id,action,previous_role,new_role)
      values(v_actor,p_user_id,'revoke_admin','admin',null);
    end if;
  end if;

  return query
    select v_target.id,coalesce(v_target.email,''),coalesce(nullif(s.display_name,''),v_target.raw_user_meta_data->>'display_name',split_part(coalesce(v_target.email,''),'@',1),'Player'),
      (select a.role from public.app_admins a where a.user_id=v_target.id),v_changed
    from (select 1) x left join public.player_saves s on s.user_id=v_target.id;
end;
$$;

create or replace function public.owner_list_admin_access_events(p_limit integer default 40)
returns table (
  id bigint,
  actor_email text,
  target_email text,
  action text,
  previous_role text,
  new_role text,
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
    select e.id,coalesce(actor.email,''),coalesce(target.email,''),e.action,e.previous_role,e.new_role,e.created_at
    from public.app_admin_access_events e
    left join auth.users actor on actor.id=e.actor_user_id
    left join auth.users target on target.id=e.target_user_id
    order by e.created_at desc
    limit greatest(1,least(coalesce(p_limit,40),100));
end;
$$;

revoke all on function public.is_language_miner_owner() from public,anon;
revoke all on function public.get_my_language_miner_admin_role() from public,anon;
revoke all on function public.owner_search_accounts(text,integer) from public,anon;
revoke all on function public.owner_list_admins() from public,anon;
revoke all on function public.owner_set_admin_access(uuid,boolean) from public,anon;
revoke all on function public.owner_list_admin_access_events(integer) from public,anon;
grant execute on function public.is_language_miner_owner() to authenticated;
grant execute on function public.get_my_language_miner_admin_role() to authenticated;
grant execute on function public.owner_search_accounts(text,integer) to authenticated;
grant execute on function public.owner_list_admins() to authenticated;
grant execute on function public.owner_set_admin_access(uuid,boolean) to authenticated;
grant execute on function public.owner_list_admin_access_events(integer) to authenticated;

comment on table public.app_admins is
  'One protected Language Miner master owner plus owner-assigned administrators. Direct browser writes remain forbidden.';

notify pgrst,'reload schema';
