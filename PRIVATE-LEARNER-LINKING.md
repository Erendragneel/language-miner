# Private learner linking

Implemented in the development workspace on October 4, 2026. The v6.4.288 web release includes this migration and deployment documentation, but retains the existing account-linking client until database access is available. The new feature is not deployed to the live database or included in the previously built Android bundle.

## Player flow

1. The learner opens Parent/Teacher Center → Manage access → Create invitation.
2. The game shows a persistent unique gamer tag and a private invitation code. The learner shares both with their intended parent or teacher.
3. The adult opens Link student and enters both. No learner email is requested or displayed.
4. The learner approves or declines the request from their own account. Progress is unavailable until approval. Either participant can remove the link; the learner can revoke access.

The gamer tag is a separate generated linking identity (`Miner#` plus a unique suffix); existing display names and account IDs are preserved. This prevents duplicate player names from selecting the wrong account. There is no public student search directory.

## Controls

- Codes are generated on the server, stored only as SHA-256 hashes, expire after 15 minutes, and work once. Generating a replacement invalidates the previous code. Cancellation is available before use.
- Failed attempts return the same empty result and count toward a limit of 20 attempts per authenticated account per 15 minutes. The client gives a generic recovery message.
- Request creation and code consumption occur in one database transaction with a row lock. An invitation never bypasses the existing approval checks.
- Invitation tables have row-level security and no direct client table grants. Only authenticated, restricted RPCs provide access.
- The legacy email-lookup RPC loses client execution permission. Link-list responses keep their old shape for compatibility but return empty email fields. The progress RPC uses the gamer tag instead of an email-derived name.
- Codes are held in page memory, not local storage; cleared after successful submission or profile change. A page reload requires a new code. Existing approved links survive migration.
- Local profile linking remains available without email. Online registration still requires email; this is not an email-free online account system.

## Deployment

Apply `supabase/migrations/202610040001_private_gamer_linking.sql` to the existing Supabase project before publishing the updated client. It depends on the installed parent/teacher linking and gradebook RPCs. The migration verifies the deployed progress-name expression before replacing it; an unexpected definition aborts the entire transaction for inspection rather than replacing custom progress protections. Test on staging first.

Older clients that attempt email linking will need to update after this migration. Do not restore the old email RPC grant as a compatibility workaround. Rebuild and verify the Android bundle after staging approval. No production deployment was attempted from this task because no database connection was available.

## Tests

- `tests/private-linking-database.test.cjs`: actual PostgreSQL execution using PGlite 0.5.8; migration, permission checks, no email disclosure, pending/approved/revoked access, self-link rejection, single-use codes, rotation, cancellation, expiry, rate limiting, and recovery after its window.
- `tests/private-linking-browser.test.cjs`: Edge at a 390-pixel viewport using mocked cloud responses and the real account/center scripts; create/cancel invitation, tag/code request, no email input or request payload, pending receipt, no persisted code, invalid input rejection, and mobile fit.

Run with Node. Set `PLAYWRIGHT_MODULE` and `PGLITE_MODULE` to installed copies of Playwright and `@electric-sql/pglite` if they are not on the default module path. The database test also accepts the task-local copy under `work/private-linking-deps/package/dist/index.cjs`. PGlite uses the documented [query and exec API](https://pglite.dev/docs/).

These are local tests, not a live Supabase, concurrent-connection, physical Android, or legal compliance certification. New interface copy also needs the pending language-review pass.

## Remaining account work

Children without email currently can use local profiles, but cannot create an email-free cross-device account through the existing registration screen. A separate parent/school-managed enrollment and recovery design is still needed: trusted provisioning, child login credentials, authorized account recovery, and transfer/removal of school management. No fake child emails or weakened sign-in checks were introduced.
