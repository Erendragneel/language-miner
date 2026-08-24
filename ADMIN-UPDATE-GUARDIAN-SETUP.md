# Admin Update Guardian setup

Language Miner v6.4.179 includes the guarded release system. The master owner and an administrator specifically assigned the **Game Updates** privilege can use **Admin → Admin Update Center** to deploy a reviewed Git branch, tag, or commit; publish small non-executable feature flags; mark a release stable; or redeploy the previous approved release. Only the owner can grant, revoke, or change administrator privileges.

This is intentionally not a raw code editor. The game never accepts pasted JavaScript, HTML, SQL, binaries, or deployment credentials. New code must first be reviewed and committed to Git. That boundary prevents a stolen admin session or typing mistake from turning the player-facing game into a remote-code executor.

## What the browser guardian does

- Downloads the complete app shell and verifies critical files before a service worker can install.
- Keeps the current and previous verified caches instead of immediately deleting the previous build.
- Does not replace files inside an active quiz or test. A reload is required to enter a new build.
- Runs startup and runtime health checks, records a limited local error history, and offers device rollback after repeated boot failures.
- Saves local recovery copies of gameplay keys in IndexedDB and restores only malformed save entries. Authentication tokens are never copied.
- Polls the public release record for predefined, non-executable feature flags.

It cannot automatically invent a correct fix for every future bug. Unknown bugs still require diagnosis, review, testing, and a new Git commit.

## One-time Supabase setup

1. In Supabase **SQL Editor**, run `supabase/migrations/202608240002_admin_release_control.sql`.
2. Deploy the Edge Function:

   ```text
   supabase functions deploy admin-release-deploy
   ```

3. Add these secrets under **Project Settings → Edge Functions → Secrets**:

   ```text
   GITHUB_DEPLOY_TOKEN=your_fine_grained_token
   GITHUB_REPOSITORY=owner/repository
   GITHUB_WORKFLOW_ID=deploy-language-miner.yml
   GITHUB_WORKFLOW_REF=main
   ```

   Keep the existing `APP_URL`, `ALLOWED_ORIGINS`, `SUPABASE_URL`, and service-role configuration.

4. Use a fine-grained GitHub token limited to the one Language Miner repository with **Actions: Read and write** and **Contents: Read-only**. Store it only as a Supabase Edge Function secret—never in the game, ZIP, GitHub source, screenshot, or chat.
5. Commit `.github/workflows/deploy-language-miner.yml` to the default branch and enable GitHub Pages through **GitHub Actions**.
6. In Owner Master Controls, confirm every person who should deploy has **Game Updates** checked. Removing that privilege or revoking the admin immediately blocks protected deployment requests.

## Releasing safely

1. Build and test a new version in Git.
2. Open the in-game Admin panel and find **Admin Update Center**.
3. Enter the exact version and reviewed branch, tag, or commit, plus release notes. `GITHUB_WORKFLOW_REF` identifies the trusted branch that owns the deployment workflow; `source_ref` identifies the reviewed code to publish.
4. Select **Deploy Approved Build** and confirm.
5. GitHub validates required files and JavaScript syntax before publishing the Pages artifact.
6. Test the hosted game, then select **Mark Current Build Stable**.
7. If the release is bad, use **Global Rollback** to redeploy the stored previous Git ref. Use **Rollback This Device** only for the current browser's cached copy.

## Feature flags

Feature flags must be one flat JSON object with at most 40 entries. Values can only be strings, finite numbers, booleans, or `null`:

```json
{
  "arcade.crystalRush": true,
  "settlements.maxDailyJobs": 3,
  "announcement": "New practice event"
}
```

Game code must already know what a flag means. A flag cannot install new code by itself.

## Recovery and privacy

Guardian recovery information stays on the player's device. It includes the build number, short error summaries, and protected gameplay-save keys. It excludes passwords, Supabase tokens, Patreon credentials, and browser cookies. No automatic error telemetry is transmitted by v6.4.177.
