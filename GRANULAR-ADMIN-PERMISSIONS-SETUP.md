# Granular Administrator Privileges setup

Language Miner v6.4.179 lets the protected master owner choose exactly which tools each administrator can use.

## One-time Supabase installation

Run the migrations in date order in Supabase **SQL Editor**. If the owner migration is already installed, only the second file is new:

```text
supabase/migrations/202608240003_owner_master_admin_controls.sql
supabase/migrations/202608240004_granular_admin_permissions.sql
```

The new migration adds the `permissions` object to `app_admins`, keeps existing administrators working during the upgrade, installs owner-only permission RPCs, and replaces protected player, privacy, and release-history checks with privilege-specific checks.

Redeploy the updated release Edge Function so deployment requests use the same rule:

```text
supabase functions deploy admin-release-deploy
```

Do not put Supabase service-role keys, passwords, tokens, or GitHub deployment secrets in the game files.

## Assigning privileges

1. Sign in with the one master owner account.
2. Open **Admin → Owner Master Controls**.
3. Search for a registered account.
4. Choose **Configure & Grant Admin**, select the allowed privileges, then save.
5. For an existing administrator, choose **Edit Privileges** and save the revised checklist.
6. Use **Revoke Admin** to remove the admin title and every privilege.

An admin can be assigned any combination of:

- **Economy** — Nuggets and gems.
- **Hearts & Health** — heart restoration, max hearts, and infinite hearts.
- **Course Progression** — stage changes, kana mastery, and content unlocks.
- **Cosmetics & Supplies** — pickaxes, hints, and shields.
- **Save & Profile Resets** — the administrator's own save export/import/reset tools.
- **Player Management** — global player search and selected-player progress resets.
- **Game Updates** — reviewed Git releases, feature flags, and rollbacks.
- **Privacy Requests** — protected privacy-request review and resolution.

The owner always has all eight privileges. Owner authority cannot be edited inside the game.

## Security behavior

The game hides unassigned sections and rejects their actions. Sensitive Supabase RPCs and the release Edge Function also verify the exact assigned privilege on the server. Direct writes to `app_admins` remain unavailable to browser accounts, and every access change is written to the protected audit history.
