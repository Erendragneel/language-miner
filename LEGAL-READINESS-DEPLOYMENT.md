# Legal-readiness deployment checklist

Build: v6.4.183

## Implemented in source

- Direct account creation requires a 13+ learner, adult/guardian, or educator role.
- No exact birth date is collected.
- Under-13 learners are directed to use an adult-managed flow; direct signup is blocked.
- Terms and Privacy acceptance is versioned in account metadata and `legal_consents`.
- Existing accounts must accept the current policy versions before continuing.
- A Privacy & Safety center provides data inventory, JSON export, privacy requests, and permanent deletion.
- Parent/Teacher links remain student-approved and read-only.
- Parent/Teacher gradebook reports expose only whitelisted learning summaries, assessment history, lesson mastery, active study time, and streak data.
- Educational-framework and non-affiliation disclaimers are visible.
- Privacy Policy, Terms, third-party notices, asset register, claims register, and preliminary mark screen are included.
- In-game release controls require a verified `app_admins` account, keep deployment credentials server-side, accept only reviewed Git refs, and write an audit event for every release action.
- Administrator assignment is reserved to the single server-verified owner role, prevents browser table writes and owner self-demotion, and writes a private access audit event for every successful grant or revocation.

## Required Supabase deployment

From the configured Supabase project directory:

```text
supabase db push
supabase functions deploy account-delete
supabase functions deploy admin-release-deploy
```

`supabase db push` must include `202608240001_repair_cross_device_parent_teacher_linking.sql`, `202608240002_admin_release_control.sql`, and `202608240003_owner_master_admin_controls.sql`. They install repaired linking, guarded releases, and owner-only administrator assignment. See `CROSS-DEVICE-LINKING-DEPLOYMENT.md`, `ADMIN-UPDATE-GUARDIAN-SETUP.md`, and `OWNER-MASTER-CONTROLS-SETUP.md` for setup details.

The deletion function requires the standard project `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets available to Supabase Edge Functions. Confirm that authenticated calls can delete only the caller's own account.

## Required operator details before public launch

- Replace the policy placeholder with a working privacy/business contact and the operator's correct legal identity.
- Confirm the countries and ages the service will support with privacy counsel.
- If under-13 accounts will be offered, build and independently review a verifiable-parental-consent workflow before enabling them.
- Complete all `HOLD` items in `ASSET-PROVENANCE.md`.
- Have counsel approve the Privacy Policy, Terms, child-directed design, subscription disclosures, and trademark clearance.
- Test export, request submission, account deletion, data retention, backups, and service-provider deletion in production.
- Publish only claims allowed by `EDUCATIONAL-CLAIMS-REGISTER.md` unless new substantiation is documented.

## Privacy request operations

An administrator can use the RPCs from the legal migration to list and update privacy requests. Establish an internal response owner, identity-verification procedure, response deadline, deletion log, and backup-retention schedule before launch.
