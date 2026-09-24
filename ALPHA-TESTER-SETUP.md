# Alpha Tester access

Released in 6.4.263. Apply the owner and granular permission migrations (202608240003 and 202608240004) before 202609240001_alpha_tester_access.sql. These were applied to production on September 24, 2026. No tester accounts were assigned by deployment.

In Owner Master Controls, search for a registered player, choose Grant Admin or Edit Privileges, select Alpha Tester, and save. The fixed preset grants all Patreon tiers without a subscription, the Alpha Tester title, Hearts & Health, Cosmetics & Supplies, and Course Progression. Other administrator privileges remain disabled. Ordinary in-game item prices still apply.

Players should sign out and back in after assignment. Verified access refreshes every minute while signed in; revoking the administrator assignment removes the tester entitlement and title on the next successful refresh. Existing paid Patreon membership remains separate. Previously earned/unlocked progress is not erased.

Only the master owner can assign or revoke this preset. Database permission checks enforce its fixed three privileges.
