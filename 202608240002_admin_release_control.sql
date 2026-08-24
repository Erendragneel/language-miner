-- Language Miner v6.4.177: reviewed admin releases and non-executable feature flags.
-- This intentionally does not provide an arbitrary SQL, JavaScript, or HTML executor.

create table if not exists public.app_release_control (
  channel text primary key check (channel ~ '^[a-z][a-z0-9-]{0,31}$'),
  current_version text not null default '6.4.177',
  current_ref text not null default 'main',
  previous_version text,
  previous_ref text,
  rollout_status text not null default 'unconfigured'
    check (rollout_status in ('unconfigured','deploying','active','rolling_back','paused','failed')),
  feature_flags jsonb not null default '{}'::jsonb check (jsonb_typeof(feature_flags) = 'object'),
  notes text not null default '',
  revision bigint not null default 0 check (revision >= 0),
  requested_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz,
  stable_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_release_events (
  id uuid primary key default gen_random_uuid(),
  channel text not null references public.app_release_control(channel) on delete cascade,
  action text not null check (action in ('deploy','rollback','feature_flags','mark_stable','pause','failure')),
  version text,
  git_ref text,
  requested_by uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_release_events_channel_created_idx
  on public.app_release_events(channel, created_at desc);

alter table public.app_release_control enable row level security;
alter table public.app_release_events enable row level security;
revoke all on public.app_release_control from public, anon, authenticated;
revoke all on public.app_release_events from public, anon, authenticated;

insert into public.app_release_control(channel,current_version,current_ref,rollout_status,notes)
values ('stable','6.4.177','main','unconfigured','Configure the reviewed GitHub deployment workflow before the first in-game release.')
on conflict (channel) do nothing;

create or replace function public.get_app_release_control(p_channel text default 'stable')
returns table (
  channel text,
  current_version text,
  rollout_status text,
  feature_flags jsonb,
  revision bigint,
  requested_at timestamptz,
  stable_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select r.channel,r.current_version,r.rollout_status,r.feature_flags,r.revision,r.requested_at,r.stable_at,r.updated_at
  from public.app_release_control r
  where r.channel = coalesce(nullif(trim(p_channel),''),'stable')
  limit 1;
$$;

create or replace function public.admin_list_release_events(p_limit integer default 20)
returns table (
  id uuid,
  channel text,
  action text,
  version text,
  git_ref text,
  details jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_language_miner_admin() then
    raise exception 'Administrator access required';
  end if;
  return query
    select e.id,e.channel,e.action,e.version,e.git_ref,e.details,e.created_at
    from public.app_release_events e
    order by e.created_at desc
    limit greatest(1,least(coalesce(p_limit,20),100));
end;
$$;

revoke all on function public.get_app_release_control(text) from public;
grant execute on function public.get_app_release_control(text) to anon, authenticated;
revoke all on function public.admin_list_release_events(integer) from public, anon;
grant execute on function public.admin_list_release_events(integer) to authenticated;

notify pgrst, 'reload schema';
