-- Repair the ambiguous ON CONFLICT target in the live student-link RPC.
-- Preserves the live function's existing security, checks, grants and behavior.
-- Does not create requests or modify student progress or existing links.
begin;
do $repair$
declare
  function_sql text;
  repaired_sql text;
  conflict_pattern constant text := 'on\s+conflict\s*\(\s*adult_user_id\s*,\s*student_user_id\s*\)';
begin
  if not exists (
    select 1 from pg_constraint as c
    where c.conrelid = 'public.parent_teacher_links'::regclass
      and c.conname = 'parent_teacher_links_unique_pair'
      and c.contype = 'u'
  ) then
    raise exception 'Expected unique link constraint is missing; no change applied.';
  end if;
  select pg_get_functiondef('public.request_student_link(text)'::regprocedure)
    into function_sql;
  if function_sql ~* 'on\s+conflict\s+on\s+constraint\s+parent_teacher_links_unique_pair' then
    raise notice 'Student-link conflict target is already repaired.';
    return;
  end if;
  if function_sql !~* conflict_pattern then
    raise exception 'Unexpected live function definition; inspect before applying a repair.';
  end if;
  repaired_sql := regexp_replace(function_sql, conflict_pattern,
    'on conflict on constraint parent_teacher_links_unique_pair', 'gi');
  execute repaired_sql;
end;
$repair$;
notify pgrst, 'reload schema';
commit;
select pg_get_functiondef('public.request_student_link(text)'::regprocedure)
  ~* 'on\s+conflict\s+on\s+constraint\s+parent_teacher_links_unique_pair'
  as student_link_conflict_fixed;
