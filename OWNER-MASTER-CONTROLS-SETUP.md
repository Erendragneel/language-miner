# Owner Master Controls setup

Language Miner v6.4.179 separates the protected **master owner** from ordinary **administrators** and lets the owner assign granular privileges.

## Authority model

- Exactly one `app_admins` account has the `owner` role.
- The owner has all administrator capabilities plus the exclusive ability to search registered accounts, grant administrator access, select individual privileges, revoke administrator access, and read the administrator-access audit history.
- Administrators can use only the individual controls selected by the owner.
- Administrators cannot grant access, revoke access, promote another owner, demote the owner, or view the Owner Master Controls.
- The owner cannot be changed or deleted through the game. An ownership recovery or transfer must be performed deliberately in Supabase SQL Editor.
- Every successful grant, revocation, and privilege change is written to `app_admin_access_events`.

## One-time deployment

Run this migration in the connected Supabase project:

```text
supabase/migrations/202608240003_owner_master_admin_controls.sql
```

Then run the granular privilege migration:

```text
supabase/migrations/202608240004_granular_admin_permissions.sql
```

The migration changes the default role for future rows from `owner` to `admin`. It preserves the earliest existing administrator row as the one master owner and converts any accidental extra legacy owner rows to regular administrators.

Verify the selected owner in Supabase SQL Editor:

```sql
select a.user_id,u.email,a.role,a.created_at
from public.app_admins a
join auth.users u on u.id=a.user_id
order by case when a.role='owner' then 0 else 1 end,a.created_at;
```

If `app_admins` was empty, bootstrap the owner once with the real owner account email:

```sql
insert into public.app_admins(user_id,role)
select id,'owner' from auth.users where lower(email)=lower('OWNER_ACCOUNT_EMAIL')
on conflict(user_id) do update set role='owner';
```

Do not put the owner's email, user ID, password, Supabase service-role key, or access token in game source files.

## Assigning administrators

1. Sign in with the owner account.
2. Open **Admin**.
3. In **Owner Master Controls**, search by the registered player's name or account email.
4. Select **Configure & Grant Admin**, check exactly the privileges that person should receive, and confirm.
5. The new administrator should sign out and sign back in, or restart the app, to refresh the visible Admin button.
6. Use **Edit Privileges** to change an administrator without removing the title, or **Revoke Admin** to remove every privilege. Server-protected actions are denied immediately; the visible interface refreshes when that account reloads its role or restarts.

The local preview demonstrates the interface without changing a live account. Real assignments require the migration and a signed-in Supabase owner account.

## Ownership recovery or transfer

The in-game interface intentionally cannot transfer master ownership. If transfer is ever necessary, use Supabase SQL Editor while authenticated as the project operator:

```sql
begin;
update public.app_admins set role='admin' where role='owner';
update public.app_admins set role='owner'
where user_id=(select id from auth.users where lower(email)=lower('NEW_OWNER_ACCOUNT_EMAIL'));
commit;
```

Confirm that exactly one owner remains before closing SQL Editor.
