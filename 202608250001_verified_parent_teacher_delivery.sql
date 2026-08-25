-- Language Miner v6.4.184
-- Refresh pending learner-link requests and make every successful RPC return
-- the exact durable row that the recipient will read from Supabase.

create table if not exists public.parent_teacher_links (
  id uuid primary key default gen_random_uuid(),
  adult_user_id uuid not null references auth.users(id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint parent_teacher_links_different_accounts check (adult_user_id <> student_user_id),
  constraint parent_teacher_links_unique_pair unique (adult_user_id, student_user_id)
);

create index if not exists parent_teacher_links_student_status_idx
  on public.parent_teacher_links (student_user_id, status, updated_at desc);
create index if not exists parent_teacher_links_adult_status_idx
  on public.parent_teacher_links (adult_user_id, status, updated_at desc);

alter table public.parent_teacher_links enable row level security;
revoke all on table public.parent_teacher_links from public, anon, authenticated;

create or replace function public.request_student_link(p_student_email text)
returns table (
  id uuid,
  adult_user_id uuid,
  student_user_id uuid,
  status text,
  requested_at timestamptz,
  responded_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_adult_id uuid := (select auth.uid());
  v_student_id uuid;
  v_link public.parent_teacher_links%rowtype;
begin
  if v_adult_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select users.id into v_student_id
  from auth.users as users
  where lower(trim(coalesce(users.email, ''))) = lower(trim(coalesce(p_student_email, '')))
  limit 1;

  if v_student_id is null then
    raise exception 'No learner account matches that exact email address' using errcode = 'P0002';
  end if;
  if v_student_id = v_adult_id then
    raise exception 'Use a different learner account' using errcode = '22023';
  end if;

  insert into public.parent_teacher_links as links
    (adult_user_id, student_user_id, status, requested_at, responded_at, updated_at)
  values (v_adult_id, v_student_id, 'pending', now(), null, now())
  on conflict (adult_user_id, student_user_id) do update set
    -- An approved connection stays approved. Pending or declined requests are
    -- refreshed so the recipient receives a new, current request timestamp.
    status = case when links.status = 'approved' then 'approved' else 'pending' end,
    requested_at = case when links.status = 'approved' then links.requested_at else now() end,
    responded_at = case when links.status = 'approved' then links.responded_at else null end,
    updated_at = now()
  returning * into v_link;

  if v_link.id is null then
    raise exception 'The learner request was not saved' using errcode = 'P0001';
  end if;

  return query select v_link.id, v_link.adult_user_id, v_link.student_user_id,
    v_link.status, v_link.requested_at, v_link.responded_at;
end;
$$;

revoke all on function public.request_student_link(text) from public, anon;
grant execute on function public.request_student_link(text) to authenticated;

notify pgrst, 'reload schema';
