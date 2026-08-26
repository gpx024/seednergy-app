# Known limitations and deferred work

## Product validation

- The blueprint’s Stage 9 gate requires a genuine 10 to 14 day Cress cycle. It cannot be responsibly compressed into an automated or same-day test. Final Stage 9 product acceptance remains pending that real grow.
- Development builds can create a separate harvest-ready simulation for interface testing. Its event history is labelled `development_cycle_simulated`; it is not evidence for the genuine grow-cycle acceptance gate.
- Harvest wording and all authored seed guidance require ongoing horticultural review before production release.
- Temporary seed and profile photography remains replaceable production artwork.

## Notifications

- A new Android development APK must be installed before push notifications can be tested because `expo-notifications` adds native code.
- Android Firebase Cloud Messaging is not configured in this repository yet. The client-owned Firebase Android app, `google-services.json`, and Expo FCM v1 credential must be added before real push delivery can pass.
- The dispatcher records a message as sent when Expo accepts the HTTP request. Expo ticket and receipt reconciliation, invalid-token cleanup, retries, and delivery analytics are not implemented yet.
- The five-minute cron interval means delivery is approximate, not exact to the minute.
- Quiet hours are displayed but not yet editable as separate time pickers in the app.
- Apple push delivery cannot be verified until the client’s Apple Developer setup is available.

## AI and operations

- Harvest suggestions use a deterministic authored fallback if the provider fails. The harvest remains valid, but the app does not currently offer a manual retry button.
- Stage 8 fixture validation and live Pixel testing were completed, but a complete labelled horticultural image corpus is still required for production evaluation.
- Local fresh-project migration verification requires Docker. The linked remote project accepted the complete numbered migration chain and Supabase database lint reports no schema errors.
- `npm audit --omit=dev` currently reports 23 transitive Expo toolchain advisories, 14 moderate and 9 high. Expo Doctor passes all 18 compatibility checks. The suggested automatic fix is an unsupported major Expo SDK upgrade, so it was not applied inside Stage 9 and should be handled as a planned SDK upgrade with full regression testing.

## Deferred stages

Payments, CMS authoring UI, public community features, public Garden sharing, gamification, commerce, and production Apple authentication remain outside Stage 9.
