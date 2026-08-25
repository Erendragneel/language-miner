# Cross-device account-linking deployment

Language Miner v6.4.176 includes the client repair and the required database repair. The database migration must be run once on the Supabase project used by the published game; uploading the website files alone cannot create server-side functions.

## Supabase Dashboard method

1. Sign in to the Supabase project used by Language Miner.
2. Open **SQL Editor** and choose **New query**.
3. Open and run `supabase/migrations/202608240001_repair_cross_device_parent_teacher_linking.sql`, then run `supabase/migrations/202608250001_verified_parent_teacher_delivery.sql` so repeated requests receive a current server-confirmed delivery receipt.
4. Choose **Run** and confirm that the query finishes without an error.
5. Upload the complete v6.4.176 game build.

The migration is idempotent: it can safely repair a project where the table already exists, reinstalls all five authenticated functions, preserves existing links, adds lookup indexes, retains read-only learner-data filtering, and tells PostgREST to reload its schema.

## Two-account verification

1. Sign in to two different Language Miner online accounts on separate devices.
2. On the adult/teacher account, open **Parent/Teacher Center → Link student**, enter the learner account's exact sign-in email, and send the request.
3. Confirm that the adult immediately sees the learner under **Learners you requested — Awaiting approval**.
4. On the learner's device, reopen or refresh the Parent/Teacher Center. Confirm that the persistent request banner names the adult and offers **Approve** and **Decline**. The optional **Enable phone alerts** control can also be used in an installed app or supported browser.
5. Approve it. The learner should move into the adult's linked-learner list and the read-only gradebook should load.

Only the two authenticated accounts can list their link record. Learning progress remains unavailable until the learner approves the pending request.
