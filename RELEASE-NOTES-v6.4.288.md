# Language Miner 6.4.288

Publishes the reviewed game and language fixes while retaining the live anime reward animation, customized wardrobe and narrated reward reels.

- Clears the previous answer explanation when the next question appears.
- Allows the newly earned Daily Miner title to be equipped immediately.
- Improves answer explanation contrast and prevents stacked beginner guides.
- Includes the shared-code fixes used by the offline Android edition; publishing the website does not update an installed Android package.
- Applies the 1,420 additional localized-form corrections from the complete 22,780-form AI review, along with the earlier targeted corrections.
- Refreshes restored vocabulary, grammar and travel questions using the corrected text without resetting progress or changing item IDs.
- Preserves the live animation/reel assets and service-worker media caching.

## Pending deployment

Private gamer-tag and invitation-code linking requires the Supabase migration `supabase/migrations/202610040001_private_gamer_linking.sql`. The website retains its existing account-linking client until that migration can be applied and verified. Its new client implementation remains in the development workspace; no unavailable database function is enabled in this release.

## Remaining release work

The AI linguistic pass is complete, but 5,788 forms have open contextual or qualified-review flags and 1,369 forms need matching audio. This is not native-speaker certification. Google Play packaging, clearance and upload remain separate; no Google Play release is performed by this web deployment.

Version: `6.4.288`. Browser cache revision: `reviewed-fixes-r117`.
