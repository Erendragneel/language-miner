# Source controls and release-readiness checklist

Reviewed: 2026-10-14. This replaces the historical v6.4.184 checklist. The prepared website publication is v6.4.291; the separately verified signed Android candidate is v6.4.289-play.11. These are different distribution configurations. This source checklist is not a legal opinion, operator-identity verification, or Google approval.

## What the source establishes

- The website signup UI rejects the under-13 category and requires an eligible learner, adult/guardian, or educator category plus policy acknowledgement. It records an age category rather than an exact birth date. Self-selection is not verified age assurance or verifiable parental consent.
- The legal client includes policy-version checks, data export, privacy requests and signed-in deletion requests. Attempted cloud reads during export can fail. Source presence does not establish complete production exports or deletion across providers and backups.
- Legal SQL declares consent/request tables, row-level security and authenticated request functions. Its signup trigger records eligible metadata but returns the new account unchanged when metadata is ineligible or missing. It does not itself reject all bypassed account-creation requests.
- The deletion function source authenticates the caller, requires DELETE confirmation, and targets that caller's user ID. Actual deployment, service configuration and provider retention require separate verification.
- Independent practice and non-certification notices appear in maps. See EDUCATIONAL-CLAIMS-REGISTER.md for claims supported within their actual scope.
- Parent/Teacher and administration features have separate setup records. Source presence does not establish correct production authorization or policy accuracy. The protected owner role is an access-control role, not proof of the legal operator's identity.
- Android staging removes website cloud signup, Patreon and Discord flows. Billing is disabled until the purchase-verification endpoint is configured. Inspect the exact staged Android files before applying website account or membership statements to the Play edition.

## Running the local source check

Run powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\legal-readiness-check.ps1. The checker resolves files relative to its own repository directory, supports recorded flat and conventional Supabase source layouts, and checks both literal cache lists. -Json returns a structured report; -ReportPath <path> saves it; -ProjectRoot <directory> selects an explicit source fixture.

Exit 0 means the specified local source checks passed. The report always states releaseClearanceEstablished: false. It cannot establish licenses, trademark availability, operator identity, server deployment, production privacy operations, language accuracy or Play acceptance. Manifest orientation is a product setting, not a legal approval condition.

## Website deployment evidence still required

Record actual deployed migration/function versions and verify permission boundaries with disposable accounts before claiming production cloud/privacy/admin workflows are established. No deployment is performed by the checker.

The conventional layout places SQL in supabase/migrations and functions in supabase/functions. This repository also preserves flattened exports: root 202608150001_legal_privacy_controls.sql is the legal migration; root index.ts is the account-deletion function. Do not run supabase db push against a flat export and assume it discovers these files. Restore the appropriate reviewed project layout and inspect function imports/configuration before any explicitly authorized deployment.

Verify consent/request records, caller-only deletion, complete data export, learner-approved summaries, administrator permissions, retention and backups. CROSS-DEVICE-LINKING-DEPLOYMENT.md, ADMIN-UPDATE-GUARDIAN-SETUP.md and OWNER-MASTER-CONTROLS-SETUP.md describe historical setup; inspect deployed state rather than assume every step is complete.

## Operator and audience details

- Owner-supplied public support/privacy email: languageminersupport@gmail.com. Inclusion is checkable in policy/listing files; this source audit does not verify inbox ownership or successful delivery. Check the separately published website and staged Android policy instead of relying on older placeholders.
- The supplied Console screenshot shows public display name "Eren dragneel." A display name is not evidence of the actual legal person/entity or address. The owner must confirm legally required operator details. Do not invent a company, address or jurisdiction from a nickname, support email or hosting location.
- The owner intends an all-age audience. That intention does not establish that website cloud signup, Patreon/community links or the Play edition meet every child/audience requirement. Keep edition-specific declarations accurate. Adult or teacher role selection alone does not provide parental consent or permit direct under-13 accounts.
- Record actual jurisdictions, data handling and an operational privacy-response owner. Resolve applicable child/privacy obligations before enabling the corresponding audience or account flows. Specialist advice may help resolve uncertainty; paid counsel or trademark registration is not a blanket technical prerequisite imposed by this script.

## Outstanding release decisions and evidence

1. Resolve rights gaps for assets actually included in the intended edition. Preserve historical HOLD entries and document included, replaced and excluded assets against the final packaged inventory. Unused archived files do not automatically block every edition. Consult ASSET-PROVENANCE.md.
2. Confirm accurate edition-specific policies, real operator details, contacts, audience and retention. Draft policies are not independently reviewed legal clearance.
3. Complete a documented trademark search and risk assessment for intended territories. This does not require purchasing a registration. TRADEMARK-PRELIMINARY-SEARCH.md preserves historical observations without claiming clearance.
4. Complete native editorial review before making comprehensive accuracy claims. Corrected flags and code checks do not certify every lesson or teaching effectiveness.
5. For paid Play subscriptions, finish products/base plans, authorize/deploy the verifier, configure the real endpoint and disclosures, rebuild, and test actual Play purchases/device behavior. The current Android receipt records checkout disabled and no upload.
6. Verify platform declarations, signing acceptance and export-law applicability against the actual identity, audience, package and distribution. Local source checks do not settle these matters.

These conditions remain open wherever evidence is absent. This checklist does not assert lawyer approval or satisfaction of an unresolved legal obligation.

## Privacy request operations

Assign a response owner, appropriate identity verification, applicable deadlines, deletion records and retention/backup handling. Verify request permissions and provider deletion with disposable accounts before advertising established operations. Keep credentials and private operator records out of source, app bundles and public reports.